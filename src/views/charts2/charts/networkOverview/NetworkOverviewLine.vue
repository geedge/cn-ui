<template>
  <div class="line network">
    <chart-no-data v-if="isNoData"></chart-no-data>
    <div class="line-header">
      <div class="line-header-left">
        <div class="line-value-active" v-if="lineTab"></div>
        <div class="line-value">
          <div class="line-value-mpackets"
               v-show="item.show"
               :class=" {'is-active': lineTab === item.class, 'mousemove-cursor': mousemoveCursor === item.class}"
               v-for="(item, index) in mpackets"
               :key="index"
               @mouseenter="mouseenter(item)"
               @mouseleave="mouseleave(item)"
               @click="activeChange(item, index)">
            <div class="line-value-mpackets-name">
              <div :class="item.class"></div>
              <div class="mpackets-name">{{$t(item.name)}}</div>
            </div>
            <div class="line-value-unit">
              <span class="line-value-unit-number">{{unitConvert(item.analysis.avg, unitTypes.number)[0]}}</span>
              <span class="line-value-unit-number2">
                <span>{{unitConvert(item.analysis.avg, unitTypes.number)[1]}}</span><span v-if="item.unitType">{{item.unitType}}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="line-select line-header-right">
        <div class="line-select-metric">
          <span>{{$t('network.metric')}}:</span>
          <div class="line-select__operation">
            <el-select
                size="mini"
                v-model="lineMetric"
                popper-class="common-select"
                :popper-append-to-body="false"
                @change="metricSelectChange"
            >
              <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
        </div>
        <div class="line-select-reference-line">
          <span>{{$t('network.referenceLine')}}:</span>
          <div class="line-select__operation">
            <el-select
                size="mini"
                v-model="lineRefer"
                :disabled="!lineTab"
                popper-class="common-select"
                :popper-append-to-body="false"
                @change="referenceSelectChange"
            >
              <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <div class="chart-drawing" v-show="showMarkLine" id="overviewLineChart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { stackedLineChartOption } from '@/views/charts2/charts/options/echartOption'
