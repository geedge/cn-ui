<template>
  <div class="line network">
    <chart-error v-if="showError" :content="errorMsg"/>
    <div class="line-header" v-if="!showError">
      <div class="line-header-left">
        <div class="line-value-active" v-if="lineTab"></div>
        <div class="line-value">
          <template v-for="(item, index) in tabs">
            <div class="line-value-tabs"
                 :class=" {'is-active': lineTab === item.class, 'mousemove-cursor': mousemoveCursor === item.class}"
                 v-if="item.show"
                 :key="index"
                 @mouseenter="mouseenter(item)"
                 @mouseleave="mouseleave(item)"
                 @click="activeChange(item, index,true)"
                 :test-id="`tab${index}`"
            >
              <div class="line-value-tabs-name">
                <div :class="item.class"></div>
                <div class="tabs-name" :test-id="`tabTitle${index}`">{{ $t(item.name) }}</div>
              </div>
              <div class="line-value-unit" :test-id="`tabContent${index}`">
                <span class="line-value-unit-number">{{ valueToRangeValue(item.analysis.avg, unitTypes.number)[0] }}</span>
                <span class="line-value-unit-number2">
                <span>{{ valueToRangeValue(item.analysis.avg, unitTypes.number)[1] }}</span>
                <span v-if="item.unitType">{{ item.unitType }}</span>
              </span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="line-select line-header-right">
        <div class="line-select-reference-line">
          <span>{{ $t('network.referenceLine') }}:</span>
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
    <div style="height: calc(100% - 74px); position: relative">
      <chart-no-data v-if="isNoData && !showError"></chart-no-data>
      <div class="chart-drawing" v-show="showMarkLine && !isNoData && !showError" ref="overviewLineChart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { stackedLineChartOption } from '@/views/charts2/charts/options/echartOption'
import { valueToRangeValue } from '@/utils/unit-convert'
import { unitTypes, chartColor3, chartColor4 } from '@/utils/constants.js'
import { ref, shallowRef } from 'vue'
import { stackedLineTooltipFormatter } from '@/views/charts/charts/tools'
import _ from 'lodash'
import axios from 'axios'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { getLineType, getMarkLineByLineRefer, overwriteUrl, urlParamsHandler } from '@/utils/tools'
import ChartError from '@/components/common/Error'
import { dataForNetworkOverviewLine } from '@/utils/static-data'

