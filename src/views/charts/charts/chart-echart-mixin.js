import { shallowRef } from 'vue'
import * as echarts from 'echarts'
import { storageKey } from '@/utils/constants'
import {
  isEchartsLine,
  isEchartsPie,
  isEchartsWithTable,
  isEchartsWithStatistics,
  isIpHostedDomain,
  isAppRelatedDomain,
  getOption
} from './tools'
import { handleEchartFontSize, getEchartsFontSize } from '@/utils/tools'
export default {
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String] // 数据在父组件查询后传入，本组件内不查询，只根据接传递的数据来渲染
  },
  setup (props) {
    return {
      myChart: shallowRef(null),
      myChart2: shallowRef(null), // 个别有两个图表的chart

      isEchartsLine: isEchartsLine(props.chartInfo.type),
      isEchartsPie: isEchartsPie(props.chartInfo.type),

      isEchartsWithTable: isEchartsWithTable(props.chartInfo.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chartInfo.type),

      isAppRelatedDomain: isAppRelatedDomain(props.chartInfo.type),
      isIpHostedDomain: isIpHostedDomain(props.chartInfo.type)
    }
  },
  data () {
    return {
      chartOption: null,
      chartOption2: null,
      isResizing: false
    }
  },
  methods: {
    initDom (id, chartNum) {
      if (chartNum && chartNum == 2) {
        const dom = document.getElementById(id + '-0')
        const dom2 = document.getElementById(id + '-1')
        !this.myChart && (this.myChart = echarts.init(dom))
        !this.myChart2 && (this.myChart2 = echarts.init(dom2))
        this.chartOption2 = this.$_.cloneDeep(getOption(this.chartInfo.type))
      } else {
        const dom = document.getElementById(id)
        !this.myChart && (this.myChart = echarts.init(dom))
      }
      this.chartOption = this.$_.cloneDeep(getOption(this.chartInfo.type))
    },
    // 出来y轴相关配置
    handleYaxis () {
      const allZero = this.timeLineIsAllZero(this.chartData)
      if (allZero) {
        this.chartOption.yAxis = {
          ...this.chartOption.yAxis,
          min: 0,
          max: 5,
          interval: 1
        }
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
    chartResize (e) {
      if (!this.isResizing) {
        this.isResizing = true
        // echarts相关图表文字动态调整大小
        const oldLegendFontSize = localStorage.getItem(storageKey.echartLegendFontSize)
        const oldLabelFontSize = localStorage.getItem(storageKey.echartLabelFontSize)
        getEchartsFontSize(e)
        const echartLegendFontSize = localStorage.getItem(storageKey.echartLegendFontSize)
        const echartLabelFontSize = localStorage.getItem(storageKey.echartLabelFontSize)

        const chartList = this.$store.getters.getChartList
        chartList.forEach((item, index, arr) => {
          try {
            if (item) {
              const chart = echarts.init(item.getDom())
              let chartOption = item.getOption()

              if (oldLegendFontSize != echartLegendFontSize) {
                chartOption = {
                  ...chartOption,
                  legend: {
                    ...chartOption.legend,
                    textStyle: {
                      fontSize: echartLegendFontSize
                    }
                  }
                }
              }
              if (oldLabelFontSize != echartLabelFontSize) {
                const newSeries = []
                const chartType = chartOption.series[0].type
                chartOption.series.forEach((series) => {
                  if (series.markLine) {
                    const seriesNew = {
                      ...series,
                      label: {
                        ...series.label,
                        fontSize: echartLabelFontSize
                      },
                      markLine: {
                        ...series.markLine,
                        label: {
                          ...series.markLine.label,
                          fontSize: echartLabelFontSize
                        }
                      }
                    }
                    newSeries.push(seriesNew)
                  } else {
                    const seriesNew = {
                      ...series,
                      label: {
                        ...series.label,
                        fontSize: echartLabelFontSize
                      },
                      markLine: {
                        ...series.markLine,
                        label: {
                          fontSize: echartLabelFontSize
                        }
                      }
                    }
                    newSeries.push(seriesNew)
                  }
                })

                if (chartType === 'pie') {
                  chartOption = {
                    ...chartOption,
                    axisLabel: {
                      ...chartOption.axisLabel,
                      fontSize: echartLabelFontSize
                    },
                    series: newSeries
                  }
                } else {
                  chartOption = {
                    ...chartOption,
                    xAxis: {
                      ...chartOption.xAxis,
                      axisLabel: {
                        ...chartOption.xAxis.axisLabel,
                        fontSize: echartLabelFontSize
                      }
                    },
                    yAxis: {
                      ...chartOption.yAxis,
                      axisLabel: {
                        ...chartOption.yAxis.axisLabel,
                        fontSize: echartLabelFontSize
                      }
                    },
                    axisLabel: {
                      ...chartOption.axisLabel,
                      fontSize: echartLabelFontSize
                    },
                    series: newSeries
                  }
                }
              }
              if (oldLegendFontSize != echartLegendFontSize || oldLabelFontSize != echartLabelFontSize) {
                chart.setOption(chartOption)
              }
              item.resize()
            }
          } catch (e) {
            console.error(e)
          }
        })

        setTimeout(() => {
          this.isResizing = false
        }, 200)
      }
    },
    setTimeoutResize (e) {
      setTimeout(() => {
        this.chartResize(e)
      }, 400)
    },
    loadEchart (chartNum, refresh = false) {
      this.$emit('showLoading', true)
      try {
        this.myChart.setOption(handleEchartFontSize(this.chartOption), refresh)
        this.$store.commit('setChartList', this.$_.cloneDeep(this.myChart))
        if (chartNum && chartNum == 2) {
          this.myChart2.setOption(handleEchartFontSize(this.chartOption2), refresh)
          this.$store.commit('setChartList', this.$_.cloneDeep(this.myChart2))
        }
      } finally {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 200)
      }
    }
  },
  mounted () {
    this.debounceFunc = this.$_.debounce(this.setTimeoutResize, 400)
    window.addEventListener('resize', this.debounceFunc)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
    if (this.myChart) {
      this.myChart.off('legendselectchanged')
      this.myChart.dispose()
      this.myChart = null
    }
    if (this.myChart2) {
      this.myChart2.off('legendselectchanged')
      this.myChart2.dispose()
      this.myChart2 = null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        if (this.chartData && this.chartData.length > 0) {
          this.initEcharts(`chart${this.chartInfo.id}`)
        }
      }
    }
  }
}
