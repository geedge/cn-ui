<template>
  <div class="npm-traffic-line">
    <div class="npm-traffic-line-header">
      <div class="npm-traffic-line-title"></div>
      <div class="line-select-metric">
        <span>{{$t('network.metric')}}:</span>
        <div class="line-select__operation">
          <el-select
              size="mini"
              v-model="metricFilter"
              placeholder=""
              popper-class="common-select"
              :popper-append-to-body="false"
              @change="metricChange"
          >
            <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div class="npm-traffic-line-body">
      <div style="position: absolute;width: 100%;">
        <chart-error v-if="showError" :content="errorMsg" />
      </div>
      <chart-no-data v-if="isNoData && !showError"></chart-no-data>
      <div v-show="!isNoData && !showError" class="chart-drawing" ref="chart-line"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { trafficLineChartOption } from '@/views/charts2/charts/options/echartOption'
import unitConvert from '@/utils/unit-convert'
import { chartColor3, unitTypes } from '@/utils/constants.js'
import { ref, shallowRef } from 'vue'
import { stackedLineTooltipFormatter } from '@/views/charts/charts/tools'
import axios from 'axios'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import _ from 'lodash'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import {
  getLineType,
  getLineIndexUnit,
  getLineIndexUnit2,
  overwriteUrl,
  urlParamsHandler,
  getQueryByType
} from '@/utils/tools'
import ChartError from '@/components/common/Error'
import { dataForNpmTrafficLine } from '@/utils/static-data'

