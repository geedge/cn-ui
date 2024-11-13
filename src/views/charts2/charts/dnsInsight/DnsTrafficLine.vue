<template>
  <div class="line network dns-traffic-line">
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
               @click="activeChange(item, index,true)">
            <div class="line-value-tabs-name">
              <div :class="item.class"></div>
              <div class="tabs-name">{{$t(item.name)}}</div>
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
<!--        <div class="line-select-metric">
          <span>{{$t('network.metric')}}:</span>
          <div class="line-select__operation">
            <el-select
                size="small"
                v-model="lineMetric"
                placeholder=" "
                popper-class="common-select"
                :teleported="false"
                @change="metricSelectChange"
            >
              <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
        </div>-->
        <div class="line-select-reference-line">
          <span>{{$t('network.referenceLine')}}&nbsp;:&nbsp;</span>
          <div class="line-select__operation">
            <el-select
                size="small"
                v-model="lineRefer"
                placeholder=" "
                :disabled="!lineTab"
                popper-class="common-select"
                :teleported="false"
                @change="referenceSelectChange"
            >
              <el-option :key="options2[0].value" :label="$t(options2[0].label)" :value="options2[0].value"></el-option>
              <el-option :key="options2[1].value" :label="$t(options2[1].label[0], options2[1].label[1])" :value="options2[1].value"></el-option>
              <el-option :key="options2[2].value" :label="$t(options2[2].label)" :value="options2[2].value"></el-option>
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <div style="height: calc(100% - 74px); position: relative">
      <chart-no-data v-if="isNoData"></chart-no-data>
      <div class="chart-drawing" v-show="showMarkLine && !isNoData" id="dnsLineChart"></div>
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
import { api } from '@/utils/api'
import axios from 'axios'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { getLineType, getMarkLineByLineRefer, overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { dataForDnsTrafficLine } from '@/utils/static-data'
export default {
  name: 'DnsTrafficLine',
  components: {
    ChartNoData
  },
  setup () {
    const { query } = useRoute()
    const lineMetric = ref(query.lineMetric || 'Queries/s')
    const lineRefer = ref(query.lineRefer || 'Average')
    const lineTab = ref(query.lineTab || '')
    const lineQueryCondition = ref(query.lineQueryCondition || '')
    const dimensionType = ref(query.dimensionType || '')
    return {
      lineQueryCondition,
      dimensionType,
      lineMetric,
      lineRefer,
      lineTab,
      myChart: shallowRef(null)
    }
  },
  mixins: [chartMixin],
  data () {
    return {
      options1: dataForDnsTrafficLine.options1,
      options2: dataForDnsTrafficLine.options2,
      tabs: dataForDnsTrafficLine.tabs,
      unitConvert,
      unitTypes,
      chartDateObject: [],
      timer: null,
      mousemoveCursor: '',
      leftOffset: 0,
      sizes: [3, 4, 6, 8, 9, 10],
      dynamicVariable: '',
      showMarkLine: true,
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
    lineRefer (n) {
      this.reloadUrl({ lineRefer: n })
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
    init (val, show, active) {
      if (!val) {
        val = this.lineMetric
      }

      const type = this.dimensionType
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        type: type
      }

      if (this.lineQueryCondition) {
        params.q = this.lineQueryCondition
      }

      this.toggleLoading(true)

      const url = this.lineQueryCondition ? api.dnsInsight.drilldownTrafficAnalysis : api.dnsInsight.totalTrafficAnalysis

      axios.get(url, { params }).then(res => {
        if (res.status === 200) {
          this.chartDateObject = res.data.data.result
          this.showError = false
          this.isNoData = res.data.data.result.length === 0
          if (!active) {
            this.tabs = _.cloneDeep(dataForDnsTrafficLine.tabs)
          }
          if (this.isNoData) {
            this.lineTab = ''
            this.tabs = _.cloneDeep(dataForDnsTrafficLine.tabs)
          } else {
            this.initData(res.data.data.result, val, active, show)
          }
        } else {
          this.isNoData = false
          this.showError = true
          this.errorMsg = this.errorMsgHandler(res.data)
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = false
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    initTabData (val, show, active) {
      if (!val) {
        val = this.lineMetric
      }
      this.toggleLoading(true)
      try {
        if (this.chartDateObject.length > 0) {
          this.initData(this.chartDateObject, val, active, show)
        } else {
          this.init(val, show, active)
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.toggleLoading(false)
      }
    },
    echartsInit (echartsData, show) {
      this.$nextTick(() => {
        if (this.lineTab) {
          this.handleActiveBar()
          echartsData = echartsData.filter(t => t.show === true && t.invertTab === false)
        } else {
          echartsData = echartsData.filter(t => t.show === true)
        }
        const _this = this
        if (echartsData.length > 0) {
          this.chartOption = stackedLineChartOption
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
                    const referIndex = _this.options2.findIndex(o => o.value === _this.lineRefer)
                    if (referIndex > -1) {
                      if (referIndex === 1) {
                        return _this.$t(_this.options2[1].label[0], _this.options2[1].label[1]) + '(' + arr + echartsData[0].unitType + ')'
                      } else {
                        return _this.$t(_this.options2[referIndex].label) + '(' + arr + echartsData[0].unitType + ')'
                      }
                    }
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
            this.myChart = echarts.init(document.getElementById('dnsLineChart'))
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
      })
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
      this.init(val, this.showMarkLine)
    },
    referenceSelectChange (val) {
      this.lineRefer = val
      let echartsData
      const chartOption = this.myChart.getOption()

      if (this.lineTab) {
        echartsData = this.tabs.filter(t => t.show === true && t.invertTab === false)
      } else {
        echartsData = this.tabs.filter(t => t.show === true)
      }
      if (this.showMarkLine) {
        chartOption.series.forEach(t => {
          if (t.name === echartsData[0].name) {
            t.markLine.data = [{ yAxis: echartsData[0].analysis[getMarkLineByLineRefer(this.lineRefer)] }]
          }
        })
      }

      this.myChart.setOption(chartOption)
    },
    symbolSizeSortChange (index, time) {
      const dataIntegrationArray = []
      for (let i = 0; i < 3; i++) {
        if (stackedLineChartOption.series[i]) {
          const item = stackedLineChartOption.series[i].data.find(t => t[0] === time)
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
      const totalData = lineData[0]
      // 判断total曲线的第一个值和最后一个值，若是0，则删除
      if (totalData.values.length > 1 && Number(totalData.values[totalData.values.length - 1][1]) === 0) {
        lineData.forEach(r => {
          r.values.splice(r.values.length - 1, 1)
        })
      }
      if (totalData.values[0].length > 1 && Number(totalData.values[0][1]) === 0) {
        lineData.forEach(l => {
          l.values.splice(0, 1)
        })
      }

      const tabs = _.cloneDeep(this.tabs)
      if (val === 'Queries/s') {
        lineData.forEach((d, i) => {
          tabs[i].data = d.values
          tabs[i].analysis = d.analysis
        })
        tabs.forEach((e, i) => {
          if (i !== 0) {
            e.show = false
          }
          e.unitType = 'queries/s'
          e.invertTab = false
          this.lineTab = 'total'
          this.legendSelectChange(e, 0)
        })
        this.tabs = tabs
        this.lineRefer = 'Average'
        this.echartsInit(this.tabs, true)
      } else {
        const unit = 'bps'
        this.legendInit(lineData, active, show, unit, tabs)
      }
    },
    legendInit (data, active, show, type, dnsData) {
      data.forEach(d => {
        const obj = dnsData.find(item => d.label.includes(item.class))
        if (obj) {
          obj.data = d.values
          obj.analysis = d.analysis
        }
      })

      let num = 0

      dnsData.forEach(e => {
        e.unitType = type
        if (parseFloat(e.analysis.max) === 0 || isNaN(parseFloat(e.analysis.max))) {
          e.show = false
          num += 1
        } else {
          e.show = true
          if (!active && show !== this.lineRefer) {
            this.legendSelectChange(e, 'index')
          }
        }
        if (this.lineTab === e.class) {
          if (parseFloat(e.analysis.max) <= 0) {
            this.lineTab = ''
            this.lineRefer = ''
            // this.init() // 后续多关注
          }
        }
      })
      const emptyData = dnsData.filter(d => parseFloat(d.analysis.max) === 0)
      this.isNoData = emptyData.length === dnsData.length
      if (this.isNoData) {
        return true
      }

      this.tabs = dnsData
      // 如果三者avg都为0时，至少保证total显示
      const ingressObj = dnsData.find(d => d.name === 'network.inbound')
      const egressObj = dnsData.find(d => d.name === 'network.outbound')
      let ingressAvg = 0
      let egressAvg = 0
      if (ingressObj) {
        ingressAvg = parseFloat(ingressObj.analysis.max) || 0
      }
      if (egressObj) {
        egressAvg = parseFloat(egressObj.analysis.max) || 0
      }
      if ((ingressAvg + egressAvg) === 0) {
        const totalObj = dnsData.find(d => d.name === 'network.total')
        totalObj.show = true
      }

      if (num === 3) {
        dnsData[0].invertTab = false
        this.lineTab = 'total'
        this.legendSelectChange(dnsData[0], 0)
        this.echartsInit(this.tabs)
      } else {
        this.echartsInit(this.tabs, show)
        if (!this.lineRefer) this.lineRefer = 'Average'
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
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      if (this.lineTab) {
        const data = this.tabs.find(t => t.class === this.lineTab)
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
    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
    this.chartOption = null
    this.unitConvert = null
    this.chartDateObject = []
  }
}
</script>
