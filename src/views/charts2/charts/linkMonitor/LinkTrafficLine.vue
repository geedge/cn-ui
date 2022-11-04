<template>
 <div class="link-traffic-line">
   <link-traffic-drill-down-list
     :chart="chart"
     :line-data="mpackets"
     :time-filter="timeFilter">
   </link-traffic-drill-down-list>
   <div class="line network link-traffic">
     <loading :loading="loading"></loading>
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
       </div>
     </div>
     <div style="height: calc(100% - 74px); position: relative">
       <chart-no-data v-if="isNoData"></chart-no-data>
       <div class="chart-drawing" v-show="showMarkLine && !isNoData" id="linkTrafficLineChart"></div>
     </div>
   </div>
 </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import linkTrafficDrillDownLine from '@/views/charts2/charts/linkMonitor/localComponents/LinkTrafficDrillDownLine'
import LinkTrafficDrillDownList from '@/views/charts2/charts/linkMonitor/localComponents/LinkTrafficDrillDownList'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import Loading from '@/components/common/Loading'
import {useRoute} from 'vue-router'
import {ref, shallowRef} from 'vue'
import unitConvert from '@/utils/unit-convert'
import {chartColor3, chartColor4, unitTypes} from '@/utils/constants'
import {overwriteUrl, urlParamsHandler} from '@/utils/tools'
import {getSecond} from '@/utils/date-util'
import {get} from '@/utils/http'
import {api} from '@/utils/api'
import _ from 'lodash'
import * as echarts from 'echarts'
import {linkTrafficLineChartOption} from '@/views/charts2/charts/options/echartOption'
import {stackedLineTooltipFormatter} from '@/views/charts/charts/tools'

