<template>
  <div class="npm-line">
    <chart-no-data v-if="isNoData"></chart-no-data>
    <template v-if="chartData.i18n === 'overall.throughput'">
      <div class="npm-line-header">
        <div class="npm-line-header-title">
          {{$t(chartData.i18n) || chartData.name}}
          <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
        </div>
        <div class="npm-line-header-rights" v-if="chartData.params && chartData.params.showLegend && !isNoData">
          <div class="npm-line-header-right" :class="{'active': item.show}" v-for="(item, index) in chartOptionLineData" :key="index" @click="highlightEvent(item)">
            <div class="npm-line-header-icon" :class="'icon' + index"></div>
            <div class="npm-line-header-value">{{item.legend}}</div>
          </div>
        </div>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.tripTime'">
      <div class="npm-line-title">
        {{$t(chartData.i18n) || chartData.name}}(ms)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.httpResponse'">
      <div class="npm-line-title">
        {{$t(chartData.i18n) || chartData.name}}(ms)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.sslResponseLatency'">
      <div class="npm-line-title">
        {{$t(chartData.i18n) || chartData.name}}(ms)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.packetLoss'">
      <div class="npm-line-title">
        {{$t(chartData.i18n) || chartData.name}}(%)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.packetRetrans'">
      <div class="npm-line-title">
        {{$t(chartData.i18n) || chartData.name}}(%)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { npmLineChartOption } from '@/views/charts2/charts/options/echartOption.js'
import { shallowRef } from 'vue'
import _ from 'lodash'
import { stackedLineTooltipFormatter } from '@/views/charts/charts/tools'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import unitConvert from '@/utils/unit-convert'
import ChartError from '@/components/common/Error'

