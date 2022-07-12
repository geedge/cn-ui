import { chartColor1, chartColor2, chartColor3, chartColor4, unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import * as echarts from 'echarts'

export const pieChartOption1 = {
  color: chartColor1,
  legend: {
    orient: 'vertical',
    top: 45,
    left: '50%',
    itemGap: 4,
    itemWidth: 15,
    itemHeight: 7,
    textStyle: {
      fontFamily: 'SimHei',
      rich: {
        a: {
          width: 35,
          align: 'left'
        },
        b: {
          width: 6,
          align: 'left',
          fontSize: 12,
          color: '#575757'
        }
      }
    },
    formatter: function (name) {
      const data = pieChartOption1.series[0].data
      let value
      data.forEach(t => {
        if (t.name === name) {
          value = t.describe
        }
      })
      const arr = ['{a|' + ' ' + name + '}' + '{b|' + value + '}']
      return arr
    }
  },
  series: [
    {
      right: '50%',
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '60%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
}
export const pieChartOption2 = {
  legend: {
    orient: 'vertical',
    top: 45,
    left: '50%',
    itemGap: 4,
    itemWidth: 15,
    itemHeight: 7,
    textStyle: {
      fontFamily: 'SimHei',
      rich: {
        a: {
          width: 35,
          align: 'left'
        },
        b: {
          width: 6,
          align: 'left',
          fontSize: 12,
          color: '#575757'
        }
      }
    },
    formatter: function (name) {
      const data = pieChartOption2.series[0].data
      let value
      data.forEach(t => {
        if (t.name === name) {
          value = t.describe
        }
      })
      const arr = ['{a|' + ' ' + name + '}' + '{b|' + value + '}']
      return arr
    }
  },
  color: chartColor2,
  series: [
    {
      right: '50%',
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '60%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
}
export const stackedLineChartOption = {
  color: chartColor3,
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    type: 'scroll',
    top: 10,
    left: 20,
    itemGap: 60,
    itemWidth: 11,
    itemHeight: 14
  },
  grid: {
    top: '30%',
    left: '1%',
    right: '2%',
    bottom: 15,
    containLabel: true
  },
  xAxis: [
    {
      type: 'time',
      splitNumber: 12,
      axisLabel: {
        formatter: function (value) {
          const data = new Date(value)
          const h = data.getHours() > 9 ? data.getHours() : '0' + data.getHours()
          const m = data.getMinutes() > 9 ? data.getMinutes() : '0' + data.getMinutes()
          return h + ':' + m
        }
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      axisLabel: {
        formatter: function (value) {
          return unitConvert(value, unitTypes.number).join('')
        }
      }
    }
  ],
  series: [
    {
      name: 'Total',
      type: 'line',
      symbol: 'circle',
      hoverAnimation: false,
      smooth: true,
      symbolSize: function (value, params) {
        return symbolSizeSortChange(0, value[0])
      },
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      lineStyle: {
        color: chartColor3[0],
        width: 1
      },
      areaStyle: {
        opacity: 0.1,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: chartColor3[0]
          },
          {
            offset: 1,
            color: chartColor3[0]
          }
        ])
      },
      data: []
    },
    {
      name: 'Inbound',
      type: 'line',
      symbol: 'circle',
      smooth: true,
      symbolSize: function (value, params) {
        return symbolSizeSortChange(1, value[0])
      },
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      lineStyle: {
        color: chartColor3[1],
        width: 1
      },
      areaStyle: {
        opacity: 0.1,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: chartColor3[1]
          },
          {
            offset: 1,
            color: chartColor3[1]
          }
        ])
      },
      data: []
    },
    {
      name: 'Outbound',
      type: 'line',
      symbol: 'circle',
      smooth: true,
      symbolSize: function (value, params) {
        return symbolSizeSortChange(2, value[0])
      },
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      lineStyle: {
        color: chartColor3[2],
        width: 1
      },
      areaStyle: {
        opacity: 0.1,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: chartColor3[2]
          },
          {
            offset: 1,
            color: chartColor3[2]
          }
        ])
      },
      data: []
    },
    {
      name: 'Internal',
      type: 'line',
      symbol: 'circle',
      smooth: true,
      symbolSize: function (value, params) {
        return symbolSizeSortChange(3, value[0])
      },
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      lineStyle: {
        color: chartColor3[3],
        width: 1
      },
      areaStyle: {
        opacity: 0.1,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: chartColor3[3]
          },
          {
            offset: 1,
            color: chartColor3[3]
          }
        ])
      },
      data: []
    },
    {
      name: 'Other',
      type: 'line',
      symbol: 'circle',
      smooth: true,
      symbolSize: function (value, params) {
        return symbolSizeSortChange(4, value[0])
      },
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      lineStyle: {
        color: chartColor3[4],
        width: 1
      },
      areaStyle: {
        opacity: 0.1,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: chartColor3[4]
          },
          {
            offset: 1,
            color: chartColor3[4]
          }
        ])
      },
      data: []
    }
  ]
}
const sizes = [3, 6, 8, 9, 10]
function symbolSizeSortChange (index, time) {
  const totalData = stackedLineChartOption.series[0].data.find(t => t[0] === time) // [time, value]
  const inboundData = stackedLineChartOption.series[1].data.find(t => t[0] === time)
  const outboundData = stackedLineChartOption.series[2].data.find(t => t[0] === time)
  const internalData = stackedLineChartOption.series[3].data.find(t => t[0] === time)
  const otherData = stackedLineChartOption.series[4].data.find(t => t[0] === time)
  totalData[2] = 0
  inboundData[2] = 1
  outboundData[2] = 2
  internalData[2] = 3
  otherData[2] = 4
  const dataIntegrationArray = [totalData, inboundData, outboundData, internalData, otherData]
  dataIntegrationArray.sort((a, b) => { return a[1] - b[1] })
  const sortIndex = dataIntegrationArray.findIndex(a => a[2] === index)
  // stackedLineChartOption.series[sortIndex].itemStyle = {
  //   emphasis: {
  //     borderColor: chartColor4[sortIndex],
  //     borderWidth: 2,
  //     shadowColor: chartColor4[sortIndex],
  //     shadowBlur: sizes[sortIndex] + 2
  //   }
  // }
  return sizes[sortIndex]
}
