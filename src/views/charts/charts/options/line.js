import unitConvert from '@/utils/unit-convert'
import { unitTypes, chartColor } from '@/utils/constants'
import { axisFormatter, tooLongFormatter } from '@/views/charts/charts/tools'

export const line = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axisFormatter,
    show: true,
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important'
  },
  xAxis: {
    type: 'time'
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: function (value, index, a, b) {
        return unitConvert(value, unitTypes.number).join(' ')
      }
    },
    minInterval: 1
  },
  animation: false,
  grid: {
    left: 55,
    bottom: 30,
    top: 100,
    right: 25
  },
  color: chartColor,
  legend: {
    tooltip: {
      show: true,
      formatter: '{a}'
    },
    show: true,
    right: 23,
    top: 8,
    padding: 2,
    orient: 'horizontal',
    icon: 'circle',
    itemGap: 10,
    itemWidth: 10,
    textStyle: {
      padding: [0, 0, 0, 2],
      fontSize: 14
    },
    formatter: tooLongFormatter
  },
  axisLabel: {
    fontSize: 14
  },
  series: [
    {
      name: '',
      type: 'line',
      smooth: false,
      symbol: 'none',
      data: []
    }
  ]
}
export const lineWithStatistics = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axisFormatter,
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important'
  },
  xAxis: {
    type: 'time'
  },
  animation: false,
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: function (value, index) {
        return unitConvert(value, unitTypes.number).join(' ')
      }
    },
    minInterval: 1
  },
  color: chartColor,
  grid: {
    left: 55,
    bottom: 30,
    top: 20,
    right: 20
  },
  legend: {
    show: false
  },
  axisLabel: {
    fontSize: 14
  },
  series: [
    {
      name: '',
      type: 'line',
      smooth: false,
      symbol: 'none',
      data: [],
      connectNulls: true
    }
  ]
}
export const lineStack = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axisFormatter,
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important'
  },
  xAxis: {
    type: 'time'
  },
  color: chartColor,
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: function (value, index) {
        return unitConvert(value, unitTypes.number).join(' ')
      }
    },
    minInterval: 1
  },
  grid: {
    left: 55,
    bottom: 45,
    top: 10,
    right: 180
  },
  legend: {
    show: true,
    right: 30,
    top: 'middle',
    orient: 'vertical',
    icon: 'circle',
    itemGap: 20,
    itemWidth: 10,
    formatter: tooLongFormatter,
    textStyle: {
      padding: [0, 0, 0, 5],
      fontSize: 14
    }
  },
  axisLabel: {
    fontSize: 14
  },
  series: [
    {
      name: '',
      type: 'line',
      stack: 'value',
      areaStyle: {},
      symbol: 'none',
      data: []
    }
  ]
}
export const singleValueLine = {
  tooltip: {
    show: true,
    enterable: true,
    showContent: true,
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    }
  },
  xAxis: {
    type: 'time',
    show: false
  },
  yAxis: {
    type: 'value',
    show: false
  },
  animation: false,
  grid: {
    left: 0,
    bottom: 2,
    top: 5,
    right: 0
  },
  color: chartColor,
  legend: {
    show: false
  },
  series: [
    {
      type: 'line',
      legendHoverLink: false,
      itemStyle: {
        normal: {
          color: '#81C9FF',
          lineStyle: {
            width: 2
          }
        }
      },
      data: [],
      showSymbol: false,
      areaStyle: { color: '#C9EAFF' }
    }
  ]
}
export const entityListLine = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axisFormatter,
    show: true,
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important'
  },
  xAxis: {
    type: 'time',
    show: false
  },
  yAxis: {
    type: 'value',
    show: false
  },
  animation: false,
  grid: {
    left: 0,
    bottom: 2,
    top: 5,
    right: 0
  },
  color: chartColor,
  legend: {
    show: false
  },
  series: [
    {
      type: 'line',
      legendHoverLink: false,
      itemStyle: {
        normal: {
          lineStyle: {
            width: 2
          }
        }
      },
      data: [],
      showSymbol: false
    }
  ]
}