export default {
  name: 'NpmLine',
  components: {
    ChartError,
    ChartNoData
  },
  mixins: [chartMixin],
  setup () {
    return {
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      chartData: {},
      chartOptionLineData: [
        { legend: this.$t('network.total'), index: 0, invertTab: true, show: false, color: '#749F4D' },
        { legend: this.$t('network.inbound'), index: 1, invertTab: true, show: false, color: '#98709B' },
        { legend: this.$t('network.outbound'), index: 2, invertTab: true, show: false, color: '#E5A219' }
      ],
      npmLineColor: [
        { legend: '', color: '#749F4D' },
        { legend: '', color: '#98709B' },
        { legend: '', color: '#E5A219' }
      ],
      timer: null,
      myChartArray: [],
      side: this.$store.state.panel.npmLocationSide,
      country: this.$store.state.panel.npmLocationCountry,
      // province: '',
      showError: false,
      errorMsg: ''
    }
  },
  watch: {
    '$store.state.panel.npmLocationSide': {
      deep: true,
      handler (n) {
        this.side = n
        this.init()
      }
    },
    '$store.state.panel.npmLocationCountry': {
      deep: true,
      handler (n) {
        this.country = n
        this.init(n)
      }
    },
    timeFilter: {
      handler () {
        this.init()
      }
    }
  },
  methods: {
    init (n) {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        side: this.side
        // country: this.country
        // province: this.province
      }
      if (n) {
        params.country = n
      } else {
        params.country = ''
      }
      this.toggleLoading(true)
      let url
      if (this.chart.params) {
        if (this.chart.params.index === 0) {
          url = api.npm.location.thoughput
        } else if (this.chart.params.index === 1) {
          url = api.npm.location.tcpConnectionEstablishLatency
        } else if (this.chart.params.index === 2) {
          url = api.npm.location.httpResponseLatency
        } else if (this.chart.params.index === 3) {
          url = api.npm.location.sslHandshakeLatency
        } else if (this.chart.params.index === 4) {
          url = api.npm.location.packetsLoss
        } else if (this.chart.params.index === 5) {
          url = api.npm.location.packetsRetrains
        }
        if (url) {
          get(url, params).then(res => {
            if (res.code === 200) {
              this.showError = false
              this.isNoData = res.data.result.length === 0
              if (!this.isNoData) {
                if (this.chart.params.index === 0) {
                  res.data.result.forEach((t, i) => {
                    if (t.type === 'totalBitsRate') {
                      this.chartOptionLineData[i].values = t.values
                    } else if (t.type === 'inboundBitsRate') {
                      this.chartOptionLineData[i].values = t.values
                    } else if (t.type === 'outboundBitsRate') {
                      this.chartOptionLineData[i].values = t.values
                    }
                  })
                  const result = this.chartOptionLineData.filter(t => this.chartData.params.color.indexOf(t.color) > -1)
                  this.echartsInit(result, this.chartData, this.chartData.params.unitType)
                } else {
                  this.echartsInit(res.data.result, this.chartData, this.chartData.params.unitType)
                }
              }
            } else {
              this.isNoData = false
              this.showError = true
              this.errorMsg = res.message
            }
          }).catch((e) => {
            this.isNoData = false
            this.showError = true
            this.errorMsg = e.message
          }).finally(() => {
            this.toggleLoading(false)
          })
        }
      } else {
        this.isNoData = true
        this.toggleLoading(false)
      }
    },
    echartsInit (data, chartData, type) {
      const dom = document.getElementById(`chart${chartData.name}`)
      if (dom) {
        if (!this.myChart) {
          this.myChart = echarts.init(dom)
        }
        this.chartOption = npmLineChartOption
        this.chartOption.color = this.chartData.params.color
        this.chartOption.series = data.map((t, i) => {
          return {
            type: 'line',
            symbol: 'circle',
            smooth: true,
            showSymbol: false,
            emphasis: {
              focus: 'series'
            },
            name: t.legend ? t.legend : this.$t(chartData.i18n) || chartData.name,
            stack: this.chartData.params.isStack ? 'network.total' : '',
            lineStyle: {
              width: 1
            },
            areaStyle: {
              opacity: 0.1
            },
            data: t.values.map((v) => [Number(v[0]) * 1000, Number(v[1]), type])
          }
        })
        this.chartOption.yAxis[0].axisLabel.formatter = (value) => {
          if (type === 'percent') {
            return unitConvert(value, type)[0]
          } else {
            return unitConvert(value, 'number').join('')
          }
        }
        this.chartOption.tooltip.formatter = (params) => {
          params.forEach(t => {
            this.chartOptionLineData.forEach(e => {
              if (e.legend === t.seriesName) {
                t.borderColor = e.color
              }
              if (this.$t(chartData.i18n) === t.seriesName) {
                t.borderColor = t.color
              }
            })
          })
          return stackedLineTooltipFormatter(params)
        }
        this.myChartArray.push(this.myChart)
        this.myChart.setOption(this.chartOption)
        this.$nextTick(() => {
          this.myChart.resize()
        })
      }
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
    highlightEvent (item) {
      const chartOptionLineData = _.cloneDeep(this.chartOptionLineData)
      chartOptionLineData.forEach(t => {
        if (t.legend === item.legend) {
          t.invertTab = !t.invertTab
        } else {
          t.show = t.invertTab
        }
      })
      const legend = chartOptionLineData.filter(t => t.invertTab)
      const legends = chartOptionLineData.filter(t => !t.invertTab)
      chartOptionLineData.forEach(t => {
        if ((t.legend === item.legend) && t.invertTab) {
          if (legend.length === 2) {
            t.show = true
          } else {
            legend.forEach(r => {
              r.show = false
            })
          }
        } else if ((t.legend !== item.legend) && !t.invertTab) {
          legends.forEach(r => {
            if (r.legend === item.legend) {
              r.show = false
            }
          })
        }
      })
      if (legend.length === 0) {
        chartOptionLineData.forEach((t, i) => {
          t.invertTab = true
        })
      }
      this.chartOptionLineData = chartOptionLineData
      this.legendSelectChange(legends, legend)
    },
    legendSelectChange (legends, legend) {
      if (legends.length > 0) {
        this.chartOptionLineData.forEach(t => {
          legends.forEach(r => {
            if (t.legend !== r.legend) {
              this.dispatchLegendUnSelectAction(t.legend)
            }
            if (!t.show) {
              this.dispatchLegendSelectAction(t.legend)
            }
          })
        })
      } else if (legend.length > 0) {
        this.chartOptionLineData.forEach(t => {
          legend.forEach(r => {
            if (t.legend !== r.legend) {
              this.dispatchLegendSelectAction(t.legend)
            }
          })
        })
      }
    },
    resize () {
      this.myChartArray.forEach(t => {
        t.resize()
      })
    }
  },
  mounted () {
    if (this.chart) {
      this.chartData = _.cloneDeep(this.chart)
    }
    this.timer = setTimeout(() => {
      this.init()
    }, 100)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)
    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
    this.chartOption = null
  }
}
</script>
