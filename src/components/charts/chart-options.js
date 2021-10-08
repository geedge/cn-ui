/**
 * @author 陈劲松
 * @date 2021/6/16
 * @description chart option和一些工具
*/
import { format } from 'echarts'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
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
const pieWithTable = {
  tooltip: {
    appendToBody: true
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
        formatter: '{d}%'
      },
      tooltip: {
        formatter: function (param, index, callback) {
          return `${param.name}: ${unitConvert(param.value, param.data.unitType).join(' ')}`
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
const ipHostedDomain = {
  color: chartColor,
  animation: false,
  legend: {
    orient: 'vertical',
    type: 'plain',
    right: 50,
    top: 'middle',
    icon: 'circle',
    itemWidth: 10, // 设置宽度
    itemHeight: 10, // 设置高度
    itemGap: 20,
    tooltip: {
      show: true
    }
  },
  series: [
    {
      type: 'pie',
      selectedMode: 'single',
      radius: ['42%', '65%'],
      center: ['40%', '50%'],
      data: [],
      label: {
        formatter: '{d}%'
      },
      tooltip: {
        formatter: function (param, index, callback) {
          return `${param.name}: ${unitConvert(param.value, param.data.unitType).join(' ')}`
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
const singleValueLine = {
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
export const entityListLineOption = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axiosFormatter,
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
const relationShip = {
  grid: {
    left: 0,
    bottom: 50,
    top: 80,
    right: 0
  },
  series: [
    {
      type: 'graph',
      layout: 'force',
      symbolSize: 40,
      roam: true,
      force: {
        repulsion: 350
      },
      draggable: true,
      label: { show: true },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: 7,
      data: [],
      links: []
    }
  ]
}
const sankey = {
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: [
    {
      type: 'sankey',
      data: [],
      links: [],
      right: '5%',
      top: 50,
      bottom: 100,
      levels: [
        {
          depth: 0,
          itemStyle: {
            color: '#47D49C'
          },
          lineStyle: {
            color: '#999'
          }
        }, {
          depth: 1,
          itemStyle: {
            color: '#A69BF5'
          },
          lineStyle: {
            color: '#999'
          }
        }, {
          depth: 2,
          itemStyle: {
            color: '#73A0FA'
          },
          lineStyle: {
            color: '#999'
          }
        }
      ]
    }
  ]
}
const ipOpenPortBar = {
  xAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: { show: false }
  },
  grid: {
    top: 30,
    left: 60,
    right: 50,
    bottom: 50
  },
  yAxis: {
    type: 'value',
    show: false
  },
  series: [{
    barWidth: 38,
    data: [],
    type: 'bar',
    label: { show: true, position: 'top' },
    barCategoryGap: '10%'
  }]
}
const typeOptionMappings = [
  { value: 11, option: line }, // 常规折线图
  { value: 12, option: lineWithStatistics }, // 带统计表格的折线图
  { value: 13, option: lineStack }, // 折线堆叠图
  { value: 22, option: ipOpenPortBar }, // ip详情--开放端口的柱状图
  { value: 31, option: pieWithTable }, // 常规折线图
  { value: 33, option: ipHostedDomain }, // ip详情--托管域名
  { value: 34, option: ipHostedDomain }, // app详情--相关域名
  { value: 42, option: relationShip }, // 关系图
  { value: 43, option: sankey }, // 桑基图
  { value: 52, option: singleValueLine }
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
/* 色块地图 */
export function isMapBlock (type) {
  return type === 2
}
/* 带统计的折线图 */
export function isEchartsWithStatistics (type) {
  return type === 12
}
/* 关系图 */
export function isRelationShip (type) {
  return type === 42
}
/* 桑基图 */
export function isSankey (type) {
  return type === 43
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
/* IP实体基本信息 */
export function isIpBasicInfo (type) {
  return type === 4
}
/* IP实体开放端口 */
export function isIpOpenPort (type) {
  return type === 22
}
/* IP实体托管域名 */
export function isIpHostedDomain (type) {
  return type === 33
}
/* APP实体相关域名 */
export function isAppRelatedDomain (type) {
  return type === 34
}
/* APP实体基本信息 */
export function isAppBasicInfo (type) {
  return type === 82
}
/* DOMAIN实体Whois */
export function isDomainWhois (type) {
  return type === 83
}
/* DOMAIN实体DNS记录 */
export function isDomainDnsRecord (type) {
  return type === 84
}
/* 组 */
export function isGroup (type) {
  return type === 94
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
        ${unitConvert(item.data[1], item.data[2]).join(' ')}
    </span>`
    str += '</div>'
  })
  str += '</div>'
  return str
}
