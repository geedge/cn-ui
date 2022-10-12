<template>
  <div class="npm-line">
    <chart-no-data v-if="isNoData"></chart-no-data>
    <template v-if="chartData.id === 11">
      <div class="npm-line-header">
        <div class="npm-line-header-title">{{$t(chartData.i18n) || chartData.name}}</div>
        <div class="npm-line-header-rights" v-if="chartData.params && chartData.params.showLegend && !isNoData">
          <div class="npm-line-header-right" :class="{'active': item.show}" v-for="(item, index) in chartOptionLineData" :key="index" @click="highlightEvent(item)">
            <div class="npm-line-header-icon" :class="'icon' + index"></div>
            <div class="npm-line-header-value">{{$t(item.legend)}}</div>
          </div>
        </div>
      </div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.id === 12">
      <div class="npm-line-title">{{$t(chartData.i18n) || chartData.name}}</div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.id === 13">
      <div class="npm-line-title">{{$t(chartData.i18n) || chartData.name}}</div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.id === 14">
      <div class="npm-line-title">{{$t(chartData.i18n) || chartData.name}}</div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.id === 15">
      <div class="npm-line-title">{{$t(chartData.i18n) || chartData.name}}</div>
      <div v-show="!isNoData" class="chart-drawing" :id="`chart${chartData.name}`"></div>
    </template>
    <template v-else-if="chartData.id === 16">
      <div class="npm-line-title">{{$t(chartData.i18n) || chartData.name}}</div>
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

export default {
  name: 'NpmLine',
  components: {
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
        { legend: 'network.total', index: 0, invertTab: true, color: '#749F4D' },
        { legend: 'network.inbound', index: 1, invertTab: true, color: '#98709B' },
        { legend: 'network.outbound', index: 2, invertTab: true, color: '#E5A219' }
      ],
      npmLineColor: [
        { legend: '', color: '#749F4D' },
        { legend: '', color: '#98709B' },
        { legend: '', color: '#E5A219' }
      ],
      timer: null,
      myChartArray: [],
      side: this.$store.state.panel.npmLocationSide,
      country: this.$store.state.panel.npmLocationCountry
      // province: '',
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
        this.init()
      }
    },
    timeFilter: {
      handler (n) {
        this.init()
      }
    }
  },
  methods: {
    init () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        side: this.side,
        country: this.country
        // province: this.province
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
              this.isNoData = res.data.result.length === 0
              if (this.chart.params.index === 0) {
                res.data.result.forEach((t, i) => {
                  if (t.type === 'totalBytesRate') {
                    this.chartOptionLineData[i].values = t.values
                  } else if (t.type === 'inboundBytesRate') {
                    this.chartOptionLineData[i].values = t.values
                  } else if (t.type === 'outboundBytesRate') {
                    this.chartOptionLineData[i].values = t.values
                  }
                })
                const result = this.chartOptionLineData.filter(t => this.chartData.params.color.indexOf(t.color) > -1)
                this.echartsInit(result, this.chartData, this.chartData.params.unitType)
              } else {
                this.echartsInit(res.data.result, this.chartData, this.chartData.params.unitType)
              }
            }
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
        const seriesTemplate = this.chartOption.series[0]
        this.chartOption.color = this.chartData.params.color
        this.chartOption.series = data.map((t, i) => {
          return {
            ...seriesTemplate,
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
        this.chartOption.tooltip.formatter = (params) => {
          params.forEach(t => {
            t.seriesName = this.$t(t.seriesName)
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
      this.chartOptionLineData.forEach(t => {
        if (t.legend === item.legend) {
          t.invertTab = !t.invertTab
        } else {
          t.show = t.invertTab
        }
      })
      const legend = this.chartOptionLineData.filter(t => t.invertTab)
      const legends = this.chartOptionLineData.filter(t => !t.invertTab)
      this.chartOptionLineData.forEach(t => {
        if ((t.legend === item.legend) && t.invertTab) {
          legend.forEach(r => {
            r.show = false
          })
        } else if ((t.legend !== item.legend) && !t.invertTab) {
          legends.forEach(r => {
            if (r.legend === item.legend) {
              r.show = false
            }
          })
        }
      })
      if (legend.length === 0) {
        this.chartOptionLineData.forEach((t, i) => {
          t.invertTab = true
        })
      }
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
  }
}
</script>
