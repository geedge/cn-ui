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
      <div v-show="!isNoData && !showError" class="chart-drawing" id="chart-line"></div>
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
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import _ from 'lodash'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { getLineType, getLineIndexUnit, overwriteUrl, urlParamsHandler } from '@/utils/tools'
import ChartError from '@/components/common/Error'

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
      mpackets: [
        { name: this.$t('network.total'), show: true, positioning: 0, data: [], unitType: 'number' },
        { name: this.$t('network.inbound'), show: true, positioning: 1, data: [], unitType: 'number' },
        { name: this.$t('network.outbound'), show: true, positioning: 2, data: [], unitType: 'number' },
        { name: this.$t('network.internal'), show: true, positioning: 3, data: [], unitType: 'number' },
        { name: this.$t('network.through'), show: true, positioning: 4, data: [], unitType: 'number' },
        { name: this.$t('network.other'), show: true, positioning: 5, data: [], unitType: 'number' }
      ],
      npmQuantity: [
        { name: this.$t('networkAppPerformance.tcpConnectionEstablishLatency'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 0 },
        { name: this.$t('networkAppPerformance.httpResponse'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 1 },
        { name: this.$t('networkAppPerformance.sslResponseLatency'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 2 },
        { name: this.$t('networkAppPerformance.packetLoss'), show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 3 },
        { name: this.$t('overall.packetRetrans'), show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 4 }
      ],
      chartData: {},
      metricOptions: [
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
        },
        {
          value: 'establishLatencyMs',
          label: this.$t('networkAppPerformance.tcpConnectionEstablishLatency')
        },
        {
          value: 'httpResponseLatency',
          label: this.$t('networkAppPerformance.httpResponse')
        },
        {
          value: 'sslConLatency',
          label: this.$t('networkAppPerformance.sslResponseLatency')
        },
        {
          value: 'tcpLostlenPercent',
          label: this.$t('networkAppPerformance.packetLoss')
        },
        {
          value: 'pktRetransPercent',
          label: this.$t('overall.packetRetrans')
        }
      ],
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
        this.init()
      }
    }
  },
  methods: {
    init (val) {
      if (!val) {
        val = this.metricFilter
      }
      // const conditionStr = this.$route.query.queryCondition ? this.$route.query.queryCondition : ''
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
        if (type === 'clientIp' || type === 'serverIp') {
          params.q = `ip='${condition.split(/'(.*?)'/)[1]}'`
        } else if (type === 'clientCity') {
          params.q = `client_city='${condition.split(/'(.*?)'/)[1]}'`
        } else if (type === 'serverCity') {
          params.q = `server_city='${condition.split(/'(.*?)'/)[1]}'`
        } else {
          params.q = condition
        }
      } else if (condition.length > 1 && type && type === 'ip') {
        params.q = `${type}='${condition[1]}' and side='${this.side}'`
      } else if (condition.length > 1 && type && type !== 'ip') {
        if (type === 'country' || type === 'asn' || type === 'province' || type === 'city' || type === 'isp') {
          params.q = `${type}='${condition[1]}'`
        } else if (type === 'idcRenter') {
          params.q = `idc_renter='${condition[1]}'`
        } else {
          params.q = `${condition[0]}'${condition[1]}'`
        }
      }
      this.toggleLoading(true)
      if (params.type && params.q) {
        get(api.npm.overview.trafficGraph, params).then((res) => {
          if (res.code === 200) {
            this.showError = false
            this.isNoData = res.data.result.length === 0
            if (this.isNoData) {
              this.mpackets = [
                { name: this.$t('network.total'), show: true, positioning: 0, data: [], unitType: 'number' },
                { name: this.$t('network.inbound'), show: true, positioning: 1, data: [], unitType: 'number' },
                { name: this.$t('network.outbound'), show: true, positioning: 2, data: [], unitType: 'number' },
                { name: this.$t('network.internal'), show: true, positioning: 3, data: [], unitType: 'number' },
                { name: this.$t('network.through'), show: true, positioning: 4, data: [], unitType: 'number' },
                { name: this.$t('network.other'), show: true, positioning: 5, data: [], unitType: 'number' }
              ]
              this.npmQuantity = [
                { name: this.$t('networkAppPerformance.tcpConnectionEstablishLatency'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 0 },
                { name: this.$t('networkAppPerformance.httpResponse'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 1 },
                { name: this.$t('networkAppPerformance.sslResponseLatency'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 2 },
                { name: this.$t('networkAppPerformance.packetLoss'), show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 3 },
                { name: this.$t('overall.packetRetrans'), show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 4 }
              ]
            } else {
              this.initData(res.data.result, val)
            }
          } else {
            this.isNoData = false
            this.showError = true
            this.errorMsg = res.message
          }
        }).catch(e => {
          this.isNoData = false
          this.showError = true
          this.errorMsg = e.message
        }).finally(() => {
          this.toggleLoading(false)
        })
      } else {
        this.toggleLoading(true)
        const totalTrafficAnalysis = get(api.npm.overview.totalTrafficAnalysis, params)
        const totalNetworkAnalysis = get(api.npm.overview.totalNetworkAnalysis, params)
        const totalHttpResponseDelay = get(api.npm.overview.totalHttpResponseDelay, params)
        const totalSslConDelay = get(api.npm.overview.totalSslConDelay, params)
        const npmLineData = []
        Promise.all([totalNetworkAnalysis, totalTrafficAnalysis, totalHttpResponseDelay, totalSslConDelay]).then(res => {
          res.forEach(item => {
            if (item.code === 200) {
              npmLineData.push(...item.data.result)
            } else {
              this.isNoData = false
              this.showError = true
              this.errorMsg = res.message
            }
          })
          this.showError = false
          this.isNoData = npmLineData.length === 0
          if (this.isNoData) {
            this.mpackets = [
              { name: this.$t('network.total'), show: true, positioning: 0, data: [], unitType: 'number' },
              { name: this.$t('network.inbound'), show: true, positioning: 1, data: [], unitType: 'number' },
              { name: this.$t('network.outbound'), show: true, positioning: 2, data: [], unitType: 'number' },
              { name: this.$t('network.internal'), show: true, positioning: 3, data: [], unitType: 'number' },
              { name: this.$t('network.through'), show: true, positioning: 4, data: [], unitType: 'number' },
              { name: this.$t('network.other'), show: true, positioning: 5, data: [], unitType: 'number' }
            ]
            this.npmQuantity = [
              { name: this.$t('networkAppPerformance.tcpConnectionEstablishLatency'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 0 },
              { name: this.$t('networkAppPerformance.httpResponse'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 1 },
              { name: this.$t('networkAppPerformance.sslResponseLatency'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 2 },
              { name: this.$t('networkAppPerformance.packetLoss'), show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 3 },
              { name: this.$t('overall.packetRetrans'), show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 4 }
            ]
          } else {
            this.initData(npmLineData, val)
          }
        }).catch(e => {
          this.isNoData = false
          this.showError = true
          this.errorMsg = e.message
        }).finally(() => {
          this.toggleLoading(false)
        })
      }
    },
    echartsInit (echartsData, legendUnit) {
      echartsData = echartsData.filter(t => t.show === true)
      this.$nextTick(() => {
        if (echartsData.length > 0) {
          const dom = document.getElementById('chart-line')
          !this.myChart && (this.myChart = echarts.init(dom))
          this.chartOption = trafficLineChartOption
          const chartOption = this.chartOption.series[0]
          this.chartOption.series = echartsData.map((t) => {
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
              stack: t.name !== 'network.total' ? 'network.total' : '',
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
              this.mpackets.forEach(e => {
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
          this.myChart.on('legendselectchanged', this.handleLegendClick)
          this.myChart.setOption(this.chartOption, true)
        }
      })
    },
    // 点击前，高亮legend个数
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

    // 自定义legend的点击事件:此方法只处理多条曲线的情况（单条曲线正常切换legend和曲线）
    handleLegendClick (params) {
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
      this.init(value)
    },
    resize () {
      this.myChart.resize()
    },
    initData (data, val) {
      let lineData = []
      if (data !== undefined && data.length > 0) {
        data.forEach(item => {
          item.type = getLineType(item.type)
          if (item.type === val) {
            lineData = Object.keys((item)).map(t => {
              return {
                ...item[t],
                index: getLineIndexUnit(item.type, false),
                unit: getLineIndexUnit(item.type, true)
              }
            })
          }
        })
      }
      lineData.splice(0, 1)
      const mpackets = _.cloneDeep(this.mpackets)
      const npmQuantity = _.cloneDeep(this.npmQuantity)
      if (val === 'Sessions/s') {
        lineData.forEach((d, i) => {
          mpackets[i].data = d.values
          mpackets[i].analysis = d.analysis
        })
        mpackets.forEach((e, i) => {
          if (i !== 0) {
            e.show = false
          }
        })
        this.mpackets = mpackets
        this.echartsInit(this.mpackets)
      } else if (val !== 'Bits/s' && val !== 'Packets/s' && val !== 'Sessions/s') {
        this.legendInit(lineData, npmQuantity, true)
      } else {
        this.legendInit(lineData, mpackets, false)
      }
    },
    legendInit (data, npmData, show) {
      data.forEach((d, i) => {
        if (show) {
          npmData[d.index].data = d.values
          npmData[d.index].analysis = d.analysis
        } else {
          npmData[i].data = d.values
          npmData[i].analysis = d.analysis
        }
      })
      if (show) {
        npmData.forEach((e, i) => {
          e.show = i === data[0].index
        })
        this.npmQuantity = npmData
        this.echartsInit(this.npmQuantity, data[0].unit)
      } else {
        npmData.forEach((e) => {
          e.show = true
        })
        this.mpackets = npmData
        this.echartsInit(this.mpackets)
      }
    }
  },
  mounted () {
    if (this.chart) {
      this.chartData = _.cloneDeep(this.chart)
    }
    this.timer = setTimeout(() => {
      this.init()
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