export default {
  name: 'LinkTrafficLine',
  mixins: [chartMixin],
  components: {
    ChartNoData,
    Loading,
    LinkTrafficDrillDownList
  },
  setup () {
    const { query } = useRoute()
    const lineMetric = ref(query.lineMetric || 'Bits/s')
    const lineTab = ref(query.lineTab || '')
    const queryCondition = ref(query.queryCondition || '')
    return {
      lineMetric,
      lineTab,
      queryCondition,
      myChart: shallowRef(null)
    }
  },
  props: {
    linkTrafficShow: Boolean,
    linkTrafficData: Array
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
        }
      ],
      mpackets: [],
      unitConvert,
      unitTypes,
      chartDateObject: [],
      timer: null,
      mousemoveCursor: '',
      leftOffset: 0,
      sizes: [3, 4, 6, 8, 9, 10],
      dynamicVariable: '',
      showMarkLine: true,
      loading: false
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
    timeFilter: {
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
        const condition = this.queryCondition.toLowerCase().split(' or ')
        if (condition.length > 1) {
          params.egressParam = condition.find(c => c.indexOf('common_egress_link_id') > -1 || c.indexOf('egress_link_direction') > -1)
          params.ingressParam = condition.find(c => c.indexOf('common_ingress_link_id') > -1 || c.indexOf('ingress_link_direction') > -1)
        }
      }
      this.loading = true
      get(api.linkMonitor.totalTrafficAnalysis, params).then((res) => {
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.mpackets = [
            { analysis: {}, name: 'network.total', class: 'total', show: true, invertTab: true, positioning: 0, data: [], unitType: '' },
            { analysis: {}, name: 'linkMonitor.ingress', class: 'ingress', show: true, invertTab: true, positioning: 1, data: [], unitType: '' },
            { analysis: {}, name: 'linkMonitor.egress', class: 'egress', show: true, invertTab: true, positioning: 2, data: [], unitType: '' }
          ]
          res.data.result.forEach((t, i) => {
            if (t.type === 'bytes' && val === 'Bits/s') {
              const mpackets = _.cloneDeep(this.mpackets)
              mpackets[0].analysis = t.totalBitsRate.analysis
              mpackets[1].analysis = t.ingressBitsRate.analysis
              mpackets[2].analysis = t.egressBitsRate.analysis
              mpackets[0].data = t.totalBitsRate.values ? t.totalBitsRate.values : []
              mpackets[1].data = t.ingressBitsRate.values ? t.ingressBitsRate.values : []
              mpackets[2].data = t.egressBitsRate.values ? t.egressBitsRate.values : []
              let num = 0
              mpackets.forEach(e => {
                e.unitType = 'bps'
                if (e.name !== 'network.total' && e.analysis.avg == 0) {
                  e.show = false
                  num += 1
                } else {
                  e.show = true
                  if (!active && !show) {
                    this.legendSelectChange(e, 'index')
                  }
                }
                if (this.lineTab === e.class) {
                  if (e.analysis.avg <= 0) {
                    this.lineTab = ''
                    this.init()
                  }
                }
              })
              this.mpackets = mpackets
              if (num === 3) {
                mpackets[0].invertTab = false
                this.lineTab = 'total'
                this.legendSelectChange(mpackets[0], 0)
                this.$nextTick(() => {
                  this.echartsInit(this.mpackets)
                })
              } else {
                this.$nextTick(() => {
                  this.echartsInit(this.mpackets)
                })
              }
            } else if (t.type === 'packets' && val === 'Packets/s') {
              const mpackets = _.cloneDeep(this.mpackets)
              mpackets[0].analysis = t.totalPacketsRate.analysis
              mpackets[1].analysis = t.ingressPacketsRate.analysis
              mpackets[2].analysis = t.egressPacketsRate.analysis
              mpackets[0].data = t.totalPacketsRate.values ? t.totalPacketsRate.values : []
              mpackets[1].data = t.ingressPacketsRate.values ? t.ingressPacketsRate.values : []
              mpackets[2].data = t.egressPacketsRate.values ? t.egressPacketsRate.values : []
              let num = 0
              mpackets.forEach(e => {
                e.unitType = 'packets/s'
                if (e.name !== 'network.total' && e.analysis.avg == 0) {
                  e.show = false
                  num += 1
                } else {
                  e.show = true
                  if (!active && !show) {
                    this.legendSelectChange(e, 'index')
                  }
                }
                if (this.lineTab === e.class) {
                  if (e.analysis.avg <= 0) {
                    this.lineTab = ''
                    this.init()
                  }
                }
              })
              this.mpackets = mpackets
              if (num === 3) {
                mpackets[0].invertTab = false
                this.lineTab = 'total'
                this.legendSelectChange(mpackets[0], 0)
                this.$nextTick(() => {
                  this.echartsInit(this.mpackets)
                })
              } else {
                this.$nextTick(() => {
                  this.echartsInit(this.mpackets)
                })
              }
            }
          })
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.loading = false
      })
    },
    echartsInit (echartsData) {
      if (this.lineTab) {
        this.handleActiveBar()
        echartsData = echartsData.filter(t => t.show === true && t.invertTab === false)
      } else {
        echartsData = echartsData.filter(t => t.show === true)
      }
      const _this = this
      const dom = document.getElementById('linkTrafficLineChart')
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = linkTrafficLineChartOption
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
          data: t.data.map(v => [Number(v[0]) * 1000, Number(v[1]), 'number'])
        }
      })
      this.chartOption.tooltip.formatter = (params) => {
        params.forEach(t => {
          t.seriesName = this.$t(t.seriesName)
          this.mpackets.forEach(e => {
            if (this.$t(e.name) === t.seriesName) {
              t.borderColor = chartColor3[e.positioning]
            }
          })
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
    symbolSizeSortChange (index, time) {
      const dataIntegrationArray = []
      if (linkTrafficLineChartOption.series[0]) {
        const totalData = linkTrafficLineChartOption.series[0].data.find(t => t[0] === time) // [time, value]
        if (totalData) {
          dataIntegrationArray.push(totalData)
          totalData[2] = 0
        }
      }
      if (linkTrafficLineChartOption.series[1]) {
        const ingressData = linkTrafficLineChartOption.series[1].data.find(t => t[0] === time)
        if (ingressData) {
          dataIntegrationArray.push(ingressData)
          ingressData[2] = 1
        }
      }
      if (linkTrafficLineChartOption.series[2]) {
        const egressData = linkTrafficLineChartOption.series[2].data.find(t => t[0] === time)
        if (egressData) {
          dataIntegrationArray.push(egressData)
          egressData[2] = 2
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
