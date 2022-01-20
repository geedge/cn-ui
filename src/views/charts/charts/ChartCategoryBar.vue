<template>
    <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import * as echarts from 'echarts'
import { lineToSpace } from '@/utils/tools'
import { unitTypes } from '@/utils/constants'
import { legendMapping } from '@/components/charts/chart-table-title'
import {
  categoryBar
} from '@/views/charts/charts/options/bar'
import { getCharBartColor, categoryBarTooltipFormatter } from '@/views/charts/charts/tools'

export default {
  name: 'ChartCategoryBar',
  data () {
    return {
      myChart: null,
      chartOption: null
    }
  },
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object,
    queryParams: Object
  },
  methods: {
    init (id) {
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
        // chartParams.direction === 'vertical' ? r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType]) : r.values.map(v => [Number(v[1]), Number(v[0]) * 1000, chartParams.unitType])
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
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.init(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>
