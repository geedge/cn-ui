<template>
  <div class="chart-drawing"  :style="`height: calc(100% - ${statisticsHeight}px)`" :id="`chart${chartInfo.id}`"></div>
  <div class="cn-chart__footer">
    <statistics-legend :data="statisticsData" :chart-info="chartInfo" @toggleLegend="toggleStatisticsLegend"></statistics-legend>
  </div>
</template>

<script>
import StatisticsLegend from '@/views/charts/charts/StatisticsLegend'
import {
  getChartColor
} from '@/views/charts/charts/tools'
import chartEchartMixin from './chart-echart-mixin'
import unitConvert from '@/utils/unit-convert'
import {unitTypes} from "@/utils/constants";

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
      if (this.statisticsData.length === 1) {
        const markLine = {
          silent: true,
          symbol: 'none',
          label: {
            distance: [-50, 0],
            formatter (params) {
              const arr = unitConvert(
                Number(params.value),
                chartParams.unitType
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
            }
          },
          data: [
            {
              name: 'P50',
              yAxis: this.chartData[0].aggregation.p50
                ? this.chartData[0].aggregation.p50
                : 50
            },
            {
              name: 'P90',
              yAxis: this.chartData[0].aggregation.p90
                ? this.chartData[0].aggregation.p90
                : 90
            }
          ]
        }
        const serieTmp = this.chartOption.series[0]
        this.chartOption.series[0] = {
          ...serieTmp,
          markLine: markLine
        }
      }
      const gridTemplate = this.chartOption.grid
      // option中默认单位是数字，当单位是字节、百分比、时间时，额外处理
      if (chartParams.unitType === unitTypes.byte) {
        this.chartOption.yAxis.axisLabel.formatter = function (value) {
          return unitConvert(value, unitTypes.byte).join('')
        }
        this.chartOption.grid = {
          ...gridTemplate,
          left: 75
        }
      } else if (chartParams.unitType === unitTypes.percent) {
        this.chartOption.yAxis.axisLabel.formatter = function (value) {
          return unitConvert(value, unitTypes.percent).join('')
        }
      } else if (chartParams.unitType === unitTypes.time) {
        this.chartOption.yAxis.axisLabel.formatter = function (value) {
          return unitConvert(value, unitTypes.time).join('')
        }
      }
      this.loadEchart(1, true)
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

    toggleStatisticsLegend (index) {
      const legendNum = this.statisticsData.length
      const chartParams = this.chartInfo.params
      if (legendNum > 1) {
        const selectedNum = this.statisticsData.filter(item => { return item.active === true }).length // 点击前，高亮legend个数
        if (selectedNum === legendNum) { // 全部曲线高亮时
          this.statisticsData.forEach((item, indexTmp) => {
            if (indexTmp === index) {
              item.active = true
              this.dispatchLegendSelectAction(item.legend)
            } else {
              item.active = false
              this.dispatchLegendUnSelectAction(item.legend)
            }
          })
        } else if (selectedNum === 1 && this.statisticsData[index].active) { // 多条曲线，且只有一条曲线高亮, 且点击的曲线为高亮曲线时
          this.statisticsData.forEach((item) => {
            item.active = true
            this.dispatchLegendSelectAction(item.legend)
          })
        } else {
          this.statisticsData[index].active = !this.statisticsData[index].active
          this.statisticsData.forEach((item, i) => {
            if (item.active) {
              this.dispatchLegendSelectAction(item.legend)
            } else {
              this.dispatchLegendUnSelectAction(item.legend)
            }
          })
        }

        const selectedAfterNum = this.statisticsData.filter((item, i) => { return item.active === true }).length // 点击后，高亮legend个数
        if (selectedAfterNum === 1) { // 点击后只有一条曲线高亮
          const chartParams = this.chartInfo.params
          // 多条曲线，且只有一条曲线高亮时，显示P50 P90 分位值，不止一个时隐藏标线
          const selectedName = this.statisticsData.filter((item, i) => { return item.active === true })[0].legend

          const serieArray = []
          this.chartOption.series.forEach((item, i) => {
            if (item.name === selectedName) {
              const markLine = {
                silent: true,
                symbol: 'none',
                label: {
                  distance: [-50, 0],
                  formatter (params) {
                    const arr = unitConvert(
                      Number(params.value),
                      chartParams.unitType
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
                  }
                },
                data: [
                  {
                    name: 'P50',
                    yAxis: this.chartData[i].aggregation.p50
                      ? this.chartData[i].aggregation.p50
                      : 50
                  },
                  {
                    name: 'P90',
                    yAxis: this.chartData[i].aggregation.p90
                      ? this.chartData[i].aggregation.p90
                      : 90
                  }
                ]
              }
              item.markLine = markLine
            }
            serieArray.push(item)
          })
          this.myChart.setOption({
            series: serieArray
          })
        } else { // 不止一条线高亮时隐藏标线
          const serieArray = []
          this.chartOption.series.forEach((item, i) => {
            item.markLine = []
            serieArray.push(item)
          })
          this.myChart.setOption({
            series: serieArray
          })
        }
      } else {
        this.statisticsData[index].active = !this.statisticsData[index].active
        this.statisticsData.forEach((item, i) => {
          if (item.active) {
            this.dispatchLegendSelectAction(item.legend)
          } else {
            this.dispatchLegendUnSelectAction(item.legend)
          }
        })

        const selectedAfterNum = this.statisticsData.filter((item, i) => { return item.active === true }).length // 点击后，高亮legend个数
        if (selectedAfterNum === 1) { // 点击后只有一条曲线高亮
          const markLine = {
            silent: true,
            symbol: 'none',
            label: {
              distance: [-50, 0],
              formatter (params) {
                const arr = unitConvert(
                  Number(params.value),
                  chartParams.unitType
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
              }
            },
            data: [
              {
                name: 'P50',
                yAxis: this.chartData[0].aggregation.p50
                  ? this.chartData[0].aggregation.p50
                  : 50
              },
              {
                name: 'P90',
                yAxis: this.chartData[0].aggregation.p90
                  ? this.chartData[0].aggregation.p90
                  : 90
              }
            ]
          }
          this.chartOption.series[0].markLine = markLine
        } else {
          this.chartOption.series[0].markLine = []
        }
      }
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
