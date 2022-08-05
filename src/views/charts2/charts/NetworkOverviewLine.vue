<template>
  <div class="line network">
    <div class="chart-drawing" id="chart"></div>
    <div class="line-value-active"></div>
    <div class="line-value" >
      <div class="line-value-mpackets"
           v-show="item.show"
           :class=" {'is-active': activeShow === item.class, 'mousemove-cursor': mousemoveCursor === item.class}"
           v-for="(item, index) in mpackets"
           :key="index"
           @mouseenter="mouseenter(item)"
           @mouseleave="mouseleave(item)"
           @click="activeChange(item, index)">
        <div class="line-value-mpackets-name">
          <div :class="item.class"></div>
          <div class="mpackets-name">{{$t(item.name)}}</div>
        </div>
        <div><span>{{unitConvert(item.analysis.avg, unitTypes.number)[0]}}</span><span>{{unitConvert(item.analysis.avg, unitTypes.number)[1]}}packets/s</span></div>
      </div>
    </div>
    <div class="line-select">
      <div class="line-select-metric">
        <span>{{$t('network.metric')}}:</span>
        <div class="line-select__operation">
          <el-select
              size="mini"
              v-model="value1"
              popper-class="metric"
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
              v-model="value2"
              :disabled="activeShow === ''"
              popper-class="reference-line"
              @change="referenceSelectChange"
          >
            <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { stackedLineChartOption } from '@/views/charts2/charts/options/echartOption'
