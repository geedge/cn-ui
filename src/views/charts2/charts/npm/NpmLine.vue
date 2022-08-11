<template>
  <div class="npm-line">
    <div class="npm-line-header" v-if="chartData.params && chartData.params.showLegend">
      <div class="npm-line-header-right" :class="{'active': item.show}" v-for="(item, index) in chartOptionLineData" :key="index" @click="highlightEvent(item)">
        <div class="npm-line-header-icon" :class="'icon' + index"></div>
        <div class="npm-line-header-value">{{$t(item.legend)}}</div>
      </div>
    </div>
    <div class="chart-drawing" :id="`chart${chartData.name}`"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { npmLineChartOption } from '@/views/charts2/charts/options/echartOption.js'
import { shallowRef } from 'vue'
import _ from 'lodash'
import { stackedLineTooltipFormatter } from '@/views/charts/charts/tools'

export default {
  name: 'NpmLine',
  props: {
    chart: Object
  },
  setup () {
    return {
      myChart: shallowRef()
    }
  },
  data () {
    return {
      chartData: {},
      chartOptionLineData: [
        { legend: 'network.total', index: 0, invertTab: true },
        { legend: 'network.inbound', index: 1, invertTab: true },
        { legend: 'network.outbound', index: 2, invertTab: true }
      ],
      timer: null,
      myChartArray: []
    }
  },
  methods: {
    init () {
      const dom = document.getElementById(`chart${this.chartData.name}`)
      this.myChart = echarts.init(dom)
      this.chartOption = npmLineChartOption
      const seriesTemplate = this.chartOption.series[0]
      this.chartOption.title.text = this.chartData.i18n ? this.chartData.i18n : this.chartData.name
      this.chartOption.color = this.chartData.params.color
      let result = [
        {
          values: [[1435781430781, '1'], [1435781431781, '2']],
          legend: 'network.total',
          color: '#749F4D'
        },
        {
          values: [[1435781430781, '1'], [1435781431781, '2']],
          legend: 'network.inbound',
          color: '#98709B'
        },
        {
          values: [[1435781430781, '1'], [1435781431781, '2']],
          legend: 'network.outbound',
          color: '#E5A219'
        }
      ]
      result = result.filter(item => this.chartData.params.color.indexOf(item.color) > -1)
      this.chartOption.series = result.map((t, i) => {
        return {
          ...seriesTemplate,
          name: t.legend,
          stack: this.chartData.params.isStack ? 'network.total' : '',
          lineStyle: {
            width: 1
          },
          areaStyle: {
            opacity: 0.1
          },
          data: t.values.map((v) => [Number(v[0]) * 1000, Number(v[1]), this.chartData.params.unitType])
        }
      })
      this.chartOption.tooltip.formatter = (params) => {
        params.forEach(t => {
          t.seriesName = this.$t(t.seriesName)
        })
        const str = stackedLineTooltipFormatter(params)
        return str
      }
      this.myChartArray.push(this.myChart)
      this.myChart.setOption(this.chartOption)
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
  }
}
</script>
