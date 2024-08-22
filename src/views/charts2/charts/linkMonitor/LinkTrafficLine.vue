<template>
 <div class="link-traffic-line">
   <link-traffic-drill-down-list
     :chart="chart"
     :line-data="tabs[0]"
     :time-filter="timeFilter">
   </link-traffic-drill-down-list>
   <div class="line network link-traffic">
     <loading :loading="loading"></loading>
     <chart-error v-if="showError" :content="errorMsg" />
     <div class="line-header" v-if="!showError">
       <div class="line-header-left">
         <div class="line-value-active" v-if="lineTab"></div>
         <div class="line-value">
           <div class="line-value-tabs"
                v-show="item.show"
                :class=" {'is-active': lineTab === item.class, 'mousemove-cursor': mousemoveCursor === item.class}"
                v-for="(item, index) in tabs"
                :key="item.name"
                @mouseenter="mouseenter(item)"
                @mouseleave="mouseleave(item)"
                @click="activeChange(item, index, true)"
                :test-id="`tab-${index}`">
             <div class="line-value-tabs-name">
               <div :class="item.class"></div>
               <div class="tabs-name">{{$t(item.name)}}</div>
             </div>
             <div class="line-value-unit" :test-id="`tabContent${index}`">
               <span class="line-value-unit-number">{{valueToRangeValue(item.analysis.avg, unitTypes.number)[0]}}</span>
               <span class="line-value-unit-number2">
                 <span>{{valueToRangeValue(item.analysis.avg, unitTypes.number)[1]}}</span>
                 <span v-if="item.unitType">{{item.unitType}}</span>
               </span>
             </div>
           </div>
         </div>
       </div>
       <div class="line-select line-header-right">
         <div class="line-select-metric">
           <span>{{$t('detections.metric')}}:</span>
           <div class="line-select__operation">
             <el-select
                 size="small"
                 v-model="lineMetric"
                 placeholder=" "
                 popper-class="common-select"
                 :teleported="false"
                 @change="metricSelectChange"
             >
               <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
             </el-select>
           </div>
         </div>
       </div>
     </div>
     <div style="height: calc(100% - 74px); position: relative">
       <chart-no-data v-if="isNoData" test-id="noData"></chart-no-data>
       <div class="chart-drawing" v-show="showMarkLine && !isNoData" id="linkTrafficLineChart"></div>
     </div>
   </div>
 </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import LinkTrafficDrillDownList from '@/views/charts2/charts/linkMonitor/localComponents/LinkTrafficDrillDownList'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import Loading from '@/components/common/Loading'
