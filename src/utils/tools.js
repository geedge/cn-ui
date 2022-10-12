import { ElMessageBox, ElMessage } from 'element-plus'
import i18n from '@/i18n'
import _ from 'lodash'
import { storageKey, iso36112, topDomain, echartsFontSize, dbGeoDataTableName, networkTable, dbDrilldownTableConfig } from '@/utils/constants'
import { getIso36112JsonData } from '@/utils/api'
import { format } from 'echarts'
import router from '@/router'
import { db } from '@/indexedDB'

export const tableSort = {
  // 是否需要排序
  sortableShow (prop, from) {
    switch (prop) {
      case 'state': {
        if (from === 'operationlog' || from === 'alertSilence') {
          return false
        }
        break
      }
      case 'startAt': {
        if (from === 'alertSilence') {
          return false
        }
        break
      }
      case 'id':
      case 'alertRule':
      case 'severity':
      case 'endAt':
      case 'ID':
      case 'HOST':
      case 'SN':
      case 'assetType':
      case 'purchaseDate':
      case 'pingStatus':
      case 'dataCenter':
      case 'cabinet':
      case 'model':
      case 'principal':
      case 'asset':
      case 'port':
      case 'project':
      case 'module':
      case 'type':
      case 'name':
      case 'area':
      case 'vendor':
      case 'filename':
      case 'updateAt':
      case 'username':
      case 'ip':
      case 'operation':
      case 'createDate':
      case 'time':
      case 'host':
      case 'protocol':
      case 'user':
      case 'cmd':
      case 'alertName':
      case 'threshold':
      case 'idc':
      case 'alertNum':
      case 'gname':
        return 'custom'
      default : return false
    }
  },
  // prop字段
  propTitle (prop, from) {
    switch (from) {
      case 'asset':
        switch (prop) {
          case 'ID': return 'ass.id'
          case 'HOST': return 'ass.host'
          case 'SN': return 'ass.sn'
          case 'assetType': return 'sdtt.value'
          case 'purchaseDate': return 'ass.purchase_date'
          case 'state': return 'ass.state'
          case 'pingStatus': return 'assp.rtt'
          case 'dataCenter': return 'idc.name'
          case 'cabinet': return 'cab.name'
          case 'model': return 'mo.name'
          case 'vendor': return 'sdt.value'
          case 'principal': return 'su.username'
          default : return prop
        }

      case 'alertMessage':
        switch (prop) {
          case 'id': return 'am.id'
          case 'state': return 'am.state'
          case 'alertRule': return 'ar.alert_name'
          case 'severity': return 'am.severity'
          case 'startAt': return 'am.start_at'
          case 'endAt': return 'am.end_at'
          default : return prop
        }

      case 'project':
        switch (prop) {
          case 'id': return 'e.id'
          case 'asset': return 'a.host'
          case 'port': return 'e.port'
          case 'project': return 'p.name'
          case 'module': return 'm.name'
          case 'type': return 'm.type'
          case 'state' :return 'es.state'
          // case 'path': return'e.path';
          default : return prop
        }

      case 'dc':
        switch (prop) {
          case 'id': return 'i.id'
          case 'name': return 'i.name'
          case 'area': return 'sa.name'
          default : return prop
        }

      case 'endpointTab':
        switch (prop) {
          case 'id': return 'e.id'
          case 'asset': return 'a.host'
          case 'port': return 'e.port'
          case 'project': return 'p.name'
          case 'module': return 'm.name'
          case 'type': return 'm.type'
          case 'state' :return 'es.state'
          // case 'path': return'e.path';
          default : return prop
        }
      case 'model':
        switch (prop) {
          case 'id': return 'mo.id'
          case 'name': return 'mo.name'
          case 'type': return 'dictt.value'
          case 'vendor': return 'dict.value'
          default : return prop
        }
      case 'promServer':
        switch (prop) {
          case 'id': return 'id'
          case 'idc': return 'idc_id'
          case 'host': return 'host'
          case 'port': return 'port'
          case 'type': return 'type'
          default : return prop
        }
      case 'mib':
        switch (prop) {
          case 'id': return 'sm.id'
          case 'name': return 'sm.name'
          case 'filename': return 'sm.file_name'
          case 'updateAt': return 'sm.update_at'
          default : return prop
        }
      case 'operationlog':
        switch (prop) {
          case 'id': return 'sl.id'
          case 'username': return 'su.username'
          case 'ip': return 'sl.ip'
          case 'operation': return 'sl.operation'
          case 'type': return 'sl.type'
          case 'createDate': return 'sl.create_date'
          case 'time': return 'sl.time'
          default : return prop
        }
      case 'temrminallog':
        switch (prop) {
          case 'protocol': return 'protocol'
          case 'startTime': return 'startTime'
          default : return prop
        }
      case 'alertRules':
        switch (prop) {
          case 'id': return 'ar.id'
          case 'alertName': return 'ar.alert_name'
          case 'threshold': return 'ar.threshold'
          case 'severity': return 'ar.severity'
          default : return prop
        }
      case 'exprTemp':
        switch (prop) {
          case 'id': return 'id'
          case 'name': return 'name'
          case 'gname': return 'gname'
          default : return prop
        }
      default: return prop
    }
  },
  // 本地正序
  asce (prop) {
    return function (obj1, obj2) {
      const { val1, val2 } = this.format(prop, obj1, obj2)
      if (val1 < val2) {
        return -1
      } else if (val1 > val2) {
        return 1
      } else {
        return 0
      }
    }
  },
  // 本地倒序
  desc (prop) {
    return function (obj1, obj2) {
      const { val1, val2 } = this.format(prop, obj1, obj2)
      if (val1 < val2) {
        return 1
      } else if (val1 > val2) {
        return -1
      } else {
        return 0
      }
    }
  },
  format (prop, obj1, obj2) {
    let val1 = obj1[prop]
    let val2 = obj2[prop]
    if (!isNaN(Number(val1)) && !isNaN(Number(val2)) && prop !== 'time') {
      val1 = Number(val1)
      val2 = Number(val2)
    }
    if (prop === 'time') {
      val1 = tableSort.strTodate(val1)
      val2 = tableSort.strTodate(val2)
    }
    if (prop === 'element') {
      if (val1.alias) {
        val1 = JSON.stringify(obj1[prop].alias).replace(/\s*/g, '')
      } else {
        val1 = JSON.stringify(obj1[prop].element).replace(/\s*/g, '')
      }
      if (val2.alias) {
        val2 = JSON.stringify(obj2[prop].alias).replace(/\s*/g, '')
      } else {
        val2 = JSON.stringify(obj2[prop].element).replace(/\s*/g, '')
      }
    }
    return { val1, val2 }
  },
  // 转化时间字符串为时间戳
  strToDate (str) {
    let date = str.trim()
    date = date.substring(0, 19)
    date = date.replace(/-/g, '/') // 必须把日期'-'转为'/'
    return new Date(date).getTime()
  }
}
/* cancel提醒保存指令 */
export const cancelWithChange = {
  mounted (el, binding) {
    if (!binding.value || !binding.value.object) return
    const oldValue = JSON.parse(JSON.stringify(binding.value.object))
    function domClick (e) {
      const newValue = JSON.parse(JSON.stringify(binding.value.object))
      if (!isEqual(oldValue, newValue)) {
        ElMessageBox.confirm(i18n.global.t('tip.confirmCancel'), {
          confirmButtonText: i18n.global.t('tip.yes'),
          cancelButtonText: i18n.global.t('tip.no'),
          type: 'warning'
        }).then(() => {
          if (binding.value.func) {
            binding.value.func()
          }
        })
      } else {
        binding.value.func()
      }
    }
    el.__vueDomClick__ = domClick
    el.addEventListener('click', domClick)
  },
  unmounted (el, binding) {
    // 解除事件监听
    document.removeEventListener('click', el.__vueDomClick__)
    delete el.__vueDomClick__
  }
}

function noDataDomFactory () {
  const noDataDom = document.createElement('div')
  noDataDom.setAttribute('class', 'no-data')
  noDataDom.innerText = 'No data'
  return noDataDom
}

export const noData = {
  updated (el, binding) {
    if (el) {
      if (binding.value) {
        setTimeout(() => {
          // 是否已有no data
          let alreadyHasNoData = false
          el.childNodes.forEach(node => {
            if (node.classList && node.classList.value.indexOf('no-data') > -1) {
              alreadyHasNoData = true
            } else {
              node.style && (node.style.display = 'none')
            }
          })
          if (!alreadyHasNoData) {
            el.insertBefore(noDataDomFactory(), el.childNodes[0])
          }
        })
      } else {
        setTimeout(() => {
          for (let i = 0; i < el.childNodes.length; i++) {
            const node = el.childNodes[i]
            if (node.classList && node.classList.value.indexOf('no-data') > -1) {
              el.removeChild(node)
              break
            }
          }
          el.childNodes.forEach(node => {
            node.style && (node.style.display = '')
          })
        })
      }
    }
  }
}
export function isEqual (o1, o2) {
  const isEqualForInner = function (obj1, obj2) {
    const o1 = obj1 instanceof Object
    const o2 = obj2 instanceof Object
    if (!o1 || !o2) {
      return obj1 === obj2
    }
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false
    }

    for (const attr of Object.keys(obj1)) {
      const t1 = obj1[attr] instanceof Object
      const t2 = obj2[attr] instanceof Object
      if (t1 && t2) {
        if (!isEqualForInner(obj1[attr], obj2[attr])) {
          return false
        }
      } else if (obj1[attr] !== obj2[attr]) {
        return false
      }
    }
    return true
  }
  return isEqualForInner(o1, o2)
}

/* 计算文本的实际width，而不是length */
export function getTextRect (text, fontSize = 14) {
  return format.getTextRect(text, `${fontSize}`)
}

/* url占位符处理 */
export function replaceUrlPlaceholder (url, params) {
  _.forIn(params, (value, key) => {
    url = url.replace('{{' + key + '}}', value)
  })
  url = url.replace(/{{(.*?)}}/g, '')
  return url
}
// 双引号替换为单引号
export function doubleQuotationToSingle (content) {
  return content.replace(/\"/g, "'")
}
// 双引号加斜杠转义
export function doubleQuotationEscape (content) {
  return content.replace(/\"/g, '\\\"')
}
// 下划线转换驼峰
export function lineToHump (name) {
  return name.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase()
  })
}
// 驼峰转空格，首字母小写
export function humpToSpace (name) {
  const str = name.replace(/([A-Z])/g, ' $1')
  return str.split(' ').map(s => _.lowerFirst(s)).join(' ')
}
// 下划线转换空格
export function lineToSpace (name) {
  if (_.isEmpty(name)) {
    return ''
  }
  return name.replace(/\_(\w)/g, ' ')
}
// 驼峰转换下划线
export function humpToLine (name) {
  if (_.isEmpty(name)) {
    return ''
  }
  return name.replace(/([A-Z])/g, '_$1').toLowerCase()
}
// 排序功能:从大到小，降序排列
export function reverseSortBy (i) {
  return function (a, b) {
    return b[i] - a[i]
  }
}

// 排序功能:从小到大，升序排列
export function sortBy (i) {
  return function (a, b) {
    return a[i] - b[i]
  }
}

