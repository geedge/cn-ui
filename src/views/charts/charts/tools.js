import unitConvert from '@/utils/unit-convert'
import { format } from 'echarts'
import _ from 'lodash'
import { line, lineWithStatistics, lineStack, singleValueLine } from './options/line'
import { ipOpenPortBar, timeBar, categoryBar } from './options/bar'
import { pieWithTable, ipHostedDomain } from './options/pie'
import { relationShip } from './options/graph'
import { sankey } from './options/sankey'

export const chartColor = ['#5370C6', '#90CC74', '#FAC858', '#EE6666',
  '#73BFDE', '#3BA172', '#FC8452', '#9960B4',
  '#E97CCC', '#FEA69E', '#0F8AB2', '#57CBAC',
  '#5888BC', '#63B6AC', '#EDC6B2', '#D5746B']
export const chartBarColor = ['#0F8AB2', '#57CBAC']
export function getChartColor (index) {
  return chartColor[index % chartColor.length]
}
export function getCharBartColor (index) {
  return chartBarColor[index % chartBarColor.length]
}

const typeOptionMappings = [
  { value: 11, option: line }, // 常规折线图
  { value: 12, option: lineWithStatistics }, // 带统计表格的折线图
  { value: 13, option: lineStack }, // 折线堆叠图
  { value: 22, option: ipOpenPortBar }, // ip详情--开放端口的柱状图
  { value: 23, option: timeBar }, // 矿机所属单位
  { value: 24, option: categoryBar }, // 挖矿事件统计
  { value: 31, option: pieWithTable }, // 常规饼图
  { value: 32, option: pieWithTable }, // 带表格饼图
  { value: 33, option: ipHostedDomain }, // ip详情--托管域名
  { value: 34, option: ipHostedDomain }, // app详情--相关域名
  { value: 42, option: relationShip }, // 关系图
  { value: 43, option: sankey }, // 桑基图
  { value: 52, option: singleValueLine } // 单值图中的折线图
]
export function getOption (type) {
  const mapping = typeOptionMappings.find(m => m.value === type)
  return mapping && mapping.option ? _.cloneDeep(mapping.option) : null
}

/* 柱状图:挖矿事件统计(time类型柱状图) */
export function isEchartsTimeBar (type) {
  return type === 23
}
/* 柱状图:矿机所属单位(category类型柱状图) */
export function isEchartsCategoryBar (type) {
  return type === 24
}
export function isIpOpenPortBar (type) {
  return type === 22
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
/* 普通折线图 */
export function isEchartsLine (type) {
  return type === 11
}
/* 普通饼图 */
export function isEchartsPie (type) {
  return type === 32
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
/* 带折线图的单值 */
export function isSingleValueWithEchartsTemp (type) {
  return type === 55
}
/* 带Table的饼图 */
export function isEchartsWithTable (type) {
  return type === 31
}
/* table */
export function isTable (type) {
  return type >= 61 && type <= 70
}
/* current table */
export function isCurrentTable (type) {
  return type === 61
}
/* table */
export function isActiveIpTable (type) {
  return type === 63
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
  return type === 62
}
/* 近期挖矿事件 */
export function isCryptocurrencyEventList (type) {
  return type === 85
}
/* 组 */
export function isGroup (type) {
  return type === 94
}
/* 实体详情块 */
export function isBlock (type) {
  return type === 95
}

/* 根据type获取图表分类 */
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

/* 根据type获取布局 */
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

export function getGroupHeight (arr) {
  if (arr.length) {
    let lastItem = []
    let maxY = arr[0].y
    arr.forEach((children, index) => {
      if (maxY === children.y) {
        lastItem.push(children)
      } else if (maxY < children.y) {
        maxY = children.y
        lastItem = [children]
      }
    })
    let maxHeight = 0
    lastItem.forEach(last => {
      if (maxHeight < last.h) {
        maxHeight = last.h
      }
    })
    if (maxY < 0) {
      maxY = 0
    }
    return maxHeight + maxY
  } else {
    return 1
  }
}
export function getLayoutPosition (arr) {
  if (arr.length) {
    let lastItem = []
    let maxY = 0
    arr.forEach((children, index) => {
      if (maxY === children.y) {
        lastItem.push(children)
      } else if (maxY < children.y) {
        maxY = children.y
        lastItem = [children]
      }
    })
    let maxX = 0
    lastItem.forEach(last => {
      if (maxX < last.x + last.span) {
        maxX = last.x + last.span
      }
    })
    return {
      x: maxX,
      y: maxY
    }
  } else {
    return {
      x: 0,
      y: 0
    }
  }
}
export function axisFormatter (params) {
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
export function tooLongFormatter (name) {
  return format.truncateText(name, 110, '12')
}
export function timeHorizontalFormatter (params) {
  let str = '<div>'
  params.forEach((item, i) => {
    const tData = item.data[1]
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
        ${unitConvert(item.data[0], item.data[2]).join(' ')}
    </span>`
    str += '</div>'
  })
  str += '</div>'
  return str
}
export function categoryHorizontalFormatter (params) {
  let str = '<div>'
  params.forEach((item, i) => {
    str += '<div class="cn-chart-tooltip-box">'
    str += item.data[1] + ': ' + item.data[0]
    str += '</div>'
  })
  str += '</div>'
  return str
}
export function categoryVerticalFormatter (params) {
  let str = '<div>'
  params.forEach((item, i) => {
    str += '<div class="cn-chart-tooltip-box">'
    str += item.data[0] + ': ' + item.data[1]
    str += '</div>'
  })
  str += '</div>'
  return str
}
export function timeVerticalFormatter (params) {
  console.log(params)
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
export function timeBarTooltipFormatter (params, type) {
  console.log(params, type)
  let index1, index0
  if (type === 'vertical') {
    index0 = 0
    index1 = 1
  } else {
    index0 = 1
    index1 = 0
  }
  let str = '<div>'
  const tData = params.data[index0]
  str += '<div style="margin-bottom: 5px">'
  str += window.$dayJs.tz(tData).format('YYYY-MM-DD HH:mm:ss')
  str += '</div>'

  str += '<div class="cn-chart-tooltip-box">'
  // str += params.marker
  str += `<span class="cn-chart-tooltip-content"> 
       values
    </span>`
  str += `<span class="cn-chart-tooltip-value">
        ${unitConvert(params.data[index1], params.data[2]).join(' ')}
    </span>`
  str += '</div>'

  str += '</div>'
  return str
}
export function categoryBarTooltipFormatter (params, type) {
  console.log(params, type)
  let index1, index0
  if (type === 'vertical') {
    index0 = 0
    index1 = 1
  } else {
    index0 = 1
    index1 = 0
  }
  let str = '<div>'
  str += '<div style="margin-bottom: 5px">'
  str += params.data[index0]
  str += '</div>'

  str += '<div class="cn-chart-tooltip-box">'
  // str += params.marker
  str += `<span class="cn-chart-tooltip-content"> 
       values
    </span>`
  str += `<span class="cn-chart-tooltip-value">
        ${unitConvert(params.data[index1], params.data[2]).join(' ')}
    </span>`
  str += '</div>'

  str += '</div>'
  return str
}
