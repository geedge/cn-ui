import {
  tooLongFormatter
} from '@/views/charts/charts/tools'
import unitConvert from '@/utils/unit-convert'
import _ from 'lodash'
import { dateFormatByAppearance } from '@/utils/date-util'

const severitySeriesIndexMappings = [
  { value: 'critical', index: '0' },
  { value: 'high', index: '1' },
  { value: 'medium', index: '2' },
  { value: 'low', index: '3' },
  { value: 'info', index: '4' }
]

export function getSeriesIndex (type) {
  const mapping = severitySeriesIndexMappings.find(m => m.value === type.toLowerCase())
  return mapping && mapping.index ? _.cloneDeep(mapping.index) : null
}

export const activeAttackColor = ['#51a9ee', '#49bcf2', '#4ad7eb', '#4cd4c8',
  '#7acc7e', '#a7db69']

const activeAttackColorMappings = [
  { value: 'command and control', color: '#51a9ee' },
  { value: 'payload delivery', color: '#49bcf2' },
  { value: 'cryptomining', color: '#4ad7eb' },
  { value: 'phishing', color: '#4cd4c8' },
  { value: 'dga', color: '#7acc7e' },
  { value: 'ddos', color: '#a7db69' }
]

export function getAttackColor (type) {
  const mapping = activeAttackColorMappings.find(m => m.value === type)
  return mapping && mapping.color ? _.cloneDeep(mapping.color) : null
}

const severityColorMappings = [
  { value: 'critical', color: '#d84c4c' },
  { value: 'high', color: '#ff9a79' },
  { value: 'medium', color: '#ffb65a' },
  { value: 'low', color: '#ffdd4a' },
  { value: 'info', color: '#d7c668' }
]

export function getSeverityColor (type) {
  const mapping = severityColorMappings.find(m => m.value === type)
  return mapping && mapping.color ? _.cloneDeep(mapping.color) : null
}

export const multipleBarOption = {
  legend: {
    icon: 'circle',
    top: 10,
    right: 30,
    itemWidth: 10, // 设置宽度
    itemHeight: 10 // 设置高度
  },
  tooltip: {},
  dataset: {
    source: [
    ]
  },
  xAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#eaedef'
      }
    },
    axisLabel: {
      color: '#737373',
      interval: 'auto'
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    axisTick: { show: false },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#eaedef'
      }
    },
    axisLabel: {
      color: '#737373'
    },
    splitLine: {
      show: false
    },
    minInterval: 1
  },
  grid: {
    top: 40,
    left: 25,
    right: 25,
    bottom: 20,
    containLabel: true
  },
  series: [
    {
      name: 'critical',
      type: 'bar',
      stack: 'eventSeverityTrend',
      emphasis: {
        focus: 'series'
      },
      barWidth: 15,
      seriesLayoutBy: 'row',
      itemStyle: {
        color: '#d84c4c'
      }
    },
    {
      name: 'high',
      type: 'bar',
      stack: 'eventSeverityTrend',
      emphasis: {
        focus: 'series'
      },
      barWidth: 15,
      seriesLayoutBy: 'row',
      itemStyle: {
        color: '#ff9a79'
      }
    },
    {
      name: 'medium',
      type: 'bar',
      stack: 'eventSeverityTrend',
      emphasis: {
        focus: 'series'
      },
      barWidth: 15,
      seriesLayoutBy: 'row',
      itemStyle: {
        color: '#ffb65a'
      }
    },
    {
      name: 'low',
      type: 'bar',
      stack: 'eventSeverityTrend',
      emphasis: {
        focus: 'series'
      },
      barWidth: 15,
      seriesLayoutBy: 'row',
      itemStyle: {
        color: '#ffdd4a'
      }
    },
    {
      name: 'info',
      type: 'bar',
      stack: 'eventSeverityTrend',
      emphasis: {
        focus: 'series'
      },
      barWidth: 15,
      seriesLayoutBy: 'row',
      itemStyle: {
        color: '#d7c668'
      }
    }
  ]
}
export const pieForSeverity = {
  tooltip: {
    appendToBody: true
  },
  color: activeAttackColor,
  animation: false,
  legend: {
    orient: 'vertical',
    type: 'plain',
    left: '60%',
    top: 'middle',
    icon: 'circle',
    itemWidth: 10, // 设置宽度
    itemHeight: 10, // 设置高度
    itemGap: 10,
    formatter: tooLongFormatter,
    tooltip: {
      show: true
    }
  },
  series: [
    {
      type: 'pie',
      selectedMode: 'single',
      radius: ['42%', '65%'],
      center: ['30%', '50%'],
      data: [],
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      tooltip: {
        formatter: function (param, index, callback) {
          return `${param.name}: ${param.value}`
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}
export const activeAttackBar = {
  tooltip: {
    appendToBody: true,
    trigger: 'item',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: function (param, index, callback) {
      return `${param.name}: ${unitConvert(param.value[0], 'number').join(' ')}`
    },
    show: true,
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
    top: 20,
    left: 100,
    right: 70,
    bottom: 20
  },
  yAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      show: true,
      width: 95,
      overflow: 'truncate'

    },
    splitLine: {
      show: false
    },
    triggerEvent: true
  },
  series: [{
    barWidth: 5,
    barMaxHeight: 20,
    itemStyle: {
      normal: {
        color: function (params) {
          const colorList = ['#d1bd50', '#c9d150', '#fddd52', '#ffb65a', '#fe845d']
          return colorList[params.dataIndex]
        }
      }
    },
    data: [],
    type: 'bar',
    label: {
      show: true,
      position: 'right',
      valueAnimation: true,
      formatter: function (param, index, callback) {
        return `${unitConvert(param.value[0], 'number').join(' ')}`
      }
    },
    barCategoryGap: '10%'
  }]
}
export const metricOption = {
  tooltip: {
    show: true,
    trigger: 'axis',
    formatter (params) {
      let str = '<div>'
      const item = params[0]
      const tData = item.data[0]
      str += '<div style="margin-bottom: 5px">'
      str += dateFormatByAppearance(tData)
      str += '</div>'
      str += '<div class="cn-chart-tooltip-box">'
      str += item.marker
      str += `<span class="cn-chart-tooltip-content"> 
      ${item.seriesName}
      </span>`
      str += `<span class="cn-chart-tooltip-value">
          ${unitConvert(item.data[1], item.data[2]).join(' ')}
      </span>`
      str += '</div>'
      return str
    },
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    appendToBody: true
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
  legend: {
    show: false
  },
  series: [
    {
      name: 'metric',
      type: 'line',
      legendHoverLink: false,
      lineStyle: {
        width: 1,
        type: 'dashed'
      },
      color: '#ec836c',
      data: [],
      showSymbol: false
    },
    {
      name: 'metric',
      type: 'line',
      legendHoverLink: false,
      lineStyle: {
        width: 1,
        type: 'solid'
      },
      areaStyle: {
        color: 'rgba(244, 187, 174, 0.59)'
      },
      color: '#ec836c',
      data: [],
      showSymbol: false
    },
    {
      name: 'metric',
      type: 'line',
      legendHoverLink: false,
      lineStyle: {
        width: 1,
        type: 'dashed'
      },
      color: '#ec836c',
      data: [],
      showSymbol: false
    }
  ]
}
