import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import { format } from 'echarts'
import _ from 'lodash'
import { line, lineWithStatistics, lineStack, singleValueLine } from './options/line'
import { ipOpenPortBar, timeBar, categoryBar } from './options/bar'
import { pieWithTable, ipHostedDomain } from './options/pie'
import { relationShip } from './options/graph'
import { sankey } from './options/sankey'
import { chartColor } from '@/utils/constants'
import { dateFormatByAppearance } from '@/utils/date-util'

export const chartBarColor = ['#0F8AB2', '#57CBAC']
export function getChartColor (index) {
  return chartColor[index % chartColor.length]
}
export function getCharBartColor (index) {
  return chartBarColor[index % chartBarColor.length]
}

const typeOptionMappings = [
  { value: 101, option: line }, // 常规折线图
  { value: 102, option: lineWithStatistics }, // 带统计表格的折线图
  { value: 103, option: lineStack }, // 折线堆叠图
  { value: 202, option: ipOpenPortBar }, // ip详情--开放端口的柱状图
  { value: 203, option: timeBar }, // 矿机所属单位
  { value: 204, option: categoryBar }, // 挖矿事件统计
  { value: 301, option: pieWithTable }, // 常规饼图
  { value: 302, option: pieWithTable }, // 带表格饼图
  { value: 303, option: ipHostedDomain }, // ip详情--托管域名
  { value: 304, option: ipHostedDomain }, // app详情--相关域名
  { value: 402, option: relationShip }, // 关系图
  { value: 403, option: sankey }, // 桑基图
  { value: 502, option: singleValueLine } // 单值图中的折线图
]
export function getOption (type) {
  const mapping = typeOptionMappings.find(m => m.value === type)
  return mapping && mapping.option ? _.cloneDeep(mapping.option) : null
}

/* 饼图柱状图等 */
export function isEcharts (type) {
  return type >= 101 && type <= 500
}
/* 地图 */
export function isMap (type) {
  return type >= 1 && type <= 100
}
/* 连线地图 */
export function isMapLine (type) {
  return type === 1
}
/* 色块地图 */
export function isMapBlock (type) {
  return type === 2
}
/* 散点地图 */
export function isMapPoint (type) {
  return type === 3
}
/* IP实体基本信息 */
export function isIpBasicInfo (type) {
  return type === 4
}
/* 普通折线图 */
export function isEchartsLine (type) {
  return type === 101
}
/* 带统计的折线图 */
export function isEchartsWithStatistics (type) {
  return type === 102
}
/* IP实体开放端口 */
export function isIpOpenPortBar (type) {
  return type === 202
}
/* 柱状图:挖矿事件统计(time类型柱状图) */
export function isEchartsTimeBar (type) {
  return type === 203
}
/* 柱状图:矿机所属单位(category类型柱状图) */
export function isEchartsCategoryBar (type) {
  return type === 204
}
/* 带Table的饼图 */
export function isEchartsWithTable (type) {
  return type === 301
}
/* 普通饼图 */
export function isEchartsPie (type) {
  return type === 302
}
/* IP实体托管域名 */
export function isIpHostedDomain (type) {
  return type === 303
}
/* APP实体相关域名 */
export function isAppRelatedDomain (type) {
  return type === 304
}
/* 关系图 */
export function isRelationShip (type) {
  return type === 402
}
/* 桑基图 */
export function isSankey (type) {
  return type === 403
}
/* 单值 */
export function isSingleValue (type) {
  return type >= 501 && type <= 600
}
/* 常规单值图 */
export function isCommonSingleValue (type) {
  return type === 501
}
/* 带折线图的单值 */
export function isSingleValueWithEcharts (type) {
  return type === 502
}
/* 常规单值图2 */
export function isCommon2SingleValue (type) {
  return type === 503
}
/* 常规单值图3 */
export function isCommon3SingleValue (type) {
  return type === 504
}
/* 带折线图的单值 */
export function isSingleValueWithPercent (type) {
  return type === 505
}
/* 带分位值的单值 */
export function isSingleValueWithPercentileLeft (type) {
  return type === 506
}
/* 带分位值的单值 */
export function isSingleValueWithPercentileRight (type) {
  return type === 507
}
/* table */
export function isTable (type) {
  return type >= 601 && type <= 700
}
/* basic table */
export function isBasicTable (type) {
  return type === 601
}
/* DNS加密协议 */
export function isDetectionsProtocol (type) {
  return type === 508
}
/* DOMAIN实体DNS记录 */
export function isDomainDnsRecord (type) {
  return type === 602
}
/* table */
export function isActiveIpTable (type) {
  return type === 603
}
/* APP实体基本信息 */
export function isAppBasicInfo (type) {
  return type === 702
}
/* DOMAIN实体Whois */
export function isDomainWhois (type) {
  return type === 703
}
/* 告警信息 */
export function isAlarmInfo (type) {
  return type === 704
}
/* 近期挖矿事件 */
export function isCryptocurrencyEventList (type) {
  return type === 705
}
/* 单支持情况统计 */
export function isSingleSupportStatistics (type) {
  return type === 706
}
/* 两个支持情况统计 */
export function isTwoSupportStatistics (type) {
  return type === 707
}
/* 域名递归解析 */
export function isDomainRecursiveResolve (type) {
  return type === 708
}
/* tabs */
export function isTabs (type) {
  return type === 801
}
/* title */
export function isTitle (type) {
  return type === 803
}
/* 组 */
export function isGroup (type) {
  return type === 804
}
/* 实体详情块 */
export function isBlock (type) {
  return type === 805
}

