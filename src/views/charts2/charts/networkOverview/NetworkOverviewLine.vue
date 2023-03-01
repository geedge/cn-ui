<template>
  <div class="line network">
    <chart-error v-if="showError" :content="errorMsg" />
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
                 @click="activeChange(item, index)"
                 :test-id="`tab${index}`"
            >
              <div class="line-value-tabs-name">
                <div :class="item.class"></div>
                <div class="tabs-name" :test-id="`tabTitle${index}`">{{$t(item.name)}}</div>
              </div>
              <div class="line-value-unit" :test-id="`tabContent${index}`">
                <span class="line-value-unit-number">{{unitConvert(item.analysis.avg, unitTypes.number)[0]}}</span>
                <span class="line-value-unit-number2">
                <span>{{unitConvert(item.analysis.avg, unitTypes.number)[1]}}</span>
                <span v-if="item.unitType">{{item.unitType}}</span>
              </span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="line-select line-header-right">
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
    <div style="height: calc(100% - 74px); position: relative">
      <chart-no-data v-if="isNoData && !showError"></chart-no-data>
      <div class="chart-drawing" v-show="showMarkLine && !isNoData && !showError" ref="overviewLineChart"></div>
<!--      todo 后续改动，此处为框选返回-->
<!--      <div id="brushBtn" style="position: absolute;left: 0;top: 0;" v-show="mouseDownFlag">-->
<!--        <el-button @click.stop="backBrushHistory">返回</el-button>-->
<!--      </div>-->
    </div>
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
import axios from 'axios'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { getLineType, overwriteUrl, urlParamsHandler } from '@/utils/tools'
import ChartError from '@/components/common/Error'

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
      tabsTemplate: [
        { analysis: {}, name: 'network.total', class: 'total', show: true, invertTab: true, positioning: 0, data: [], unitType: '' },
        { analysis: {}, name: 'network.inbound', class: 'inbound', show: true, invertTab: true, positioning: 1, data: [], unitType: '' },
        { analysis: {}, name: 'network.outbound', class: 'outbound', show: true, invertTab: true, positioning: 2, data: [], unitType: '' },
        { analysis: {}, name: 'network.internal', class: 'internal', show: true, invertTab: true, positioning: 3, data: [], unitType: '' },
        { analysis: {}, name: 'network.through', class: 'through', show: true, invertTab: true, positioning: 4, data: [], unitType: '' },
        { analysis: {}, name: 'network.other', class: 'other', show: true, invertTab: true, positioning: 5, data: [], unitType: '' }
      ],
      tabs: [],
      unitConvert,
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
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, {
          lineTab: n
        })
        overwriteUrl(newUrl)
      })
    },
    lineRefer (n) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        lineRefer: n
      })
      overwriteUrl(newUrl)
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
    init (val, show, active, n) {
      if (!val) {
        val = this.metric
      }
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
        // const res = mockData.bytes.boundary.data
        this.errorMsg = res.message
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.showError = false
          if (this.isNoData) {
            this.lineTab = ''
            this.tabs = _.cloneDeep(this.tabsTemplate)
          } else {
            this.initData(res.data.result, val, active, show, n)
          }
        } else {
          this.showError = true
          this.errorMsg = res.message
        }
      }).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = e.message
        this.isNoData = false
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    /**
     * 初始化echartsdom，用于右键点击返回框选
     */
    domInit () {
      const self = this
      // 去掉默认的contextmenu事件，否则会和右键事件同时出现。
      document.oncontextmenu = function (e) {
        e.preventDefault()
      }
      document.getElementById('overviewLineChart').onmousedown = function (e) {
        // e.button: 0左键，1滚轮，2右键
        if (e.button === 2) {
          self.myChart.dispatchAction({
            type: 'brush',
            areas: [] // 删除选框
          })
          self.mouseDownFlag = true
          document.getElementById('brushBtn').style.left = e.layerX + 'px'
          document.getElementById('brushBtn').style.top = e.layerY + 74 + 'px'
        }
      }
    },
    echartsInit (echartsData, show) {
      // echarts内容在单元测试时不执行
      if (!this.isUnitTesting) {
        if (this.lineTab) {
          this.handleActiveBar()
          echartsData = echartsData.filter(t => t.show === true && t.class === this.lineTab)//t.invertTab === false
        } else {
          echartsData = echartsData.filter(t => t.show === true)
        }
        const _this = this
        // !this.myChart && (this.myChart = echarts.init(dom))
        // 此处为验证是否因dom未销毁，导致图表出错，后续可能会改
        this.chartOption = stackedLineChartOption
        const chartOption = this.chartOption.series[0]
        this.chartOption.series = echartsData.map((t, i) => {
          return {
            ...chartOption,
            name: t.name,
            type: "line",
            showSymbol: false,
            smooth: true,
            symbol: "circle",
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
          this.chartOption.series.forEach((t) => {
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
          this.myChart = echarts.init(this.$refs.overviewLineChart)
          this.myChart.setOption(this.chartOption)
          // 设置参见官网：https://echarts.apache.org/zh/api.html#action.brush.brush
          this.myChart.dispatchAction({
            // 刷选模式的开关。使用此 action 可将当前鼠标变为可刷选状态。事实上，点击 toolbox 中的 brush 按钮时，就是通过这个 action，将当前普通鼠标变为刷选器的。
            type: 'takeGlobalCursor',
            // 如果想变为“可刷选状态”，必须设置。不设置则会关闭“可刷选状态”。
            key: 'brush',
            brushOption: {
              // 参见 brush 组件的 brushType。如果设置为 false 则关闭“可刷选状态”。
              brushType: 'lineX',
              xAxisIndex: 'all',
              // 单击清除选框
              brushMode: 'single',
              // 选择完毕再返回所选数据
              throttleType: 'debounce'
            }
          })

          const self = this

          this.myChart.on('brushEnd', function (params) {
            self.myChart.dispatchAction({
              type: 'brush',
              areas: [] // 删除选框
            })
            if (!self.mouseDownFlag) {
              // 避免点击空白区域报错
              if (params.areas !== undefined && params.areas.length > 0) {
                self.brushHistory.unshift({
                  startTime: _.cloneDeep(self.timeFilter.startTime) * 1000,
                  endTime: _.cloneDeep(self.timeFilter.endTime) * 1000
                })

                const rangeObj = {
                  startTime: Math.ceil(params.areas[0].coordRange[0]),
                  endTime: Math.ceil(params.areas[0].coordRange[1])
                }

                // todo 目前暂定框选最小范围为5分钟，后续可能会变动
                if (rangeObj.endTime - rangeObj.startTime < 5 * 60 * 1000) {
                  rangeObj.startTime = rangeObj.endTime - 5 * 60 * 1000
                }
                _this.$store.commit('setRangeEchartsData', rangeObj)
              }
            }
          })
        })
      }
    },
    activeChange (item, index) {
      if (this.isNoData) return
      if(this.lineTab === item.class){//点击高亮 tab 后取消高亮，恢复到全不高亮的状态
        this.legendSelectChange(item, index, 'active',true)
        this.lineTab = ''
        this.showMarkLine = false
      }else {
        this.legendSelectChange(item, index, 'active')
        this.lineTab = item.class
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
    legendSelectChange (item, index, val,isActiveAll) {
      if (index === 'index') {
        this.dispatchLegendSelectAction(item.name)
      } else if (this.tabs[index] && this.tabs[index].name === item.name) {
        if(isActiveAll){
          this.tabs.forEach((t) => {
            this.dispatchLegendSelectAction(t.name)
          })
        } else {
          this.dispatchLegendSelectAction(item.name)
          this.tabs.forEach((t) => {
            if (t.name !== item.name) {
              this.dispatchLegendUnSelectAction(t.name)
            }
          })
        }
      }
      if (val === 'active') {
        this.tabs.forEach(t => {
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
            this.tabs.forEach((e) => {
              this.dispatchLegendSelectAction(e.name)
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
    referenceSelectChange (val) {
      this.lineRefer = val
      let echartsData
      if (this.lineTab) {
        echartsData = this.tabs.filter(t => t.show === true && t.class === this.lineTab)//t.invertTab === false
      } else {
        echartsData = this.tabs.filter(t => t.show === true)
      }
      if (!this.isUnitTesting) {
        const chartOption = this.myChart.getOption()
        if (this.lineRefer === 'Average' && this.showMarkLine) {
          chartOption.series.forEach((t, i) => {
            if (t.name === echartsData[0].name) {
              t.markLine.data = [{ yAxis: echartsData[0].analysis.avg }]
            }
          })
        } else if (this.lineRefer === '95th Percentile' && this.showMarkLine) {
          chartOption.series.forEach((t, i) => {
            if (t.name === echartsData[0].name) {
              t.markLine.data = [{ yAxis: echartsData[0].analysis.p95 }]
            }
          })
        } else if (this.lineRefer === 'Maximum' && this.showMarkLine) {
          chartOption.series.forEach((t, i) => {
            if (t.name === echartsData[0].name) {
              t.markLine.data = [{ yAxis: echartsData[0].analysis.max }]
            }
          })
        }
        this.myChart.setOption(chartOption)
      }
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
      let self = this
      tabs.forEach(e => {
        e.unitType = type
        if (e.name !== 'network.total' && parseFloat(e.analysis.avg) == 0) {
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
     * 鼠标右键返回框选的时间范围
     */
    backBrushHistory () {
      this.myChart.dispatchAction({
        type: 'brush',
        areas: [] // 删除选框
      })
      if (this.brushHistory.length > 0) {
        this.$store.commit('setRangeEchartsData', _.cloneDeep(this.brushHistory[0]))
        this.brushHistory.shift()
      }
      this.mouseDownFlag = false
    }
  },
  mounted () {
    // todo 初始化鼠标事件，开启右键返回
    // this.domInit()
    this.myChart = null
    this.chartOption = null
    let self = this
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
    this.unitConvert = null
    myChart = null
  }
}
</script>