export default {
  name: 'NpmTrafficLine',
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  setup () {
    const { query } = useRoute()
    const metricFilter = ref(query.lineMetric || 'Bits/s')
    const queryCondition = ref(query.queryCondition || '')
    const dimensionType = ref(query.dimensionType || '')
    const tabIndex = ref(query.tabIndex || 0)
    return {
      metricFilter,
      queryCondition,
      dimensionType,
      tabIndex,
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      unitConvert,
      unitTypes,
      side: '',
      chartData: {},
      tabs: dataForNpmTrafficLine.tabs,
      npmQuantity: dataForNpmTrafficLine.npmQuantity,
      metricOptions: dataForNpmTrafficLine.metricOptions,
      showError: false,
      errorMsg: ''
    }
  },
  watch: {
    metricFilter (n) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        lineMetric: n
      })
      overwriteUrl(newUrl)
    },
    timeFilter: {
      handler () {
        this.initData()
      }
    }
  },
  methods: {
    /**
     * 根据过滤条件，请求接口获得折线图数据
     * @param val
     */
    initData (val) {
      if (!val) {
        val = this.metricFilter
      }
      let condition = ''
      let type = this.dimensionType

      if (this.queryCondition.indexOf(' OR ') > -1) {
        condition = this.queryCondition.split(/["|'](.*?)["|']/)
      } else {
        condition = this.queryCondition
      }

      if (parseFloat(this.tabIndex) === 0) {
        this.side = 'client'
      } else if (parseFloat(this.tabIndex) === 1) {
        this.side = 'server'
      }

      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      // 此处过滤入参，再进行精简便降低可读性了，故暂时保留，若之后有更好处理方法则进行替换
      if (type) {
        if (type === 'clientIp' || type === 'serverIp') {
          if (parseFloat(this.tabIndex) === 0) {
            type = 'clientIp'
          } else if (parseFloat(this.tabIndex) === 1) {
            type = 'serverIp'
          }
          params.q = `ip='${condition.split(/'(.*?)'/)[1]}'`
        }
        params.type = type
      }

      if (condition && (typeof condition !== 'object') && type) {
        params.q = getQueryByType(type, condition)
      } else if (condition.length > 1 && type && type === 'ip') {
        params.q = `${type}='${condition[1]}' and side='${this.side}'`
      } else if (condition.length > 1 && type && type !== 'ip') {
        const typeList = ['country', 'asn', 'province', 'city', 'isp']
        const typeFlag = typeList.find(t => type === t)

        if (typeFlag) {
          params.q = `${type}='${condition[1]}'`
        } else if (type === 'idcRenter') {
          params.q = `idc_renter='${condition[1]}'`
        } else {
          params.q = `${condition[0]}'${condition[1]}'`
        }
      }

      this.toggleLoading(true)
      if (params.type && params.q) {
        axios.get(api.npm.overview.trafficGraph, { params: params }).then(res => {
          res = res.data
          if (res.code === 200) {
            this.showError = false
            this.isNoData = res.data.result.length === 0
            if (this.isNoData) {
              this.tabs = dataForNpmTrafficLine.tabs
              this.npmQuantity = dataForNpmTrafficLine.npmQuantity
            } else {
              this.initLineData(res.data.result, val)
            }
          } else {
            this.isNoData = false
            this.showError = true
            this.errorMsg = this.errorMsgHandler(res.message)
          }
        }).catch(e => {
          this.isNoData = false
          this.showError = true
          this.errorMsg = this.errorMsgHandler(e)
          console.error(e)
        }).finally(() => {
          this.toggleLoading(false)
        })
      } else {
        this.toggleLoading(true)
        const totalTrafficAnalysis = axios.get(api.npm.overview.totalTrafficAnalysis, { params: params })
        const totalNetworkAnalysis = axios.get(api.npm.overview.totalNetworkAnalysis, { params: params })
        const totalHttpResponseDelay = axios.get(api.npm.overview.totalHttpResponseDelay, { params: params })
        const totalSslConDelay = axios.get(api.npm.overview.totalSslConDelay, { params: params })
        const npmLineData = []
        Promise.all([totalNetworkAnalysis, totalTrafficAnalysis, totalHttpResponseDelay, totalSslConDelay]).then(res => {
          res.forEach(item => {
            if (item.data.code === 200) {
              npmLineData.push(...item.data.data.result)
            } else {
              this.isNoData = false
              this.showError = true
              this.errorMsg = this.errorMsgHandler(res.message)
            }
          })
          this.showError = false
          this.isNoData = npmLineData.length === 0
          if (this.isNoData) {
            this.tabs = dataForNpmTrafficLine.tabs
            this.npmQuantity = dataForNpmTrafficLine.npmQuantity
          } else {
            this.initLineData(npmLineData, val)
          }
        }).catch(e => {
          this.isNoData = false
          this.showError = true
          this.errorMsg = this.errorMsgHandler(e)
        }).finally(() => {
          this.toggleLoading(false)
        })
      }
    },
    /**
     * 初始化echarts折线图配置信息
     * @param echartsData
     * @param legendUnit
     */
    initEchartsOption (echartsData, legendUnit) {
      echartsData = echartsData.filter(t => t.show === true)
      this.$nextTick(() => {
        if (echartsData.length > 0) {
          const dom = this.$refs['chart-line']
          !this.myChart && (this.myChart = echarts.init(dom))

          this.chartOption = _.cloneDeep(trafficLineChartOption)
          const chartOption = this.chartOption.series[0]

          this.chartOption.series = echartsData.map((t) => {
            // 根据参数转换y轴单位
            this.chartOption.yAxis[0].axisLabel.formatter = (value) => {
              if (t.unitType === 'percent') {
                return unitConvert(value, t.unitType)[0]
              } else if (t.unitType === 'time') {
                return unitConvert(value, 'number').join('')
              } else {
                return unitConvert(value, t.unitType).join('')
              }
            }

            return {
              ...chartOption,
              name: t.name + (legendUnit || ''),
              lineStyle: {
                color: chartColor3[t.positioning],
                width: 1
              },
              stack: t.name !== this.$t('network.total') ? this.$t('network.total') : '',
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
              data: t.data.map(v => [Number(v[0]) * 1000, Number(v[1]), t.unitType])
            }
          })

          this.chartOption.tooltip.formatter = (params) => {
            params.forEach(t => {
              this.tabs.forEach(e => {
                if (e.name === t.seriesName) {
                  t.borderColor = chartColor3[e.positioning]
                }
              })
              this.npmQuantity.forEach(d => {
                const nameMs = d.name + '(ms)'
                const namePrent = d.name + '(%)'
                if (nameMs === t.seriesName) {
                  t.borderColor = chartColor3[d.positioning]
                } else if (namePrent === t.seriesName) {
                  t.borderColor = chartColor3[d.positioning]
                }
              })
            })
            return stackedLineTooltipFormatter(params)
          }

          this.myChart.on('legendselectchanged', this.selectLegend)
          this.myChart.setOption(this.chartOption, true)
        }
      })
    },
    /**
     * 点击前legend，高亮legend个数
     * @param params
     * @returns {number}
     */
    getSelectedNum (params) {
      let selectedNum = 0
      const legendItem = params.selected
      for (const name in legendItem) {
        if (name === params.name) {
          if (!legendItem[name]) {
            selectedNum = selectedNum + 1
          }
        } else {
          if (legendItem[name]) {
            selectedNum = selectedNum + 1
          }
        }
      }
      return selectedNum
    },
    /**
     * 自定义legend的点击事件:此方法只处理多条曲线的情况（单条曲线正常切换legend和曲线）
     * @param params
     */
    selectLegend (params) {
      // legend点击事件
      const legendNum = Object.keys(params.selected).length
      const selectedNum = this.getSelectedNum(params)
      const legendItem = params.selected
      if (selectedNum === legendNum) { // 点击前：全部曲线高亮
        for (const name in legendItem) {
          legendItem[name] = name === params.name
        }
      } else if (selectedNum === 1 && !params.selected[params.name]) { // 点击前：多条曲线，且只有一条曲线高亮时
        for (const name in legendItem) {
          legendItem[name] = true
        }
      }
      this.myChart.setOption({
        legend: {
          selected: legendItem
        }
      })
    },
    metricChange (value) {
      this.initData(value)
    },
    resize () {
      this.myChart.resize()
    },
    /**
     * 初始化整理折线图数据
     * @param data
     * @param val
     */
    initLineData (data, val) {
      let lineData = []
      if (data !== undefined && data.length > 0) {
        data.forEach(item => {
          item.type = getLineType(item.type)
          if (item.type === val) {
            if (['Bits/s', 'Packets/s', 'Sessions/s'].indexOf(val) > -1) {
              lineData = Object.keys((item)).map(t => {
                return {
                  ...item[t],
                  index: getLineIndexUnit2(t, false),
                  key: t
                }
              })
            } else {
              lineData = Object.keys((item)).map(t => {
                return {
                  ...item[t],
                  index: getLineIndexUnit(item.type, false),
                  unit: getLineIndexUnit(item.type, true),
                  key: t
                }
              })
            }
          }
        })
      }
      lineData.splice(0, 1)
      const tabs = _.cloneDeep(this.tabs)
      const npmQuantity = _.cloneDeep(this.npmQuantity)
      if (val === 'Sessions/s') {
        lineData.forEach((d, i) => {
          tabs[i].data = d.values
          tabs[i].analysis = d.analysis
        })
        tabs.forEach((e, i) => {
          if (i !== 0) {
            e.show = false
          }
        })
        this.tabs = tabs
        this.initEchartsOption(this.tabs)
      } else if (val !== 'Bits/s' && val !== 'Packets/s') {
        this.initLegend(lineData, npmQuantity, true)
      } else {
        this.initLegend(lineData, tabs, false)
      }
    },
    /**
     * 初始化legend
     * @param data
     * @param npmData
     * @param show
     */
    initLegend (data, npmData, show) {
      const newNpmData = _.clone(npmData)
      data.forEach(d => {
        if (show) {
          newNpmData[d.index].data = d.values
          newNpmData[d.index].analysis = d.analysis
        } else {
          newNpmData[d.index].data = d.values
          newNpmData[d.index].analysis = d.analysis
        }
      })
      if (show) {
        newNpmData.forEach((e, i) => {
          e.show = i === data[0].index
        })
        this.npmQuantity = newNpmData
        this.initEchartsOption(this.npmQuantity, data[0].unit)
      } else {
        newNpmData.forEach((e) => {
          e.show = true
        })
        this.tabs = newNpmData
        this.initEchartsOption(this.tabs)
      }
    }
  },
  mounted () {
    if (this.chart) {
      this.chartData = _.cloneDeep(this.chart)
    }
    this.timer = setTimeout(() => {
      this.initData()
    }, 200)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)
    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
    this.unitConvert = null
  }
}
</script>