import unitConvert from '@/utils/unit-convert'
import { unitTypes, chartColor3, chartColor4 } from '@/utils/constants.js'
import { shallowRef } from 'vue'
import { stackedLineTooltipFormatter } from '@/views/charts/charts/tools'
import _ from 'lodash'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
export default {
  name: 'NetworkOverviewLine',
  props: {
    chart: Object,
    timeFilter: Object
  },
  setup () {
    return {
      myChart: shallowRef(null)
    }
  },
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
      value1: 'Bits/s',
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
      value2: 'Average',
      mpackets: [
        { analysis: {}, name: 'network.total', class: 'total', show: true, positioning: 0, data: [] },
        { analysis: {}, name: 'network.inbound', class: 'inbound', show: true, positioning: 1, data: [] },
        { analysis: {}, name: 'network.outbound', class: 'outbound', show: true, positioning: 2, data: [] },
        { analysis: {}, name: 'network.internal', class: 'internal', show: true, positioning: 3, data: [] },
        { analysis: {}, name: 'network.through', class: 'through', show: true, positioning: 4, data: [] },
        { analysis: {}, name: 'network.other', class: 'other', show: true, positioning: 5, data: [] }
      ],
      unitConvert,
      unitTypes,
      chartDateObject: [],
      timer: null,
      activeShow: '',
      mousemoveCursor: '',
      leftOffset: 0,
      sizes: [3, 4, 6, 8, 9, 10],
      echartsLabelValue: '',
      echartsType: 'Bits/s',
      echartsData: {},
      dynamicVariable: ''
    }
  },
  watch: {
    activeShow (n) {
      this.$nextTick(() => {
        this.handleActiveBar(n)
      })
    }
  },
  methods: {
    init (val, n) {
      if (!val) {
        val = 'Bits/s'
      }
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      if (n) {
        params.q = n
      }
      get(api.netWorkOverview.totalTrafficAnalysis, params).then((res) => {
        if (res.code === 200) {
          res.data.result.forEach((t, i) => {
            if (t.type === 'bytes' && val === 'Bits/s') {
              this.mpackets[0].analysis = t.totalBitsRate.analysis
              this.mpackets[1].analysis = t.inboundBitsRate.analysis
              this.mpackets[2].analysis = t.outboundBitsRate.analysis
              this.mpackets[3].analysis = t.internalBitsRate.analysis
              this.mpackets[4].analysis = t.externalBitsRate.analysis
              this.mpackets[5].analysis = t.other.analysis
              this.mpackets[0].data = t.totalBitsRate.values ? t.totalBitsRate.values : []
              this.mpackets[1].data = t.inboundBitsRate.values ? t.inboundBitsRate.values : []
              this.mpackets[2].data = t.outboundBitsRate.values ? t.outboundBitsRate.values : []
              this.mpackets[3].data = t.internalBitsRate.values ? t.internalBitsRate.values : []
              this.mpackets[4].data = t.externalBitsRate.values ? t.externalBitsRate.values : []
              this.mpackets[5].data = t.other.values ? t.other.values : []
              this.mpackets.forEach(t => {
                if (t.name !== 'network.total' && t.analysis.avg == 0) {
                  t.show = false
                }
              })
              this.echartsInit(this.mpackets)
            } else if (t.type === 'packets' && val === 'Packets/s') {
              this.mpackets[0].analysis = t.totalPacketsRate.analysis
              this.mpackets[1].analysis = t.inboundPacketsRate.analysis
              this.mpackets[2].analysis = t.outboundPacketsRate.analysis
              this.mpackets[3].analysis = t.internalPacketsRate.analysis
              this.mpackets[4].analysis = t.externalPacketsRate.analysis
              this.mpackets[5].analysis = t.other.analysis
              this.mpackets[0].data = t.totalPacketsRate.values ? t.totalPacketsRate.values : []
              this.mpackets[1].data = t.inboundPacketsRate.values ? t.inboundPacketsRate.values : []
              this.mpackets[2].data = t.outboundPacketsRate.values ? t.outboundPacketsRate.values : []
              this.mpackets[3].data = t.internalPacketsRate.values ? t.internalPacketsRate.values : []
              this.mpackets[4].data = t.externalPacketsRate.values ? t.externalPacketsRate.values : []
              this.mpackets[5].data = t.other.values ? t.other.values : []
              this.mpackets.forEach(t => {
                if (t.name !== 'network.total' && t.analysis.avg == 0) {
                  t.show = false
                }
              })
              this.echartsInit(this.mpackets)
            } else if (t.type === 'sessions' && val === 'Sessions/s') {
              this.mpackets[0].analysis = t.totalSessionsRate.analysis
              this.mpackets[0].data = t.totalSessionsRate.values ? t.totalSessionsRate.values : []
              this.echartsInit(this.mpackets)
            }
          })
        }
      })
    },
    echartsInit (echartsData) {
      const _this = this
      echartsData = echartsData.filter(t => t.show === true)
      const dom = document.getElementById('chart')
      this.myChart = echarts.init(dom)
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
          data: t.data.map(v => [Number(v[0]) * 1000, Number(v[1])]),
          markLine: {
            silent: true,
            lineStyle: {
              color: '#B4B1A8'
            },
            symbol: 'none',
            label: {
              formatter (params) {
                const arr = unitConvert(params.value, unitTypes.number).join('')
                return _this.echartsLabelValue + '(' + arr + 'packets/s' + ')'
              },
              position: 'insideStartTop',
              color: '#717171',
              fontFamily: 'NotoSansSChineseRegular'
            }
          }
        }
      })
      if (this.echartsLabelValue === 'Average') {
        this.chartOption.series.forEach((t, i) => {
          t.markLine.data = [
            {
              yAxis: echartsData[i].analysis.avg
            }
          ]
        })
      } else if (this.echartsLabelValue === '95th Percentile') {
        this.chartOption.series.forEach((t, i) => {
          t.markLine.data = [
            { yAxis: echartsData[i].analysis.p95 }
          ]
        })
      } else if (this.echartsLabelValue === 'Maximum') {
        this.chartOption.series.forEach((t, i) => {
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
      this.myChart.setOption(this.chartOption)
    },
    activeChange (item, index) {
      if (!this.echartsLabelValue) {
        this.echartsLabelValue = 'Average'
      } else {
        this.echartsLabelValue = this.echartsLabelValue
      }
      this.activeShow = item.class
      this.legendSelectChange(item, index)
      this.init(this.echartsType)
    },
    mouseenter (item) {
      this.mousemoveCursor = item.class
      this.handleActiveBar(item.class)
    },
    mouseleave () {
      this.mousemoveCursor = ''
    },
    dispatchLegendSelectAction (name) {
      this.myChart.dispatchAction({
        type: 'legendSelect',
        name: name
      })
    },
    dispatchLegendUnSelectAction (name) {
      this.myChart.dispatchAction({
        type: 'legendUnSelect',
        name: name
      })
    },
    legendSelectChange (item, index) {
      if (item.data.length <= 0) return ''
      if (index === 'index') {
        this.dispatchLegendSelectAction(item.name)
      } else if (this.mpackets[index].name == item.name) {
        this.dispatchLegendSelectAction(item.name)
        this.mpackets.forEach((t) => {
          if (t.name !== item.name) {
            this.dispatchLegendUnSelectAction(t.name)
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
      this.echartsType = val
      if (val === 'Sessions/s') {
        this.mpackets.forEach((t, i) => {
          if (i !== 0) {
            t.show = false
          }
          this.legendSelectChange(t, 0)
        })
      } else if (!this.activeShow) {
        this.mpackets.forEach((t, i) => {
          t.show = true
          this.legendSelectChange(t, 'index')
        })
      } else if (this.activeShow) {
        this.activeShow = 'total'
        this.mpackets.forEach((t, i) => {
          t.show = true
        })
      }
      this.handleActiveBar()
      this.init(val)
    },
    referenceSelectChange (val) {
      this.echartsLabelValue = val
      this.timer = setTimeout(() => {
        this.init(this.echartsType)
      }, 200)
    },
    symbolSizeSortChange (index, time) {
      const dataIntegrationArray = []
      if (stackedLineChartOption.series[0]) {
        const totalData = stackedLineChartOption.series[0].data.find(t => t[0] === time) // [time, value]
        dataIntegrationArray.push(totalData)
        totalData[2] = 0
      }
      if (stackedLineChartOption.series[1]) {
        const inboundData = stackedLineChartOption.series[1].data.find(t => t[0] === time)
        dataIntegrationArray.push(inboundData)
        inboundData[2] = 1
      }
      if (stackedLineChartOption.series[2]) {
        const outboundData = stackedLineChartOption.series[2].data.find(t => t[0] === time)
        dataIntegrationArray.push(outboundData)
        outboundData[2] = 2
      }
      if (stackedLineChartOption.series[3]) {
        const internalData = stackedLineChartOption.series[3].data.find(t => t[0] === time)
        dataIntegrationArray.push(internalData)
        internalData[2] = 3
      }
      if (stackedLineChartOption.series[4]) {
        const throughData = stackedLineChartOption.series[4].data.find(t => t[0] === time)
        dataIntegrationArray.push(throughData)
        throughData[2] = 4
      }
      if (stackedLineChartOption.series[5]) {
        const otherData = stackedLineChartOption.series[5].data.find(t => t[0] === time)
        dataIntegrationArray.push(otherData)
        otherData[2] = 5
      }
      dataIntegrationArray.sort((a, b) => { return a[1] - b[1] })
      const sortIndex = dataIntegrationArray.findIndex(a => a[2] === index)
      return this.sizes[sortIndex]
    }
  },
  mounted () {
    const _this = this
    this.emitter.on('get-chart-data', function (value) {
      _this.init('', value)
    })
    if (this.chart) {
      this.echartsData = _.cloneDeep(this.chart)
    }
    this.timer = setTimeout(() => {
      this.init()
    }, 200)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>
