<template>
    <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
</template>

<script>
import * as echarts from 'echarts'
import {
  categoryBar
} from '@/views/charts/charts/options/bar'
import { getCharBartColor, categoryBarTooltipFormatter } from '@/views/charts/charts/tools'
import chartEchartMixin from './chart-echart-mixin'

export default {
  name: 'ChartCategoryBar',
  mixins: [chartEchartMixin],
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object,
    queryParams: Object
  },
  methods: {
    initEcharts (id) {
      const chartParams = this.chartInfo.params
      const dom = document.getElementById(id)
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = this.$_.cloneDeep(categoryBar)
      this.chartOption.tooltip.trigger = 'item'
      this.chartOption.tooltip.formatter = (params) => {
        const str = categoryBarTooltipFormatter(params, chartParams.direction)
        return str
      }
      if (!chartParams.itemColorAlternately) {
        this.chartOption.series[0].itemStyle.color = function (params) {
          return getCharBartColor(0)
        }
      }
      if (chartParams.showLegend === false) {
        this.chartOption.legend.show = false
      }
      const seriesTemplate = this.chartOption.series[0]
      const obj = {
        ...seriesTemplate,
        name: ' ',
        data: []
      }
      this.chartData.forEach((r, index) => {
        if (chartParams.direction === 'horizontal') {
          obj.data.push([Number(r.events), r.clientCountry + ' ' + r.clientRegion, chartParams.unitType])
        } else {
          obj.data.push([r.clientCountry + ' ' + r.clientRegion, Number(r.events), chartParams.unitType])
        }
        return obj
      })
      this.chartOption.series = obj
      const rows = (this.chartData.length - 1) / 4 + 1 // 根据legend个数动态预留legend空间
      const gridTop = 10 + 27 * rows
      this.chartOption.grid.top = gridTop
      if (chartParams.direction === 'horizontal') {
        const temp = this.chartOption.yAxis
        this.chartOption.yAxis = { ...this.chartOption.xAxis }
        this.chartOption.xAxis = temp
      }
      this.loadEchartBar()
    },
    loadEchartBar () {
      this.$emit('showLoading', true)
      try {
        this.myChart.setOption(this.chartOption)
      } finally {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 200)
      }
    }
  }
}
</script>