import unitConvert from '@/utils/unit-convert'
import { unitTypes, chartColor3, chartColor4 } from '@/utils/constants.js'
import { ref, shallowRef } from 'vue'
import { stackedLineTooltipFormatter } from '@/views/charts/charts/tools'
import _ from 'lodash'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
export default {
  name: 'NetworkOverviewLine',
  components: {
    ChartNoData
  },
  setup () {
    const { query } = useRoute()
    const lineMetric = ref(query.lineMetric || 'Bits/s')
    const lineRefer = ref(query.lineRefer || 'Average')
    const lineTab = ref(query.lineTab || '')
    const queryCondition = ref(query.queryCondition || '')
    return {
      lineMetric,
      lineRefer,
      lineTab,
      queryCondition,
      myChart: shallowRef(null)
    }
  },
  mixins: [chartMixin],
  data () {
    return {
      options1: [
        {
          value: 'Bits/s',
          label: 'Bits/s'
        },
        {
          value: 'Packets/s',
          label: 'Packets/s'
        },
        {
          value: 'Sessions/s',
          label: 'Sessions/s'
        }
      ],
      options2: [
        {
          value: 'Average',
          label: 'Average'
        },
        {
          value: '95th Percentile',
          label: '95th Percentile'
        },
        {
          value: 'Maximum',
          label: 'Maximum'
        }
      ],
      mpackets: [
        { analysis: {}, name: 'network.total', class: 'total', show: true, invertTab: true, positioning: 0, data: [], unitType: '' },
        { analysis: {}, name: 'network.inbound', class: 'inbound', show: true, invertTab: true, positioning: 1, data: [], unitType: '' },
        { analysis: {}, name: 'network.outbound', class: 'outbound', show: true, invertTab: true, positioning: 2, data: [], unitType: '' },
        { analysis: {}, name: 'network.internal', class: 'internal', show: true, invertTab: true, positioning: 3, data: [], unitType: '' },
        { analysis: {}, name: 'network.through', class: 'through', show: true, invertTab: true, positioning: 4, data: [], unitType: '' },
        { analysis: {}, name: 'network.other', class: 'other', show: true, invertTab: true, positioning: 5, data: [], unitType: '' }
      ],
      unitConvert,
      unitTypes,
      chartDateObject: [],
      timer: null,
      mousemoveCursor: '',
      leftOffset: 0,
      sizes: [3, 4, 6, 8, 9, 10],
      dynamicVariable: '',
      showMarkLine: true
    }
  },
  watch: {
    lineTab (n) {
      this.$nextTick(() => {
        this.handleActiveBar(n)
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, {
          lineTab: n
        })
        overwriteUrl(newUrl)
      })
    },
    lineMetric (n) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        lineMetric: n
      })
      overwriteUrl(newUrl)
    },
    lineRefer (n) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        lineRefer: n
      })
      overwriteUrl(newUrl)
    },
    queryCondition (n) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        queryCondition: n
      })
      overwriteUrl(newUrl)
    },
    timeFilter: {
      deep: true,
      handler (n) {
        if (this.lineTab) {
          this.init(this.lineMetric, this.showMarkLine, 'active')
        } else {
          this.init()
        }
      }
    }
  },
  methods: {
    init (val, show, active) {
      if (!val) {
        val = this.lineMetric
      }
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      if (this.queryCondition) {
        params.q = this.queryCondition
      }
      this.toggleLoading(true)
      get(api.netWorkOverview.totalTrafficAnalysis, params).then((res) => {
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          res.data.result.forEach((t, i) => {
            if (t.type === 'bytes' && val === 'Bits/s') {
              const mpackets = _.cloneDeep(this.mpackets)
              mpackets[0].analysis = t.totalBitsRate.analysis
              mpackets[1].analysis = t.inboundBitsRate.analysis
              mpackets[2].analysis = t.outboundBitsRate.analysis
              mpackets[3].analysis = t.internalBitsRate.analysis
              mpackets[4].analysis = t.throughBitsRate.analysis
              mpackets[5].analysis = t.other.analysis
              mpackets[0].data = t.totalBitsRate.values ? t.totalBitsRate.values : []
              mpackets[1].data = t.inboundBitsRate.values ? t.inboundBitsRate.values : []
              mpackets[2].data = t.outboundBitsRate.values ? t.outboundBitsRate.values : []
              mpackets[3].data = t.internalBitsRate.values ? t.internalBitsRate.values : []
              mpackets[4].data = t.throughBitsRate.values ? t.throughBitsRate.values : []
              mpackets[5].data = t.other.values ? t.other.values : []
              mpackets.forEach(e => {
                e.unitType = 'bps'
                if (e.name !== 'network.total' && e.analysis.avg == 0) {
                  e.show = false
                } else {
                  e.show = true
                  if (!active && show !== this.lineRefer) {
                    this.legendSelectChange(e, 'index')
                  }
                }
              })
              this.mpackets = mpackets
              this.$nextTick(() => {
                this.echartsInit(this.mpackets, show)
              })
            } else if (t.type === 'packets' && val === 'Packets/s') {
              const mpackets = _.cloneDeep(this.mpackets)
              mpackets[0].analysis = t.totalPacketsRate.analysis
              mpackets[1].analysis = t.inboundPacketsRate.analysis
              mpackets[2].analysis = t.outboundPacketsRate.analysis
              mpackets[3].analysis = t.internalPacketsRate.analysis
              mpackets[4].analysis = t.throughPacketsRate.analysis
              mpackets[5].analysis = t.other.analysis
              mpackets[0].data = t.totalPacketsRate.values ? t.totalPacketsRate.values : []
              mpackets[1].data = t.inboundPacketsRate.values ? t.inboundPacketsRate.values : []
              mpackets[2].data = t.outboundPacketsRate.values ? t.outboundPacketsRate.values : []
              mpackets[3].data = t.internalPacketsRate.values ? t.internalPacketsRate.values : []
              mpackets[4].data = t.throughPacketsRate.values ? t.throughPacketsRate.values : []
              mpackets[5].data = t.other.values ? t.other.values : []
              mpackets.forEach(e => {
                e.unitType = 'packets/s'
                if (e.name !== 'network.total' && e.analysis.avg == 0) {
                  e.show = false
                } else {
                  e.show = true
                  if (!active && show !== this.lineRefer) {
                    this.legendSelectChange(e, 'index')
                  }
                }
              })
              this.mpackets = mpackets
              this.$nextTick(() => {
                this.echartsInit(this.mpackets, show)
              })
            } else if (t.type === 'sessions' && val === 'Sessions/s') {
              const mpackets = _.cloneDeep(this.mpackets)
              mpackets[0].analysis = t.totalSessionsRate.analysis
              mpackets[0].data = t.totalSessionsRate.values ? t.totalSessionsRate.values : []
              mpackets.forEach((e, i) => {
                if (i !== 0) {
                  e.show = false
                }
                e.unitType = 'sessions/s'
                if (show !== this.lineRefer) {
                  this.legendSelectChange(e, 0)
                }
              })
              this.mpackets = mpackets
              this.$nextTick(() => {
                this.echartsInit(this.mpackets, show)
              })
            }
          })
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    echartsInit (echartsData, show) {
      if (this.lineTab) {
        this.handleActiveBar()
        echartsData = echartsData.filter(t => t.show === true && t.invertTab === false)
      } else {
        echartsData = echartsData.filter(t => t.show === true)
      }
      const _this = this
      const dom = document.getElementById('overviewLineChart')
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = stackedLineChartOption
      const chartOption = this.chartOption.series[0]
      this.chartOption.series = echartsData.map((t, i) => {
        return {
          ...chartOption,
          name: t.name,
          lineStyle: {
            color: chartColor3[t.positioning],
            width: 1
          },
          stack: t.name !== 'network.total' ? 'network.total' : '',
          symbolSize: function (value, params) {
            return _this.symbolSizeSortChange(i, value[0])
          },
          itemStyle: {
            emphasis: {
              borderColor: chartColor4[t.positioning],
              borderWidth: 2,
              shadowColor: chartColor4[t.positioning],
              shadowBlur: this.sizes[t.positioning] + 2
            }
          },
          areaStyle: {
            opacity: 0.1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: chartColor3[t.positioning]
              },
              {
                offset: 1,
                color: chartColor3[t.positioning]
              }
            ])
          },
          data: t.data.map(v => [Number(v[0]) * 1000, Number(v[1]), 'number']),
          markLine: {
            silent: true,
            lineStyle: {
              color: '#B4B1A8'
            },
            symbol: 'none',
            label: {
              formatter (params) {
                const arr = unitConvert(params.value, unitTypes.number).join('')
                return _this.lineRefer + '(' + arr + echartsData[0].unitType + ')'
              },
              position: 'insideStartTop',
              color: '#717171',
              fontFamily: 'NotoSansSChineseRegular'
            }
          }
        }
      })
      if (!show) {
        this.chartOption.series.forEach((t, i) => {
          t.markLine.label.show = false
          t.markLine = []
        })
      }
      if (this.lineRefer === 'Average' && show) {
        this.chartOption.series.forEach((t, i) => {
          t.markLine.label.show = true
          t.markLine.data = [
            {
              yAxis: echartsData[i].analysis.avg
            }
          ]
        })
      } else if (this.lineRefer === '95th Percentile' && show) {
        this.chartOption.series.forEach((t, i) => {
          t.markLine.label.show = true
          t.markLine.data = [
            { yAxis: echartsData[i].analysis.p95 }
          ]
        })
      } else if (this.lineRefer === 'Maximum' && show) {
        this.chartOption.series.forEach((t, i) => {
          t.markLine.label.show = true
          t.markLine.data = [
            { yAxis: echartsData[i].analysis.max }
          ]
        })
      }
      this.chartOption.tooltip.formatter = (params) => {
        params.forEach(t => {
          t.seriesName = this.$t(t.seriesName)
        })
        const str = stackedLineTooltipFormatter(params)
        return str
      }
      this.showMarkLine = true
      this.myChart.setOption(this.chartOption)
    },
    activeChange (item, index) {
      this.lineTab = item.class
      this.legendSelectChange(item, index, 'active')
      this.showMarkLine = !item.invertTab
      this.init(this.lineMetric, this.showMarkLine, 'active')
    },
    mouseenter (item) {
      this.mousemoveCursor = item.class
      this.handleActiveBar(item.class)
    },
    mouseleave () {
      this.mousemoveCursor = ''
    },
    dispatchLegendSelectAction (name) {
      this.myChart && this.myChart.dispatchAction({
        type: 'legendSelect',
        name: name
      })
    },
    dispatchLegendUnSelectAction (name) {
      this.myChart && this.myChart.dispatchAction({
        type: 'legendUnSelect',
        name: name
      })
    },
    legendSelectChange (item, index, val) {
      if (index === 'index') {
        this.dispatchLegendSelectAction(item.name)
      } else if (this.mpackets[index] && this.mpackets[index].name === item.name) {
        this.dispatchLegendSelectAction(item.name)
        this.mpackets.forEach((t) => {
          if (t.name !== item.name) {
            this.dispatchLegendUnSelectAction(t.name)
          }
        })
      }
      if (val === 'active') {
        this.mpackets.forEach(t => {
          if (item.name === t.name) {
            t.invertTab = !t.invertTab
          } else {
            t.invertTab = true
          }
          if (t.invertTab && item.name === t.name) {
            if (this.lineTab) {
              this.lineTab = ''
            } else {
              this.lineTab = t.class
            }
            this.mpackets.forEach((e) => {
              this.dispatchLegendSelectAction(e.name)
            })
          }
        })
      }
    },
    handleActiveBar (value) {
      if (document.querySelector('.network .line-value-mpackets.is-active')) {
        const { offsetLeft, clientWidth, clientLeft } = document.querySelector('.network .line-value-mpackets.is-active')
        const activeBar = document.querySelector('.network .line-value-active')
        activeBar.style.cssText += `width: ${clientWidth}px; left: ${offsetLeft + this.leftOffset + clientLeft}px;`
      }
    },
    resize () {
      this.myChart.resize()
    },
    metricSelectChange (val) {
      this.lineMetric = val
      this.lineTab = ''
      this.handleActiveBar()
      this.showMarkLine = !this.showMarkLine
      this.mpackets.forEach((e, i) => {
        if (!e.invertTab) {
          e.invertTab = true
        }
      })
      this.init(val, this.showMarkLine)
    },
    referenceSelectChange (val) {
      this.lineRefer = val
      this.echartsInit(this.mpackets, this.showMarkLine)
    },
    symbolSizeSortChange (index, time) {
      const dataIntegrationArray = []
      if (stackedLineChartOption.series[0]) {
        const totalData = stackedLineChartOption.series[0].data.find(t => t[0] === time) // [time, value]
        if (totalData) {
          dataIntegrationArray.push(totalData)
          totalData[2] = 0
        }
      }
      if (stackedLineChartOption.series[1]) {
        const inboundData = stackedLineChartOption.series[1].data.find(t => t[0] === time)
        if (inboundData) {
          dataIntegrationArray.push(inboundData)
          inboundData[2] = 1
        }
      }
      if (stackedLineChartOption.series[2]) {
        const outboundData = stackedLineChartOption.series[2].data.find(t => t[0] === time)
        if (outboundData) {
          dataIntegrationArray.push(outboundData)
          outboundData[2] = 2
        }
      }
      if (stackedLineChartOption.series[3]) {
        const internalData = stackedLineChartOption.series[3].data.find(t => t[0] === time)
        if (internalData) {
          dataIntegrationArray.push(internalData)
          internalData[2] = 3
        }
      }
      if (stackedLineChartOption.series[4]) {
        const throughData = stackedLineChartOption.series[4].data.find(t => t[0] === time)
        if (throughData) {
          dataIntegrationArray.push(throughData)
          throughData[2] = 4
        }
      }
      if (stackedLineChartOption.series[5]) {
        const otherData = stackedLineChartOption.series[5].data.find(t => t[0] === time)
        if (otherData) {
          dataIntegrationArray.push(otherData)
          otherData[2] = 5
        }
      }
      dataIntegrationArray.sort((a, b) => { return a[1] - b[1] })
      const sortIndex = dataIntegrationArray.findIndex(a => a[2] === index)
      return this.sizes[sortIndex]
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      if (this.lineTab) {
        const data = this.mpackets.find(t => t.class === this.lineTab)
        this.activeChange(data, data.positioning)
      } else {
        this.init()
      }
    }, 200)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)
  }
}
</script>
