<template>
  <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import * as echarts from 'echarts'
import { lineToSpace, reverseSortBy, humpToSpace } from '@/utils/tools'
import { unitTypes } from '@/utils/constants'
import chartEchartMixin from './chart-echart-mixin'
import { isEchartsLine, isEchartsPie } from './tools'
import { legendMapping } from '@/views/charts/charts/chart-table-title'

export default {
  name: 'ChartEchart',
  mixins: [chartEchartMixin],
  data() {
    return {}
  },
  props: {
    resultType: Object,
    chartInfo: Object,
  },
  setup(props) {
    return {
      isEchartsPie: isEchartsPie(props.chartInfo.type),
      isEchartsLine: isEchartsLine(props.chartInfo.type),
    }
  },
  methods: {
    initEcharts(id) {
      this.initDom(id)
      const chartParams = this.chartInfo.params
      if (chartParams.showLegend === false) {
        this.chartOption.legend.show = false
      }
      this.handleYaxis()

      if (this.isEchartsPie) {
        if (chartParams.size && chartParams.size === 'small') {
          this.chartOption.series[0] = {
            ...this.chartOption.series[0],
            radius: ['30%', '45%'],
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
          }
          this.chartOption.legend = {
            ...this.chartOption.legend,
            left: '60%',
            itemGap: 5,
            itemWidth: 8,
            itemHeight: 8,
            formatter: function (name) {
              return name.length > 9 ? name.substr(0, 9) + '...' : name
              // return echarts.format.truncateText(name, 6, '…');
            },
            tooltip: {
              show: true,
            },
            textStyle: {
              // 图例文字的样式
              color: '#666666',
              fontSize: 12,
              fontWeight: 400,
            },
          }
          let chartDataTmp = []
          let otherData = []
          this.chartData.sort(reverseSortBy('num'))

          if (this.chartData.length > 5) {
            chartDataTmp = this.chartData.slice(0, 5)
            chartDataTmp.forEach((data) => {
              if (data.name === '') {
                data.name = ' '
              }
            })
            let otherSum = 0
            otherData = this.chartData.slice(5)
            otherData.forEach((data) => {
              otherSum = otherSum + data.num
            })
            chartDataTmp.push({ num: otherSum, name: 'other' })
          } else if (this.chartData.length <= 5) {
            chartDataTmp = this.chartData.slice(0, this.chartData.length)
            chartDataTmp.forEach((data) => {
              if (data.name === '') {
                data.name = ' '
              }
            })
          }

          this.chartOption.series[0].data = chartDataTmp.map((d) => {
            return {
              name: lineToSpace(d.name),
              data: d,
              value: parseInt(d.num),
              unitType: chartParams.unitType ? chartParams.unitType : 'number',
            }
          })
        } else {
          this.chartOption.series[0].data = this.chartData.map((d) => {
            return {
              name: lineToSpace(d.name),
              data: d,
              value: parseInt(d.num),
              unitType: chartParams.unitType ? chartParams.unitType : 'number',
            }
          })
        }
      } else {
        const seriesTemplate = this.chartOption.series[0]
        this.chartOption.series = this.chartData.map((r) => {
          const serie = {
            ...seriesTemplate,
            name: legendMapping[
              `${this.entity && this.entity.ip ? 'ip_' : ''}${r.legend}`
            ]
              ? legendMapping[
                  `${this.entity && this.entity.ip ? 'ip_' : ''}${r.legend}`
                ]
              : humpToSpace(r.legend),
            data: r.values.map((v) => [
              Number(v[0]) * 1000,
              Number(v[1]),
              chartParams.unitType,
            ]),
          }
          if (this.isEchartsLine) {
            serie.data = serie.data.slice(1, serie.data.length - 2)
            serie.markLine = {
              silent: true,
              symbol: 'none',
              label: {
                    distance:[-50,0],
                formatter(params) {
                  const arr = unitConvert(
                    params.value,
                    chartParams.unitType,
                  ).join(' ')
                  let desc = ''
                  switch (params.dataIndex) {
                    case 0: {
                      desc = 'P50'
                      break
                    }
                    case 1: {
                      desc = 'P90'
                      break
                    }
                    default:
                      break
                  }
                  return `${arr} (${desc})`
                },
              },
              data: [
                {
                  name: 'P50',
                  yAxis: this.chartData[0].aggregation.p50
                    ? this.chartData[0].aggregation.p50
                    : 50,
                },
                {
                  name: 'P90',
                  yAxis: this.chartData[0].aggregation.p90
                    ? this.chartData[0].aggregation.p90
                    : 90,
                },
              ],
            }
          }
          return serie
        })
      }

      const rows = (this.chartData.length - 1) / 4 + 1 // 根据legend个数动态预留legend空间
      const gridTop = 10 + 27 * rows

      const gridTemplate = this.chartOption.grid
      if (chartParams.unitType === unitTypes.byte) {
        this.chartOption.yAxis.axisLabel.formatter = function (
          value,
          index,
          a,
          b,
        ) {
          return unitConvert(value, unitTypes.byte).join(' ')
        }
        this.chartOption.grid = {
          ...gridTemplate,
          top: gridTop,
          left: 75,
        }
      } else {
        this.chartOption.grid = {
          ...gridTemplate,
          top: gridTop,
        }
      }

      this.loadEchart()
    },
  },
}
</script>
