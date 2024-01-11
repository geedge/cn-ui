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
                <div class="tabs-name" :test-id="`tabTitle${index}`" style="padding-left: 0;">{{ $t(item.name) }}</div>
              </div>
              <div class="line-value-unit" :test-id="`tabContent${index}`">
            <span class="line-value-unit-number">
              {{ valueToRangeValue(item.analysis.avg, unitTypes.number)[0] }}
            </span>
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
        <div class="panel__tools">
          <div class="panel__time line-date-right">
            <date-time-range
                class="entity-detail-date-time-range"
                :start-time="timeFilter.startTime"
                :end-time="timeFilter.endTime"
                :date-range="timeFilter.dateRangeValue"
                ref="dateTimeRange"
                @change="reload"
            />
          </div>
          <div class="line-select-metric">
            <span class="select-prefix line-margin-right">{{$t('network.metric')}}:</span>
            <el-select
                size="mini"
                v-model="metric"
                placeholder=" "
                popper-class="common-select"
                :popper-append-to-body="false"
                @change="metricChange"
            >
              <el-option v-for="item in metricOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <div style="height: calc(100% - 74px); position: relative">
      <chart-no-data v-if="isNoData && !showError"></chart-no-data>
      <div class="chart-drawing" v-show="!isNoData && !showError" ref="overviewLineChart"></div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import * as echarts from 'echarts'