// echart图标，y轴鼠标悬浮时，显示标签所有内容
export function extensionEchartY (chart) {
  // 判断是否创建过div框,如果创建过就不再创建了
  // 该div用来盛放文本显示内容的，方便对其悬浮位置进行处理
  const id = document.getElementById('extension')
  if (!id) {
    const div = "<div id = 'extension' style=\"display:block\"></div>"
    const contentDiv = document.createElement('div')
    contentDiv.setAttribute('id', 'extension')
    contentDiv.setAttribute('style', 'display:block')
    document.documentElement.append(contentDiv)
  }
  chart.on('mouseover', function (params) {
    // 注意这里，我是以Y轴显示内容过长为例，如果是x轴的话，需要改为xAxis
    if (params.componentType === 'yAxis') {
      // 设置悬浮文本的位置以及样式
      const extEle = document.getElementById('extension')
      extEle.style.cssText = 'display:inline;position:absolute;' +
          '    padding: 12px;' +
          '    max-width: 400px !important;' +
          '    color: #666;' +
          '    background-color: rgb(255, 255, 255);' +
          '    font-size: 14px;' +
          '    line-height: 20px;' +
          '    font-weight:400; ' +
          '    font-family: "Microsoft YaHei"' +
          '    border-style: solid;' +
          '    border-width: 1px;' +
          '    border-radius: 4px;' +
          '    border-color: transparent !important;' +
          '    box-shadow: rgb(0 0 0 / 30%) 0px 0px 3px;' +
          '    white-space: nowrap;' +
          '    z-index: 99999999;'

      extEle.innerHTML = params.value
      document.documentElement.onmousemove = function (event) {
        const extEle = document.getElementById('extension')
        const xx = event.pageX - extEle.offsetWidth - 20
        const yy = event.pageY + 20
        extEle.style.cssText = extEle.style.cssText + 'top:' + yy + 'px;left:' + xx + 'px;'
      }
    }
  })
  chart.on('mouseout', function (params) {
    // 注意这里，我是以Y轴显示内容过长为例，如果是x轴的话，需要改为xAxis
    if (params.componentType == 'yAxis') {
      const extEle = document.getElementById('extension')
      extEle.style.cssText = 'display:none;'
    }
  })
}
// 搜索功能：对象转字符串
export function objToStr (obj) {
  return Object.keys(obj).map(k => {
    return `${k}='${obj[k]}'`
  }).join(' AND ')
}
// 搜索功能：字符串转对象
export function strToObj (n) {
  const paramsArr = n.split(/\sAND\s/)
  const paramsObj = {}
  paramsArr.forEach(string => {
    const param = string.split('=')
    if (param.length > 1) {
      let value = param[1].trim()
      const valueArr = value.split(/[\"\']/g)
      if (valueArr.length > 2) {
        value = valueArr[1].trim()
      }
      paramsObj[param[0].trim()] = value
    }
  })
  return paramsObj
}
// 加载geo数据
export function loadGeoData () {
  const keys = []
  keys.push(storageKey.iso36112Capital)
  keys.push(storageKey.iso36112WorldLow)
  keys.forEach(async k => {
    const queryData = await db[dbGeoDataTableName].get({ name: k })
    if (!queryData) {
      const data = await getIso36112JsonData(iso36112[k])
      if (data) {
        db[dbGeoDataTableName].add({
          name: k,
          geo: data
        })
      }
    }
  })
}

/* 返回geodata对象
*  使用indexedDB缓存地图数据
*  */
export async function getGeoData (key) {
  const data = await db[dbGeoDataTableName].get({ name: key })
  if (data) {
    return data.geo
  } else {
    if (iso36112[key]) {
      const d = await getIso36112JsonData(iso36112[key])
      if (d) {
        db[dbGeoDataTableName].add({
          name: key,
          geo: d
        })
        return d[key]
      }
    }
    return null
  }
}

export function getCapitalGeo (countryId) {
  const data = getGeoData(storageKey.iso36112Capital)
  return data[countryId]
}

export function getUserDrilldownTableGeo (userId) {
  const data = getGeoData(storageKey.userCustomizationConfig)
  return data[userId]
}

function JSONParse (data) {
  const firstParse = JSON.parse(data)
  if (typeof firstParse === 'string') {
    return JSON.parse(firstParse)
  } else {
    return firstParse
  }
}

export function copyValue (item) {
  const str = item
  const domUrl = document.createElement('input')
  domUrl.value = JSON.stringify(str)
  domUrl.id = 'creatDom'
  document.body.appendChild(domUrl)
  domUrl.select() // 选择对象
  document.execCommand('Copy') // 执行浏览器复制命令
  const creatDom = document.getElementById('creatDom')
  creatDom.parentNode.removeChild(creatDom)
  ElMessage.success(i18n.global.t('tip.copySuccess'))
}

export function computeSecondaryDomain (name) {
  // 命中的顶级域名
  let hitTopDomain = ''
  // 同顶级域名比对
  const hits = []
  topDomain.forEach(td => {
    const hitIndex = name.lastIndexOf(td)
    if (hitIndex > -1 && hitIndex + td.length === name.length) {
      hits.push(td)
    }
  })
  if (hits.length > 0) {
    hits.sort((a, b) => {
      return b.split('.').length - a.split('.').length
    })
    hitTopDomain = hits[0]
  } else {
    const arr = name.split('.')
    hitTopDomain = arr[arr.length - 1]
  }
  const index = name.lastIndexOf(hitTopDomain)
  const preArr = name.substring(0, index).split('.')
  return [preArr[preArr.length - 2], hitTopDomain].join('.')
}

export function getCurrentRoute () {
  return router.currentRoute && router.currentRoute.path
}

export function getEchartsFontSize (e) {
  let clientWidth
  if (e) {
    clientWidth = e.currentTarget.innerWidth
  } else {
    clientWidth = document.getElementsByTagName('html')[0].clientWidth
  }

  let echartLegendFontSize = echartsFontSize.legendFirstFontSize
  let echartLabelFontSize = echartsFontSize.labelFirstFontSize
  if (clientWidth < 1920) {
    echartLegendFontSize = echartsFontSize.legendFirstFontSize
    echartLabelFontSize = echartsFontSize.labelFirstFontSize
  } else if (clientWidth >= 1920 && clientWidth < 2560) {
    echartLegendFontSize = echartsFontSize.legendSecondFontSize
    echartLabelFontSize = echartsFontSize.labelSecondFontSize
  } else if (clientWidth >= 2560) {
    echartLegendFontSize = echartsFontSize.legendThirdFontSize
    echartLabelFontSize = echartsFontSize.labelThirdFontSize
  }
  localStorage.setItem(storageKey.echartLegendFontSize, echartLegendFontSize)
  localStorage.setItem(storageKey.echartLabelFontSize, echartLabelFontSize)
}

export function handleEchartFontSize (option) {
  // echarts相关图表文字动态调整大小
  getEchartsFontSize()
  const echartLegendFontSize = localStorage.getItem(storageKey.echartLegendFontSize)
  const echartLabelFontSize = localStorage.getItem(storageKey.echartLabelFontSize)
  let chartOption = option
  const newSeries = []
  const chartType = chartOption.series[0].type
  chartOption.series.forEach((series) => {
    if (series.markLine) {
      const seriesNew = {
        ...series,
        label: {
          ...series.label,
          fontSize: echartLabelFontSize
        },
        markLine: {
          ...series.markLine,
          label: {
            ...series.markLine.label,
            fontSize: echartLabelFontSize
          }
        }
      }
      newSeries.push(seriesNew)
    } else {
      const seriesNew = {
        ...series,
        label: {
          ...series.label,
          fontSize: echartLabelFontSize
        },
        markLine: {
          label: {
            fontSize: echartLabelFontSize
          }
        }
      }
      newSeries.push(seriesNew)
    }
  })

  if (chartType === 'pie') {
    chartOption = {
      ...chartOption,
      legend: {
        ...chartOption.legend,
        textStyle: {
          ...chartOption.legend.textStyle,
          fontSize: echartLegendFontSize
        }
      },
      axisLabel: {
        ...chartOption.axisLabel,
        fontSize: echartLabelFontSize
      },
      series: newSeries
    }
  } else {
    chartOption = {
      ...chartOption,
      legend: {
        ...chartOption.legend,
        textStyle: {
          ...chartOption.legend.textStyle,
          fontSize: echartLegendFontSize
        }
      },
      xAxis: {
        ...chartOption.xAxis,
        axisLabel: {
          ...chartOption.xAxis.axisLabel,
          fontSize: echartLabelFontSize
        }
      },
      yAxis: {
        ...chartOption.yAxis,
        axisLabel: {
          ...chartOption.yAxis.axisLabel,
          fontSize: echartLabelFontSize
        }
      },
      axisLabel: {
        ...chartOption.axisLabel,
        fontSize: echartLabelFontSize
      },
      series: newSeries
    }
  }
  return chartOption
}

// 判断数据相等
export function arrayIsEqual (arr1, arr2) {
  if (arr1 === arr2) { // 如果2个数组对应的指针相同，那么肯定相等，同时也对比一下类型
    return true
  } else {
    if (arr1.length !== arr2.length) {
      return false
    } else {
      for (const i in arr1) { // 循环遍历对比每个位置的元素
        if (arr1[i] !== arr2[i]) { // 只要出现一次不相等，那么2个数组就不相等
          return false
        }
      } // for循环完成，没有出现不相等的情况，那么2个数组相等
      return true
    }
  }
}

// 字体长度缓存记录，{ 'fontSize': { 'limitWidth': { 'text': xxx } } }
const fontCache = {}
// 处理文本超长
export function truncateText (text, limitWidth, fontSize = 12, ellipsis = '...') {
  if (!text || !limitWidth) {
    return null
  }
  // hit cache
  const cache = fontCache[`${fontSize}`] && fontCache[`${fontSize}`][`${limitWidth}`]
  if (cache) {
    const hit = Object.keys(cache).find(k => k === text)
    if (hit) {
      return cache[hit]
    }
  }
  // 计算
  const dom = document.createElement('span')
  dom.classList.add('temp-dom')
  dom.style.fontSize = `${fontSize}px`
  dom.innerText = text
  return dom.offsetWidth
}

export function scrollToTop (dom, toTop, duration, direction) {
  const clientHeight = dom.clientHeight
  const currentTop = dom.scrollTop
  const totalScrollDistance = Math.abs(currentTop - toTop)
  let scrollY = currentTop
  let oldTimestamp = null

  function step (newTimestamp) {
    if (oldTimestamp !== null) {
      if (direction === 'up') {
        scrollY -= totalScrollDistance * (newTimestamp - oldTimestamp) / duration
        if (scrollY < 0) {
          dom.scrollTop = 0
          return
        }
        dom.scrollTop = scrollY
      } else if (direction === 'down') {
        scrollY += totalScrollDistance * (newTimestamp - oldTimestamp) / duration
        if (scrollY > clientHeight) {
          dom.scrollTop = clientHeight
          return
        }
        dom.scrollTop = scrollY
      }
    }
    oldTimestamp = newTimestamp
    window.requestAnimationFrame(step)
  }
  window.requestAnimationFrame(step)
}

export function getChainRatio (current, prev) {
  if (prev === 0) {
    return '-'
  } else {
    return (current - prev) / prev
  }
}

export function computeScore (data, index) {
  let score = 0
  let k = 0
  if (index === 0) {
    k = 0.3
    if (!data.establishLatencyMs && data.establishLatencyMs !== 0) {
      score = 0
    } else if (data.establishLatencyMs <= 50) {
      score = 1
    } else if (data.establishLatencyMs > 500) {
      score = 0
    } else {
      score = (data.establishLatencyMs - 500) / (50 - 500)
    }
  } else if (index === 1) {
    k = 0.05
    if (!data.httpResponseLatency && data.httpResponseLatency !== 0) {
      score = 1
    } else if (data.httpResponseLatency <= 50) {
      score = 1
    } else if (data.httpResponseLatency > 500) {
      score = 0
    } else {
      score = (data.httpResponseLatency - 500) / (50 - 500)
    }
  } else if (index === 2) {
    k = 0.05
    if (!data.sslConLatency && data.sslConLatency !== 0) {
      score = 1
    } else if (data.sslConLatency <= 50) {
      score = 1
    } else if (data.sslConLatency > 500) {
      score = 0
    } else {
      score = (data.sslConLatency - 500) / (50 - 500)
    }
  } else if (index === 3) {
    k = 0.3
    if (!data.tcpLostlenPercent && data.tcpLostlenPercent !== 0) {
      score = 0
    } else if (data.tcpLostlenPercent <= 0.01) {
      score = 1
    } else if (data.tcpLostlenPercent > 0.5) {
      score = 0
    } else {
      score = (data.tcpLostlenPercent - 0.5) / (0.01 - 0.5)
    }
  } else if (index === 4) {
    k = 0.3
    if (!data.pktRetransPercent && data.pktRetransPercent !== 0) {
      score = 0
    } else if (data.pktRetransPercent <= 0.01) {
      score = 1
    } else if (data.pktRetransPercent > 0.5) {
      score = 0
    } else {
      score = (data.pktRetransPercent - 0.5) / (0.01 - 0.5)
    }
  }
  return score * k
}

// 改变tab状态(url中)：当前tab，
export function changeTabState (param, value) {
  const query = router.query
  query[param] = JSON.stringify(value)
  router.push({
    query: query
  })
}
export function getTabList (curTable, curMetric) {
  console.log('getTabList--------------')
  let tabs = []
  if (curTable.hasMetricSearch) { // 有metric
    const metricsList = curTable ? curTable.metrics : []
    if (metricsList && metricsList.length > 0) {
      const metricTab = metricsList.find(metric => metric.name === curMetric)
      tabs = metricTab.tabs
    }
  } else { // 无metric
    if (curTable.tabs) {
      tabs = curTable.tabs
    }
  }
  return tabs
}
export function combineTabList (tableType, list, commonTabList) {
  const curTableInCode = networkTable[tableType] ? networkTable[tableType] : networkTable.networkOverview
  const listInCode = curTableInCode ? curTableInCode.tabList : []
  list.forEach(tab => {
    // 配置的内容
    if (!tab.hasOwnProperty('checked')) {
      const tabName = tab ? (tab.name ? tab.name : tab) : ''
      // 配置的内容
      tab = {}
      const commonTab = commonTabList.find(item => item.name === tabName)
      tab.label = commonTab ? commonTab.i18n : ''
      tab.prop = commonTab ? commonTab.prop : ''
      if (!tab.hasOwnProperty('checked')) {
        tab.checked = tab ? tab.show : true
      }
      if (!tab.hasOwnProperty('disabled')) {
        tab.disabled = tab ? !tab.enable : false
      }
      if (!tab.hasOwnProperty('panelId')) {
        tab.panelId = tab ? tab.panelIdOfFourthMenu : null
      }
      // 代码里写死的
      const tabInCode = listInCode ? listInCode.find(item => item.label === tab.label) : {}
      tab.queryCycleTotalProp = tabInCode ? tabInCode.queryCycleTotalProp : null
      tab.dillDownProp = tabInCode ? tabInCode.dillDownProp : []
    }
  })
}

export function setUserConfig () {
  const userTableConfig = this.getUserLocalConfig()
  if (userTableConfig) {
    const newTabConfigs = []
    userTableConfig.tabConfig.forEach(tab => {
      const tabConfig = this.list.find(item => item.name === tab.name)
      if (tabConfig) {
        tabConfig.checked = tab ? tab.checked : true
      } else {
        tabConfig.checked = true
      }
      newTabConfigs.push(tabConfig)
    })
    this.list = newTabConfigs
  }
}

export async function getDefaultCurTab (tableType, metric, columnName) {
  const tabList = await getUserDrilldownTableConfig(tableType, metric)
  const curTab = tabList.filter(item => item.label === columnName)[0]
  return curTab
}

export async function getUserDrilldownTableConfig (tableType, curMetric) {
  let list = []
  // 先从localStorage中获取用户定制的自定义配置，如果没有，则使用默认的自定义配置
  const userId = localStorage.getItem(storageKey.userId)
  const userLocalCongfig = await db[dbDrilldownTableConfig].get({ id: userId })
  let defaultDrillDownTableConfigs = []
  if (userLocalCongfig) {
    defaultDrillDownTableConfigs = userLocalCongfig.config
  }
  if (!defaultDrillDownTableConfigs || defaultDrillDownTableConfigs.length === 0) { // 未找到当前用户的配置，使用默认配置
    console.log('default..............')
    const defaultCongfig = await db[dbDrilldownTableConfig].get({ id: 'default' })
    if (defaultCongfig) {
      defaultDrillDownTableConfigs = defaultCongfig.config
    }
  }
  const currentTableConfig = defaultDrillDownTableConfigs.find(config => config.route === tableType)
  const commonTabList = currentTableConfig ? currentTableConfig.tabs : []
  const tables = currentTableConfig ? currentTableConfig.tables : []
  if (tables && tables.length > 0) {
    const curTableOldConfig = tables.find(table => table.id === tableType)
    const curTable = curTableOldConfig || null
    if (curTable) {
      if (curTable.hasMetricSearch) { // 有metric
        const metricsList = curTable ? curTable.metrics : []
        if (metricsList && metricsList.length > 0) {
          const metricTab = metricsList.find(metric => metric.name === curMetric)
          list = metricTab ? metricTab.tabs : []
        }
      } else { // 无metric
        list = curTable ? curTable.tabs : []
      }
      combineTabList(tableType, list, commonTabList)
    }
  }
  return list
}

// cleanOldParams: true|false，是否清除oldParams
export function urlParamsHandler (url, oldParams, newParams, cleanOldParams) {
  let newUrl = url.split('?')[0]
  let params
  if (cleanOldParams) {
    params = newParams
  } else {
    params = Object.assign(oldParams, newParams)
  }
  if (Object.keys(params).length > 0) {
    newUrl += '?'
    Object.keys(params).forEach(key => {
      newUrl += `${key}=${params[key]}&`
    })
    newUrl = newUrl.substring(0, newUrl.length - 1)
  }
  return newUrl
}

export function overwriteUrl (url) {
  window.history.replaceState('', '', url)
}

/*
startColor: 渐变起始颜色，对应最大值
endColor: 渐变结束颜色，对应最小值
values: 从大到小排好序的数值
 */
export function colorGradientCalculation (startColor, endColor, values) {
  const colors = []
  const startRgbArr = colorHexToRgbArr(startColor)
  const endRgbArr = colorHexToRgbArr(endColor)
  const rDiff = endRgbArr[0] - startRgbArr[0]
  const gDiff = endRgbArr[1] - startRgbArr[1]
  const bDiff = endRgbArr[2] - startRgbArr[2]
  const valueDiff = values[0] - values[values.length - 1]
  values.forEach((v, i) => {
    colors.push(`rgb(${startRgbArr[0] + Math.floor(rDiff * (valueDiff - diff(v)) / valueDiff)},${startRgbArr[1] + Math.floor(gDiff * (valueDiff - diff(v)) / valueDiff)},${startRgbArr[2] + Math.floor(bDiff * (valueDiff - diff(v)) / valueDiff)})`)
  })
  function diff (v) {
    return v - values[values.length - 1]
  }
  return colors
}

// returns an array like [11,22,33]
export function colorHexToRgbArr (hex) {
  return [1, 3, 5].map((h) => parseInt(hex.substring(h, h + 2), 16))
}
export const ingress = {
  data: {
    result: [
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '5604323120',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '4895392761',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '4814817940',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '4090070063',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '4049453979',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '3784403480',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '3710664123',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '3653407030',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '3371993955',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '3352297278',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '2634690236',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '2030067839',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '1937216782',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '1755711057',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '1657787141',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '1254821363',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '1246001598',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '2049',
        ingressBytes: '1221072621',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '1181549901',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '1161689269',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '1059917055',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '1052285463',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '769',
        ingressBytes: '1017069335',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '997474163',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '969823257',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '966304726',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '962623571',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '959195720',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '948900101',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '2817',
        ingressBytes: '920720265',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '917674691',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '888578323',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '852554980',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '850380806',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '829559925',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '809552700',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '804704301',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '781436925',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '761982895',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '760081501',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '742496479',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '719223843',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '1025',
        ingressBytes: '714911627',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '712848454',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '697683613',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '664163245',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '649768711',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '637538588',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '621699041',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '614610310',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '2305',
        ingressBytes: '612712311',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '608605887',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '606609681',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '579871891',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '563244876',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '545891764',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1793',
        ingressBytes: '539800397',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '1793',
        ingressBytes: '524913397',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '520046288',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '511899844',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '488789796',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '487756088',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '483164068',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '480436083',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '480205415',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '476826618',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '473016628',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '472617430',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '468520809',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '467966390',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '467114073',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '2305',
        ingressBytes: '465814161',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '2817',
        ingressBytes: '456113269',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '449372255',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '2305',
        ingressBytes: '441956776',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '438304071',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '435171140',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '414875616',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '414570978',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '411153294',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '401981144',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '397567721',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '1537',
        ingressBytes: '395561375',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '394231723',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '392255758',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '390985756',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '389957465',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '389662360',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '1537',
        ingressBytes: '389160519',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hebei',
        commonIngressLinkId: '1281',
        ingressBytes: '385352295',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '384494096',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '374984189',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '372216099',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '364508246',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '362768823',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '360296241',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '360262254',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '355733923',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '2049',
        ingressBytes: '344652638',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '344135294',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '343110470',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Gansu',
        commonIngressLinkId: '257',
        ingressBytes: '340471786',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '1281',
        ingressBytes: '335534018',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '1537',
        ingressBytes: '333528793',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '333209548',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '333043196',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '769',
        ingressBytes: '332199739',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '331243505',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '2817',
        ingressBytes: '328705261',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '327225423',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '1281',
        ingressBytes: '326841971',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1537',
        ingressBytes: '326768639',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '513',
        ingressBytes: '324625756',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '319941672',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '318686877',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '2049',
        ingressBytes: '318444356',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '315231568',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '312577605',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '2817',
        ingressBytes: '312029300',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '308882437',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '298350344',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shandong',
        commonIngressLinkId: '2817',
        ingressBytes: '290111455',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '769',
        ingressBytes: '290017314',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '289879746',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '287715643',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '286510770',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '513',
        ingressBytes: '284553267',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '2305',
        ingressBytes: '283311145',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '281270311',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '279000915',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '278405212',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '272842506',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '272613649',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '270887893',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '2817',
        ingressBytes: '270860511',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '267979575',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '267485792',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '267376598',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hebei',
        commonIngressLinkId: '1025',
        ingressBytes: '267219087',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '257',
        ingressBytes: '266961943',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '2049',
        ingressBytes: '265172583',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '262339238',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '261772331',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '2305',
        ingressBytes: '261750220',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '2817',
        ingressBytes: '261423093',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '260782109',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '1793',
        ingressBytes: '260514984',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '259951646',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '259033600',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '258041252',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '1793',
        ingressBytes: '257978825',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '255980420',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '252566718',
        serverProvince: 'Udmurtskaya Respublika'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '248514511',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '247554639',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Henan',
        commonIngressLinkId: '1025',
        ingressBytes: '245328917',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '257',
        ingressBytes: '244528540',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '242850372',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hubei',
        commonIngressLinkId: '1025',
        ingressBytes: '242769513',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '241059422',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '1793',
        ingressBytes: '239908490',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '239696863',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '238756802',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '238618793',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '237900867',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '235846410',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '233290052',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '769',
        ingressBytes: '230547003',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '227315224',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '225252499',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '225168058',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '225133906',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '221028852',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '220107120',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '218969935',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '217742704',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '217091517',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '216578712',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '215854423',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '214549138',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '213319071',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '2817',
        ingressBytes: '213063507',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '769',
        ingressBytes: '212809830',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '210847103',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '208926102',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '207895511',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '2305',
        ingressBytes: '203110418',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '257',
        ingressBytes: '201511565',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '769',
        ingressBytes: '201010773',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '1281',
        ingressBytes: '199850015',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '198451189',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '196314643',
        serverProvince: 'Ha Noi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '195457389',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '769',
        ingressBytes: '194079213',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '191262200',
        serverProvince: 'Vlaams-Brabant'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '189987609',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '769',
        ingressBytes: '189615279',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '189568160',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '2049',
        ingressBytes: '188416745',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '188019618',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '187326786',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1025',
        ingressBytes: '186596033',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '185935945',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'California',
        commonIngressLinkId: '513',
        ingressBytes: '185247278',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '2049',
        ingressBytes: '180941198',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Anhui',
        commonIngressLinkId: '1025',
        ingressBytes: '179578868',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '177793450',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '513',
        ingressBytes: '177458766',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '257',
        ingressBytes: '176777534',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '175677589',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '174784552',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '174748846',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '173718654',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '172615152',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Henan',
        commonIngressLinkId: '2817',
        ingressBytes: '170417629',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '169905564',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '1537',
        ingressBytes: '169314930',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '169110710',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '1793',
        ingressBytes: '167916507',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '167432752',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '1025',
        ingressBytes: '166857612',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '2049',
        ingressBytes: '165960150',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '165705067',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '165077379',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '513',
        ingressBytes: '163432621',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '1537',
        ingressBytes: '162449499',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '162257529',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '161120458',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '160403805',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '160157006',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '158288176',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '156064889',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '155657594',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Anhui',
        commonIngressLinkId: '513',
        ingressBytes: '155119590',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '513',
        ingressBytes: '155027009',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '2305',
        ingressBytes: '155008328',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '154571357',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '154447984',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Gansu',
        commonIngressLinkId: '2817',
        ingressBytes: '154209971',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '152617553',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '152592730',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '152443701',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '151886088',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '257',
        ingressBytes: '151068684',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '2305',
        ingressBytes: '150646267',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '150357742',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '148137028',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '1537',
        ingressBytes: '147979347',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hubei',
        commonIngressLinkId: '257',
        ingressBytes: '147480447',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '147079506',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '143937242',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '142298819',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '2049',
        ingressBytes: '141936104',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '141298309',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '2305',
        ingressBytes: '140868630',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '140764401',
        serverProvince: 'Karnataka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Gansu',
        commonIngressLinkId: '2049',
        ingressBytes: '140634874',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '513',
        ingressBytes: '140567522',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '140054538',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '139546075',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '138829897',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '137103009',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '1793',
        ingressBytes: '136227509',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '2049',
        ingressBytes: '135349524',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '1793',
        ingressBytes: '135249676',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '513',
        ingressBytes: '134139808',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '257',
        ingressBytes: '133538698',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '130496391',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hunan',
        commonIngressLinkId: '1025',
        ingressBytes: '129257678',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '2305',
        ingressBytes: '128899684',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '128075927',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1025',
        ingressBytes: '127557246',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '2817',
        ingressBytes: '127084820',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '126371315',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '1793',
        ingressBytes: '125189365',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '124971450',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '124851041',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1537',
        ingressBytes: '124200163',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Ho Chi Minh',
        commonIngressLinkId: '257',
        ingressBytes: '123204675',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Henan',
        commonIngressLinkId: '257',
        ingressBytes: '123112372',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '1281',
        ingressBytes: '122304979',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '1025',
        ingressBytes: '122142097',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '121088656',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Shandong',
        commonIngressLinkId: '1025',
        ingressBytes: '120838702',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '120097340',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '2817',
        ingressBytes: '119284148',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '119050866',
        serverProvince: 'Ha Noi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '118975273',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '257',
        ingressBytes: '118794072',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '1793',
        ingressBytes: '118737151',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Anhui',
        commonIngressLinkId: '2817',
        ingressBytes: '118697185',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '513',
        ingressBytes: '118400473',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '118145879',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '1537',
        ingressBytes: '117681686',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '111017521',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '110436944',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '1281',
        ingressBytes: '109370149',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '108692682',
        serverProvince: 'Maharashtra'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '108684927',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '108681031',
        serverProvince: 'Rizal'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hunan',
        commonIngressLinkId: '2817',
        ingressBytes: '108252873',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '108194600',
        serverProvince: 'Washington'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '107899812',
        serverProvince: "Zabaykal'skiy kray"
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '1025',
        ingressBytes: '107266715',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '257',
        ingressBytes: '107209808',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '2305',
        ingressBytes: '107192539',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '107091002',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '106256991',
        serverProvince: 'Quebec'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '105916525',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '105681666',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '105603212',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '104517050',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '103146138',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '1281',
        ingressBytes: '102869100',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '1537',
        ingressBytes: '102701654',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '1537',
        ingressBytes: '102536864',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Noord-Holland',
        commonIngressLinkId: '2305',
        ingressBytes: '102238139',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '769',
        ingressBytes: '102127537',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '101191986',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '100771900',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '1537',
        ingressBytes: '100412883',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '769',
        ingressBytes: '98435371',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '96707463',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '96429011',
        serverProvince: 'National Capital Region'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '96095542',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '96080063',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '96062467',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '96062000',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '93629590',
        serverProvince: 'Primorskiy kray'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '513',
        ingressBytes: '93536457',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '1281',
        ingressBytes: '92577018',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Rio Grande do Sul',
        commonIngressLinkId: '1537',
        ingressBytes: '92109454',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '91739894',
        serverProvince: 'Bayern'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '513',
        ingressBytes: '91555498',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '1793',
        ingressBytes: '91054997',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '2049',
        ingressBytes: '89790955',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '89622448',
        serverProvince: 'Massachusetts'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '88578236',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '88491847',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '88211331',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '769',
        ingressBytes: '88208687',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '87963365',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '86024448',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '85914301',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '2049',
        ingressBytes: '84822349',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Kuala Lumpur',
        commonIngressLinkId: '257',
        ingressBytes: '84766458',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '84670691',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '84205432',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '83976804',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hebei',
        commonIngressLinkId: '2817',
        ingressBytes: '83791957',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '83473929',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hubei',
        commonIngressLinkId: '2817',
        ingressBytes: '83189515',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '257',
        ingressBytes: '82465476',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '81280771',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '81114674',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '80456635',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '79644866',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '78732563',
        serverProvince: 'Iowa'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '78335322',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '78204972',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '257',
        ingressBytes: '77885122',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Gansu',
        commonIngressLinkId: '1793',
        ingressBytes: '77777758',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Zug',
        commonIngressLinkId: '1281',
        ingressBytes: '77315285',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '77197494',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '76054652',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Singapore',
        commonIngressLinkId: '1025',
        ingressBytes: '75083472',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '74506579',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '74472031',
        serverProvince: 'Washington'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '72219724',
        serverProvince: 'Maharashtra'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '71828965',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Ciudad Autonoma de Buenos Aires',
        commonIngressLinkId: '257',
        ingressBytes: '71170874',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1281',
        ingressBytes: '71138505',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '70658386',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '70523568',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '70395248',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '70239762',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '2817',
        ingressBytes: '69426463',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '69398959',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '69341613',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '2049',
        ingressBytes: '69056141',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Anhui',
        commonIngressLinkId: '2049',
        ingressBytes: '68523286',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '2305',
        ingressBytes: '68196514',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '2049',
        ingressBytes: '68129312',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '1281',
        ingressBytes: '67768047',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '67697735',
        serverProvince: 'Agusan del Norte'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '66700379',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ohio',
        commonIngressLinkId: '2305',
        ingressBytes: '66412037',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1281',
        ingressBytes: '66220688',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '65767367',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '65400961',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '513',
        ingressBytes: '65289765',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '257',
        ingressBytes: '64812401',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '64090619',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '1793',
        ingressBytes: '63957889',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '63934789',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '63926703',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '2817',
        ingressBytes: '63695411',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '1025',
        ingressBytes: '62921875',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '62880820',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '62773733',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Henan',
        commonIngressLinkId: '1281',
        ingressBytes: '62727725',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '2305',
        ingressBytes: '62619407',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '62542998',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '2049',
        ingressBytes: '62407460',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '2305',
        ingressBytes: '62133708',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '62063111',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '61232971',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hebei',
        commonIngressLinkId: '257',
        ingressBytes: '60799860',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '60732330',
        serverProvince: 'Zuid-Holland'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hubei',
        commonIngressLinkId: '1281',
        ingressBytes: '60568178',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '60393532',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '2305',
        ingressBytes: '60270024',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Gansu',
        commonIngressLinkId: '1025',
        ingressBytes: '59795347',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Gansu',
        commonIngressLinkId: '1537',
        ingressBytes: '58190897',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sao Paulo',
        commonIngressLinkId: '2049',
        ingressBytes: '57820353',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '1025',
        ingressBytes: '57641605',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '56922651',
        serverProvince: 'Istanbul'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '2049',
        ingressBytes: '56730732',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '54408660',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '2049',
        ingressBytes: '54391731',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '53252539',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '53050301',
        serverProvince: 'Ha Noi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Fujian',
        commonIngressLinkId: '257',
        ingressBytes: '52684834',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '52658795',
        serverProvince: 'Region Metropolitana de Santiago'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '769',
        ingressBytes: '52427289',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Beijing',
        commonIngressLinkId: '2817',
        ingressBytes: '50675567',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '50663211',
        serverProvince: 'Xizang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '50476661',
        serverProvince: 'Dublin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '50464578',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '50155003',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '49828754',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '49254383',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '49019176',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '48949685',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '48920540',
        serverProvince: 'Ontario'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '48848999',
        serverProvince: 'Dimashq'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '48837399',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '2305',
        ingressBytes: '48546356',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '2817',
        ingressBytes: '48032676',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '47817127',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '47685624',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '1793',
        ingressBytes: '47618719',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '47618027',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '46863621',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '46408617',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Fujian',
        commonIngressLinkId: '1793',
        ingressBytes: '46235403',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '1537',
        ingressBytes: '46158052',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '1025',
        ingressBytes: '46012150',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '45652773',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '2049',
        ingressBytes: '45626863',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '769',
        ingressBytes: '45275622',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '45001469',
        serverProvince: 'New South Wales'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '1281',
        ingressBytes: '44835716',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '769',
        ingressBytes: '44007026',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '43943315',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '43916191',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '43788945',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '43625170',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '2049',
        ingressBytes: '43373723',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shandong',
        commonIngressLinkId: '1281',
        ingressBytes: '42787100',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '42745453',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '42611425',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '42580319',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '1281',
        ingressBytes: '42408817',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jilin',
        commonIngressLinkId: '2817',
        ingressBytes: '42374544',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '769',
        ingressBytes: '42188475',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '42049919',
        serverProvince: 'Mazowieckie'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '41972026',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '41645869',
        serverProvince: 'Geneve'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '41621243',
        serverProvince: 'Pennsylvania'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '513',
        ingressBytes: '41500099',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '1793',
        ingressBytes: '41060051',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '769',
        ingressBytes: '41007475',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '1793',
        ingressBytes: '40989520',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '40806459',
        serverProvince: 'Jakarta Raya'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shandong',
        commonIngressLinkId: '257',
        ingressBytes: '40793814',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '40394879',
        serverProvince: 'Sao Paulo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hainan',
        commonIngressLinkId: '2305',
        ingressBytes: '40394749',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '40350138',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '40082124',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '40065591',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '39756646',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Beijing',
        commonIngressLinkId: '257',
        ingressBytes: '39253365',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '39066104',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Abu Zaby',
        commonIngressLinkId: '2305',
        ingressBytes: '38866633',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1793',
        ingressBytes: '38824465',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '38728763',
        serverProvince: 'Arizona'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '38655011',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '257',
        ingressBytes: '38563970',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '38558648',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '38445211',
        serverProvince: 'Papua'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '38441155',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '1793',
        ingressBytes: '38333446',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '38205882',
        serverProvince: 'Washington'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '2817',
        ingressBytes: '38022282',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Quebec',
        commonIngressLinkId: '1281',
        ingressBytes: '37956418',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '769',
        ingressBytes: '37818521',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '37789745',
        serverProvince: 'Sao Paulo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '37638486',
        serverProvince: 'Ceara'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '37521906',
        serverProvince: 'Delhi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '37465486',
        serverProvince: 'New Mexico'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '1537',
        ingressBytes: '37429352',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '769',
        ingressBytes: '37416787',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '36571545',
        serverProvince: 'Ho Chi Minh'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '513',
        ingressBytes: '35991542',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '2305',
        ingressBytes: '35547995',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '35141658',
        serverProvince: 'Lombardia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '34675123',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '1793',
        ingressBytes: '34363688',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '1793',
        ingressBytes: '34348169',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '34280561',
        serverProvince: 'Baden-Wurttemberg'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hainan',
        commonIngressLinkId: '1537',
        ingressBytes: '34158450',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '33900556',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '33723478',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '33468379',
        serverProvince: 'Quintana Roo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '1793',
        ingressBytes: '33379450',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '769',
        ingressBytes: '33371399',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '33031756',
        serverProvince: 'Beyrouth'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '2049',
        ingressBytes: '32871059',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '2817',
        ingressBytes: '32593562',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '32527122',
        serverProvince: 'Ontario'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '1537',
        ingressBytes: '32511721',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '32505189',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '769',
        ingressBytes: '32454313',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '32355460',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '31888659',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '31615270',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '31507932',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '31470288',
        serverProvince: 'Nordrhein-Westfalen'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '2305',
        ingressBytes: '31416195',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Islamabad',
        commonIngressLinkId: '513',
        ingressBytes: '31337035',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '31317528',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '31289869',
        serverProvince: 'Moscow'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '31123256',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '31064025',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '31045206',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '30476807',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '30333343',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '29351475',
        serverProvince: 'Bern'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '29151801',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '1793',
        ingressBytes: '29053301',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '28808019',
        serverProvince: 'San Luis Potosi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '2305',
        ingressBytes: '28583345',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '1025',
        ingressBytes: '28394029',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '257',
        ingressBytes: '28392039',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '28388355',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '28318651',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Anhui',
        commonIngressLinkId: '257',
        ingressBytes: '28308994',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '28288367',
        serverProvince: 'Goias'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '2305',
        ingressBytes: '28260159',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '1281',
        ingressBytes: '28114303',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Fujian',
        commonIngressLinkId: '2049',
        ingressBytes: '27856336',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Fujian',
        commonIngressLinkId: '2817',
        ingressBytes: '27778405',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '2817',
        ingressBytes: '27417139',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '1025',
        ingressBytes: '27267137',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '26879468',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '26608565',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '2305',
        ingressBytes: '26528654',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Madhya Pradesh',
        commonIngressLinkId: '769',
        ingressBytes: '26525387',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '1025',
        ingressBytes: '26426858',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '2049',
        ingressBytes: '26257206',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ankara',
        commonIngressLinkId: '513',
        ingressBytes: '26192289',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '26109011',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '26015954',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '25846999',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Moscow',
        commonIngressLinkId: '769',
        ingressBytes: '25792760',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '25713427',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '25625391',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '25421010',
        serverProvince: 'Phnom Penh'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '25382843',
        serverProvince: 'Hallands lan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '1537',
        ingressBytes: '25210615',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '24893265',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '24785588',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '769',
        ingressBytes: '24702293',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '24437330',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Fujian',
        commonIngressLinkId: '513',
        ingressBytes: '24417958',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Parana',
        commonIngressLinkId: '2817',
        ingressBytes: '24224529',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '24158863',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '24035017',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '24033873',
        serverProvince: 'Colorado'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '23940182',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '23767004',
        serverProvince: 'Xizang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '23673482',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '1025',
        ingressBytes: '23664804',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '23664533',
        serverProvince: 'Moscow'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '23522328',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '23515860',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Colorado',
        commonIngressLinkId: '769',
        ingressBytes: '23357936',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '2049',
        ingressBytes: '23327292',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '23293938',
        serverProvince: 'Puebla'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Kerala',
        commonIngressLinkId: '1281',
        ingressBytes: '23250940',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '23140094',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '513',
        ingressBytes: '23061417',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '22966453',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Washington',
        commonIngressLinkId: '257',
        ingressBytes: '22924878',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '22420990',
        serverProvince: 'Texas'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '22265594',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '2817',
        ingressBytes: '22204871',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '22189850',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '22087346',
        serverProvince: 'Nordrhein-Westfalen'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xizang',
        commonIngressLinkId: '257',
        ingressBytes: '21925195',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '21820781',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '1537',
        ingressBytes: '21727634',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '21551041',
        serverProvince: 'Istanbul'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '2817',
        ingressBytes: '21541800',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '769',
        ingressBytes: '21513316',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Washington',
        commonIngressLinkId: '769',
        ingressBytes: '21495282',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '21464335',
        serverProvince: 'Stockholms lan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '21377800',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '513',
        ingressBytes: '21314420',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '21149900',
        serverProvince: 'Vasterbottens lan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '21132442',
        serverProvince: "Chelyabinskaya oblast'"
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Anhui',
        commonIngressLinkId: '1537',
        ingressBytes: '21079022',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Istanbul',
        commonIngressLinkId: '2305',
        ingressBytes: '21032918',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Gansu',
        commonIngressLinkId: '1281',
        ingressBytes: '20985430',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '20928539',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '20849195',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '20791843',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '1537',
        ingressBytes: '20735625',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '2305',
        ingressBytes: '20689599',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '20684441',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '20629711',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '20523455',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Fujian',
        commonIngressLinkId: '1537',
        ingressBytes: '20368690',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '1281',
        ingressBytes: '20272515',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '20138062',
        serverProvince: 'Erevan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '20070522',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '20019049',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '19939621',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '19938244',
        serverProvince: 'Bac Kan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '19820721',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '19648965',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '769',
        ingressBytes: '19518519',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '19435075',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '19225419',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '19097102',
        serverProvince: 'Auvergne-Rhone-Alpes'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '257',
        ingressBytes: '19093170',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1537',
        ingressBytes: '19032850',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '257',
        ingressBytes: '18964180',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Antananarivo',
        commonIngressLinkId: '1281',
        ingressBytes: '18931802',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '18501343',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '1025',
        ingressBytes: '18276357',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Illinois',
        commonIngressLinkId: '1537',
        ingressBytes: '18248497',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '18063723',
        serverProvince: 'Pais Vasco'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '17988198',
        serverProvince: 'Mato Grosso do Sul'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '17799587',
        serverProvince: 'Tierra del Fuego'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '2049',
        ingressBytes: '17789957',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '17753669',
        serverProvince: 'Tehran'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '17571166',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '17540542',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '17450051',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '17448232',
        serverProvince: 'Nordrhein-Westfalen'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '17413011',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '2049',
        ingressBytes: '17355087',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '17251491',
        serverProvince: 'Gauteng'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Colorado',
        commonIngressLinkId: '513',
        ingressBytes: '17135875',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '1793',
        ingressBytes: '16832562',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '513',
        ingressBytes: '16686104',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '16673883',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '16652938',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '16501585',
        serverProvince: 'Ad Dawhah'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '16412793',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '16314462',
        serverProvince: 'Riau'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Beijing',
        commonIngressLinkId: '257',
        ingressBytes: '16210624',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '15918454',
        serverProvince: 'Alabama'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '15670517',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '513',
        ingressBytes: '15634699',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '15547487',
        serverProvince: 'Praha, Hlavni mesto'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '15470219',
        serverProvince: 'Stockholms lan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '257',
        ingressBytes: '15396691',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Washington',
        commonIngressLinkId: '2049',
        ingressBytes: '15164060',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '15163920',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '2305',
        ingressBytes: '15160915',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '14980989',
        serverProvince: 'Madrid, Comunidad de'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '14976425',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '14887162',
        serverProvince: 'Gauteng'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Phnom Penh',
        commonIngressLinkId: '513',
        ingressBytes: '14879341',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Anhui',
        commonIngressLinkId: '769',
        ingressBytes: '14855395',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '14828953',
        serverProvince: 'Ohio'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '14755579',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '14734852',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '14729720',
        serverProvince: 'Bayern'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '513',
        ingressBytes: '14597753',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Noord-Holland',
        commonIngressLinkId: '257',
        ingressBytes: '14501939',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '14421460',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '14399689',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '1537',
        ingressBytes: '14235942',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '1537',
        ingressBytes: '14216057',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xizang',
        commonIngressLinkId: '2049',
        ingressBytes: '14143024',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Seoul-teukbyeolsi',
        commonIngressLinkId: '2305',
        ingressBytes: '14141052',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '1025',
        ingressBytes: '14139793',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '257',
        ingressBytes: '14060807',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '14041331',
        serverProvince: 'Ha Noi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '13954108',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '513',
        ingressBytes: '13767874',
        serverProvince: 'Ohio'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '13678469',
        serverProvince: 'North Carolina'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '13641174',
        serverProvince: 'Dublin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '13587702',
        serverProvince: 'Gyeonggi-do'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '13510957',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hainan',
        commonIngressLinkId: '1793',
        ingressBytes: '13352745',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '1281',
        ingressBytes: '13247399',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '13163541',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '12965849',
        serverProvince: 'Sachsen'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '12816195',
        serverProvince: 'Saitama'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '257',
        ingressBytes: '12789253',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '1793',
        ingressBytes: '12688331',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '513',
        ingressBytes: '12568252',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '12447453',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Gansu',
        commonIngressLinkId: '2305',
        ingressBytes: '12435404',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '12384182',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '2049',
        ingressBytes: '12280739',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'California',
        commonIngressLinkId: '2305',
        ingressBytes: '12100636',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '11992386',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '11942268',
        serverProvince: 'Etela-Savo'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '1025',
        ingressBytes: '11941776',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '11877316',
        serverProvince: 'Noord-Holland'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '11719886',
        serverProvince: 'Cebu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '11625987',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '513',
        ingressBytes: '11599866',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '11570716',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '11389141',
        serverProvince: 'New South Wales'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '11366213',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '1281',
        ingressBytes: '11365098',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '513',
        ingressBytes: '11212297',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xizang',
        commonIngressLinkId: '1793',
        ingressBytes: '11197929',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jakarta Raya',
        commonIngressLinkId: '2305',
        ingressBytes: '11174502',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '11156732',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '1281',
        ingressBytes: '11136963',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '10888927',
        serverProvince: 'Izmir'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '10791738',
        serverProvince: 'Ciudad Autonoma de Buenos Aires'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '10788231',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '10765303',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'California',
        commonIngressLinkId: '1793',
        ingressBytes: '10617918',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '10246640',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '10206520',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Singapore',
        commonIngressLinkId: '1281',
        ingressBytes: '10002149',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '9945352',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '9886044',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '1537',
        ingressBytes: '9854016',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '9681941',
        serverProvince: 'Macao'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '9561690',
        serverProvince: 'Indiana'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '2049',
        ingressBytes: '9552558',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '1281',
        ingressBytes: '9499147',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '9469127',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '9463626',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '9453855',
        serverProvince: 'Minnesota'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '9248633',
        serverProvince: 'Ohio'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '9238927',
        serverProvince: 'Uttar Pradesh'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '9119020',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '9112163',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '9073034',
        serverProvince: 'Niederosterreich'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Tokyo',
        commonIngressLinkId: '257',
        ingressBytes: '9060532',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '9005663',
        serverProvince: 'Florida'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '513',
        ingressBytes: '8896921',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '1793',
        ingressBytes: '8818507',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '8817147',
        serverProvince: 'Osaka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '8796733',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '8680668',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '8666491',
        serverProvince: 'Maharashtra'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '8526490',
        serverProvince: 'Noord-Holland'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '8475842',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '8424341',
        serverProvince: 'Karnataka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xizang',
        commonIngressLinkId: '1537',
        ingressBytes: '8401618',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '8261168',
        serverProvince: 'Budapest'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '8248464',
        serverProvince: 'Texas'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Lagos',
        commonIngressLinkId: '2817',
        ingressBytes: '8214677',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '8149840',
        serverProvince: 'Arizona'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '7929455',
        serverProvince: 'New South Wales'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '7888740',
        serverProvince: 'New South Wales'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '513',
        ingressBytes: '7829356',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '7762421',
        serverProvince: 'Yangon'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nouvelle-Aquitaine',
        commonIngressLinkId: '513',
        ingressBytes: '7658928',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hainan',
        commonIngressLinkId: '257',
        ingressBytes: '7653163',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '1281',
        ingressBytes: '7573608',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '7566449',
        serverProvince: 'Gia Lai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '7532028',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '7530333',
        serverProvince: 'Noord-Holland'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tokyo',
        commonIngressLinkId: '769',
        ingressBytes: '7504899',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '7275915',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '7257002',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '7250638',
        serverProvince: 'Illinois'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '7236205',
        serverProvince: 'Noord-Holland'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '7216504',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '7191790',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '7191562',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '1537',
        ingressBytes: '7178274',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '7135431',
        serverProvince: 'Uusimaa'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hunan',
        commonIngressLinkId: '257',
        ingressBytes: '7128348',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '7123169',
        serverProvince: 'Misamis Oriental'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '7095907',
        serverProvince: 'Gyeonggi-do'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '7040198',
        serverProvince: 'Bahia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tunis',
        commonIngressLinkId: '1537',
        ingressBytes: '6900462',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '6863478',
        serverProvince: 'Sankt-Peterburg'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '6857167',
        serverProvince: 'Colorado'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '6836373',
        serverProvince: 'Ciudad Autonoma de Buenos Aires'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '6698813',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tokyo',
        commonIngressLinkId: '1793',
        ingressBytes: '6603723',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '6592254',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '6578970',
        serverProvince: 'Rizal'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '6439375',
        serverProvince: 'Utrecht'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '6337687',
        serverProvince: 'Hovedstaden'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '6317065',
        serverProvince: 'Hyogo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '6293482',
        serverProvince: 'Ho Chi Minh'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Texas',
        commonIngressLinkId: '1281',
        ingressBytes: '6219207',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '2305',
        ingressBytes: '6191466',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '6127516',
        serverProvince: 'Uusimaa'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '6002064',
        serverProvince: 'Rio de Janeiro'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '5938100',
        serverProvince: 'National Capital Region'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '5907549',
        serverProvince: 'Uttar Pradesh'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Jilin',
        commonIngressLinkId: '1025',
        ingressBytes: '5812643',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '5795545',
        serverProvince: 'Riau'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '5711544',
        serverProvince: 'Ho Chi Minh'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Anhui',
        commonIngressLinkId: '1281',
        ingressBytes: '5688595',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '5522488',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Uttar Pradesh',
        commonIngressLinkId: '2817',
        ingressBytes: '5481910',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '5467740',
        serverProvince: 'Tel Aviv'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '513',
        ingressBytes: '5456403',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '5455866',
        serverProvince: 'Gauteng'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '5411234',
        serverProvince: 'Kuala Lumpur'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Uttar Pradesh',
        commonIngressLinkId: '1793',
        ingressBytes: '5363154',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '5343288',
        serverProvince: 'Stockholms lan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '5281688',
        serverProvince: 'Bursa'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '5281494',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '5280882',
        serverProvince: 'Osaka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '5273349',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '5237695',
        serverProvince: 'Dadra and Nagar Haveli'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '5200832',
        serverProvince: 'Jakarta Raya'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hainan',
        commonIngressLinkId: '769',
        ingressBytes: '5169909',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Singapore',
        commonIngressLinkId: '1537',
        ingressBytes: '5154630',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '5109717',
        serverProvince: 'Budapest'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '2049',
        ingressBytes: '5085908',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '5070080',
        serverProvince: 'Sao Paulo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '513',
        ingressBytes: '4886447',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '4884053',
        serverProvince: 'Moscow'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Singapore',
        commonIngressLinkId: '257',
        ingressBytes: '4705799',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '4696886',
        serverProvince: 'Praha, Hlavni mesto'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '4617610',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '4562164',
        serverProvince: 'Mazowieckie'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBytes: '4517009',
        serverProvince: 'Gyeonggi-do'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '4451450',
        serverProvince: 'Osaka'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '4440051',
        serverProvince: 'Gyeonggi-do'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hunan',
        commonIngressLinkId: '1281',
        ingressBytes: '4387595',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '4341808',
        serverProvince: 'Chiba'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '257',
        ingressBytes: '4324256',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Maharashtra',
        commonIngressLinkId: '513',
        ingressBytes: '4274696',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '4268552',
        serverProvince: 'Osaka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '4243683',
        serverProvince: 'Brussels Hoofdstedelijk Gewest'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jakarta Raya',
        commonIngressLinkId: '1793',
        ingressBytes: '4215621',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '4205220',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hainan',
        commonIngressLinkId: '2817',
        ingressBytes: '4198193',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'West Bengal',
        commonIngressLinkId: '1537',
        ingressBytes: '4190081',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '4172388',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Madrid, Comunidad de',
        commonIngressLinkId: '2817',
        ingressBytes: '4172095',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '4020521',
        serverProvince: 'Geneve'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '2305',
        ingressBytes: '3965604',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'California',
        commonIngressLinkId: '769',
        ingressBytes: '3932763',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '513',
        ingressBytes: '3910057',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '3889249',
        serverProvince: 'Sao Paulo'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hainan',
        commonIngressLinkId: '1025',
        ingressBytes: '3887418',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '513',
        ingressBytes: '3803920',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hamburg',
        commonIngressLinkId: '2817',
        ingressBytes: '3770337',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBytes: '3729257',
        serverProvince: 'Jawa Barat'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '3719787',
        serverProvince: 'Gauteng'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '3633122',
        serverProvince: 'Hyogo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '3559354',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '3558499',
        serverProvince: 'Campania'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1025',
        ingressBytes: '3509858',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '3460540',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '3306058',
        serverProvince: 'Podkarpackie'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '1537',
        ingressBytes: '3300599',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBytes: '3216568',
        serverProvince: 'Dhaka'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '257',
        ingressBytes: '3205033',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '3090472',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hainan',
        commonIngressLinkId: '1281',
        ingressBytes: '3013298',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '2965775',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Fujian',
        commonIngressLinkId: '1281',
        ingressBytes: '2959983',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '2956483',
        serverProvince: 'Zurich'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '513',
        ingressBytes: '2810274',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '1793',
        ingressBytes: '2708532',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '2049',
        ingressBytes: '2640569',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '2519550',
        serverProvince: 'Illinois'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Washington',
        commonIngressLinkId: '513',
        ingressBytes: '2416657',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'National Capital Region',
        commonIngressLinkId: '2049',
        ingressBytes: '2314051',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '257',
        ingressBytes: '2160011',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Moscow',
        commonIngressLinkId: '2049',
        ingressBytes: '2125936',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBytes: '2053039',
        serverProvince: 'Jakarta Raya'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jilin',
        commonIngressLinkId: '257',
        ingressBytes: '2026427',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBytes: '1994643',
        serverProvince: 'Colorado'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBytes: '1881388',
        serverProvince: 'Ontario'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '1857203',
        serverProvince: 'Tel Aviv'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '1734638',
        serverProvince: 'Oregon'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Singapore',
        commonIngressLinkId: '2049',
        ingressBytes: '1668203',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'California',
        commonIngressLinkId: '1281',
        ingressBytes: '1663289',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '769',
        ingressBytes: '1620580',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '1793',
        ingressBytes: '1598971',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '1447027',
        serverProvince: 'Phnom Penh'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBytes: '1407499',
        serverProvince: 'Ontario'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '1324703',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '769',
        ingressBytes: '1151580',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '769',
        ingressBytes: '1106026',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '1101122',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBytes: '869928',
        serverProvince: 'Hofudborgarsvaedi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBytes: '853157',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBytes: '463038',
        serverProvince: 'Reunion'
      }
    ]
  }
}

/*export const egress = {"msg":"OK","queryKey":"4dc6fcfa2f3b7b9d2b7bf86db450411d","code":200,"data":{"result":[{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"33799691852","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"32470376573","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"32331207787","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"32032115917","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"31868858761","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"29541399004","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"28061504729","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"27341743200","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"25002288549","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"24859829433","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"11507760302","serverProvince":"Jiangsu","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"8651183588","serverProvince":"Beijing","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"7837391383","serverProvince":"Beijing","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"7439253656","serverProvince":"Shandong","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"7426404911","serverProvince":"Jiangsu","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"7282105391","serverProvince":"Shandong","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"7218659736","serverProvince":"Beijing","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"7197244222","serverProvince":"Jiangsu","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"6938754196","serverProvince":"Beijing","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"6718208227","serverProvince":"Jiangsu","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"6510918343","serverProvince":"Jiangsu","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"6432774951","serverProvince":"Zhejiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"6132402534","serverProvince":"Beijing","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"6082318322","serverProvince":"Jiangsu","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"5875114783","serverProvince":"Jiangsu","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"5662086016","serverProvince":"Beijing","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"5577190797","serverProvince":"Beijing","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"5501534803","serverProvince":"Shandong","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"5210291272","serverProvince":"Beijing","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"5175395545","serverProvince":"Jiangsu","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"5153922008","serverProvince":"Hongkong","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"5102568639","serverProvince":"Shandong","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"5040113099","serverProvince":"Guangdong","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"5023865655","serverProvince":"Beijing","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"4834273637","serverProvince":"Guangdong","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"4826688302","serverProvince":"Beijing","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"4805068012","serverProvince":"Jiangsu","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"4681904284","serverProvince":"Jiangsu","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"4637016802","serverProvince":"Shanghai","commonEgressLinkId":"2304"},{"clientProvince":"Shaanxi","egressLinkDirection":"西宁","egressBytes":"4273750429","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"4201444790","serverProvince":"Guangdong","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"4163603671","serverProvince":"Guangdong","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"4156376686","serverProvince":"Hongkong","commonEgressLinkId":"1280"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBytes":"4085075844","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"4033242592","serverProvince":"Stockholms lan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3890877359","serverProvince":"Shaanxi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3760672457","serverProvince":"Hubei","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3591776968","serverProvince":"Hongkong","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3573259572","serverProvince":"Shandong","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3571736200","serverProvince":"Shanghai","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3569950655","serverProvince":"Shandong","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3448751320","serverProvince":"Anhui","commonEgressLinkId":"1536"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBytes":"3381956422","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3378129303","serverProvince":"Hongkong","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3370272164","serverProvince":"Hebei","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3303380490","serverProvince":"Hongkong","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3296949084","serverProvince":"Guangdong","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3294325851","serverProvince":"Zhejiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3283180295","serverProvince":"Guangdong","commonEgressLinkId":"1792"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBytes":"3276811856","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3264653355","serverProvince":"Hunan","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3263806689","serverProvince":"","commonEgressLinkId":"1536"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBytes":"3219392420","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"3183879972","serverProvince":"Shanghai","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3175489326","serverProvince":"Shanghai","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"3151018853","serverProvince":"Zhejiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3127683959","serverProvince":"Zhejiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3124736828","serverProvince":"Zhejiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3107289622","serverProvince":"Zhejiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"3090916355","serverProvince":"Shaanxi","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3062840473","serverProvince":"Henan","commonEgressLinkId":"2816"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBytes":"3038994129","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3034665545","serverProvince":"Hongkong","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"3015392658","serverProvince":"Hongkong","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"3002537897","serverProvince":"Guangdong","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2981185824","serverProvince":"Zhejiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2971137246","serverProvince":"Hebei","commonEgressLinkId":"512"},{"clientProvince":"Henan","egressLinkDirection":"西安","egressBytes":"2898151892","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Henan","egressLinkDirection":"西安","egressBytes":"2888810451","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBytes":"2881788080","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2870185089","serverProvince":"Shanghai","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2864916188","serverProvince":"Hebei","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2852148044","serverProvince":"Fujian","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"2845550844","serverProvince":"Guangdong","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2842160558","serverProvince":"","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2832303532","serverProvince":"Tianjin","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2815887418","serverProvince":"Guangdong","commonEgressLinkId":"2048"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBytes":"2710362370","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"2701520109","serverProvince":"Shandong","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2694129410","serverProvince":"Shandong","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2686953285","serverProvince":"Hebei","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2674754590","serverProvince":"Hebei","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2662971359","serverProvince":"Zhejiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2657501064","serverProvince":"Shanghai","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2621792279","serverProvince":"Hubei","commonEgressLinkId":"512"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBytes":"2599742097","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2598562636","serverProvince":"Singapore","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2566038389","serverProvince":"Fujian","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"2557186302","serverProvince":"Hebei","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2555422429","serverProvince":"Henan","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2536111713","serverProvince":"Fujian","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2501415579","serverProvince":"Hongkong","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2484988915","serverProvince":"Shaanxi","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2445388025","serverProvince":"Hebei","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2423017533","serverProvince":"Guangdong","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2409168900","serverProvince":"Shanghai","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2406753698","serverProvince":"Hongkong","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2388316489","serverProvince":"Shandong","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2374913880","serverProvince":"Chongqing","commonEgressLinkId":"2304"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBytes":"2364684333","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2360654275","serverProvince":"Shaanxi","commonEgressLinkId":"2304"},{"clientProvince":"Jiangsu","egressLinkDirection":"西安","egressBytes":"2359491975","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2313572752","serverProvince":"Anhui","commonEgressLinkId":"2048"},{"clientProvince":"Shandong","egressLinkDirection":"西安","egressBytes":"2288652805","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2276947666","serverProvince":"Shaanxi","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2272116486","serverProvince":"Zhejiang","commonEgressLinkId":"512"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBytes":"2262874621","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2260268179","serverProvince":"Shanxi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"2227078600","serverProvince":"Fujian","commonEgressLinkId":"1024"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBytes":"2213796628","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2196533735","serverProvince":"Tianjin","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2189798080","serverProvince":"Fujian","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2183050022","serverProvince":"Liaoning","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2153404700","serverProvince":"Anhui","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2151753111","serverProvince":"Shaanxi","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2142790753","serverProvince":"Liaoning","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"2137387416","serverProvince":"","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2131488549","serverProvince":"California","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2128215575","serverProvince":"Hubei","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2127667936","serverProvince":"Hunan","commonEgressLinkId":"2816"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBytes":"2095106126","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2087330908","serverProvince":"Guangxi","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2075439414","serverProvince":"Anhui","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2071712101","serverProvince":"Hebei","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"2069170166","serverProvince":"Hunan","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"2051122697","serverProvince":"","commonEgressLinkId":"1792"},{"clientProvince":"Shaanxi","egressLinkDirection":"西安","egressBytes":"2034919965","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBytes":"2021762914","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBytes":"2015634676","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBytes":"2010256094","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Henan","egressLinkDirection":"西安","egressBytes":"2007059064","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1999976929","serverProvince":"Shanxi","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1995139834","serverProvince":"Anhui","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1986283859","serverProvince":"California","commonEgressLinkId":"1024"},{"clientProvince":"Zhejiang","egressLinkDirection":"西安","egressBytes":"1974656686","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1973935956","serverProvince":"Hebei","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1970405616","serverProvince":"Shanxi","commonEgressLinkId":"256"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBytes":"1965514857","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBytes":"1961262932","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1953155661","serverProvince":"Hunan","commonEgressLinkId":"768"},{"clientProvince":"Beijing","egressLinkDirection":"西安","egressBytes":"1928895862","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Qinghai","egressLinkDirection":"西安","egressBytes":"1925849251","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1905424010","serverProvince":"Henan","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1886095717","serverProvince":"Hongkong","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1885344218","serverProvince":"California","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1869083754","serverProvince":"","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1856542388","serverProvince":"Hubei","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1843109825","serverProvince":"Shaanxi","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1828395925","serverProvince":"Tokyo","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1824798409","serverProvince":"Henan","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1824254138","serverProvince":"Shanghai","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1817823702","serverProvince":"Tokyo","commonEgressLinkId":"1792"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBytes":"1786200585","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1779625576","serverProvince":"Tianjin","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1772383911","serverProvince":"Tianjin","commonEgressLinkId":"1024"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBytes":"1772186964","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Henan","egressLinkDirection":"西宁","egressBytes":"1733016692","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1726918186","serverProvince":"Shaanxi","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1696860726","serverProvince":"Jiangxi","commonEgressLinkId":"1024"},{"clientProvince":"Jiangxi","egressLinkDirection":"西安","egressBytes":"1693016721","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBytes":"1664870387","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Qinghai","egressLinkDirection":"西宁","egressBytes":"1644449076","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Guangdong","egressLinkDirection":"西安","egressBytes":"1644030083","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Guangdong","egressLinkDirection":"西安","egressBytes":"1624194824","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1621840336","serverProvince":"Shandong","commonEgressLinkId":"768"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBytes":"1605713764","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1604335346","serverProvince":"Hunan","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1588508880","serverProvince":"","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1574850699","serverProvince":"Sichuan","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1571605968","serverProvince":"Hubei","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1553788166","serverProvince":"Hubei","commonEgressLinkId":"768"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBytes":"1515061152","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1513480176","serverProvince":"Jiangxi","commonEgressLinkId":"2304"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBytes":"1510882798","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1499653019","serverProvince":"Sichuan","commonEgressLinkId":"2816"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBytes":"1496560840","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Shanxi","egressLinkDirection":"西宁","egressBytes":"1495502817","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1493640011","serverProvince":"Henan","commonEgressLinkId":"2048"},{"clientProvince":"Shanghai","egressLinkDirection":"西宁","egressBytes":"1493177421","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1487331061","serverProvince":"Jilin","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1482926618","serverProvince":"Hunan","commonEgressLinkId":"2048"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBytes":"1464854207","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1454347276","serverProvince":"Anhui","commonEgressLinkId":"2816"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBytes":"1449329549","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Hebei","egressLinkDirection":"西安","egressBytes":"1443201111","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1441130220","serverProvince":"Fujian","commonEgressLinkId":"1280"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBytes":"1438352785","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1427572740","serverProvince":"Fujian","commonEgressLinkId":"1536"},{"clientProvince":"Hubei","egressLinkDirection":"西安","egressBytes":"1424848734","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBytes":"1407014488","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBytes":"1399126829","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBytes":"1396851346","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1395607571","serverProvince":"Henan","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1388230021","serverProvince":"Hunan","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1384024341","serverProvince":"","commonEgressLinkId":"2304"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBytes":"1376214647","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1371403957","serverProvince":"Tokyo","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1367963252","serverProvince":"Qinghai","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1361837468","serverProvince":"Guangxi","commonEgressLinkId":"1280"},{"clientProvince":"Chongqing","egressLinkDirection":"西安","egressBytes":"1353236167","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1353105668","serverProvince":"Fujian","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1351979847","serverProvince":"Tokyo","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1332235689","serverProvince":"Jiangxi","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1331150474","serverProvince":"Hunan","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1321324884","serverProvince":"Fujian","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1311375536","serverProvince":"Jiangxi","commonEgressLinkId":"2048"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBytes":"1310921889","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1310698680","serverProvince":"Chongqing","commonEgressLinkId":"1280"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBytes":"1292831854","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Gansu","egressLinkDirection":"西安","egressBytes":"1288269214","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBytes":"1282876225","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"1279107486","serverProvince":"Tianjin","commonEgressLinkId":"1536"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBytes":"1277615514","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1269988292","serverProvince":"Shanghai","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1261952586","serverProvince":"Shaanxi","commonEgressLinkId":"1280"},{"clientProvince":"Shaanxi","egressLinkDirection":"西安","egressBytes":"1258589585","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1246162676","serverProvince":"Zhejiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1242808729","serverProvince":"Hunan","commonEgressLinkId":"2304"},{"clientProvince":"Jiangsu","egressLinkDirection":"西安","egressBytes":"1235499560","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Hebei","egressLinkDirection":"西安","egressBytes":"1235218758","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1234637975","serverProvince":"Sichuan","commonEgressLinkId":"1536"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBytes":"1225770080","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1216101410","serverProvince":"Ningxia","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1212778503","serverProvince":"Singapore","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1204212628","serverProvince":"Shanxi","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1198312532","serverProvince":"Fujian","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1195740505","serverProvince":"Shaanxi","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1193723055","serverProvince":"Maharashtra","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1190363454","serverProvince":"Jiangxi","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1187365969","serverProvince":"Jiangxi","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1185275869","serverProvince":"Henan","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1181994283","serverProvince":"Hunan","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1172123891","serverProvince":"Qinghai","commonEgressLinkId":"256"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBytes":"1168670796","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Qinghai","egressLinkDirection":"西安","egressBytes":"1165297097","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1164718209","serverProvince":"Liaoning","commonEgressLinkId":"1792"},{"clientProvince":"Hunan","egressLinkDirection":"西安","egressBytes":"1158264632","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1152445722","serverProvince":"Anhui","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1144044134","serverProvince":"Shanxi","commonEgressLinkId":"768"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBytes":"1132285146","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1129705727","serverProvince":"Guangxi","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1127759996","serverProvince":"Tianjin","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1123542962","serverProvince":"Heilongjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1119738972","serverProvince":"Tianjin","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1119605575","serverProvince":"Jiangxi","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1117806817","serverProvince":"Qinghai","commonEgressLinkId":"2816"},{"clientProvince":"Chongqing","egressLinkDirection":"西宁","egressBytes":"1117091387","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1112831693","serverProvince":"Liaoning","commonEgressLinkId":"512"},{"clientProvince":"Nei Mongol","egressLinkDirection":"西安","egressBytes":"1112331283","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1102912361","serverProvince":"Anhui","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"1099877040","serverProvince":"Hubei","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1098246634","serverProvince":"Hebei","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1097492743","serverProvince":"Chongqing","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1090058869","serverProvince":"Henan","commonEgressLinkId":"1792"},{"clientProvince":"Shandong","egressLinkDirection":"西安","egressBytes":"1080439598","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1066943898","serverProvince":"Shanghai","commonEgressLinkId":"1280"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBytes":"1064897384","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Guangxi","egressLinkDirection":"西安","egressBytes":"1059329929","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1052111871","serverProvince":"","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1046754925","serverProvince":"Singapore","commonEgressLinkId":"768"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBytes":"1042880037","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"1020637205","serverProvince":"Henan","commonEgressLinkId":"256"},{"clientProvince":"Anhui","egressLinkDirection":"西安","egressBytes":"1019003984","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBytes":"1008845946","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"1008133259","serverProvince":"Shanxi","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"996331529","serverProvince":"Ha Noi","commonEgressLinkId":"2048"},{"clientProvince":"Hebei","egressLinkDirection":"西安","egressBytes":"993142918","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Beijing","egressLinkDirection":"西安","egressBytes":"986341442","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xizang","egressLinkDirection":"太原","egressBytes":"977929795","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"977594617","serverProvince":"Colorado","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"976133602","serverProvince":"Singapore","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"974600166","serverProvince":"Indiana","commonEgressLinkId":"1792"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBytes":"972261667","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"966528413","serverProvince":"Taiwan","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"965839203","serverProvince":"Nei Mongol","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"962487709","serverProvince":"Riau","commonEgressLinkId":"2816"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBytes":"961225984","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"958773595","serverProvince":"Anhui","commonEgressLinkId":"256"},{"clientProvince":"","egressLinkDirection":"西宁","egressBytes":"954283931","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"949975203","serverProvince":"Ile-de-France","commonEgressLinkId":"256"},{"clientProvince":"Hebei","egressLinkDirection":"西宁","egressBytes":"942544765","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"941239830","serverProvince":"Qinghai","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"940605016","serverProvince":"Tianjin","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"939058935","serverProvince":"Tianjin","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"934482465","serverProvince":"Taiwan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"932258803","serverProvince":"Osaka","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"921412824","serverProvince":"Hubei","commonEgressLinkId":"2816"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBytes":"920860793","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBytes":"916167408","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"914986394","serverProvince":"Sichuan","commonEgressLinkId":"1792"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBytes":"911924110","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Sichuan","egressLinkDirection":"西安","egressBytes":"900232035","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBytes":"899933729","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Ningxia","egressLinkDirection":"西宁","egressBytes":"886377552","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"880540244","serverProvince":"Ho Chi Minh","commonEgressLinkId":"768"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBytes":"879973538","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"877080026","serverProvince":"California","commonEgressLinkId":"2304"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBytes":"872446903","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Yunnan","egressLinkDirection":"西安","egressBytes":"867635825","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBytes":"865895411","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Sichuan","egressLinkDirection":"西安","egressBytes":"860656016","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBytes":"857077749","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"855616637","serverProvince":"Florida","commonEgressLinkId":"768"},{"clientProvince":"Jilin","egressLinkDirection":"西安","egressBytes":"853903439","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"853373833","serverProvince":"Taiwan","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"845652947","serverProvince":"Sichuan","commonEgressLinkId":"768"},{"clientProvince":"Islamabad","egressLinkDirection":"西宁","egressBytes":"833418713","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"831095584","serverProvince":"Henan","commonEgressLinkId":"2304"},{"clientProvince":"Fujian","egressLinkDirection":"西安","egressBytes":"829607732","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Jilin","egressLinkDirection":"西安","egressBytes":"825757916","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBytes":"825651224","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBytes":"824258009","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"823013410","serverProvince":"Qinghai","commonEgressLinkId":"2304"},{"clientProvince":"Tianjin","egressLinkDirection":"西安","egressBytes":"818745700","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"817631439","serverProvince":"Shanxi","commonEgressLinkId":"1280"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBytes":"815316807","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBytes":"814605913","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"809344048","serverProvince":"Sichuan","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"806154654","serverProvince":"Hubei","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"802990282","serverProvince":"Tokyo","commonEgressLinkId":"2048"},{"clientProvince":"Zhejiang","egressLinkDirection":"西安","egressBytes":"801346629","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBytes":"792502498","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBytes":"781458243","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBytes":"776980142","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBytes":"776885169","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"769448874","serverProvince":"California","commonEgressLinkId":"1792"},{"clientProvince":"Zhejiang","egressLinkDirection":"西宁","egressBytes":"756335818","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"753785775","serverProvince":"Ciudad Autonoma de Buenos Aires","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"743002749","serverProvince":"Ile-de-France","commonEgressLinkId":"768"},{"clientProvince":"Hunan","egressLinkDirection":"西安","egressBytes":"735645120","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"734036840","serverProvince":"Qinghai","commonEgressLinkId":"2048"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBytes":"731234776","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"730658765","serverProvince":"Gansu","commonEgressLinkId":"2816"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBytes":"728898358","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"726547882","serverProvince":"Yunnan","commonEgressLinkId":"1280"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBytes":"725014873","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"721961079","serverProvince":"Guangxi","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"720310842","serverProvince":"Singapore","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"716476370","serverProvince":"Gauteng","commonEgressLinkId":"512"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBytes":"716469696","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBytes":"713548852","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBytes":"709720332","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"707767895","serverProvince":"Liaoning","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"705004268","serverProvince":"Chongqing","commonEgressLinkId":"2048"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBytes":"701719339","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBytes":"699801045","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Hubei","egressLinkDirection":"西安","egressBytes":"696643336","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"696519804","serverProvince":"Georgia","commonEgressLinkId":"256"},{"clientProvince":"Hubei","egressLinkDirection":"西安","egressBytes":"693109752","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"691540356","serverProvince":"Gauteng","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"689310707","serverProvince":"Hessen","commonEgressLinkId":"1792"},{"clientProvince":"California","egressLinkDirection":"西宁","egressBytes":"689292908","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Tokyo","egressLinkDirection":"太原","egressBytes":"683276177","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"675602531","serverProvince":"Ningxia","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"668063701","serverProvince":"Hubei","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"666734544","serverProvince":"Liaoning","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"662702727","serverProvince":"Liaoning","commonEgressLinkId":"1024"},{"clientProvince":"Guizhou","egressLinkDirection":"西安","egressBytes":"661339114","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"659911130","serverProvince":"Singapore","commonEgressLinkId":"1024"},{"clientProvince":"Tianjin","egressLinkDirection":"西宁","egressBytes":"658632112","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBytes":"655562049","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"650979102","serverProvince":"Singapore","commonEgressLinkId":"256"},{"clientProvince":"Jiangsu","egressLinkDirection":"西安","egressBytes":"649356321","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBytes":"646390519","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"645582209","serverProvince":"Sichuan","commonEgressLinkId":"512"},{"clientProvince":"Tianjin","egressLinkDirection":"西安","egressBytes":"644909639","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBytes":"641951381","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBytes":"641345027","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"640560860","serverProvince":"Tokyo","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"633206744","serverProvince":"Chongqing","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"632692239","serverProvince":"New South Wales","commonEgressLinkId":"2304"},{"clientProvince":"Sichuan","egressLinkDirection":"西宁","egressBytes":"631445123","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"630488493","serverProvince":"Jilin","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"630383798","serverProvince":"Karnataka","commonEgressLinkId":"768"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBytes":"621134063","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"617023640","serverProvince":"Gansu","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"612752747","serverProvince":"Ningxia","commonEgressLinkId":"2048"},{"clientProvince":"Chongqing","egressLinkDirection":"西安","egressBytes":"611669350","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"607085496","serverProvince":"Nordrhein-Westfalen","commonEgressLinkId":"768"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBytes":"603563957","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Shaanxi","egressLinkDirection":"西安","egressBytes":"602372091","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBytes":"597478137","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"596564319","serverProvince":"Liaoning","commonEgressLinkId":"256"},{"clientProvince":"Singapore","egressLinkDirection":"西宁","egressBytes":"594942506","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"594768064","serverProvince":"Singapore","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"590749456","serverProvince":"Ho Chi Minh","commonEgressLinkId":"256"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBytes":"585327755","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Heilongjiang","egressLinkDirection":"西安","egressBytes":"582597581","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"580567149","serverProvince":"Liaoning","commonEgressLinkId":"2816"},{"clientProvince":"Gansu","egressLinkDirection":"西安","egressBytes":"579002229","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Fujian","egressLinkDirection":"太原","egressBytes":"577600261","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBytes":"573711751","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBytes":"572497923","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Shandong","egressLinkDirection":"西宁","egressBytes":"569663684","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Qinghai","egressLinkDirection":"西安","egressBytes":"568608692","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"568043585","serverProvince":"England","commonEgressLinkId":"512"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"567767531","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"564215600","serverProvince":"Mazowieckie","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"563580592","serverProvince":"Agusan del Norte","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"561330467","serverProvince":"Lombardia","commonEgressLinkId":"768"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBytes":"559692013","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"554860134","serverProvince":"Qinghai","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"554540877","serverProvince":"California","commonEgressLinkId":"256"},{"clientProvince":"Madhya Pradesh","egressLinkDirection":"西安","egressBytes":"550212521","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Guangdong","egressLinkDirection":"西安","egressBytes":"546594055","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBytes":"546319399","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"545315504","serverProvince":"California","commonEgressLinkId":"2048"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBytes":"542431173","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Shanghai","egressLinkDirection":"西安","egressBytes":"539792261","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Fujian","egressLinkDirection":"西安","egressBytes":"536822089","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"531832153","serverProvince":"Heilongjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"531553588","serverProvince":"Hainan","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"529381158","serverProvince":"Maharashtra","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"529197064","serverProvince":"Chongqing","commonEgressLinkId":"1024"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBytes":"528441703","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"525147406","serverProvince":"","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"522736968","serverProvince":"Puebla","commonEgressLinkId":"1792"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBytes":"520492802","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"517472016","serverProvince":"Tianjin","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"516393925","serverProvince":"Sichuan","commonEgressLinkId":"1024"},{"clientProvince":"Ningxia","egressLinkDirection":"西安","egressBytes":"511799334","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"509735065","serverProvince":"Jiangxi","commonEgressLinkId":"1536"},{"clientProvince":"Jiangxi","egressLinkDirection":"西安","egressBytes":"501027908","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Zhejiang","egressLinkDirection":"西安","egressBytes":"500128484","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBytes":"497315562","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Sichuan","egressLinkDirection":"西安","egressBytes":"493063136","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"491194198","serverProvince":"Guangxi","commonEgressLinkId":"1024"},{"clientProvince":"Jiangxi","egressLinkDirection":"西安","egressBytes":"491098864","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"490954516","serverProvince":"New York","commonEgressLinkId":"768"},{"clientProvince":"Fujian","egressLinkDirection":"太原","egressBytes":"490918279","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"490338013","serverProvince":"Jilin","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"488339544","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"2048"},{"clientProvince":"Chongqing","egressLinkDirection":"西安","egressBytes":"486665132","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBytes":"485755605","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Liaoning","egressLinkDirection":"西安","egressBytes":"485167941","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBytes":"481606274","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"481544612","serverProvince":"Liaoning","commonEgressLinkId":"768"},{"clientProvince":"Maharashtra","egressLinkDirection":"太原","egressBytes":"479554149","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"475287590","serverProvince":"Guizhou","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"473576451","serverProvince":"Gansu","commonEgressLinkId":"512"},{"clientProvince":"Noord-Holland","egressLinkDirection":"西安","egressBytes":"470646032","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Hongkong","egressLinkDirection":"西安","egressBytes":"468991798","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Nei Mongol","egressLinkDirection":"西宁","egressBytes":"463985956","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"463737019","serverProvince":"Hessen","commonEgressLinkId":"1536"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBytes":"463313219","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBytes":"458116853","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBytes":"456136335","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"455650047","serverProvince":"Ile-de-France","commonEgressLinkId":"2816"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBytes":"455635935","serverProvince":"","commonEgressLinkId":"1792"},{"clientProvince":"Xizang","egressLinkDirection":"太原","egressBytes":"453993439","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBytes":"452435186","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Jiangsu","egressLinkDirection":"西宁","egressBytes":"450506999","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"449976055","serverProvince":"Gansu","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"444763629","serverProvince":"Shanxi","commonEgressLinkId":"1792"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBytes":"443605198","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"441186690","serverProvince":"Tel Aviv","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"438698191","serverProvince":"Gansu","commonEgressLinkId":"2048"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBytes":"438448769","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBytes":"437846204","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"436871416","serverProvince":"Jiangxi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"436824117","serverProvince":"Guangxi","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"435906864","serverProvince":"Sankt-Peterburg","commonEgressLinkId":"1536"},{"clientProvince":"Heilongjiang","egressLinkDirection":"西安","egressBytes":"435249009","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Shanxi","egressLinkDirection":"西安","egressBytes":"432756029","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"428725214","serverProvince":"Qinghai","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"428247565","serverProvince":"Ad Dawhah","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"423885451","serverProvince":"Brussels Hoofdstedelijk Gewest","commonEgressLinkId":"2816"},{"clientProvince":"Hainan","egressLinkDirection":"西安","egressBytes":"423788850","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBytes":"422154626","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"421935485","serverProvince":"New South Wales","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"415678094","serverProvince":"","commonEgressLinkId":"2048"},{"clientProvince":"Fujian","egressLinkDirection":"太原","egressBytes":"414611993","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBytes":"403658317","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"402789458","serverProvince":"Nei Mongol","commonEgressLinkId":"1536"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBytes":"401937624","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"398659190","serverProvince":"Sao Paulo","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"395709005","serverProvince":"Illinois","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"394362457","serverProvince":"Jilin","commonEgressLinkId":"2304"},{"clientProvince":"","egressLinkDirection":"西安","egressBytes":"394220219","serverProvince":"Shanghai","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"394140890","serverProvince":"Gansu","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"388294995","serverProvince":"Ningxia","commonEgressLinkId":"512"},{"clientProvince":"Hainan","egressLinkDirection":"西安","egressBytes":"386202167","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBytes":"385634205","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"382028171","serverProvince":"Ha Noi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"379606576","serverProvince":"Gansu","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"379563866","serverProvince":"Hyogo","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"377402283","serverProvince":"National Capital Region","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"375747909","serverProvince":"Tokyo","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"373804422","serverProvince":"Taiwan","commonEgressLinkId":"1792"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBytes":"373425545","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"372315796","serverProvince":"Nei Mongol","commonEgressLinkId":"2048"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"371354874","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBytes":"371122325","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"369613064","serverProvince":"Tokyo","commonEgressLinkId":"512"},{"clientProvince":"Liaoning","egressLinkDirection":"西宁","egressBytes":"364280479","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"363669827","serverProvince":"Gansu","commonEgressLinkId":"2304"},{"clientProvince":"Anhui","egressLinkDirection":"西宁","egressBytes":"362148162","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Taiwan","egressLinkDirection":"太原","egressBytes":"361855097","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"360149905","serverProvince":"Chongqing","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"359749696","serverProvince":"Bahia","commonEgressLinkId":"1536"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBytes":"359276135","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Nouvelle-Aquitaine","egressLinkDirection":"西安","egressBytes":"358637460","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"356985198","serverProvince":"Shanxi","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"354251880","serverProvince":"Taiwan","commonEgressLinkId":"1536"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBytes":"350329895","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBytes":"350009900","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"349125607","serverProvince":"Jiangxi","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"347954504","serverProvince":"Alabama","commonEgressLinkId":"2048"},{"clientProvince":"Hainan","egressLinkDirection":"太原","egressBytes":"345980082","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"344902864","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"339966189","serverProvince":"Hainan","commonEgressLinkId":"2048"},{"clientProvince":"Xizang","egressLinkDirection":"太原","egressBytes":"338579852","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBytes":"337952455","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Moscow","egressLinkDirection":"西安","egressBytes":"337154484","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"336652185","serverProvince":"Gansu","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"336500945","serverProvince":"Nordrhein-Westfalen","commonEgressLinkId":"1280"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBytes":"332552224","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"332309715","serverProvince":"Nei Mongol","commonEgressLinkId":"2816"},{"clientProvince":"","egressLinkDirection":"西安","egressBytes":"332143450","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"332038433","serverProvince":"Heilongjiang","commonEgressLinkId":"1792"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBytes":"327635089","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"327607626","serverProvince":"Hessen","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"327231713","serverProvince":"Goias","commonEgressLinkId":"1792"},{"clientProvince":"Singapore","egressLinkDirection":"西安","egressBytes":"326018725","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Phnom Penh","egressLinkDirection":"太原","egressBytes":"324882788","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBytes":"323056849","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"322261367","serverProvince":"Anhui","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"321733343","serverProvince":"Ontario","commonEgressLinkId":"1024"},{"clientProvince":"Guangdong","egressLinkDirection":"西宁","egressBytes":"320982873","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"318556812","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"512"},{"clientProvince":"Hongkong","egressLinkDirection":"太原","egressBytes":"318243407","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"315615564","serverProvince":"Ontario","commonEgressLinkId":"512"},{"clientProvince":"Gansu","egressLinkDirection":"西安","egressBytes":"312701177","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBytes":"308862664","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBytes":"306493933","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"306129178","serverProvince":"Ningxia","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"306009836","serverProvince":"Istanbul","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"302621186","serverProvince":"Osaka","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"302516511","serverProvince":"Tokyo","commonEgressLinkId":"1536"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBytes":"301128103","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"300682918","serverProvince":"Gansu","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"300043515","serverProvince":"Bayern","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"299587121","serverProvince":"Ontario","commonEgressLinkId":"2816"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBytes":"299487173","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"299471980","serverProvince":"Guizhou","commonEgressLinkId":"1280"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBytes":"295736793","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"294469034","serverProvince":"Ho Chi Minh","commonEgressLinkId":"2816"},{"clientProvince":"Gansu","egressLinkDirection":"西宁","egressBytes":"292026506","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBytes":"291577497","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Guizhou","egressLinkDirection":"西安","egressBytes":"290771520","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBytes":"288721003","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"285065036","serverProvince":"Saitama","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"282201644","serverProvince":"Hessen","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"279407692","serverProvince":"England","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"278307860","serverProvince":"Washington","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"277533705","serverProvince":"Georgia","commonEgressLinkId":"1024"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBytes":"275573752","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBytes":"274936308","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"274254750","serverProvince":"Zuid-Holland","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"273409749","serverProvince":"California","commonEgressLinkId":"1280"},{"clientProvince":"Xizang","egressLinkDirection":"太原","egressBytes":"272261584","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBytes":"270048159","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"267863047","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"266747846","serverProvince":"Mazowieckie","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"266536285","serverProvince":"Guizhou","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"264875433","serverProvince":"Yunnan","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"264464321","serverProvince":"New York","commonEgressLinkId":"2048"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBytes":"264039298","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"258997065","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"256"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"257633169","serverProvince":"","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"256806080","serverProvince":"Nei Mongol","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"256777525","serverProvince":"Heilongjiang","commonEgressLinkId":"512"},{"clientProvince":"Seoul-teukbyeolsi","egressLinkDirection":"太原","egressBytes":"251260218","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"250386774","serverProvince":"Taiwan","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"250349877","serverProvince":"Yunnan","commonEgressLinkId":"1536"},{"clientProvince":"Jakarta Raya","egressLinkDirection":"太原","egressBytes":"248331843","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"248145104","serverProvince":"Pais Vasco","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"248132398","serverProvince":"Virginia","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"244196274","serverProvince":"Hessen","commonEgressLinkId":"2816"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBytes":"242559017","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"","egressLinkDirection":"西安","egressBytes":"240782048","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBytes":"239477156","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBytes":"238652887","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"237399402","serverProvince":"Zabaykal'skiy kray","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"237048272","serverProvince":"Shanxi","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"231548014","serverProvince":"Kuala Lumpur","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"231137306","serverProvince":"Hofudborgarsvaedi","commonEgressLinkId":"1792"},{"clientProvince":"Hubei","egressLinkDirection":"西宁","egressBytes":"230996300","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"230451618","serverProvince":"Qinghai","commonEgressLinkId":"1536"},{"clientProvince":"West Bengal","egressLinkDirection":"西安","egressBytes":"230045510","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"226823993","serverProvince":"Dhaka","commonEgressLinkId":"256"},{"clientProvince":"Kuala Lumpur","egressLinkDirection":"太原","egressBytes":"226495651","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"226077265","serverProvince":"Noord-Holland","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"225099574","serverProvince":"Arizona","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"224987152","serverProvince":"Nei Mongol","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"222759681","serverProvince":"Rio de Janeiro","commonEgressLinkId":"256"},{"clientProvince":"Ningxia","egressLinkDirection":"西安","egressBytes":"222390659","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Fujian","egressLinkDirection":"西宁","egressBytes":"221318982","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"220985022","serverProvince":"Sichuan","commonEgressLinkId":"2048"},{"clientProvince":"Tunis","egressLinkDirection":"西宁","egressBytes":"218949841","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"218773971","serverProvince":"Washington","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"218535880","serverProvince":"Chelyabinskaya oblast'","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"218164511","serverProvince":"Uttar Pradesh","commonEgressLinkId":"768"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBytes":"217531147","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBytes":"213591705","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Shandong","egressLinkDirection":"西安","egressBytes":"212857079","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"211508345","serverProvince":"Heilongjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"210552923","serverProvince":"Jilin","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"210543210","serverProvince":"Chongqing","commonEgressLinkId":"768"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBytes":"209324933","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"209222575","serverProvince":"Etela-Savo","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"208918745","serverProvince":"Sichuan","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"208414548","serverProvince":"Virginia","commonEgressLinkId":"1024"},{"clientProvince":"Zug","egressLinkDirection":"太原","egressBytes":"206917024","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Guizhou","egressLinkDirection":"西宁","egressBytes":"206857554","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"206322656","serverProvince":"Virginia","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"205580983","serverProvince":"Singapore","commonEgressLinkId":"2048"},{"clientProvince":"Jiangxi","egressLinkDirection":"西宁","egressBytes":"204405584","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"201229443","serverProvince":"Phnom Penh","commonEgressLinkId":"2048"},{"clientProvince":"","egressLinkDirection":"西安","egressBytes":"201192524","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"199348852","serverProvince":"California","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"197115328","serverProvince":"Ohio","commonEgressLinkId":"1280"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBytes":"196354956","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBytes":"195053218","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Fujian","egressLinkDirection":"太原","egressBytes":"194540335","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"194537581","serverProvince":"Osaka","commonEgressLinkId":"512"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBytes":"194525234","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"193417796","serverProvince":"Xizang","commonEgressLinkId":"2816"},{"clientProvince":"Anhui","egressLinkDirection":"西安","egressBytes":"192621911","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBytes":"191959672","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"190620767","serverProvince":"Hainan","commonEgressLinkId":"1280"},{"clientProvince":"Shanxi","egressLinkDirection":"西安","egressBytes":"189950915","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Taiwan","egressLinkDirection":"西安","egressBytes":"189235309","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"188496312","serverProvince":"Nei Mongol","commonEgressLinkId":"512"},{"clientProvince":"Hunan","egressLinkDirection":"西安","egressBytes":"184753159","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"184175314","serverProvince":"Tianjin","commonEgressLinkId":"2304"},{"clientProvince":"Taiwan","egressLinkDirection":"西安","egressBytes":"181853131","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"176876752","serverProvince":"Praha, Hlavni mesto","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"176015335","serverProvince":"Qinghai","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"175804254","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"173873612","serverProvince":"Zurich","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"169877278","serverProvince":"Uttar Pradesh","commonEgressLinkId":"2048"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBytes":"169601791","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"168781341","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"2816"},{"clientProvince":"Seoul-teukbyeolsi","egressLinkDirection":"西宁","egressBytes":"168207894","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"167525933","serverProvince":"Dimashq","commonEgressLinkId":"1280"},{"clientProvince":"Uttar Pradesh","egressLinkDirection":"西安","egressBytes":"167297864","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Nei Mongol","egressLinkDirection":"西安","egressBytes":"166668927","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"166595651","serverProvince":"Ha Noi","commonEgressLinkId":"512"},{"clientProvince":"Jilin","egressLinkDirection":"西安","egressBytes":"165725670","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Nei Mongol","egressLinkDirection":"西安","egressBytes":"165051954","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Hainan","egressLinkDirection":"太原","egressBytes":"162661014","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Madrid, Comunidad de","egressLinkDirection":"西安","egressBytes":"159881003","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Yunnan","egressLinkDirection":"西安","egressBytes":"159592722","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBytes":"158433592","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBytes":"156811248","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBytes":"156576054","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Heilongjiang","egressLinkDirection":"西宁","egressBytes":"156108237","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"155408172","serverProvince":"Gauteng","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"154722763","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"1536"},{"clientProvince":"Taiwan","egressLinkDirection":"太原","egressBytes":"154472580","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"154291956","serverProvince":"Yunnan","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"153030089","serverProvince":"New York","commonEgressLinkId":"256"},{"clientProvince":"Anhui","egressLinkDirection":"西安","egressBytes":"152872906","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"151842174","serverProvince":"England","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"148972079","serverProvince":"Hainan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"148499248","serverProvince":"Ningxia","commonEgressLinkId":"1792"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBytes":"147783337","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"147718164","serverProvince":"Papua","commonEgressLinkId":"1792"},{"clientProvince":"Hainan","egressLinkDirection":"西安","egressBytes":"145527307","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"145270640","serverProvince":"Noord-Holland","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"144511414","serverProvince":"Madrid, Comunidad de","commonEgressLinkId":"768"},{"clientProvince":"Hongkong","egressLinkDirection":"西安","egressBytes":"142663489","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"142401689","serverProvince":"Delhi","commonEgressLinkId":"1792"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBytes":"142153192","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Tokyo","egressLinkDirection":"西安","egressBytes":"141943435","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"141276756","serverProvince":"Yunnan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"140657165","serverProvince":"Region Metropolitana de Santiago","commonEgressLinkId":"768"},{"clientProvince":"Hongkong","egressLinkDirection":"太原","egressBytes":"140624436","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"140313058","serverProvince":"Praha, Hlavni mesto","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"139962039","serverProvince":"Ile-de-France","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"139397109","serverProvince":"Beyrouth","commonEgressLinkId":"1024"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBytes":"139305081","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBytes":"139258802","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"136908797","serverProvince":"Geneve","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"136856047","serverProvince":"Gyeonggi-do","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"136632751","serverProvince":"Auvergne-Rhone-Alpes","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"134589480","serverProvince":"Yunnan","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"133890314","serverProvince":"Bursa","commonEgressLinkId":"2816"},{"clientProvince":"Istanbul","egressLinkDirection":"太原","egressBytes":"133617735","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"130469788","serverProvince":"Niederosterreich","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"130006786","serverProvince":"Moscow","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"129964650","serverProvince":"Rizal","commonEgressLinkId":"1536"},{"clientProvince":"Taiwan","egressLinkDirection":"太原","egressBytes":"129875363","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBytes":"127969389","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"127794267","serverProvince":"Ningxia","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"126871995","serverProvince":"Taiwan","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"126790842","serverProvince":"Hainan","commonEgressLinkId":"256"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"126012526","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Illinois","egressLinkDirection":"太原","egressBytes":"124913700","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBytes":"124059975","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Tokyo","egressLinkDirection":"西宁","egressBytes":"122007525","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"121661221","serverProvince":"New Mexico","commonEgressLinkId":"2304"},{"clientProvince":"California","egressLinkDirection":"太原","egressBytes":"121371331","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBytes":"120729688","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"120210190","serverProvince":"Riau","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"119900221","serverProvince":"Quebec","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"119678942","serverProvince":"Osaka","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"119428963","serverProvince":"Yunnan","commonEgressLinkId":"512"},{"clientProvince":"Ankara","egressLinkDirection":"太原","egressBytes":"117349371","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"117304665","serverProvince":"Istanbul","commonEgressLinkId":"1280"},{"clientProvince":"Washington","egressLinkDirection":"太原","egressBytes":"115665188","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"114662153","serverProvince":"Georgia","commonEgressLinkId":"2304"},{"clientProvince":"Ningxia","egressLinkDirection":"西安","egressBytes":"111999147","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"111629395","serverProvince":"Guizhou","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"111530511","serverProvince":"Hovedstaden","commonEgressLinkId":"2048"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBytes":"110543699","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"110482743","serverProvince":"California","commonEgressLinkId":"512"},{"clientProvince":"Liaoning","egressLinkDirection":"西安","egressBytes":"110273361","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Washington","egressLinkDirection":"西安","egressBytes":"109771912","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"108652878","serverProvince":"Illinois","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"107244332","serverProvince":"Budapest","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"104868236","serverProvince":"Hallands lan","commonEgressLinkId":"1536"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBytes":"104656013","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"103595570","serverProvince":"Uusimaa","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"102922555","serverProvince":"Utrecht","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"101778792","serverProvince":"Guangxi","commonEgressLinkId":"2304"},{"clientProvince":"Heilongjiang","egressLinkDirection":"西安","egressBytes":"101492624","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Ohio","egressLinkDirection":"太原","egressBytes":"99353294","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"96813338","serverProvince":"Gyeonggi-do","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"94930778","serverProvince":"Udmurtskaya Respublika","commonEgressLinkId":"2048"},{"clientProvince":"Beijing","egressLinkDirection":"西安","egressBytes":"94717447","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Hainan","egressLinkDirection":"太原","egressBytes":"94350817","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBytes":"94181550","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"94053149","serverProvince":"Tokyo","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"94035392","serverProvince":"Minnesota","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"93954295","serverProvince":"Budapest","commonEgressLinkId":"1536"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBytes":"93931511","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"92263238","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"89776758","serverProvince":"New South Wales","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"86386854","serverProvince":"Campania","commonEgressLinkId":"2304"},{"clientProvince":"Shanxi","egressLinkDirection":"西安","egressBytes":"85990678","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"84777876","serverProvince":"Istanbul","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"84665600","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"256"},{"clientProvince":"Colorado","egressLinkDirection":"太原","egressBytes":"84553224","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"83957714","serverProvince":"Geneve","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"82935046","serverProvince":"Oregon","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"82031216","serverProvince":"Maharashtra","commonEgressLinkId":"1536"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBytes":"81936337","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"79691322","serverProvince":"Chongqing","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"79371327","serverProvince":"Heilongjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"79353185","serverProvince":"Noord-Holland","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"78682013","serverProvince":"Ile-de-France","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"78241821","serverProvince":"Izmir","commonEgressLinkId":"512"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBytes":"78235345","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBytes":"77021469","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"76226978","serverProvince":"Uusimaa","commonEgressLinkId":"2048"},{"clientProvince":"Guangxi","egressLinkDirection":"西安","egressBytes":"75432642","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBytes":"73930708","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"73586428","serverProvince":"Guangxi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"73183057","serverProvince":"Nei Mongol","commonEgressLinkId":"1024"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBytes":"72929438","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Hunan","egressLinkDirection":"西宁","egressBytes":"72519491","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"72302620","serverProvince":"Sao Paulo","commonEgressLinkId":"1792"},{"clientProvince":"Hamburg","egressLinkDirection":"太原","egressBytes":"72161589","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Liaoning","egressLinkDirection":"西安","egressBytes":"70056483","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"70048494","serverProvince":"Guizhou","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"69765671","serverProvince":"Dadra and Nagar Haveli","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"69050553","serverProvince":"Ohio","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"68200749","serverProvince":"Sachsen","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"67770748","serverProvince":"Ceara","commonEgressLinkId":"2048"},{"clientProvince":"Ciudad Autonoma de Buenos Aires","egressLinkDirection":"太原","egressBytes":"67554598","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"67067555","serverProvince":"Bern","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"66143723","serverProvince":"Hainan","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"66013103","serverProvince":"Stockholms lan","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"65429959","serverProvince":"Jilin","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"64330228","serverProvince":"Macao","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"63671610","serverProvince":"Jilin","commonEgressLinkId":"256"},{"clientProvince":"Shanghai","egressLinkDirection":"西安","egressBytes":"62654203","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Yunnan","egressLinkDirection":"西安","egressBytes":"61855884","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"61818551","serverProvince":"Ha Noi","commonEgressLinkId":"1280"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBytes":"61297351","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"61000837","serverProvince":"Colorado","commonEgressLinkId":"1024"},{"clientProvince":"Guangxi","egressLinkDirection":"西宁","egressBytes":"60928829","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"60180591","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"60026224","serverProvince":"San Luis Potosi","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"59748233","serverProvince":"Phnom Penh","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"59684953","serverProvince":"Quintana Roo","commonEgressLinkId":"768"},{"clientProvince":"Noord-Holland","egressLinkDirection":"太原","egressBytes":"59306732","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"58872844","serverProvince":"Guizhou","commonEgressLinkId":"2304"},{"clientProvince":"Singapore","egressLinkDirection":"太原","egressBytes":"58727896","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Singapore","egressLinkDirection":"太原","egressBytes":"58342576","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Singapore","egressLinkDirection":"太原","egressBytes":"56821642","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Abu Zaby","egressLinkDirection":"太原","egressBytes":"56422697","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Kerala","egressLinkDirection":"太原","egressBytes":"55473486","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"55085024","serverProvince":"Tianjin","commonEgressLinkId":"512"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBytes":"54164232","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"53734182","serverProvince":"North Carolina","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"53625342","serverProvince":"Ningxia","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"53493244","serverProvince":"New South Wales","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"52404926","serverProvince":"Nei Mongol","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"51816051","serverProvince":"Washington","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"51631390","serverProvince":"Karnataka","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"51507045","serverProvince":"Vlaams-Brabant","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"51336023","serverProvince":"Tierra del Fuego","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"51150076","serverProvince":"Jakarta Raya","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"50726338","serverProvince":"Primorskiy kray","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"49671621","serverProvince":"New York","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"49111241","serverProvince":"Jawa Barat","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"48501627","serverProvince":"Bac Kan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"47734935","serverProvince":"Texas","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"47411001","serverProvince":"Dublin","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"46979494","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"1280"},{"clientProvince":"Uttar Pradesh","egressLinkDirection":"太原","egressBytes":"46874519","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"46704773","serverProvince":"Georgia","commonEgressLinkId":"512"},{"clientProvince":"Colorado","egressLinkDirection":"太原","egressBytes":"46683173","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"46660447","serverProvince":"Tel Aviv","commonEgressLinkId":"1792"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBytes":"46454039","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"45528943","serverProvince":"Nei Mongol","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"45383853","serverProvince":"Dublin","commonEgressLinkId":"2304"},{"clientProvince":"Singapore","egressLinkDirection":"西安","egressBytes":"45290259","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"43480899","serverProvince":"Gyeonggi-do","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"42761639","serverProvince":"Massachusetts","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"42565494","serverProvince":"Yunnan","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"41790072","serverProvince":"Georgia","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"41532310","serverProvince":"Sao Paulo","commonEgressLinkId":"2048"},{"clientProvince":"Singapore","egressLinkDirection":"西安","egressBytes":"41279146","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"40501572","serverProvince":"Gia Lai","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"40420557","serverProvince":"Rizal","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"39990297","serverProvince":"Noord-Holland","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"39960767","serverProvince":"Heilongjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"39172094","serverProvince":"Taiwan","commonEgressLinkId":"1024"},{"clientProvince":"Lagos","egressLinkDirection":"太原","egressBytes":"39149124","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"California","egressLinkDirection":"西安","egressBytes":"39145482","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBytes":"39001928","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBytes":"38984185","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"38821550","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"38454262","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"38290341","serverProvince":"Jakarta Raya","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"37882909","serverProvince":"Moscow","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"37459781","serverProvince":"Sao Paulo","commonEgressLinkId":"2304"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBytes":"37457876","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"37089834","serverProvince":"Vasterbottens lan","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"36445782","serverProvince":"Jilin","commonEgressLinkId":"512"},{"clientProvince":"Parana","egressLinkDirection":"太原","egressBytes":"36237613","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Texas","egressLinkDirection":"太原","egressBytes":"35970980","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"35429394","serverProvince":"Jakarta Raya","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"35090412","serverProvince":"New York","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"34840911","serverProvince":"Sao Paulo","commonEgressLinkId":"1536"},{"clientProvince":"Fujian","egressLinkDirection":"西安","egressBytes":"32572174","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Washington","egressLinkDirection":"太原","egressBytes":"32428003","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"32421463","serverProvince":"Mato Grosso do Sul","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"32364591","serverProvince":"National Capital Region","commonEgressLinkId":"1792"},{"clientProvince":"Quebec","egressLinkDirection":"西宁","egressBytes":"32307907","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"31977882","serverProvince":"Taiwan","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"30878903","serverProvince":"Texas","commonEgressLinkId":"1280"},{"clientProvince":"Beijing","egressLinkDirection":"西安","egressBytes":"30464224","serverProvince":"","commonEgressLinkId":"1280"},{"clientProvince":"Tianjin","egressLinkDirection":"西安","egressBytes":"30121618","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBytes":"29232151","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"","egressLinkDirection":"太原","egressBytes":"29050388","serverProvince":"Ohio","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"28071133","serverProvince":"Ha Noi","commonEgressLinkId":"768"},{"clientProvince":"National Capital Region","egressLinkDirection":"太原","egressBytes":"28031137","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"California","egressLinkDirection":"太原","egressBytes":"27817394","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"27515580","serverProvince":"Cebu","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"27193904","serverProvince":"England","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"26744227","serverProvince":"Lombardia","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"26629208","serverProvince":"Baden-Wurttemberg","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"26509455","serverProvince":"Iowa","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"26125926","serverProvince":"Maharashtra","commonEgressLinkId":"1024"},{"clientProvince":"Rio Grande do Sul","egressLinkDirection":"太原","egressBytes":"24787716","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Antananarivo","egressLinkDirection":"太原","egressBytes":"24346337","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"22312181","serverProvince":"Arizona","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"21999236","serverProvince":"Stockholms lan","commonEgressLinkId":"512"},{"clientProvince":"Ho Chi Minh","egressLinkDirection":"西安","egressBytes":"21903929","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Hongkong","egressLinkDirection":"太原","egressBytes":"20741532","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBytes":"20251952","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"19998737","serverProvince":"Guizhou","commonEgressLinkId":"2816"},{"clientProvince":"Shanghai","egressLinkDirection":"西安","egressBytes":"19266843","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Singapore","egressLinkDirection":"太原","egressBytes":"19153693","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"17450526","serverProvince":"Pennsylvania","commonEgressLinkId":"768"},{"clientProvince":"Beijing","egressLinkDirection":"西宁","egressBytes":"17329203","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBytes":"17260571","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"16954209","serverProvince":"Yangon","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"16711567","serverProvince":"Gyeonggi-do","commonEgressLinkId":"2816"},{"clientProvince":"Washington","egressLinkDirection":"西宁","egressBytes":"16506371","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"16301591","serverProvince":"Gauteng","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"15363549","serverProvince":"Erevan","commonEgressLinkId":"2304"},{"clientProvince":"California","egressLinkDirection":"西安","egressBytes":"15317692","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"15170603","serverProvince":"Xizang","commonEgressLinkId":"256"},{"clientProvince":"Jakarta Raya","egressLinkDirection":"太原","egressBytes":"15044408","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBytes":"14512419","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBytes":"13439017","serverProvince":"","commonEgressLinkId":"512"},{"clientProvince":"Sao Paulo","egressLinkDirection":"西安","egressBytes":"12429668","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"11768916","serverProvince":"Reunion","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"9116507","serverProvince":"Tehran","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBytes":"8919383","serverProvince":"Ha Noi","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBytes":"8475439","serverProvince":"Hessen","commonEgressLinkId":"1024"},{"clientProvince":"Moscow","egressLinkDirection":"西安","egressBytes":"8167238","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"7672067","serverProvince":"Misamis Oriental","commonEgressLinkId":"1280"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBytes":"6260624","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Jilin","egressLinkDirection":"西宁","egressBytes":"5154201","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"5074750","serverProvince":"Chiba","commonEgressLinkId":"256"},{"clientProvince":"Hainan","egressLinkDirection":"太原","egressBytes":"3639334","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBytes":"843585","serverProvince":"Podkarpackie","commonEgressLinkId":"256"}],"resultType":"table"},"originalUrl":"http://192.168.44.55:9999?query=SELECT%20client_province%20AS%20client_province%2Cegress_link_direction%20AS%20egress_link_direction%2Ccommon_egress_link_id%20AS%20common_egress_link_id%2Cserver_province%20AS%20server_province%2CSUM%28traffic_outbound_byte%29%20AS%20egress_bytes%20FROM%20metric_link%20WHERE%20stat_time%20%3E%3D%201665553865%20AND%20stat_time%20%3C%201665557465%20AND%20notEmpty%28egress_link_direction%29%20GROUP%20BY%20client_province%2Cegress_link_direction%2Ccommon_egress_link_id%2Cserver_province%20ORDER%20BY%20egress_bytes%20DESC&format=json&option=real-time","success":true,"meta":[{"type":"string","name":"client_province","category":"Dimension"},{"type":"string","name":"egress_link_direction","category":"Dimension"},{"type":"long","name":"common_egress_link_id","category":"Dimension"},{"type":"string","name":"server_province","category":"Dimension"},{"type":"long","name":"egress_bytes","category":"Metric"}],"formatType":"json","status":200,"statistics":{"result_rows":914,"bytes_read":654501,"elapsed":4,"rows_read":9082,"result_size":120250}}*/