import { useRoute } from 'vue-router'
import { ref, shallowRef } from 'vue'
import { valueToRangeValue } from '@/utils/unit-convert'
import { chartColor3, chartColor4, unitTypes } from '@/utils/constants'
import { getLineType, overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { getNowTime, getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import _ from 'lodash'
import * as echarts from 'echarts'
import { linkTrafficLineChartOption } from '@/views/charts2/charts/options/echartOption'
import { stackedLineTooltipFormatter } from '@/views/charts/charts/tools'
import axios from 'axios'
import { dataForLinkTrafficLine } from '@/utils/static-data'

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
      options: dataForLinkTrafficLine.options,
      tabs: dataForLinkTrafficLine.tabs,
      valueToRangeValue,
      unitTypes,
      chartDateObject: [],
      timer: null,
      mousemoveCursor: '',
      leftOffset: 0,
      sizes: [3, 4, 6, 8, 9, 10],
      dynamicVariable: '',
      showMarkLine: true,
      loading: false,
      showError: false,
      errorMsg: ''
    }
  },
  watch: {
    lineTab (n) {
      this.$nextTick(() => {
        this.handleActiveBar(n)
        this.reloadUrl({ lineTab: n })
      })
    },
    lineMetric (n) {
      this.reloadUrl({ lineMetric: n })
    },
    timeFilter: {
      handler () {
        if (this.lineTab) {
          this.init(this.lineMetric, this.showMarkLine, 'active')
        } else {
          this.init()
        }
      }
    }
  },
  methods: {
    reloadUrl (newParam) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, newParam)
      overwriteUrl(newUrl)
    },
    init (val, show, active, timeFilter) {
      if (!val) {
        val = this.lineMetric
      }
      const params = {
        startTime: timeFilter ? timeFilter.startTime : getSecond(this.timeFilter.startTime),
        endTime: timeFilter ? timeFilter.endTime : getSecond(this.timeFilter.endTime)
      }
      if (this.queryCondition) {
        const condition = this.queryCondition.split(' or ')
        if (condition.length > 1) {
          params.outParam = condition.find(c => c.indexOf('out_link_id') > -1 || c.indexOf('out_link_direction') > -1)
          params.inParam = condition.find(c => c.indexOf('in_link_id') > -1 || c.indexOf('in_link_direction') > -1)
          params.q = this.queryCondition
        }
      }
      this.loading = true
      axios.get(api.linkMonitor.totalTrafficAnalysis, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          this.showError = false
          this.chartDateObject = res.data.result
          this.isNoData = res.data.result.length === 0
          if (!active) {
            this.tabs = dataForLinkTrafficLine.tabs
          }
          if (this.isNoData) {
            this.lineTab = ''
            this.tabs = dataForLinkTrafficLine.tabs
          } else {
            this.initData(res.data.result, val, active, show)
          }
        } else {
          this.showError = true
          this.errorMsg = this.errorMsgHandler(res)
        }
      }).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
        this.isNoData = false
      }).finally(() => {
        this.loading = false
      })
    },
    initTabData (val, show, active) {
      if (!val) {
        val = this.lineMetric
      }
      this.loading = true
      try {
        this.initData(this.chartDateObject, val, active, show)
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    echartsInit (echartsData) {
      if (!this.isUnitTesting) {
        if (this.lineTab) {
          this.handleActiveBar()
          echartsData = echartsData.filter(t => t.show === true && t.invertTab === false)
        } else {
          echartsData = echartsData.filter(t => t.show === true)
        }

        const _this = this
        // const dom = document.getElementById('linkTrafficLineChart')
        // !this.myChart && (this.myChart = echarts.init(dom))

        this.chartOption = linkTrafficLineChartOption
        const chartOption = this.chartOption.series[0]

        echartsData = echartsData.reverse()
        this.chartOption.series = echartsData.map((t, i) => {
          return {
            ...chartOption,
            name: t.name,
            lineStyle: {
              color: chartColor3[t.positioning],
              width: 1
            },
            stack: t.name !== 'network.total' ? 'network.total' : '',
            symbolSize: function (value) {
              return _this.symbolSizeSortChange(i, value[0])
            },
            emphasis: {
              itemStyle: {
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
            this.tabs.forEach(e => {
              if (this.$t(e.name) === t.seriesName) {
                t.borderColor = chartColor3[e.positioning]
              }
            })
          })
          return stackedLineTooltipFormatter(params)
        }

        this.showMarkLine = true
        this.$nextTick(() => {
          if (this.myChart) {
            this.myChart.dispose()
          }
          this.myChart = echarts.init(document.getElementById('linkTrafficLineChart'))
          this.myChart.setOption(this.chartOption)

          this.myChart.dispatchAction({
            type: 'takeGlobalCursor',
            key: 'brush',
            brushOption: {
              brushType: 'lineX',
              xAxisIndex: 'all',
              brushMode: 'single',
              throttleType: 'debounce'
            }
          })
          this.myChart.on('brushEnd', this.brushEcharts)
        })
      }
    },
    activeChange (item, index, isClick) {
      if (this.isNoData) return
      this.lineTab = item.class
      this.legendSelectChange(item, index, 'active')
      this.showMarkLine = !item.invertTab
      if (isClick) {
        this.initTabData(this.lineMetric, this.showMarkLine, 'active')
      } else {
        this.init(this.lineMetric, this.showMarkLine, 'active')
      }
    },
    mouseenter (item) {
      if (this.isNoData) return
      this.mousemoveCursor = item.class
      this.handleActiveBar(item.class)
    },
    mouseleave () {
      this.mousemoveCursor = ''
    },
    dispatchSelectAction (type, name) {
      this.myChart && this.myChart.dispatchAction({
        type: type,
        name: name
      })
    },
    legendSelectChange (item, index, val) {
      if (index === 'index') {
        this.dispatchSelectAction('legendSelect', item.name)
      } else if (this.tabs[index] && this.tabs[index].name === item.name) {
        this.dispatchSelectAction('legendSelect', item.name)
        this.tabs.forEach((t) => {
          if (t.name !== item.name) {
            this.dispatchSelectAction('legendUnSelect', t.name)
          }
        })
      }
      if (val === 'active') {
        this.tabs.forEach(t => {
          t.invertTab = item.name === t.name ? !t.invertTab : true
          if (t.invertTab && item.name === t.name) {
            this.lineTab = this.lineTab ? '' : t.class
            this.tabs.forEach((e) => {
              this.dispatchSelectAction('legendSelect', e.name)
            })
          }
        })
      }
    },
    handleActiveBar () {
      if (document.querySelector('.network .line-value-tabs.is-active')) {
        const { offsetLeft, clientWidth, clientLeft } = document.querySelector('.network .line-value-tabs.is-active')
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
      this.tabs.forEach((e) => {
        if (!e.invertTab) {
          e.invertTab = true
        }
      })
      const { query } = this.$route
      const rangeParam = query.range
      let params = {}
      // 优先级：url > config.js > 默认值。
      const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.dashboard || 60)
      if (dateRangeValue !== -1) {
        const { startTime, endTime } = getNowTime(dateRangeValue)
        params = { startTime: getSecond(startTime), endTime: getSecond(endTime), range: dateRangeValue }
      }
      this.reloadUrl(params)
      this.init(val, this.showMarkLine, null, params)
    },
    symbolSizeSortChange (index, time) {
      const dataIntegrationArray = []
      for (let i = 0; i < 3; i++) {
        if (linkTrafficLineChartOption.series[i]) {
          const item = linkTrafficLineChartOption.series[i].data.find(t => t[0] === time)
          if (item) {
            dataIntegrationArray.push(item)
            item[2] = i
          }
        }
      }
      dataIntegrationArray.sort((a, b) => { return a[1] - b[1] })
      const sortIndex = dataIntegrationArray.findIndex(a => a[2] === index)
      return this.sizes[sortIndex]
    },
    initData (data, val, active, show) {
      let lineData = []
      if (data !== undefined && data.length > 0) {
        data.forEach((item) => {
          item.type = getLineType(item.type)
          if (item.type === val) {
            lineData = Object.keys(item).map(t => {
              return {
                ...item[t],
                label: t
              }
            })
          }
        })
      }
      lineData.splice(0, 1)
      const tabs = _.cloneDeep(this.tabs)
      const unit = val === 'Bits/s' ? 'bps' : 'packets/s'
      this.legendInit(lineData, active, show, unit, tabs)
    },
    legendInit (data, active, show, type, linkData) {
      data.forEach(d => {
        const obj = linkData.find(item => d.label.includes(item.label))
        if (obj) {
          obj.data = d.values
          obj.analysis = d.analysis
        }
      })
      let num = 0
      linkData.forEach(e => {
        e.unitType = type
        if (parseFloat(e.analysis.max) === 0 || isNaN(parseFloat(e.analysis.max))) {
          e.show = false
          num += 1
        } else {
          e.show = true
          if (!active && !show) {
            this.legendSelectChange(e, 'index')
          }
        }
        if (this.lineTab === e.class) {
          if (parseFloat(e.analysis.max) <= 0) {
            this.lineTab = ''
            this.lineRefer = ''
            // this.init() // 暂时注掉，后续观察
          }
        }
      })
      const emptyData = linkData.filter(d => parseFloat(d.analysis.max) === 0)
      this.isNoData = emptyData.length === linkData.length
      if (this.isNoData) {
        return true
      }
      this.tabs = linkData
      // 如果三者avg都为0时，至少保证total显示
      const ingressObj = linkData.find(d => d.name === 'linkMonitor.ingress')
      const egressObj = linkData.find(d => d.name === 'linkMonitor.egress')
      let ingressAvg = 0
      let egressAvg = 0
      if (ingressObj) {
        ingressAvg = parseFloat(ingressObj.analysis.max) || 0
      }
      if (egressObj) {
        egressAvg = parseFloat(egressObj.analysis.max) || 0
      }
      if ((ingressAvg + egressAvg) === 0) {
        const totalObj = linkData.find(d => d.name === 'network.total')
        totalObj.show = true
      }

      if (num === 3) {
        linkData[0].invertTab = false
        this.lineTab = 'total'
        this.legendSelectChange(linkData[0], 0)
        this.$nextTick(() => {
          this.echartsInit(this.tabs)
        })
      } else {
        this.$nextTick(() => {
          this.echartsInit(this.tabs)
          if (!this.lineRefer) this.lineRefer = 'Average'
        })
      }
    },
    /**
     * echarts框选
     * @param params
     */
    brushEcharts (params) {
      this.myChart.dispatchAction({
        type: 'brush',
        areas: [] // 删除选框
      })
      // 避免点击空白区域报错
      if (params.areas && params.areas.length > 0) {
        const rangeObj = {
          startTime: Math.ceil(params.areas[0].coordRange[0]),
          endTime: Math.ceil(params.areas[0].coordRange[1])
        }

        // 暂定框选最小范围为5分钟，后续可能会变动
        if (rangeObj.endTime - rangeObj.startTime < 5 * 60 * 1000) {
          rangeObj.startTime = rangeObj.endTime - 5 * 60 * 1000
        }
        this.$store.commit('setRangeEchartsData', rangeObj)
      }
    },
    initLink () {
      if (this.lineTab) {
        const data = this.tabs.find(t => t.class === this.lineTab)
        this.activeChange(data, data.positioning)
      } else {
        this.init()
      }
    }
  },
  mounted () {
    if (!this.isUnitTesting) {
      this.timer = setTimeout(() => {
        this.initLink()
      }, 200)
    } else {
      this.initLink()
    }
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)
    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
    this.chartOption = null
    this.valueToRangeValue = null
    this.chartDateObject = []
  }
}
</script>
