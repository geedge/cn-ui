/**
 * @author 陈劲松
 * @date 2021/6/16
 * @description chart option和一些工具
*/
import { format } from 'echarts'
import { shortFormatter } from './chartFormatter'
import _ from 'lodash'
export const chartColor = ['#5370C6', '#90CC74', '#FAC858', '#EE6666',
  '#73BFDE', '#3BA172', '#FC8452', '#9960B4',
  '#E97CCC', '#FEA69E', '#0F8AB2', '#57CBAC',
  '#5888BC', '#63B6AC', '#EDC6B2', '#D5746B']
export function getChartColor (index) {
  return chartColor[index % chartColor.length]
}
const line = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axiosFormatter,
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important'
  },
  xAxis: {
    type: 'time'
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: shortFormatter
    }
  },
  animation: false,
  grid: {
    left: 55,
    bottom: 45,
    top: 30
  },
  color: chartColor,
  legend: {
    show: true,
    right: 30,
    top: 'top',
    orient: 'horizontal',
    icon: 'circle',
    itemGap: 20,
    itemWidth: 10,
    textStyle: {
      padding: [0, 0, 0, 5],
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
const lineWithStatistics = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axiosFormatter,
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
      formatter: shortFormatter
    }

  },
  color: chartColor,
  grid: {
    left: 55,
    bottom: 25,
    top: 30
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
      data: []
    }
  ]
}
const lineStack = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axiosFormatter,
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
      formatter: shortFormatter
    }

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
const pieWithTable = {
  tooltip: {
    appendToBody: true,
    trigger: 'item'
  },
  color: chartColor,
  animation: false,
  legend: {
    orient: 'vertical',
    type: 'plain',
    left: '60%',
    top: 'middle',
    icon: 'circle',
    itemWidth: 10, // 设置宽度
    itemHeight: 10, // 设置高度
    itemGap: 20,
    selectedMode: false,
    // formatter: tooLongFormatter
  },
  series: [
    {
      type: 'pie',
      selectedMode: 'single',
      radius: ['42%', '70%'],
      center: ['30%', '50%'],
      data: [],
      label: {
        formatter: '{d}%'
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
const typeOptionMappings = [
  { value: 11, option: line }, // 常规折线图
  { value: 12, option: lineWithStatistics }, // 带统计表格的折线图
  { value: 13, option: lineStack }, // 折线堆叠图
  { value: 31, option: pieWithTable } // 常规折线图
]
const typeCategory = {
  MAP: 'map',
  TABLE: 'table',
  ECHARTS: 'echarts',
  TITLE: 'title',
  SINGLE: 'singleValue',
  TABS: 'tabs'
}
export function getTypeCategory (type) {
  if (isMap(type)) {
    return typeCategory.MAP
  } else if (isEcharts(type)) {
    return typeCategory.ECHARTS
  } else if (isTable(type)) {
    return typeCategory.TABLE
  } else if (isSingleValue(type)) {
    return typeCategory.SINGLE
  } else if (isTitle(type)) {
    return typeCategory.TITLE
  } else if (isTabs(type)) {
    return typeCategory.TABS
  }
}
/* 饼图柱状图等 */
export function isEcharts (type) {
  return type >= 11 && type <= 50
}
/* 地图 */
export function isMap (type) {
  return type >= 1 && type <= 10
}
/* 连线地图 */
export function isMapLine (type) {
  return type === 1
}
/* 带统计的折线图 */
export function isEchartsWithStatistics (type) {
  return type === 12
}
/* 单值 */
export function isSingleValue (type) {
  return type >= 51 && type <= 60
}
/* 带折线图的单值 */
export function isSingleValueWithEcharts (type) {
  return type === 52
}
/* 带Table的饼图 */
export function isEchartsWithTable (type) {
  return type === 31
}
/* table */
export function isTable (type) {
  return type >= 61 && type <= 70
}
/* title */
export function isTitle (type) {
  return type === 93
}
/* tabs */
export function isTabs (type) {
  return type === 91
}
export function getOption (type) {
  const mapping = typeOptionMappings.find(m => m.value === type)
  return mapping && mapping.option ? _.cloneDeep(mapping.option) : null
}
export const layoutConstant = {
  HEADER: 'header',
  FOOTER: 'footer'
}
export function getLayout (type) {
  const layout = []
  if (!isSingleValue(type) && !isTitle(type)) {
    layout.push(layoutConstant.HEADER)
  }
  if (type === 12 || type === 31) {
    layout.push(layoutConstant.FOOTER)
  }
  return layout
}

function tooLongFormatter (name) {
  return format.truncateText(name, 110, '12')
}
function axiosFormatter (params) {
  let str = '<div>'
  const sum = 0
  params.forEach((item, i) => {
    const tData = item.data[0]
    if (i === 0) {
      str += '<div style="margin-bottom: 5px">'
      str += window.$dayJs.tz(tData).format('YYYY-MM-DD HH:mm:ss')
      str += '</div>'
    }
    str += '<div class="cn-chart-tooltip-box">'
    str += item.marker
    str += `<span class="cn-chart-tooltip-content"> 
        ${item.seriesName}
    </span>`
    str += `<span class="cn-chart-tooltip-value">
        ${shortFormatter(item.data[1])}
    </span>`
    str += '</div>'
  })
  str += '</div>'
  return str
}