import { stackedLineWithLegendChartOption } from '@/views/charts2/charts/options/echartOption'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import {
  unitTypes,
  chartColor3,
  chartColor4,
  metricType,
  metricOptions,
  chartColorForBehaviorPattern
} from '@/utils/constants.js'
import { ref, shallowRef } from 'vue'
import { stackedLineWithLegendTooltipFormatter } from '@/views/charts/charts/tools'
import _ from 'lodash'
import axios from 'axios'
import { api } from '@/utils/api'
import { getNowTime, getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { useRoute } from 'vue-router'
import { getLineType, overwriteUrl, urlParamsHandler } from '@/utils/tools'
import ChartError from '@/components/common/Error'
import { dataForNetworkOverviewLine } from '@/utils/static-data'

export default {
  name: 'EntityDetailLine',
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  setup () {
    const { query } = useRoute()
    const lineTab = ref(query.lineTab || 'total')
    const queryCondition = ref(query.queryCondition || '')
    const tabOperationType = ref(query.tabOperationType)
    const networkOverviewBeforeTab = ref(query.networkOverviewBeforeTab)
    const metric = ref(query.metric || 'Bits/s')

    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime

    // 优先级：url > config.js > 默认值。
    const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.entity.trafficLine || 60)
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(dateRangeValue)
      timeFilter.value.startTime = startTime
      timeFilter.value.endTime = endTime
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }

    return {
      lineTab,
      queryCondition,
      tabOperationType,
      networkOverviewBeforeTab,
      myChart: shallowRef(null),
      metric,
      timeFilter
    }
  },
  data () {
    return {
      tabsTemplate: dataForNetworkOverviewLine.tabsTemplate,
      tabs: [],
      unitConvert,
      valueToRangeValue,
      unitTypes,
      chartDateObject: [],
      timer: null,
      mousemoveCursor: '',
      leftOffset: 0,
      sizes: [3, 4, 6, 8, 9, 10],
      dynamicVariable: '',
      mouseDownFlag: false,
      brushHistory: [],
      showError: false,
      errorMsg: '',
      metricOptions
    }
  },
  watch: {
    lineTab (n) {
      this.$nextTick(() => {
        this.handleActiveBar(n)
        this.reloadUrl({ lineTab: n })
      })
    },
    timeFilter: {
      handler () {
        if (this.lineTab) {
          this.init(this.metric, 'active')
        } else {
          this.init()
        }
      }
    },
    metric (n) {
      this.handleActiveBar()
      if (n === metricType.Sessions) {
        this.lineTab = 'total'
      }
      const { query } = this.$route
      const rangeParam = query.range
      const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.entity.trafficLine || 60)
      if (dateRangeValue !== -1) {
        const { startTime, endTime } = getNowTime(dateRangeValue)
        const timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime), range: dateRangeValue }
        const newUrl = urlParamsHandler(window.location.href, query, timeFilter)
        overwriteUrl(newUrl)
        this.init(n, 'active', timeFilter)
      } else {
        this.initTabData(n, 'active')
      }
    }
  },
  methods: {
    reloadUrl (newParam) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, newParam)
      overwriteUrl(newUrl)
    },
    init (val, active, timeFilter) {
      const newVal = val ? _.clone(val) : this.metric

      const params = {
        resource: this.entity.entityName,
        startTime: timeFilter ? timeFilter.startTime : getSecond(this.timeFilter.startTime),
        endTime: timeFilter ? timeFilter.endTime : getSecond(this.timeFilter.endTime),
        metric: newVal
      }

      if (this.queryCondition) {
        params.q = this.queryCondition
      }

      this.toggleLoading(true)
      axios.get(`${api.entity.throughput}/${this.entity.entityType}/relate/app`, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          this.chartDateObject = res.data.result.slice(0, 10)
          this.isNoData = res.data.result.length === 0
          this.showError = false
          if (!active) {
            this.tabs = _.cloneDeep(this.tabsTemplate)
          }
          if (this.isNoData) {
            this.lineTab = ''
            this.tabs = _.cloneDeep(this.tabsTemplate)
          } else {
            this.initData(res.data.result.slice(0, 10), newVal, active)
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
    initTabData (val, active) {
      const newVal = val ? _.clone(val) : this.metric
      this.toggleLoading(true)
      try {
        if (this.chartDateObject.length > 0) {
          this.initData(this.chartDateObject, newVal, active)
        } else {
          this.init(val, active)
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.toggleLoading(false)
      }
    },
    echartsInit (echartsData) {
      // echarts内容在单元测试时不执行
      if (!this.isUnitTesting) {
        if (this.lineTab) {
          this.handleActiveBar()
        }
        const _this = this
        this.chartOption = stackedLineWithLegendChartOption
        const chartOption = this.chartOption.series[0]
        this.chartOption.series = echartsData.map((t, i) => {
          return {
            ...chartOption,
            name: t.name,
            type: 'line',
            showSymbol: false,
            smooth: true,
            symbol: 'circle',
            lineStyle: {
              color: chartColor3[i],
              width: 1
            },
            stack: 'stack',
            symbolSize: function (value) {
              return _this.symbolSizeSortChange(i, value[0])
            },
            emphasis: {
              itemStyle: {
                borderWidth: 2
              }
            },
            areaStyle: {
              opacity: 0.1,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: chartColorForBehaviorPattern[i]
                },
                {
                  offset: 1,
                  color: chartColorForBehaviorPattern[i]
                }
              ])
            },
            data: t.values.map(v => [Number(v[0]) * 1000, Number(v[1]), 'number'])
          }
        })
        this.chartOption.legend.data = echartsData.map(t => t.name).reverse()
        this.chartOption.tooltip.formatter = (params) => {
          params.forEach(t => {
            echartsData.forEach((e, i) => {
              if (e.name === t.seriesName) {
                t.borderColor = chartColorForBehaviorPattern[i]
              }
            })
          })
          return stackedLineWithLegendTooltipFormatter(params)
        }
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

          this.myChart.on('brushEnd', this.brushEcharts)
        })
      }
    },
    activeChange (item, index, isClick) { // isClick:代表是通过点击操作来的
      if (this.isNoData) return
      if (this.lineTab === item.class) return
      this.lineTab = item.class
      this.legendSelectChange(item, index, 'active')
      if (isClick) {
        this.initTabData(this.metric, 'active')
      } else {
        this.init(this.metric, 'active')
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
    symbolSizeSortChange (index, time) {
      const dataIntegrationArray = []
      for (let i = 0; i < 5; i++) {
        if (stackedLineWithLegendChartOption.series[i]) {
          const item = stackedLineWithLegendChartOption.series[i].data.find(t => t[0] === time)
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
    initData (data, val, active) {
      const lineData = []
      const tabData = []

      if (data && data.length > 0) {
        data.forEach(app => {
          Object.keys(app).forEach(appName => {
            if (app[appName] && app[appName].length > 0) {
              app[appName].forEach(item => {
                // 整理tab数据
                const templateList = ['total', 'inbound', 'outbound', 'internal', 'through', 'other']
                let typeData = tabData.find(t => t.type === item.type)
                if (!typeData) {
                  tabData.push({
                    type: item.type
                  })
                  typeData = tabData.find(t => t.type === item.type)
                }
                for (const key in templateList) {
                  const code = Object.keys(item).find(d => d.indexOf(templateList[key]) > -1)
                  if (code) {
                    if (typeData[code]) {
                      typeData[code].analysis.avg += Number(item[code].analysis.avg)
                      typeData[code].analysis.min += Number(item[code].analysis.min)
                      typeData[code].analysis.max += Number(item[code].analysis.max)
                      typeData[code].analysis.p95 += Number(item[code].analysis.p95)
                    } else {
                      typeData[code] = {
                        analysis: {
                          avg: Number(item[code].analysis.avg),
                          min: Number(item[code].analysis.min),
                          max: Number(item[code].analysis.max),
                          p95: Number(item[code].analysis.p95)
                        }
                      }
                    }
                    // 整理line数据
                    if (templateList[key] === this.lineTab && this.metric === getLineType(item.type)) {
                      lineData.push({ name: appName, ...item[code] })
                    }
                  }
                }
              })
            }
          })
        })
      }
      tabData.forEach(t => {
        t.type = getLineType(t.type)
      })
      // TODO 下面的逻辑是判断曲线的尾部数据，每条曲线从尾往前数0值的个数，若每条曲线的值全部为0个数大于0，所有曲线都从尾部去掉相同数量的点，最多4个
      const zeroPointCount = []
      lineData.forEach(l => {
        if (_.get(l, 'values', []).length > 4) {
          let count = 0
          for (let i = l.values.length - 1; i >= l.values.length - 4; i--) {
            if (l.values[i].length > 1 && l.values[i][1] === 0) {
              count++
            } else {
              break
            }
          }
          zeroPointCount.push(count)
        }
      })
      if (zeroPointCount.length > 0) {
        const minCount = _.min(zeroPointCount)
        if (minCount > 0) {
          lineData.forEach(l => {
            l.values.splice(l.values.length - minCount, minCount)
          })
        }
      }

      if (val === metricType.Sessions) {
        const tabs = _.cloneDeep(this.tabsTemplate)
        tabData.forEach((t, i) => {
          if (this.metric === t.type) {
            tabs[i].analysis = t.analysis
          }
        })
        tabs.forEach((tab, i) => {
          if (i !== 0) {
            tab.show = false
          }
          tab.invertTab = false
          tabData.forEach((t, i) => {
            if (this.metric === t.type) {
              Object.keys(t).forEach(k => {
                if (k !== 'type' && k.indexOf(tab.class) > -1) {
                  tab.analysis = t[k].analysis
                }
              })
            }
          })
          const metric = metricOptions.find(item => item.value === metricType.Sessions)
          tab.unitType = metric ? this.$t(metric.label) : ''
          this.lineTab = 'total'
          this.legendSelectChange(tab, 0)
        })
        /* tabs.forEach((e, i) => {
          if (i !== 0) {
            e.show = false
          }
          const metric = metricOptions.find(item => item.value === metricType.Sessions)
          e.unitType = metric ? this.$t(metric.label) : ''
          e.invertTab = false
          this.lineTab = 'total'
          this.legendSelectChange(e, 0)
        }) */
        this.tabs = tabs
        this.$nextTick(() => {
          this.echartsInit(lineData)
        })
      } else {
        let metric = metricOptions.find(item => item.value === val)
        if (!metric) {
          metric = metricOptions.find(item => item.value === metricType.Packets)
        }
        const unit = metric ? this.$t(metric.label) : ''
        this.legendInit(tabData, lineData, active, unit, val)
      }
    },
    legendInit (tabData, lineData, active, type, val) {
      const tabs = _.cloneDeep(this.tabsTemplate)
      tabs.forEach(tab => {
        tabData.forEach((t, i) => {
          if (this.metric === t.type) {
            Object.keys(t).forEach(k => {
              if (k !== 'type' && k.indexOf(tab.class) > -1) {
                tab.analysis = t[k].analysis
              }
            })
          }
        })
      })
      let num = 0
      const self = this
      tabs.forEach(e => {
        e.unitType = type
        if (e.name !== 'network.total' && parseFloat(e.analysis.max) === 0) {
          e.show = false
          num += 1
        } else {
          e.show = true
          if (!active) {
            self.legendSelectChange(e, 'index')
          }
        }
        if (self.lineTab === e.class) {
          if (parseFloat(e.analysis.max) <= 0) {
            self.lineTab = ''
            // self.init() // 后续多测试关注
          }
        }
      })
      const emptyData = tabs.filter(d => parseFloat(d.analysis.max) === 0)
      this.isNoData = emptyData.length === tabs.length
      if (this.isNoData) {
        return true
      }
      this.tabs = tabs
      if (num === 5) {
        tabs[0].invertTab = false
        this.lineTab = 'total'
        this.legendSelectChange(tabs[0], 0)
        this.$nextTick(() => {
          this.echartsInit(lineData)
        })
      } else {
        this.$nextTick(() => {
          this.echartsInit(lineData)
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
    },
    metricChange (value) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        metric: value
      })
      overwriteUrl(newUrl)
    },
    reload (startTime, endTime, dateRangeValue) {
      this.timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime) }
      const { query } = this.$route
      // 因为详情页是打开的新标签页，设置时间并不会影响到其他界面，所以store的名称不必改变
      this.$store.commit('setTimeRangeArray', [this.timeFilter.startTime, this.timeFilter.endTime])
      this.$store.commit('setTimeRangeFlag', dateRangeValue.value)

      const newUrl = urlParamsHandler(window.location.href, query, {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        range: dateRangeValue.value
      })
      overwriteUrl(newUrl)
    },
    timeRefreshChange () {
      // 不是自选时间
      if (this.$refs.dateTimeRange) {
        if (!this.$refs.dateTimeRange.isCustom) {
          const value = this.timeFilter.dateRangeValue
          this.$refs.dateTimeRange.quickChange(value)
        } else {
          this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
        }
      } else {
        this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
      }
    }
  },
  mounted () {
    this.myChart = null
    this.chartOption = null
    this.timer = setTimeout(() => {
      this.init()
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
    this.unitConvert = null
    this.valueToRangeValue = null
    myChart = null
  }
}
</script>
