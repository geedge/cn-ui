<template>
  <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import * as echarts from 'echarts'
import { lineToSpace } from '@/utils/tools'
import { unitTypes } from '@/utils/constants'
import chartEchartMixin from './chart-echart-mixin'
import { getOption, isEchartsPie } from './tools'
import { legendMapping } from '@/views/charts/charts/chart-table-title'

export default {
  name: 'ChartEchart',
  mixins: [chartEchartMixin],
  data () {
    return {
    }
  },
  props: {
    resultType: Object
  },
  setup (props) {
    return {
      isEchartsPie: isEchartsPie(props.chartInfo.type)
    }
  },
  methods: {
    initEcharts (id) {
      this.initDom(id)
      const chartParams = this.chartInfo.params
      if (chartParams.showLegend === false) {
        this.chartOption.legend.show = false
      }
      this.handleYaxis()

      if (this.isEchartsPie) {
        this.chartOption.series[0].data = this.chartData.map(d => {
          return {
            name: lineToSpace(d.name),
            data: d,
            value: parseInt(d.num),
            unitType: chartParams.unitType ? chartParams.unitType : 'number'
          }
        })
      } else {
        const seriesTemplate = this.chartOption.series[0]
        this.chartOption.series = this.chartData.map(r => {
          return {
            ...seriesTemplate,
            name: legendMapping[`${this.entity && this.entity.ip ? 'ip_' : ''}${r.legend}`] ? legendMapping[`${this.entity && this.entity.ip ? 'ip_' : ''}${r.legend}`] : lineToSpace(r.legend),
            data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType])
          }
        })
      }

      const rows = (this.chartData.length - 1) / 4 + 1 // 根据legend个数动态预留legend空间
      const gridTop = 10 + 27 * rows

      const gridTemplate = this.chartOption.grid
      if (chartParams.unitType === unitTypes.byte) {
        this.chartOption.yAxis.axisLabel.formatter = function (value, index, a, b) {
          return unitConvert(value, unitTypes.byte).join(' ')
        }
        this.chartOption.grid = {
          ...gridTemplate,
          top: gridTop,
          left: 75
        }
      } else {
        this.chartOption.grid = {
          ...gridTemplate,
          top: gridTop
        }
      }

      this.loadEchart()
    }
  }
}
</script>