export default {
  name: 'NetworkOverviewLine',
  components: {
    ChartError,
    ChartNoData
  },
  props: {
    metric: {
      type: String,
      default: 'Bits/s'
    }
  },
  setup () {
    const { query } = useRoute()
    const lineRefer = ref(query.lineRefer || 'Average')
    const lineTab = ref(query.lineTab || '')
    const queryCondition = ref(query.queryCondition || '')
    const tabOperationType = ref(query.tabOperationType)
    const networkOverviewBeforeTab = ref(query.networkOverviewBeforeTab)
    return {
      lineRefer,
      lineTab,
      queryCondition,
      tabOperationType,
      networkOverviewBeforeTab,
      myChart: shallowRef(null)
    }
  },
  mixins: [chartMixin],
  data () {
    return {
      options2: dataForNetworkOverviewLine.options2,
      tabsTemplate: dataForNetworkOverviewLine.tabsTemplate,
      tabs: [],
      valueToRangeValue,
      unitTypes,
      chartDateObject: [],
      timer: null,
      mousemoveCursor: '',
      leftOffset: 0,
      sizes: [3, 4, 6, 8, 9, 10],
      dynamicVariable: '',
      showMarkLine: true,
      mouseDownFlag: false,
      brushHistory: [],
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
    lineRefer (n) {
      this.reloadUrl({ lineRefer: n })
    },
    timeFilter: {
      handler () {
        if (this.lineTab) {
          this.init(this.metric, this.showMarkLine, 'active')
        } else {
          this.init()
        }
      }
    },
    metric (n) {
      this.handleActiveBar()
      this.showMarkLine = !this.showMarkLine
      this.tabs.forEach((e) => {
        if (!e.invertTab) {
          e.invertTab = true
        }
      })
      this.init(n, this.showMarkLine, '', n)
    }
  },
  methods: {
    reloadUrl (newParam) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, newParam)
      overwriteUrl(newUrl)
    },
    init (val, show, active, n) {
      const newVal = val ? _.clone(val) : this.metric

      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      if (this.queryCondition) {
        params.q = this.queryCondition
      }

      this.toggleLoading(true)
      axios.get(api.netWorkOverview.totalTrafficAnalysis, { params: params }).then(response => {
        const res = response.data

        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.showError = false
          if (this.isNoData) {
            this.lineTab = ''
            this.tabs = _.cloneDeep(this.tabsTemplate)
          } else {
            this.initData(res.data.result, newVal, active, show, n)
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    echartsInit (echartsData, show) {
      // echarts内容在单元测试时不执行
      if (!this.isUnitTesting) {
        if (this.lineTab) {
          this.handleActiveBar()
          echartsData = echartsData.filter(t => t.show === true && t.class === this.lineTab) // t.invertTab === false
        } else {
          echartsData = echartsData.filter(t => t.show === true)
        }
        const _this = this
        this.chartOption = stackedLineChartOption
        const chartOption = this.chartOption.series[0]
        // 1、堆叠图从下往上堆叠图形，数组倒序操作，目的让堆叠图图形按数组一样从上往下展示
        // 2、tooltip会跟着倒序操作，数据展示相反，tooltip处再将数组倒序回来
        echartsData = echartsData.reverse()
        this.chartOption.series = echartsData.map((t, i) => {
          return {
            ...chartOption,
            name: t.name,
            type: 'line',
            showSymbol: false,
            smooth: true,
            symbol: 'circle',
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
            data: t.data.map(v => [Number(v[0]) * 1000, Number(v[1]), 'number']),
            markLine: {
              silent: true,
              lineStyle: {
                color: '#B4B1A8'
              },
              symbol: 'none',
              label: {
                formatter (params) {
                  const arr = valueToRangeValue(params.value, unitTypes.number).join('')
                  return _this.lineRefer + '(' + arr + echartsData[0].unitType + ')'
                },
                position: 'insideStartTop',
                color: '#717171',
                fontFamily: 'NotoSansSChineseRegular'
              }
            }
          }
        })
        if (!show && !this.lineTab) {
          this.chartOption.series.forEach((t) => {
            t.markLine.label.show = false
            t.markLine = []
          })
        }

        if (show) {
          this.chartOption.series.forEach((t, i) => {
            t.markLine.label.show = true
            t.markLine.data = [
              {
                yAxis: echartsData[i].analysis[getMarkLineByLineRefer(this.lineRefer)]
              }
            ]
          })
        }

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
          this.myChart = echarts.init(this.$refs.overviewLineChart)
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
          // 选中tab并刷新界面时，自动触发，避免markLine不显示的情况
          if (this.lineTab) {
            this.referenceSelectChange(this.lineRefer)
          }

          this.myChart.on('brushEnd', this.brushEcharts)
        })
      }
    },
    activeChange (item, index, isClick) { // isClick:代表是通过点击操作来的
      if (this.isNoData) return
      if (isClick && this.lineTab === item.class) { // 点击高亮 tab 后取消高亮，恢复到全不高亮的状态
        this.legendSelectChange(item, index, 'active', true)
        this.lineTab = ''
        this.showMarkLine = false
      } else {
        this.lineTab = item.class
        this.legendSelectChange(item, index, 'active')
        this.showMarkLine = !item.invertTab
      }
      this.init(this.metric, this.showMarkLine, 'active')
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
    legendSelectChange (item, index, val, isActiveAll) {
      if (index === 'index') {
        this.dispatchSelectAction('legendSelect', item.name)
      } else if (this.tabs[index] && this.tabs[index].name === item.name) {
        if (isActiveAll) {
          this.tabs.forEach((t) => {
            this.dispatchSelectAction('legendSelect', t.name)
          })
        } else {
          this.dispatchSelectAction('legendSelect', item.name)
          this.tabs.forEach((t) => {
            if (t.name !== item.name) {
              this.dispatchSelectAction('legendUnSelect', t.name)
            }
          })
        }
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
        const {
          offsetLeft,
          clientWidth,
          clientLeft
        } = document.querySelector('.network .line-value-tabs.is-active')
        const activeBar = document.querySelector('.network .line-value-active')
        activeBar.style.cssText += `width: ${clientWidth}px; left: ${offsetLeft + this.leftOffset + clientLeft}px;`
      }
    },
    resize () {
      if (this.myChart) {
        this.myChart.resize()
      }
    },
    referenceSelectChange (val) {
      this.lineRefer = val
      let echartsData
      if (this.lineTab) {
        echartsData = this.tabs.filter(t => t.show === true && t.class === this.lineTab) // t.invertTab === false
      } else {
        echartsData = this.tabs.filter(t => t.show === true)
      }
      if (!this.isUnitTesting) {
        const chartOption = this.myChart.getOption()

        if (this.showMarkLine) {
          chartOption.series.forEach(t => {
            if (t.name === echartsData[0].name) {
              t.markLine.data = [{ yAxis: echartsData[0].analysis[getMarkLineByLineRefer(this.lineRefer)] }]
            }
          })
        }

        this.myChart.setOption(chartOption)
      }
    },
    symbolSizeSortChange (index, time) {
      const dataIntegrationArray = []
      for (let i = 0; i < 5; i++) {
        if (stackedLineChartOption.series[i]) {
          const item = stackedLineChartOption.series[i].data.find(t => t[0] === time)
          if (item) {
            dataIntegrationArray.push(item)
            item[2] = i
          }
        }
      }

      dataIntegrationArray.sort((a, b) => {
        return a[1] - b[1]
      })
      const sortIndex = dataIntegrationArray.findIndex(a => a[2] === index)
      return this.sizes[sortIndex]
    },
    initData (data, val, active, show, n) {
      let lineData = []
      if (data !== undefined && data.length > 0) {
        data.forEach((item) => {
          item.type = getLineType(item.type)
          if (item.type === val) {
            lineData = Object.keys(item).map(t => {
              return {
                ...item[t]
              }
            })
          }
        })
      }
      lineData.splice(0, 1)
      if (val === 'Sessions/s') {
        const tabs = _.cloneDeep(this.tabsTemplate)
        lineData.forEach((d, i) => {
          tabs[i].data = d.values
          tabs[i].analysis = d.analysis
        })
        tabs.forEach((e, i) => {
          if (i !== 0) {
            e.show = false
          }
          e.unitType = 'sessions/s'
          e.invertTab = false
          this.lineTab = 'total'
          this.legendSelectChange(e, 0)
        })
        this.tabs = tabs
        this.$nextTick(() => {
          this.echartsInit(this.tabs, true)
        })
      } else {
        const unit = val === 'Bits/s' ? 'bps' : 'packets/s'
        this.legendInit(lineData, active, show, unit, n)
      }
    },
    legendInit (data, active, show, type, n) {
      const tabs = _.cloneDeep(this.tabsTemplate)
      data.forEach((d, i) => {
        tabs[i].data = d.values
        tabs[i].analysis = d.analysis
      })
      let num = 0
      const self = this
      tabs.forEach(e => {
        e.unitType = type
        if (e.name !== 'network.total' && parseFloat(e.analysis.avg) === 0) {
          e.show = false
          num += 1
        } else {
          e.show = true
          if (!active && show !== self.lineRefer) {
            self.legendSelectChange(e, 'index')
          }
        }
        if (self.lineTab === e.class) {
          if (parseFloat(e.analysis.avg) <= 0) {
            self.lineTab = ''
            self.lineRefer = ''
            self.init()
          }
        }
      })
      this.tabs = tabs
      if (num === 5) {
        tabs[0].invertTab = false
        this.lineTab = 'total'
        this.legendSelectChange(tabs[0], 0)
        this.$nextTick(() => {
          this.echartsInit(this.tabs, true)
        })
      } else {
        if (n) this.lineTab = ''
        this.$nextTick(() => {
          this.echartsInit(this.tabs, show)
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
      if (!this.mouseDownFlag) {
        // 避免点击空白区域报错
        if (params.areas && params.areas.length > 0) {
          this.brushHistory.unshift({
            startTime: _.cloneDeep(this.timeFilter.startTime) * 1000,
            endTime: _.cloneDeep(this.timeFilter.endTime) * 1000
          })

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
      }
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    }
  },
  mounted () {
    this.myChart = null
    this.chartOption = null
    const self = this
    self.timer = setTimeout(() => {
      if (self.lineTab && self.metric !== 'Sessions/s') {
        const data = self.tabsTemplate.find(t => t.class === self.lineTab)
        self.activeChange(data, data.positioning)
      } else {
        self.init()
      }
    }, 200)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)

    let myChart = echarts.getInstanceByDom(this.$refs.overviewLineChart)
    if (myChart) {
      echarts.dispose(myChart)
    }
    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
    // 检测时发现该方法占用较大内存，且未被释放
    this.valueToRangeValue = null
    myChart = null
  }
}
</script>
