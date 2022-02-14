<template>
  <div class="chart-drawing"  :style="`height: calc(100% - ${statisticsHeight}px)`" :id="`chart${chartInfo.id}`"></div>
  <div class="cn-chart__footer">
    <statistics-legend :data="statisticsData" :chart-info="chartInfo" @toggleLegend="toggleStatisticsLegend"></statistics-legend>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import StatisticsLegend from '@/views/charts/charts/StatisticsLegend'
import {
  lineWithStatistics
} from '@/views/charts/charts/options/line'
import {
  getChartColor
} from '@/views/charts/charts/chart-options'
import chartEchartMixin from './chart-echart-mixin'

export default {
  name: 'ChartEchartWithStatistics',
  mixins: [chartEchartMixin],
  data () {
    return {
      statisticsData: [],
      statisticsHeight: 280
    }
  },
  props: {
    resultType: Object
  },
  components: {
    StatisticsLegend
  },
  mounted () {
    // 动态计算统计信息的高度
    if (this.chartData) {
      const dataLen = this.chartData.length
      this.statisticsHeight = (dataLen * 24) + 30 + 3 + 7 // 根据legend个数动态预留legend空间,7为其他
    }
  },
  methods: {
    initEcharts (id) {
      this.initDom(id)
      const chartParams = this.chartInfo.params
      this.handleYaxis()
      this.statisticsData = this.chartData.map(d => {
        return {
          ...d,
          active: true
        }
      })
      const seriesTemplate = this.chartOption.series[0]
      this.chartOption.series = this.chartData.map((r, i) => {
        return {
          ...seriesTemplate,
          name: r.legend,
          data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType]),
          lineStyle: {
            color: getChartColor[i]
          }
        }
      })
      this.loadEchart()
    },
    toggleStatisticsLegend (index) {
      this.statisticsData[index].active = !this.statisticsData[index].active
      this.statisticsData.forEach((d, i) => {
        if (d.active) {
          this.myChart.dispatchAction({
            type: 'legendSelect',
            name: d.legend
          })
        } else {
          this.myChart.dispatchAction({
            type: 'legendUnSelect',
            name: d.legend
          })
        }
      })
    }
  },
  watch: {
    statisticsHeight (val) {
      const dom = document.getElementById(`chart${this.chartInfo.id}`)
      dom.style.cssText += `height: calc(100% - ${val}px)`
    }
  }
}
</script>
