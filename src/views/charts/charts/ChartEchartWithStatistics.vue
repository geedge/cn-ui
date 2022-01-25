<template>
  <div class="chart-drawing"  :style="`height: calc(100% - ${statisticsHeight}px)`" :id="`chart${chartInfo.id}`"></div>
  <div class="cn-chart__footer">
    <statistics-legend :data="statisticsData" :chart-info="chartInfo" @toggleLegend="toggleStatisticsLegend"></statistics-legend>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import StatisticsLegend from '@/components/charts/StatisticsLegend'
import {
  lineWithStatistics
} from '@/views/charts/charts/options/line'
import {
  getChartColor
} from '@/views/charts/charts/chart-options'

export default {
  name: 'ChartEchartWithStatistics',
  data () {
    return {
      myChart: null,
      chartOption: null,
      statisticsData: [],
      statisticsHeight: 280
    }
  },
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
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
    initEchartsWithStatistics (id) {
      const chartParams = this.chartInfo.params
      const dom = document.getElementById(id)
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = this.$_.cloneDeep(lineWithStatistics)
      const allZero = this.timeLineIsAllZero(this.chartData)
      if (allZero) {
        this.chartOption.yAxis = {
          ...this.chartOption.yAxis,
          min: 0,
          max: 5,
          interval: 1
        }
      }
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
      this.loadEchartWithStatistics()
    },

    loadEchartWithStatistics () {
      this.$emit('showLoading', true)
      try {
        this.myChart.setOption(this.chartOption)
      } finally {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 200)
      }
    },
    timeLineIsAllZero (data) {
      if (this.resultType === 'matrix') {
        let allZero = true
        try {
          data.forEach(d => {
            d.values.forEach(r => {
              if (r[1] && r[1] !== '0') {
                allZero = false
                throw new Error('break')
              }
            })
          })
        } catch (e) {}
        return allZero
      }
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
    chartData: {
      deep: true,
      handler (n) {
        this.initEchartsWithStatistics(`chart${this.chartInfo.id}`)
      }
    },
    statisticsHeight (val) {
      const dom = document.getElementById(`chart${this.chartInfo.id}`)
      dom.style.cssText += `height: calc(100% - ${val}px)`
    }
  }
}
</script>
