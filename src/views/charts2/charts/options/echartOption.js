import {
  chartColor,
  chartColor1,
  chartColor2,
  chartColor3,
  chartColor5,
  chartColor6,
  unitTypes
} from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import { axisFormatter } from '@/views/charts/charts/tools'

export const pieChartOption1 = {
  color: chartColor1,
  legend: {
    orient: 'vertical',
    top: 35,
    left: '50%',
    itemGap: 4,
    itemWidth: 15,
    itemHeight: 7,
    textStyle: {
      fontFamily: 'SimHei',
      rich: {
        a: {
          width: 35,
          align: 'left',
          fontWeight: 'bold'
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
    top: 35,
    left: '50%',
    itemGap: 4,
    itemWidth: 15,
    itemHeight: 7,
    textStyle: {
      fontFamily: 'SimHei',
      rich: {
        a: {
          width: 35,
          align: 'left',
          fontWeight: 'bold'
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
export const pieChartOption3 = {
  color: chartColor6,
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['45%', '50%'],
      avoidLabelOverlap: false,
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 500,
          fontFamily: 'NotoSansHans-Medium',
          color: '#353636',
          formatter: function (params) {
            return params.data.value
          }
        }
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
    className: 'echarts-tooltip echarts-tooltip-dark'
  },
  legend: {
    show: false
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
      type: 'line',
      symbol: 'circle',
      stack: 'network.total',
      smooth: true,
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      data: []
    }
  ]
}

export const appListChartOption = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    formatter: axisFormatter,
    show: true
  },
  xAxis: {
    show: false,
    type: 'time'
  },
  yAxis: {
    show: false,
    type: 'value',
    axisLabel: {
      formatter: function (value) {
        return unitConvert(value, unitTypes.number, null, null, 0).join(' ')
      }
    }
  },
  grid: {
    left: 0,
    right: 0
  },
  animation: false,
  color: chartColor,
  axisLabel: {},
  series: [
    {
      name: '',
      type: 'line',
      smooth: false,
      symbol: 'none',
      data: [],
      markLine: {}
    }
  ]
}

export const npmLineChartOption = {
  color: chartColor5,
  title: {
    text: '',
    top: 20,
    left: 20,
    textStyle: {
      fontFamily: 'NotoSansSChineseRegular',
      fontSize: 14,
      color: '#353636',
      fontWeight: 400
    }
  },
  tooltip: {
    trigger: 'axis',
    className: 'echarts-tooltip echarts-tooltip-dark'
  },
  legend: {
    show: false
  },
  grid: {
    top: '25%',
    left: '4%',
    right: '4%',
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
      type: 'line',
      symbol: 'circle',
      stack: 'network.total',
      smooth: true,
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      data: []
    }
  ]
}
