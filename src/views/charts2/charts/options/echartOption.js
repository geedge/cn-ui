import {
  chartColor1,
  chartColor2,
  chartColor3,
  chartColor5,
  chartColor6,
  chartColorForBehaviorPattern,
  unitTypes,
  chartColorForSubscriberTopApp
} from '@/utils/constants'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import { axisFormatter } from '@/views/charts/charts/tools'
import { xAxisTimeFormatter, xAxisTimeRich } from '@/utils/date-util'

export const pieChartOption1 = {
  tooltip: {
    show: false
  },
  color: chartColor1,
  legend: {
    orient: 'vertical',
    top: '25%',
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
        if (t.name === name) {
          value = t.value
        }
      })
      name = name.length > 10 ? name.substr(0, 11) + '...' : name
      return ['{a|' + ' ' + value + '}' + '{b|' + name + '}']
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
    top: '25%',
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
        if (t.name === name) {
          value = t.value
        }
      })
      name = name.length > 10 ? name.substr(0, 10) + '...' : name
      return ['{a|' + ' ' + value + '}' + '{b|' + name + '}']
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
      radius: ['40%', '50%'],
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

export const pieChartOption4 = {
  color: chartColorForBehaviorPattern,
  polar: {
    radius: [30, 225],
    center: ['400px', '100%']// 为了显示出来半圆底部左侧的边
  },
  radiusAxis: {
    min: 0,
    axisLine: {
      show: true,
      lineStyle: {
        color: '#d3d3d3',
        type: 'dashed'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#d3d3d3',
        type: 'dashed'
      }
    }
  },
  angleAxis: {
    type: 'category',
    data: [], // 'a', 'b', 'c', 'd','aa', 'ab', 'ac', 'ad','a', 'b', 'c', 'd','aa', 'ab', 'ac', 'ad'
    startAngle: 180,
    // splitNumber: 30,
    axisLine: {
      show: false
    },
    axisLabel: {
      show: true,
      // alignWithLabel:true,//可以保证刻度线和标签对齐
      interval: 0, // 强制显示所有标签
      // hideOverlap:true//从 v5.2.0 开始支持
      formatter: function (params, index) {
        if (index === 7) {
          return params + '\n'
        } else if (index === 8) {
          return '\n' + params
        } else if (index === 15) {
          return params + '\n'
        } else {
          return params
        }
      }
    },
    axisTick: {
      show: false,
      alignWithLabel: true,
      interval: 0,
      length: 5
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#e2e5ec'],
        type: 'dashed'
      }
    }
  },
  tooltip: {
    show: true,
    formatter: function (item) {
      let str = '<div style="display:flex;flex-direction: row;align-items: center;">'
      str += '<div style="width: 8px;\n' +
            '            height: 8px;\n' +
            '            margin: 3px 8px 0 0;\n' +
            '            border-radius: 1px;;background:'
      str += item.color
      str += ';"></div>'
      str += item.name + ': ' + unitConvert(item.value, unitTypes.number).join('')
      str += '</div>'
      str += '</div>'
      return str
    }
  },
  series: [{
    type: 'bar',
    data: [], // 8,7,6,5,4,3,2,1,0,0,0,0,0,0,0,0
    coordinateSystem: 'polar',
    axisTick: {
      show: false
    },
    itemStyle: {
      color: function (params) {
        return chartColorForBehaviorPattern[params.dataIndex]
      }
    },
    label: {
      show: false,
      position: 'middle',
      formatter: '{b}: {c}'
    },
    barMinHeight: 5
  }],
  animation: false
}

