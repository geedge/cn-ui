<template>
  <div class="npm-line">
    <chart-no-data v-if="isNoData"></chart-no-data>
    <template v-if="chartData.i18n === 'overall.throughput'">
      <div class="npm-line-header">
        <div class="npm-line-header-title">
          {{ $t(chartData.i18n) || chartData.name }}
          <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
        </div>
        <div class="npm-line-header-rights" v-if="chartData.params && chartData.params.showLegend && !isNoData">
          <div class="npm-line-header-right" :class="{'active': item.show}" v-for="(item, index) in chartOptionLineData"
               :key="index" @click="highlightEvent(item)">
            <div class="npm-line-header-icon" :class="'icon' + index"></div>
            <div class="npm-line-header-value">{{ item.legend }}</div>
          </div>
        </div>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.tripTime'">
      <div class="npm-line-title">
        {{ $t(chartData.i18n) || chartData.name }}(ms)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.httpResponse'">
      <div class="npm-line-title">
        {{ $t(chartData.i18n) || chartData.name }}(ms)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.sslResponseLatency'">
      <div class="npm-line-title">
        {{ $t(chartData.i18n) || chartData.name }}(ms)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.packetLoss'">
      <div class="npm-line-title">
        {{ $t(chartData.i18n) || chartData.name }}(%)
        <chart-error v-if="showError" tooltip :content="errorMsg"></chart-error>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.i18n === 'networkAppPerformance.packetRetrans'">
      <div class="npm-line-title">
        {{ $t(chartData.i18n) || chartData.name }}(%)
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
import { api } from '@/utils/api'
import axios from 'axios'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import unitConvert from '@/utils/unit-convert'
import ChartError from '@/components/common/Error'
import { dataForNpmLine } from '@/utils/static-data'

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
      chartOptionLineData: dataForNpmLine.chartOptionLineData,
      npmLineColor: dataForNpmLine.npmLineColor,
      timer: null,
      myChartArray: [],
      side: this.$store.state.panel.npmLocationSide,
      country: this.$store.state.panel.npmLocationCountry,
      // province: '',
      showError: false,
      errorMsg: '',
      sizes: [3, 4, 6, 8, 9, 10]
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
      }

      params.countryRegion = n || ''

      this.toggleLoading(true)
      let url
      if (this.chart.params) {
        url = this.switchUrl(this.chart.params.index)

        if (url) {
          axios.get(url, { params: params }).then(response => {
            const res = response.data
            if (response.status === 200) {
              this.showError = false
              this.isNoData = res.data.result.length === 0

              if (!this.isNoData) {
                if (this.chart.params.index === 0) {
                  res.data.result.forEach((t, i) => {
                    this.chartOptionLineData[i].values = t.values
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
              this.errorMsg = this.errorMsgHandler(res)
            }
          }).catch(e => {
            console.error(e)
            this.isNoData = false
            this.showError = true
            this.errorMsg = this.errorMsgHandler(e)
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
        this.chartOption.color = this.chartOption.color.reverse()
        data = data.reverse()

        this.chartOption.series = data.map((t, i) => {
          return {
            type: 'line',
            symbol: 'circle',
            smooth: true,
            showSymbol: false,
            emphasis: {
              itemStyle: {
                borderColor: t.color,
                borderWidth: 2,
                shadowColor: t.color,
                shadowBlur: t.positioning ? this.sizes[t.positioning] + 2 : 0
              }
            },
            name: t.invertTab ? t.legend : this.$t(chartData.i18n) || chartData.name,
            stack: this.chartData.params.isStack ? (t.legend === this.$t('network.total') ? '' : 'network.total') : '',
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
    dispatchSelectAction (type, name) {
      this.myChart.dispatchAction({
        type: type,
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
      const legendList = chartOptionLineData.filter(t => !t.invertTab)

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
          legendList.forEach(r => {
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
      this.legendSelectChange(legendList, legend)
    },
    legendSelectChange (legendList, legend) {
      if (legendList.length > 0) {
        this.chartOptionLineData.forEach(t => {
          legendList.forEach(r => {
            if (t.legend !== r.legend) {
              this.dispatchSelectAction('legendUnSelect', t.legend)
            }
            if (!t.show) {
              this.dispatchSelectAction('legendSelect', t.legend)
            }
          })
        })
      } else if (legend.length > 0) {
        this.chartOptionLineData.forEach(t => {
          legend.forEach(r => {
            if (t.legend !== r.legend) {
              this.dispatchSelectAction('legendSelect', t.legend)
            }
          })
        })
      }
    },
    resize () {
      this.myChartArray.forEach(t => {
        t.resize()
      })
    },
    switchUrl (index) {
      switch (index) {
        case 0:
          return api.npm.location.thoughput
        case 1:
          return api.npm.location.tcpConnectionEstablishLatency
        case 2:
          return api.npm.location.httpResponseLatency
        case 3:
          return api.npm.location.sslHandshakeLatency
        case 4:
          return api.npm.location.packetsLoss
        case 5:
          return api.npm.location.packetsRetrains
      }
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