export function isDetectionSecurity (type) {
  return type === 709
}

export function isDetectionService (type) {
  return type === 710
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
  if (isEchartsWithStatistics(type) || isEchartsWithTable(type)) {
    layout.push(layoutConstant.FOOTER)
  }
  return layout
}

export function getGroupHeight (arr) {
  if (arr.length) {
    const minYArr = [...arr]
    minYArr.sort((a, b) => {
      return a.y - b.y
    })
    const maxYArr = [...arr]
    maxYArr.sort((a, b) => {
      return (b.y + b.h) - (a.y + a.h)
    })
    return maxYArr[0].y + maxYArr[0].h - minYArr[0].y
    /* let lastItem = []
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
    return maxHeight + maxY */
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
      str += dateFormatByAppearance(tData)
      str += '</div>'
    }
    str += '<div class="cn-chart-tooltip-box">'
    str += item.marker
    str += `<span class="cn-chart-tooltip-content"> 
        ${item.seriesName}
    </span>`
    str += `<span class="cn-chart-tooltip-value">
        ${valueToRangeValue(item.data[1], item.data[2]).join(' ')}
    </span>`
    str += '</div>'
  })
  str += '</div>'
  return str
}
export function tooLongFormatter (name) {
  return format.truncateText(name, 110, '12px')
}
export function timeHorizontalFormatter (params) {
  let str = '<div>'
  params.forEach((item, i) => {
    const tData = item.data[1]
    if (i === 0) {
      str += '<div style="margin-bottom: 5px">'
      str += dateFormatByAppearance(tData)
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
  let str = '<div>'
  params.forEach((item, i) => {
    const tData = item.data[0]
    if (i === 0) {
      str += '<div style="margin-bottom: 5px">'
      str += dateFormatByAppearance(tData)
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
  str += dateFormatByAppearance(tData)
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

export function stackedLineTooltipFormatter (params) {
  let str = '<div>'
  params.forEach((item, i) => {
    const tData = item.data[0]
    if (i === 0) {
      str += '<div style="margin-bottom: 5px">'
      str += dateFormatByAppearance(tData)
      str += '</div>'
    }
    str += '<div class="cn-chart-tooltip">'
    str += '<span class="cn-chart-tooltip-box">'
    str += item.marker
    str += `<span class="cn-chart-tooltip-content"> 
        ${item.seriesName}
    </span>`
    str += '</span>'
    str += `<span class="cn-chart-tooltip-value cn-chart-tooltip__color">
        ${unitConvert(item.data[1], item.value[2]).join(' ')}
    </span>`
    str += '</div>'
  })
  str += '</div>'
  return str
}
export function trafficLineTooltipFormatter (params) {
  let str = '<div>'
  params.forEach((item, i) => {
    const tData = item.data[0]
    if (i === 0) {
      str += '<div style="margin-bottom: 5px">'
      str += dateFormatByAppearance(tData)
      str += '</div>'
    }
    str += '<div class="cn-chart-tooltip">'
    str += '<span class="cn-chart-tooltip-box">'
    str += item.marker
    str += `<span class="cn-chart-tooltip-content"> 
        ${item.seriesName}
    </span>`
    str += '</span>'
    str += `<span class="cn-chart-tooltip-value cn-chart-tooltip__color">
        ${unitConvert(item.data[1], item.value[2]).join(' ')}
    </span>`
    str += '</div>'
  })
  str += '</div>'
  return str
}