export const stackedLineChartOption = {
  color: chartColor3,
  tooltip: {
    trigger: 'axis',
    className: 'echarts-tooltip echarts-tooltip-dark'
  },
  toolbox: {
    show: false
  },
  brush: {
    toolbox: ['lineX'],
    xAxisIndex: 'all',
    throttleType: 'debounce',
    transformable: false
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
      splitNumber: 8,
      axisLabel: {
        formatter: xAxisTimeFormatter,
        rich: xAxisTimeRich
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
// subscriber的app页签
export const stackedLineWithLegendChartOption = {
  color: chartColorForBehaviorPattern,
  tooltip: {
    trigger: 'axis',
    className: 'echarts-tooltip echarts-tooltip-dark'
  },
  toolbox: {
    show: false
  },
  brush: {
    toolbox: ['lineX'],
    xAxisIndex: 'all',
    throttleType: 'debounce',
    transformable: false
  },
  legend: {
    show: true,
    left: 'center',
    bottom: 10,
    icon: 'roundRect',
    itemWidth: 10,
    itemHeight: 10
  },
  grid: {
    top: '12%',
    left: '2%',
    right: '1.5%',
    bottom: 40,
    containLabel: true
  },
  xAxis: [
    {
      type: 'time',
      splitNumber: 8,
      axisLabel: {
        formatter: xAxisTimeFormatter,
        rich: xAxisTimeRich
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

export const linkTrafficLineChartOption = {
  color: chartColor3,
  tooltip: {
    trigger: 'axis',
    className: 'echarts-tooltip echarts-tooltip-dark'
  },
  legend: {
    show: false
  },
  brush: {
    toolbox: ['lineX'],
    xAxisIndex: 'all',
    throttleType: 'debounce',
    transformable: false
  },
  toolbox: {
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
      splitNumber: 8,
      axisLabel: {
        formatter: xAxisTimeFormatter,
        rich: xAxisTimeRich
      }
      // axisLabel: {
      //   formatter: function (value) {
      //     const data = new Date(value)
      //     const h = data.getHours() > 9 ? data.getHours() : '0' + data.getHours()
      //     const m = data.getMinutes() > 9 ? data.getMinutes() : '0' + data.getMinutes()
      //     return h + ':' + m
      //   }
      // }
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
    type: 'time',
    axisLabel: {
      formatter: xAxisTimeFormatter,
      rich: xAxisTimeRich
    }
  },
  yAxis: {
    show: false,
    type: 'value'
  },
  grid: {
    left: 0,
    right: 1,
    top: 2,
    bottom: 0
  },
  animation: false,
  color: chartColor3[2],
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
      axisLabel: {
        formatter: xAxisTimeFormatter,
        rich: xAxisTimeRich
      }
      // axisLabel: {
      //   formatter: function (value) {
      //     const data = new Date(value)
      //     const h = data.getHours() > 9 ? data.getHours() : '0' + data.getHours()
      //     const m = data.getMinutes() > 9 ? data.getMinutes() : '0' + data.getMinutes()
      //     console.log(h + ':' + m)
      //     return h + ':' + m
      //   }
      // }
    }
  ],
  yAxis: [
    {
      type: 'value',
      splitLine: {
        show: false
      },
      axisLabel: {
        // formatter: function (value) {
        //   return unitConvert(value, unitTypes.number).join('')
        // }
      }
    }
  ],
  series: []
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
      fontFamily: 'NotoSansSChineseRegular'
    }
  },
  brush: {
    toolbox: ['lineX'],
    xAxisIndex: 'all',
    throttleType: 'debounce',
    transformable: false
  },
  toolbox: {
    show: false
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
      splitNumber: 8,
      axisLabel: {
        formatter: xAxisTimeFormatter,
        rich: xAxisTimeRich
      }
      // axisLabel: {
      //   formatter: function (value) {
      //     const data = new Date(value)
      //     const h = data.getHours() > 9 ? data.getHours() : '0' + data.getHours()
      //     const m = data.getMinutes() > 9 ? data.getMinutes() : '0' + data.getMinutes()
      //     return h + ':' + m
      //   }
      // }
    }
  ],
  yAxis: [
    {
      type: 'value',
      splitLine: {
        show: false
      },
      axisLabel: {
        // formatter: function (value) {
        //   return unitConvert(value, unitTypes.number).join('')
        // }
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

export const linksTrafficSankeyOption = {
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
    border: '#C5C5C5',
    borderWidth: 1,
    boxShadow: '-1px 1px 10px -1px rgba(122,116,116,0.85)',
    borderRadius: '2px 2px 2px 2px'
  },
  series: [
    {
      type: 'sankey',
      data: [],
      links: [],
      right: '7%',
      left: '3%',
      top: '0%',
      bottom: '23%',
      label: {
        color: 'rgba(0,0,0,0.7)',
        fontSize: 12,
        formatter (params) {
          return params.data.originalName || params.data.name
        }
      },
      draggable: false
    }
  ]
}

export const stackedBarChartOption = {
  color: chartColor6,
  legend: {
    show: false
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      barWidth: 26,
      type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
    }
  },
  grid: {
    top: '12%',
    left: '2%',
    right: '2%',
    bottom: 24,
    containLabel: true
  },
  xAxis: {
    type: 'time',
    boundaryGap: ['1%', '3%'],
    splitNumber: 8,
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      formatter: xAxisTimeFormatter,
      rich: xAxisTimeRich
    }
    // axisLabel: {
    //   margin: 12,
    //   formatter: function (value) {
    //     const data = new Date(value)
    //     const h = data.getHours() > 9 ? data.getHours() : '0' + data.getHours()
    //     const m = data.getMinutes() > 9 ? data.getMinutes() : '0' + data.getMinutes()
    //     return h + ':' + m
    //   }
    // }
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true,
      lineStyle: {
        color: '#ECECEC'
      }
    },
    axisLabel: {
      margin: 20
    }
  },
  series: [
    {
      data: [],
      stack: 'total',
      type: 'bar',
      name: '',
      emphasis: {
        focus: 'series'
      },
      barWidth: 26
    }
  ]
}

export const entityDetailSubscriberTopApp = {
  tooltip: {
    show: true,
    trigger: 'axis',
    formatter: function (param) {
      return `${param[0].name}: ${valueToRangeValue(param[0].value[0], unitTypes.percent, null, null, 1).join(' ')}`
    },
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 400px !important'
  },
  xAxis: {
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  grid: {
    top: 0,
    left: 15,
    right: 45,
    bottom: 0
  },
  yAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#E2E5EC'
      }
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  series: [{
    barWidth: 14,
    barMaxHeight: 20,
    itemStyle: {
      color: function (params) {
        const colorList = chartColorForSubscriberTopApp
        return colorList[params.dataIndex]
      }
    },
    data: [],
    type: 'bar',
    label: {
      show: true,
      position: 'right',
      valueAnimation: true,
      formatter: function (param, index, callback) {
        return `${valueToRangeValue(param.value[0], unitTypes.percent, null, null, 1).join(' ')}`
      }
    }
  }]
}

export const tagLineChartOption = {
  tooltip: {
    trigger: 'axis',
    className: 'echarts-tooltip echarts-tooltip-dark'
  },
  legend: {
    show: true,
    x: 'center',
    y: 'bottom',
    icon: 'circle',
    itemGap: 50,
    data: ['IP', 'Domain Name']
  },
  grid: {
    top: '12%',
    left: '1%',
    right: '1%',
    bottom: 30,
    containLabel: true
  },
  xAxis: [
    {
      type: 'time',
      axisLabel: {
        formatter: xAxisTimeFormatter,
        rich: xAxisTimeRich
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
        // formatter: function (value) {
        //   return unitConvert(value, unitTypes.number).join('')
        // }
      },
      minInterval:1
    }
  ],
  series: []
}
