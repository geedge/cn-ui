import { chartColor1, chartColor2, chartColor3 } from '@/utils/constants'
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
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
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
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Total',
      type: 'line',
      stack: 'Total',
      symbol: 'circle',
      smooth: true,
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
      stack: 'Total',
      symbol: 'circle',
      smooth: true,
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
      stack: 'Total',
      symbol: 'circle',
      smooth: true,
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
      stack: 'Total',
      symbol: 'circle',
      smooth: true,
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
      stack: 'Total',
      symbol: 'circle',
      smooth: true,
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
