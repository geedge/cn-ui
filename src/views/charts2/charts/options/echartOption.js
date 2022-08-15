import {
  chartColor,
  chartColor1,
  chartColor2,
  chartColor3,
  chartColor5,
  unitTypes
} from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import { axisFormatter } from '@/views/charts/charts/tools'

export const pieChartOption1 = {
  tooltip: {
    show: false
  },
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
          width: 60,
          align: 'left',
          fontWeight: 'bold'
        },
        b: {
          align: 'left',
          fontSize: 12,
          color: '#575757'
        }
      }
    },
    tooltip: {
      show: true
    },
    formatter: function (name) {
      const data = pieChartOption1.series[0].data
      let value
      data.forEach(t => {
        if (t.name == name) {
          value = t.value
        }
      })
      name = name.length > 9 ? name.substr(0, 9) + '...' : name
      const arr = ['{a|' + ' ' + value + '}' + '{b|' + name + '}']
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
  tooltip: {
    show: false
  },
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
          width: 60,
          align: 'left',
          fontWeight: 'bold'
        },
        b: {
          align: 'left',
          fontSize: 12,
          color: '#575757'
        }
      }
    },
    tooltip: {
      show: true
    },
    formatter: function (name) {
      const data = pieChartOption2.series[0].data
      let value
      data.forEach(t => {
        if (t.name == name) {
          value = t.value
        }
      })
      name = name.length > 9 ? name.substr(0, 9) + '...' : name
      const arr = ['{a|' + ' ' + value + '}' + '{b|' + name + '}']
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
  color: chartColor5,
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
    top: '12%',
    left: '2%',
    right: '1.5%',
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
      splitLine: {
        show: false
      },
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
    right: 1,
    top: 2,
    bottom: 0
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
  tooltip: {
    trigger: 'axis',
    className: 'echarts-tooltip echarts-tooltip-dark'
  },
  legend: {
    show: false
  },
  grid: {
    top: '13%',
    left: '4.6%',
    right: '3%',
    bottom: 15,
    containLabel: true
  },
  xAxis: [
    {
      type: 'time',
      splitNumber: 8,
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
      splitLine: {
        show: false
      },
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
      smooth: true,
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      data: []
    }
  ]
}

export const trafficLineChartOption = {
  color: chartColor3,
  tooltip: {
    trigger: 'axis',
    className: 'echarts-tooltip echarts-tooltip-dark'
  },
  legend: {
    show: true,
    left: '0.8%',
    top: '4%',
    padding: 2,
    orient: 'horizontal',
    icon: 'circle',
    itemGap: 20,
    itemWidth: 8,
    textStyle: {
      padding: [0, 0, 0, 2],
      fontSize: 12,
      color: '#717171',
      fontWeight: 400,
      fontFamily: 'NotoSansSChineseRegular'
    }
  },
  grid: {
    top: '21%',
    left: '2%',
    right: '1%',
    bottom: 20,
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
      splitLine: {
        show: false
      },
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
      smooth: true,
      showSymbol: false,
      emphasis: {
        focus: 'series'
      },
      data: []
    }
  ]
}
