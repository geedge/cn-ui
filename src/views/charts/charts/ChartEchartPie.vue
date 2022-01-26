<template>
   <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import * as echarts from 'echarts'
import { lineToSpace } from '@/utils/tools'
import { unitTypes } from '@/utils/constants'
import {
  pieWithTable
} from '@/views/charts/charts/options/pie'

export default {
  name: 'ChartEchartPie',
  data () {
    return {
      myChart: null,
      chartOption: null
    }
  },
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object
  },
  methods: {
    initPie (id) {
      const chartParams = this.chartInfo.params
      const dom = document.getElementById(id)
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = this.$_.cloneDeep(pieWithTable)
      if (chartParams.showLegend === false) {
        this.chartOption.legend.show = false
      }
      const allZero = this.timeLineIsAllZero(this.chartData)
      if (allZero) {
        this.chartOption.yAxis = {
          ...this.chartOption.yAxis,
          min: 0,
          max: 5,
          interval: 1
        }
      }
      this.chartOption.series[0].data = this.chartData.map(d => {
        return {
          data: d,
          name: lineToSpace(d.name),
          value: parseInt(d.num),
          unitType: chartParams.unitType
        }
      })
      const rows = (this.chartData.length - 1) / 4 + 1 // 根据legend个数动态预留legend空间
      const gridTop = 10 + 27 * rows

      if (chartParams.unitType === unitTypes.byte) {
        this.chartOption.yAxis.axisLabel.formatter = function (value, index, a, b) {
          return unitConvert(value, unitTypes.byte).join(' ')
        }
        this.chartOption.grid = {
          top: gridTop,
          left: 75
        }
      } else {
        this.chartOption.grid = {
          top: gridTop
        }
      }
      this.loadEchartPie()
    },
    loadEchartPie () {
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
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.initPie(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>
