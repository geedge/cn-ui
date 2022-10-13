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
        ingressBitsRate: '5604323120',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '4895392761',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '4814817940',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '4090070063',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '4049453979',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '3784403480',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '3710664123',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '3653407030',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '3371993955',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '3352297278',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '2634690236',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '2030067839',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '1937216782',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '1755711057',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '1657787141',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '1254821363',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '1246001598',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '2049',
        ingressBitsRate: '1221072621',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '1181549901',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '1161689269',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '1059917055',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '1052285463',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '769',
        ingressBitsRate: '1017069335',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '997474163',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '969823257',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '966304726',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '962623571',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '959195720',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '948900101',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '2817',
        ingressBitsRate: '920720265',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '917674691',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '888578323',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '852554980',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '850380806',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '829559925',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '809552700',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '804704301',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '781436925',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '761982895',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '760081501',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '742496479',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '719223843',
        serverProvince: 'Beijing'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '1025',
        ingressBitsRate: '714911627',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '712848454',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '697683613',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '664163245',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '649768711',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '637538588',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '621699041',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '614610310',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '2305',
        ingressBitsRate: '612712311',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '608605887',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '606609681',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '579871891',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '563244876',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '545891764',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1793',
        ingressBitsRate: '539800397',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '1793',
        ingressBitsRate: '524913397',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '520046288',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '511899844',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '488789796',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '487756088',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '483164068',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '480436083',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '480205415',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '476826618',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '473016628',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '472617430',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '468520809',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '467966390',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '467114073',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '2305',
        ingressBitsRate: '465814161',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '2817',
        ingressBitsRate: '456113269',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '449372255',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '2305',
        ingressBitsRate: '441956776',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '438304071',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '435171140',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '414875616',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '414570978',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '411153294',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '401981144',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '397567721',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '1537',
        ingressBitsRate: '395561375',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '394231723',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '392255758',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '390985756',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '389957465',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '389662360',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '1537',
        ingressBitsRate: '389160519',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hebei',
        commonIngressLinkId: '1281',
        ingressBitsRate: '385352295',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '384494096',
        serverProvince: 'Jiangsu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '374984189',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '372216099',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '364508246',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '362768823',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '360296241',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '360262254',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '355733923',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '344652638',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '344135294',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '343110470',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Gansu',
        commonIngressLinkId: '257',
        ingressBitsRate: '340471786',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '1281',
        ingressBitsRate: '335534018',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '1537',
        ingressBitsRate: '333528793',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '333209548',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '333043196',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '769',
        ingressBitsRate: '332199739',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '331243505',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '2817',
        ingressBitsRate: '328705261',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '327225423',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '1281',
        ingressBitsRate: '326841971',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1537',
        ingressBitsRate: '326768639',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '324625756',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '319941672',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '318686877',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '2049',
        ingressBitsRate: '318444356',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '315231568',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '312577605',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '2817',
        ingressBitsRate: '312029300',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '308882437',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '298350344',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shandong',
        commonIngressLinkId: '2817',
        ingressBitsRate: '290111455',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '769',
        ingressBitsRate: '290017314',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '289879746',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '287715643',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '286510770',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '513',
        ingressBitsRate: '284553267',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '2305',
        ingressBitsRate: '283311145',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '281270311',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '279000915',
        serverProvince: 'Hongkong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '278405212',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '272842506',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '272613649',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '270887893',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '2817',
        ingressBitsRate: '270860511',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '267979575',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '267485792',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '267376598',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hebei',
        commonIngressLinkId: '1025',
        ingressBitsRate: '267219087',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '257',
        ingressBitsRate: '266961943',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '2049',
        ingressBitsRate: '265172583',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '262339238',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '261772331',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '2305',
        ingressBitsRate: '261750220',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '261423093',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '260782109',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '1793',
        ingressBitsRate: '260514984',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '259951646',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '259033600',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '258041252',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '1793',
        ingressBitsRate: '257978825',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '255980420',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '252566718',
        serverProvince: 'Udmurtskaya Respublika'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '248514511',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '247554639',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Henan',
        commonIngressLinkId: '1025',
        ingressBitsRate: '245328917',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '257',
        ingressBitsRate: '244528540',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '242850372',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hubei',
        commonIngressLinkId: '1025',
        ingressBitsRate: '242769513',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '241059422',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '1793',
        ingressBitsRate: '239908490',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '239696863',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '238756802',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '238618793',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '237900867',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '235846410',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '233290052',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '769',
        ingressBitsRate: '230547003',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '227315224',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '225252499',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '225168058',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '225133906',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '221028852',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '220107120',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '218969935',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '217742704',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '217091517',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '216578712',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '215854423',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '214549138',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '213319071',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '2817',
        ingressBitsRate: '213063507',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '769',
        ingressBitsRate: '212809830',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '210847103',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '208926102',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '207895511',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '2305',
        ingressBitsRate: '203110418',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '257',
        ingressBitsRate: '201511565',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '769',
        ingressBitsRate: '201010773',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '1281',
        ingressBitsRate: '199850015',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '198451189',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '196314643',
        serverProvince: 'Ha Noi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '195457389',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '769',
        ingressBitsRate: '194079213',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '191262200',
        serverProvince: 'Vlaams-Brabant'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '189987609',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '189615279',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '189568160',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '2049',
        ingressBitsRate: '188416745',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '188019618',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '187326786',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1025',
        ingressBitsRate: '186596033',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '185935945',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'California',
        commonIngressLinkId: '513',
        ingressBitsRate: '185247278',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '2049',
        ingressBitsRate: '180941198',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Anhui',
        commonIngressLinkId: '1025',
        ingressBitsRate: '179578868',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '177793450',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '513',
        ingressBitsRate: '177458766',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '257',
        ingressBitsRate: '176777534',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '175677589',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '174784552',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '174748846',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '173718654',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '172615152',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Henan',
        commonIngressLinkId: '2817',
        ingressBitsRate: '170417629',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '169905564',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '1537',
        ingressBitsRate: '169314930',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '169110710',
        serverProvince: 'Guangdong'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '1793',
        ingressBitsRate: '167916507',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '167432752',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '1025',
        ingressBitsRate: '166857612',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '2049',
        ingressBitsRate: '165960150',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '165705067',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '165077379',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '513',
        ingressBitsRate: '163432621',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '1537',
        ingressBitsRate: '162449499',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '162257529',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '161120458',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '160403805',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '160157006',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '158288176',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '156064889',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '155657594',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Anhui',
        commonIngressLinkId: '513',
        ingressBitsRate: '155119590',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '513',
        ingressBitsRate: '155027009',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '2305',
        ingressBitsRate: '155008328',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '154571357',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '154447984',
        serverProvince: 'Shandong'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Gansu',
        commonIngressLinkId: '2817',
        ingressBitsRate: '154209971',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '152617553',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '152592730',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '152443701',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '151886088',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '151068684',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '2305',
        ingressBitsRate: '150646267',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '150357742',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '148137028',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Henan',
        commonIngressLinkId: '1537',
        ingressBitsRate: '147979347',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hubei',
        commonIngressLinkId: '257',
        ingressBitsRate: '147480447',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '147079506',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '143937242',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '142298819',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '2049',
        ingressBitsRate: '141936104',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '141298309',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '2305',
        ingressBitsRate: '140868630',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '140764401',
        serverProvince: 'Karnataka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Gansu',
        commonIngressLinkId: '2049',
        ingressBitsRate: '140634874',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '513',
        ingressBitsRate: '140567522',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '140054538',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '139546075',
        serverProvince: 'Zhejiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '138829897',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '137103009',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '1793',
        ingressBitsRate: '136227509',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '2049',
        ingressBitsRate: '135349524',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '1793',
        ingressBitsRate: '135249676',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '513',
        ingressBitsRate: '134139808',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '257',
        ingressBitsRate: '133538698',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '130496391',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hunan',
        commonIngressLinkId: '1025',
        ingressBitsRate: '129257678',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '2305',
        ingressBitsRate: '128899684',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '128075927',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1025',
        ingressBitsRate: '127557246',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '2817',
        ingressBitsRate: '127084820',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '126371315',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '1793',
        ingressBitsRate: '125189365',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '124971450',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '124851041',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1537',
        ingressBitsRate: '124200163',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Ho Chi Minh',
        commonIngressLinkId: '257',
        ingressBitsRate: '123204675',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Henan',
        commonIngressLinkId: '257',
        ingressBitsRate: '123112372',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '1281',
        ingressBitsRate: '122304979',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '1025',
        ingressBitsRate: '122142097',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '121088656',
        serverProvince: 'Hunan'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Shandong',
        commonIngressLinkId: '1025',
        ingressBitsRate: '120838702',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '120097340',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '2817',
        ingressBitsRate: '119284148',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '119050866',
        serverProvince: 'Ha Noi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '118975273',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '257',
        ingressBitsRate: '118794072',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '1793',
        ingressBitsRate: '118737151',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Anhui',
        commonIngressLinkId: '2817',
        ingressBitsRate: '118697185',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '513',
        ingressBitsRate: '118400473',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '118145879',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '117681686',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '111017521',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '110436944',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '109370149',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '108692682',
        serverProvince: 'Maharashtra'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '108684927',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '108681031',
        serverProvince: 'Rizal'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hunan',
        commonIngressLinkId: '2817',
        ingressBitsRate: '108252873',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '108194600',
        serverProvince: 'Washington'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '107899812',
        serverProvince: "Zabaykal'skiy kray"
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '1025',
        ingressBitsRate: '107266715',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '257',
        ingressBitsRate: '107209808',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '2305',
        ingressBitsRate: '107192539',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '107091002',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '106256991',
        serverProvince: 'Quebec'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '105916525',
        serverProvince: 'Fujian'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '105681666',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '105603212',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '104517050',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '103146138',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '1281',
        ingressBitsRate: '102869100',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '1537',
        ingressBitsRate: '102701654',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '1537',
        ingressBitsRate: '102536864',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Noord-Holland',
        commonIngressLinkId: '2305',
        ingressBitsRate: '102238139',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '769',
        ingressBitsRate: '102127537',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '101191986',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '100771900',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '1537',
        ingressBitsRate: '100412883',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangsu',
        commonIngressLinkId: '769',
        ingressBitsRate: '98435371',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '96707463',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '96429011',
        serverProvince: 'National Capital Region'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '96095542',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '96080063',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '96062467',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '96062000',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '93629590',
        serverProvince: 'Primorskiy kray'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '513',
        ingressBitsRate: '93536457',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '1281',
        ingressBitsRate: '92577018',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Rio Grande do Sul',
        commonIngressLinkId: '1537',
        ingressBitsRate: '92109454',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '91739894',
        serverProvince: 'Bayern'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '513',
        ingressBitsRate: '91555498',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '1793',
        ingressBitsRate: '91054997',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '2049',
        ingressBitsRate: '89790955',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '89622448',
        serverProvince: 'Massachusetts'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '88578236',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '88491847',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '88211331',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '769',
        ingressBitsRate: '88208687',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '87963365',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '86024448',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '85914301',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '2049',
        ingressBitsRate: '84822349',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Kuala Lumpur',
        commonIngressLinkId: '257',
        ingressBitsRate: '84766458',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '84670691',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '84205432',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '83976804',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hebei',
        commonIngressLinkId: '2817',
        ingressBitsRate: '83791957',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '83473929',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hubei',
        commonIngressLinkId: '2817',
        ingressBitsRate: '83189515',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '257',
        ingressBitsRate: '82465476',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '81280771',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '81114674',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '80456635',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '79644866',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '78732563',
        serverProvince: 'Iowa'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '78335322',
        serverProvince: 'Hebei'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '78204972',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '257',
        ingressBitsRate: '77885122',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Gansu',
        commonIngressLinkId: '1793',
        ingressBitsRate: '77777758',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Zug',
        commonIngressLinkId: '1281',
        ingressBitsRate: '77315285',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '77197494',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '76054652',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Singapore',
        commonIngressLinkId: '1025',
        ingressBitsRate: '75083472',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '74506579',
        serverProvince: 'Shaanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '74472031',
        serverProvince: 'Washington'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '72219724',
        serverProvince: 'Maharashtra'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '71828965',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Ciudad Autonoma de Buenos Aires',
        commonIngressLinkId: '257',
        ingressBitsRate: '71170874',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1281',
        ingressBitsRate: '71138505',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '70658386',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '70523568',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '70395248',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '70239762',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '2817',
        ingressBitsRate: '69426463',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '69398959',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '69341613',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '2049',
        ingressBitsRate: '69056141',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Anhui',
        commonIngressLinkId: '2049',
        ingressBitsRate: '68523286',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Qinghai',
        commonIngressLinkId: '2305',
        ingressBitsRate: '68196514',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '2049',
        ingressBitsRate: '68129312',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '1281',
        ingressBitsRate: '67768047',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '67697735',
        serverProvince: 'Agusan del Norte'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '66700379',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ohio',
        commonIngressLinkId: '2305',
        ingressBitsRate: '66412037',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1281',
        ingressBitsRate: '66220688',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '65767367',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '65400961',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '513',
        ingressBitsRate: '65289765',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '257',
        ingressBitsRate: '64812401',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '64090619',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '1793',
        ingressBitsRate: '63957889',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '63934789',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '63926703',
        serverProvince: 'Hubei'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '2817',
        ingressBitsRate: '63695411',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Shaanxi',
        commonIngressLinkId: '1025',
        ingressBitsRate: '62921875',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '62880820',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '62773733',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Henan',
        commonIngressLinkId: '1281',
        ingressBitsRate: '62727725',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '2305',
        ingressBitsRate: '62619407',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '62542998',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '2049',
        ingressBitsRate: '62407460',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '2305',
        ingressBitsRate: '62133708',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '62063111',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '61232971',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hebei',
        commonIngressLinkId: '257',
        ingressBitsRate: '60799860',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '60732330',
        serverProvince: 'Zuid-Holland'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hubei',
        commonIngressLinkId: '1281',
        ingressBitsRate: '60568178',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '60393532',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '2305',
        ingressBitsRate: '60270024',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Gansu',
        commonIngressLinkId: '1025',
        ingressBitsRate: '59795347',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Gansu',
        commonIngressLinkId: '1537',
        ingressBitsRate: '58190897',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sao Paulo',
        commonIngressLinkId: '2049',
        ingressBitsRate: '57820353',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '1025',
        ingressBitsRate: '57641605',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '56922651',
        serverProvince: 'Istanbul'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '2049',
        ingressBitsRate: '56730732',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '54408660',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '2049',
        ingressBitsRate: '54391731',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '53252539',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '53050301',
        serverProvince: 'Ha Noi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Fujian',
        commonIngressLinkId: '257',
        ingressBitsRate: '52684834',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '52658795',
        serverProvince: 'Region Metropolitana de Santiago'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '769',
        ingressBitsRate: '52427289',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Beijing',
        commonIngressLinkId: '2817',
        ingressBitsRate: '50675567',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '50663211',
        serverProvince: 'Xizang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '50476661',
        serverProvince: 'Dublin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '50464578',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '50155003',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '49828754',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '49254383',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '49019176',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '48949685',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '48920540',
        serverProvince: 'Ontario'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '48848999',
        serverProvince: 'Dimashq'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '48837399',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '48546356',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '2817',
        ingressBitsRate: '48032676',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '47817127',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '47685624',
        serverProvince: 'Liaoning'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '1793',
        ingressBitsRate: '47618719',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '47618027',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '46863621',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '46408617',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Fujian',
        commonIngressLinkId: '1793',
        ingressBitsRate: '46235403',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '1537',
        ingressBitsRate: '46158052',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '1025',
        ingressBitsRate: '46012150',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '45652773',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '2049',
        ingressBitsRate: '45626863',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '769',
        ingressBitsRate: '45275622',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '45001469',
        serverProvince: 'New South Wales'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '1281',
        ingressBitsRate: '44835716',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '769',
        ingressBitsRate: '44007026',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '43943315',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '43916191',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '43788945',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '43625170',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '2049',
        ingressBitsRate: '43373723',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shandong',
        commonIngressLinkId: '1281',
        ingressBitsRate: '42787100',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '42745453',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '42611425',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '42580319',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '1281',
        ingressBitsRate: '42408817',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jilin',
        commonIngressLinkId: '2817',
        ingressBitsRate: '42374544',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '769',
        ingressBitsRate: '42188475',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '42049919',
        serverProvince: 'Mazowieckie'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '41972026',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '41645869',
        serverProvince: 'Geneve'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '41621243',
        serverProvince: 'Pennsylvania'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '513',
        ingressBitsRate: '41500099',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '1793',
        ingressBitsRate: '41060051',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '769',
        ingressBitsRate: '41007475',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '1793',
        ingressBitsRate: '40989520',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '40806459',
        serverProvince: 'Jakarta Raya'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shandong',
        commonIngressLinkId: '257',
        ingressBitsRate: '40793814',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '40394879',
        serverProvince: 'Sao Paulo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hainan',
        commonIngressLinkId: '2305',
        ingressBitsRate: '40394749',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '40350138',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '40082124',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '40065591',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '39756646',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Beijing',
        commonIngressLinkId: '257',
        ingressBitsRate: '39253365',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '39066104',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Abu Zaby',
        commonIngressLinkId: '2305',
        ingressBitsRate: '38866633',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1793',
        ingressBitsRate: '38824465',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '38728763',
        serverProvince: 'Arizona'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '38655011',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '257',
        ingressBitsRate: '38563970',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '38558648',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '38445211',
        serverProvince: 'Papua'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '38441155',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '1793',
        ingressBitsRate: '38333446',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '38205882',
        serverProvince: 'Washington'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '2817',
        ingressBitsRate: '38022282',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Quebec',
        commonIngressLinkId: '1281',
        ingressBitsRate: '37956418',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '769',
        ingressBitsRate: '37818521',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '37789745',
        serverProvince: 'Sao Paulo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '37638486',
        serverProvince: 'Ceara'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '37521906',
        serverProvince: 'Delhi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '37465486',
        serverProvince: 'New Mexico'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '1537',
        ingressBitsRate: '37429352',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '37416787',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '36571545',
        serverProvince: 'Ho Chi Minh'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shandong',
        commonIngressLinkId: '513',
        ingressBitsRate: '35991542',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '2305',
        ingressBitsRate: '35547995',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '35141658',
        serverProvince: 'Lombardia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '34675123',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '1793',
        ingressBitsRate: '34363688',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '34348169',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '34280561',
        serverProvince: 'Baden-Wurttemberg'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hainan',
        commonIngressLinkId: '1537',
        ingressBitsRate: '34158450',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '33900556',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '33723478',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '33468379',
        serverProvince: 'Quintana Roo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '1793',
        ingressBitsRate: '33379450',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '769',
        ingressBitsRate: '33371399',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '33031756',
        serverProvince: 'Beyrouth'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hebei',
        commonIngressLinkId: '2049',
        ingressBitsRate: '32871059',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '2817',
        ingressBitsRate: '32593562',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '32527122',
        serverProvince: 'Ontario'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '1537',
        ingressBitsRate: '32511721',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '32505189',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '769',
        ingressBitsRate: '32454313',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '32355460',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '31888659',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '31615270',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '31507932',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '31470288',
        serverProvince: 'Nordrhein-Westfalen'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '2305',
        ingressBitsRate: '31416195',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Islamabad',
        commonIngressLinkId: '513',
        ingressBitsRate: '31337035',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '31317528',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '31289869',
        serverProvince: 'Moscow'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '31123256',
        serverProvince: 'Anhui'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '31064025',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '31045206',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '30476807',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '30333343',
        serverProvince: 'California'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '29351475',
        serverProvince: 'Bern'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '29151801',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '1793',
        ingressBitsRate: '29053301',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '28808019',
        serverProvince: 'San Luis Potosi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '2305',
        ingressBitsRate: '28583345',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '1025',
        ingressBitsRate: '28394029',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '257',
        ingressBitsRate: '28392039',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '28388355',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '28318651',
        serverProvince: 'Shanxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Anhui',
        commonIngressLinkId: '257',
        ingressBitsRate: '28308994',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '28288367',
        serverProvince: 'Goias'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '2305',
        ingressBitsRate: '28260159',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '1281',
        ingressBitsRate: '28114303',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Fujian',
        commonIngressLinkId: '2049',
        ingressBitsRate: '27856336',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Fujian',
        commonIngressLinkId: '2817',
        ingressBitsRate: '27778405',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '2817',
        ingressBitsRate: '27417139',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '1025',
        ingressBitsRate: '27267137',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '26879468',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '26608565',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '2305',
        ingressBitsRate: '26528654',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Madhya Pradesh',
        commonIngressLinkId: '769',
        ingressBitsRate: '26525387',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '1025',
        ingressBitsRate: '26426858',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '2049',
        ingressBitsRate: '26257206',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ankara',
        commonIngressLinkId: '513',
        ingressBitsRate: '26192289',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '26109011',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '26015954',
        serverProvince: 'Jiangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '25846999',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Moscow',
        commonIngressLinkId: '769',
        ingressBitsRate: '25792760',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '25713427',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '25625391',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '25421010',
        serverProvince: 'Phnom Penh'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '25382843',
        serverProvince: 'Hallands lan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '1537',
        ingressBitsRate: '25210615',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '24893265',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '24785588',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '769',
        ingressBitsRate: '24702293',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '24437330',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Fujian',
        commonIngressLinkId: '513',
        ingressBitsRate: '24417958',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Parana',
        commonIngressLinkId: '2817',
        ingressBitsRate: '24224529',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '24158863',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '24035017',
        serverProvince: 'Gansu'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '24033873',
        serverProvince: 'Colorado'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '23940182',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '23767004',
        serverProvince: 'Xizang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '23673482',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '1025',
        ingressBitsRate: '23664804',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '23664533',
        serverProvince: 'Moscow'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '23522328',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '23515860',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Colorado',
        commonIngressLinkId: '769',
        ingressBitsRate: '23357936',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '2049',
        ingressBitsRate: '23327292',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '23293938',
        serverProvince: 'Puebla'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Kerala',
        commonIngressLinkId: '1281',
        ingressBitsRate: '23250940',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '23140094',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '23061417',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '22966453',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Washington',
        commonIngressLinkId: '257',
        ingressBitsRate: '22924878',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '22420990',
        serverProvince: 'Texas'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '22265594',
        serverProvince: 'Henan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '2817',
        ingressBitsRate: '22204871',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '22189850',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '22087346',
        serverProvince: 'Nordrhein-Westfalen'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xizang',
        commonIngressLinkId: '257',
        ingressBitsRate: '21925195',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '21820781',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '1537',
        ingressBitsRate: '21727634',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '21551041',
        serverProvince: 'Istanbul'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '2817',
        ingressBitsRate: '21541800',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '769',
        ingressBitsRate: '21513316',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Washington',
        commonIngressLinkId: '769',
        ingressBitsRate: '21495282',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '21464335',
        serverProvince: 'Stockholms lan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '21377800',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '513',
        ingressBitsRate: '21314420',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '21149900',
        serverProvince: 'Vasterbottens lan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '21132442',
        serverProvince: "Chelyabinskaya oblast'"
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Anhui',
        commonIngressLinkId: '1537',
        ingressBitsRate: '21079022',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Istanbul',
        commonIngressLinkId: '2305',
        ingressBitsRate: '21032918',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Gansu',
        commonIngressLinkId: '1281',
        ingressBitsRate: '20985430',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '20928539',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '20849195',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '20791843',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '1537',
        ingressBitsRate: '20735625',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '2305',
        ingressBitsRate: '20689599',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '20684441',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '20629711',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '20523455',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Fujian',
        commonIngressLinkId: '1537',
        ingressBitsRate: '20368690',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '1281',
        ingressBitsRate: '20272515',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '20138062',
        serverProvince: 'Erevan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '20070522',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '20019049',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '19939621',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '19938244',
        serverProvince: 'Bac Kan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '19820721',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '19648965',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '769',
        ingressBitsRate: '19518519',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '19435075',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '19225419',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '19097102',
        serverProvince: 'Auvergne-Rhone-Alpes'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '257',
        ingressBitsRate: '19093170',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '1537',
        ingressBitsRate: '19032850',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Zhejiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '18964180',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Antananarivo',
        commonIngressLinkId: '1281',
        ingressBitsRate: '18931802',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '18501343',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '1025',
        ingressBitsRate: '18276357',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Illinois',
        commonIngressLinkId: '1537',
        ingressBitsRate: '18248497',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '18063723',
        serverProvince: 'Pais Vasco'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '17988198',
        serverProvince: 'Mato Grosso do Sul'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '17799587',
        serverProvince: 'Tierra del Fuego'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '2049',
        ingressBitsRate: '17789957',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '17753669',
        serverProvince: 'Tehran'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '17571166',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '17540542',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '17450051',
        serverProvince: 'Tokyo'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '17448232',
        serverProvince: 'Nordrhein-Westfalen'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '17413011',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '2049',
        ingressBitsRate: '17355087',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '17251491',
        serverProvince: 'Gauteng'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Colorado',
        commonIngressLinkId: '513',
        ingressBitsRate: '17135875',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '1793',
        ingressBitsRate: '16832562',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '513',
        ingressBitsRate: '16686104',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '16673883',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '16652938',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '16501585',
        serverProvince: 'Ad Dawhah'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '16412793',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '16314462',
        serverProvince: 'Riau'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Beijing',
        commonIngressLinkId: '257',
        ingressBitsRate: '16210624',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '15918454',
        serverProvince: 'Alabama'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '15670517',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '513',
        ingressBitsRate: '15634699',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '15547487',
        serverProvince: 'Praha, Hlavni mesto'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '15470219',
        serverProvince: 'Stockholms lan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '257',
        ingressBitsRate: '15396691',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Washington',
        commonIngressLinkId: '2049',
        ingressBitsRate: '15164060',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '15163920',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '2305',
        ingressBitsRate: '15160915',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '14980989',
        serverProvince: 'Madrid, Comunidad de'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '14976425',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '14887162',
        serverProvince: 'Gauteng'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Phnom Penh',
        commonIngressLinkId: '513',
        ingressBitsRate: '14879341',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Anhui',
        commonIngressLinkId: '769',
        ingressBitsRate: '14855395',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '14828953',
        serverProvince: 'Ohio'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '14755579',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '14734852',
        serverProvince: 'New York'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '14729720',
        serverProvince: 'Bayern'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '513',
        ingressBitsRate: '14597753',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Noord-Holland',
        commonIngressLinkId: '257',
        ingressBitsRate: '14501939',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '14421460',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '14399689',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '1537',
        ingressBitsRate: '14235942',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '1537',
        ingressBitsRate: '14216057',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xizang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '14143024',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Seoul-teukbyeolsi',
        commonIngressLinkId: '2305',
        ingressBitsRate: '14141052',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '1025',
        ingressBitsRate: '14139793',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Shanghai',
        commonIngressLinkId: '257',
        ingressBitsRate: '14060807',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '14041331',
        serverProvince: 'Ha Noi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '13954108',
        serverProvince: 'Sichuan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '513',
        ingressBitsRate: '13767874',
        serverProvince: 'Ohio'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '13678469',
        serverProvince: 'North Carolina'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '13641174',
        serverProvince: 'Dublin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '13587702',
        serverProvince: 'Gyeonggi-do'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '13510957',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hainan',
        commonIngressLinkId: '1793',
        ingressBitsRate: '13352745',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '1281',
        ingressBitsRate: '13247399',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '13163541',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '12965849',
        serverProvince: 'Sachsen'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '12816195',
        serverProvince: 'Saitama'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '257',
        ingressBitsRate: '12789253',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '1793',
        ingressBitsRate: '12688331',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '513',
        ingressBitsRate: '12568252',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '12447453',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Gansu',
        commonIngressLinkId: '2305',
        ingressBitsRate: '12435404',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '12384182',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Ningxia',
        commonIngressLinkId: '2049',
        ingressBitsRate: '12280739',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'California',
        commonIngressLinkId: '2305',
        ingressBitsRate: '12100636',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '11992386',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '11942268',
        serverProvince: 'Etela-Savo'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '1025',
        ingressBitsRate: '11941776',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '11877316',
        serverProvince: 'Noord-Holland'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '11719886',
        serverProvince: 'Cebu'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '11625987',
        serverProvince: 'Qinghai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nei Mongol',
        commonIngressLinkId: '513',
        ingressBitsRate: '11599866',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '11570716',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '11389141',
        serverProvince: 'New South Wales'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '11366213',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '1281',
        ingressBitsRate: '11365098',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '513',
        ingressBitsRate: '11212297',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xizang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '11197929',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jakarta Raya',
        commonIngressLinkId: '2305',
        ingressBitsRate: '11174502',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '11156732',
        serverProvince: 'Taiwan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: '',
        commonIngressLinkId: '1281',
        ingressBitsRate: '11136963',
        serverProvince: 'Tianjin'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '10888927',
        serverProvince: 'Izmir'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '10791738',
        serverProvince: 'Ciudad Autonoma de Buenos Aires'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '10788231',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '10765303',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'California',
        commonIngressLinkId: '1793',
        ingressBitsRate: '10617918',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '10246640',
        serverProvince: 'Nei Mongol'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '10206520',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Singapore',
        commonIngressLinkId: '1281',
        ingressBitsRate: '10002149',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '9945352',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '9886044',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Sichuan',
        commonIngressLinkId: '1537',
        ingressBitsRate: '9854016',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '9681941',
        serverProvince: 'Macao'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '9561690',
        serverProvince: 'Indiana'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '2049',
        ingressBitsRate: '9552558',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '1281',
        ingressBitsRate: '9499147',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '9469127',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '9463626',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '9453855',
        serverProvince: 'Minnesota'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '9248633',
        serverProvince: 'Ohio'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '9238927',
        serverProvince: 'Uttar Pradesh'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '9119020',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '9112163',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '9073034',
        serverProvince: 'Niederosterreich'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Tokyo',
        commonIngressLinkId: '257',
        ingressBitsRate: '9060532',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '9005663',
        serverProvince: 'Florida'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '513',
        ingressBitsRate: '8896921',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '1793',
        ingressBitsRate: '8818507',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '8817147',
        serverProvince: 'Osaka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '8796733',
        serverProvince: 'Virginia'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '8680668',
        serverProvince: 'Georgia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '8666491',
        serverProvince: 'Maharashtra'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '8526490',
        serverProvince: 'Noord-Holland'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '8475842',
        serverProvince: 'Chongqing'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '8424341',
        serverProvince: 'Karnataka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xizang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '8401618',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '8261168',
        serverProvince: 'Budapest'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '8248464',
        serverProvince: 'Texas'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Lagos',
        commonIngressLinkId: '2817',
        ingressBitsRate: '8214677',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '8149840',
        serverProvince: 'Arizona'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '7929455',
        serverProvince: 'New South Wales'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '7888740',
        serverProvince: 'New South Wales'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '513',
        ingressBitsRate: '7829356',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '7762421',
        serverProvince: 'Yangon'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Nouvelle-Aquitaine',
        commonIngressLinkId: '513',
        ingressBitsRate: '7658928',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hainan',
        commonIngressLinkId: '257',
        ingressBitsRate: '7653163',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jiangxi',
        commonIngressLinkId: '1281',
        ingressBitsRate: '7573608',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '7566449',
        serverProvince: 'Gia Lai'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '7532028',
        serverProvince: 'Ile-de-France'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '7530333',
        serverProvince: 'Noord-Holland'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tokyo',
        commonIngressLinkId: '769',
        ingressBitsRate: '7504899',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '7275915',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '7257002',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '7250638',
        serverProvince: 'Illinois'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '7236205',
        serverProvince: 'Noord-Holland'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '7216504',
        serverProvince: 'Hessen'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '7191790',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '7191562',
        serverProvince: 'Guangxi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '1537',
        ingressBitsRate: '7178274',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '7135431',
        serverProvince: 'Uusimaa'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hunan',
        commonIngressLinkId: '257',
        ingressBitsRate: '7128348',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '7123169',
        serverProvince: 'Misamis Oriental'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '7095907',
        serverProvince: 'Gyeonggi-do'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '7040198',
        serverProvince: 'Bahia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tunis',
        commonIngressLinkId: '1537',
        ingressBitsRate: '6900462',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '6863478',
        serverProvince: 'Sankt-Peterburg'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '6857167',
        serverProvince: 'Colorado'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '6836373',
        serverProvince: 'Ciudad Autonoma de Buenos Aires'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '6698813',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tokyo',
        commonIngressLinkId: '1793',
        ingressBitsRate: '6603723',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '6592254',
        serverProvince: 'Krung Thep Maha Nakhon'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '6578970',
        serverProvince: 'Rizal'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '6439375',
        serverProvince: 'Utrecht'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '6337687',
        serverProvince: 'Hovedstaden'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '6317065',
        serverProvince: 'Hyogo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '6293482',
        serverProvince: 'Ho Chi Minh'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Texas',
        commonIngressLinkId: '1281',
        ingressBitsRate: '6219207',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '2305',
        ingressBitsRate: '6191466',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '6127516',
        serverProvince: 'Uusimaa'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '6002064',
        serverProvince: 'Rio de Janeiro'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '5938100',
        serverProvince: 'National Capital Region'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '5907549',
        serverProvince: 'Uttar Pradesh'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Jilin',
        commonIngressLinkId: '1025',
        ingressBitsRate: '5812643',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '5795545',
        serverProvince: 'Riau'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '5711544',
        serverProvince: 'Ho Chi Minh'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Anhui',
        commonIngressLinkId: '1281',
        ingressBitsRate: '5688595',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '5522488',
        serverProvince: 'Hainan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Uttar Pradesh',
        commonIngressLinkId: '2817',
        ingressBitsRate: '5481910',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '5467740',
        serverProvince: 'Tel Aviv'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '513',
        ingressBitsRate: '5456403',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '5455866',
        serverProvince: 'Gauteng'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '5411234',
        serverProvince: 'Kuala Lumpur'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Uttar Pradesh',
        commonIngressLinkId: '1793',
        ingressBitsRate: '5363154',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '5343288',
        serverProvince: 'Stockholms lan'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '5281688',
        serverProvince: 'Bursa'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '5281494',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '5280882',
        serverProvince: 'Osaka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '5273349',
        serverProvince: 'England'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '5237695',
        serverProvince: 'Dadra and Nagar Haveli'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '5200832',
        serverProvince: 'Jakarta Raya'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hainan',
        commonIngressLinkId: '769',
        ingressBitsRate: '5169909',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Singapore',
        commonIngressLinkId: '1537',
        ingressBitsRate: '5154630',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '5109717',
        serverProvince: 'Budapest'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Shanxi',
        commonIngressLinkId: '2049',
        ingressBitsRate: '5085908',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '5070080',
        serverProvince: 'Sao Paulo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Yunnan',
        commonIngressLinkId: '513',
        ingressBitsRate: '4886447',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '4884053',
        serverProvince: 'Moscow'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Singapore',
        commonIngressLinkId: '257',
        ingressBitsRate: '4705799',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '4696886',
        serverProvince: 'Praha, Hlavni mesto'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '4617610',
        serverProvince: 'Guizhou'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '4562164',
        serverProvince: 'Mazowieckie'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1793',
        ingressBitsRate: '4517009',
        serverProvince: 'Gyeonggi-do'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '4451450',
        serverProvince: 'Osaka'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '4440051',
        serverProvince: 'Gyeonggi-do'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hunan',
        commonIngressLinkId: '1281',
        ingressBitsRate: '4387595',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '4341808',
        serverProvince: 'Chiba'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Liaoning',
        commonIngressLinkId: '257',
        ingressBitsRate: '4324256',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Maharashtra',
        commonIngressLinkId: '513',
        ingressBitsRate: '4274696',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '4268552',
        serverProvince: 'Osaka'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '4243683',
        serverProvince: 'Brussels Hoofdstedelijk Gewest'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jakarta Raya',
        commonIngressLinkId: '1793',
        ingressBitsRate: '4215621',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Heilongjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '4205220',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hainan',
        commonIngressLinkId: '2817',
        ingressBitsRate: '4198193',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'West Bengal',
        commonIngressLinkId: '1537',
        ingressBitsRate: '4190081',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '4172388',
        serverProvince: 'Seoul-teukbyeolsi'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Madrid, Comunidad de',
        commonIngressLinkId: '2817',
        ingressBitsRate: '4172095',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '4020521',
        serverProvince: 'Geneve'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hunan',
        commonIngressLinkId: '2305',
        ingressBitsRate: '3965604',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'California',
        commonIngressLinkId: '769',
        ingressBitsRate: '3932763',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guangxi',
        commonIngressLinkId: '513',
        ingressBitsRate: '3910057',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '3889249',
        serverProvince: 'Sao Paulo'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Hainan',
        commonIngressLinkId: '1025',
        ingressBitsRate: '3887418',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: '',
        commonIngressLinkId: '513',
        ingressBitsRate: '3803920',
        serverProvince: 'Shanghai'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hamburg',
        commonIngressLinkId: '2817',
        ingressBitsRate: '3770337',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2817',
        ingressBitsRate: '3729257',
        serverProvince: 'Jawa Barat'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '3719787',
        serverProvince: 'Gauteng'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '3633122',
        serverProvince: 'Hyogo'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '3559354',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '3558499',
        serverProvince: 'Campania'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Guangdong',
        commonIngressLinkId: '1025',
        ingressBitsRate: '3509858',
        serverProvince: ''
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '3460540',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '3306058',
        serverProvince: 'Podkarpackie'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Jilin',
        commonIngressLinkId: '1537',
        ingressBitsRate: '3300599',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '513',
        ingressBitsRate: '3216568',
        serverProvince: 'Dhaka'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '257',
        ingressBitsRate: '3205033',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '3090472',
        serverProvince: 'Yunnan'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Hainan',
        commonIngressLinkId: '1281',
        ingressBitsRate: '3013298',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '2965775',
        serverProvince: 'Heilongjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Fujian',
        commonIngressLinkId: '1281',
        ingressBitsRate: '2959983',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '2956483',
        serverProvince: 'Zurich'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Guizhou',
        commonIngressLinkId: '513',
        ingressBitsRate: '2810274',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Chongqing',
        commonIngressLinkId: '1793',
        ingressBitsRate: '2708532',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Beijing',
        commonIngressLinkId: '2049',
        ingressBitsRate: '2640569',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '2519550',
        serverProvince: 'Illinois'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Washington',
        commonIngressLinkId: '513',
        ingressBitsRate: '2416657',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'National Capital Region',
        commonIngressLinkId: '2049',
        ingressBitsRate: '2314051',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Tianjin',
        commonIngressLinkId: '257',
        ingressBitsRate: '2160011',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Moscow',
        commonIngressLinkId: '2049',
        ingressBitsRate: '2125936',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1281',
        ingressBitsRate: '2053039',
        serverProvince: 'Jakarta Raya'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Jilin',
        commonIngressLinkId: '257',
        ingressBitsRate: '2026427',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1537',
        ingressBitsRate: '1994643',
        serverProvince: 'Colorado'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2049',
        ingressBitsRate: '1881388',
        serverProvince: 'Ontario'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '1857203',
        serverProvince: 'Tel Aviv'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '1734638',
        serverProvince: 'Oregon'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Singapore',
        commonIngressLinkId: '2049',
        ingressBitsRate: '1668203',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'California',
        commonIngressLinkId: '1281',
        ingressBitsRate: '1663289',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '769',
        ingressBitsRate: '1620580',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Taiwan',
        commonIngressLinkId: '1793',
        ingressBitsRate: '1598971',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '1447027',
        serverProvince: 'Phnom Penh'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '769',
        ingressBitsRate: '1407499',
        serverProvince: 'Ontario'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '1324703',
        serverProvince: 'Ningxia'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hongkong',
        commonIngressLinkId: '769',
        ingressBitsRate: '1151580',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Hubei',
        commonIngressLinkId: '769',
        ingressBitsRate: '1106026',
        serverProvince: 'Xinjiang'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '1101122',
        serverProvince: 'Jilin'
      },
      {
        ingressLinkDirection: '西宁',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '1025',
        ingressBitsRate: '869928',
        serverProvince: 'Hofudborgarsvaedi'
      },
      {
        ingressLinkDirection: '太原',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '2305',
        ingressBitsRate: '853157',
        serverProvince: 'Singapore'
      },
      {
        ingressLinkDirection: '西安',
        clientProvince: 'Xinjiang',
        commonIngressLinkId: '257',
        ingressBitsRate: '463038',
        serverProvince: 'Reunion'
      }
    ]
  }
}

/*export const egress = {"msg":"OK","queryKey":"4dc6fcfa2f3b7b9d2b7bf86db450411d","code":200,"data":{"result":[{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"33799691852","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"32470376573","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"32331207787","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"32032115917","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"31868858761","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"29541399004","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"28061504729","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"27341743200","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"25002288549","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"24859829433","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"11507760302","serverProvince":"Jiangsu","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"8651183588","serverProvince":"Beijing","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"7837391383","serverProvince":"Beijing","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"7439253656","serverProvince":"Shandong","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"7426404911","serverProvince":"Jiangsu","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"7282105391","serverProvince":"Shandong","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"7218659736","serverProvince":"Beijing","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"7197244222","serverProvince":"Jiangsu","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"6938754196","serverProvince":"Beijing","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"6718208227","serverProvince":"Jiangsu","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"6510918343","serverProvince":"Jiangsu","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"6432774951","serverProvince":"Zhejiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"6132402534","serverProvince":"Beijing","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"6082318322","serverProvince":"Jiangsu","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"5875114783","serverProvince":"Jiangsu","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"5662086016","serverProvince":"Beijing","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"5577190797","serverProvince":"Beijing","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"5501534803","serverProvince":"Shandong","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"5210291272","serverProvince":"Beijing","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"5175395545","serverProvince":"Jiangsu","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"5153922008","serverProvince":"Hongkong","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"5102568639","serverProvince":"Shandong","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"5040113099","serverProvince":"Guangdong","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"5023865655","serverProvince":"Beijing","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"4834273637","serverProvince":"Guangdong","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"4826688302","serverProvince":"Beijing","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"4805068012","serverProvince":"Jiangsu","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"4681904284","serverProvince":"Jiangsu","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"4637016802","serverProvince":"Shanghai","commonEgressLinkId":"2304"},{"clientProvince":"Shaanxi","egressLinkDirection":"西宁","egressBitsRate":"4273750429","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"4201444790","serverProvince":"Guangdong","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"4163603671","serverProvince":"Guangdong","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"4156376686","serverProvince":"Hongkong","commonEgressLinkId":"1280"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBitsRate":"4085075844","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"4033242592","serverProvince":"Stockholms lan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3890877359","serverProvince":"Shaanxi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3760672457","serverProvince":"Hubei","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3591776968","serverProvince":"Hongkong","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3573259572","serverProvince":"Shandong","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3571736200","serverProvince":"Shanghai","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3569950655","serverProvince":"Shandong","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3448751320","serverProvince":"Anhui","commonEgressLinkId":"1536"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBitsRate":"3381956422","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3378129303","serverProvince":"Hongkong","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3370272164","serverProvince":"Hebei","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3303380490","serverProvince":"Hongkong","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3296949084","serverProvince":"Guangdong","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3294325851","serverProvince":"Zhejiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3283180295","serverProvince":"Guangdong","commonEgressLinkId":"1792"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBitsRate":"3276811856","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3264653355","serverProvince":"Hunan","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3263806689","serverProvince":"","commonEgressLinkId":"1536"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBitsRate":"3219392420","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"3183879972","serverProvince":"Shanghai","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3175489326","serverProvince":"Shanghai","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"3151018853","serverProvince":"Zhejiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3127683959","serverProvince":"Zhejiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3124736828","serverProvince":"Zhejiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3107289622","serverProvince":"Zhejiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"3090916355","serverProvince":"Shaanxi","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3062840473","serverProvince":"Henan","commonEgressLinkId":"2816"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBitsRate":"3038994129","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3034665545","serverProvince":"Hongkong","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"3015392658","serverProvince":"Hongkong","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"3002537897","serverProvince":"Guangdong","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2981185824","serverProvince":"Zhejiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2971137246","serverProvince":"Hebei","commonEgressLinkId":"512"},{"clientProvince":"Henan","egressLinkDirection":"西安","egressBitsRate":"2898151892","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Henan","egressLinkDirection":"西安","egressBitsRate":"2888810451","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBitsRate":"2881788080","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2870185089","serverProvince":"Shanghai","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2864916188","serverProvince":"Hebei","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2852148044","serverProvince":"Fujian","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"2845550844","serverProvince":"Guangdong","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2842160558","serverProvince":"","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2832303532","serverProvince":"Tianjin","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2815887418","serverProvince":"Guangdong","commonEgressLinkId":"2048"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBitsRate":"2710362370","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"2701520109","serverProvince":"Shandong","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2694129410","serverProvince":"Shandong","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2686953285","serverProvince":"Hebei","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2674754590","serverProvince":"Hebei","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2662971359","serverProvince":"Zhejiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2657501064","serverProvince":"Shanghai","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2621792279","serverProvince":"Hubei","commonEgressLinkId":"512"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBitsRate":"2599742097","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2598562636","serverProvince":"Singapore","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2566038389","serverProvince":"Fujian","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"2557186302","serverProvince":"Hebei","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2555422429","serverProvince":"Henan","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2536111713","serverProvince":"Fujian","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2501415579","serverProvince":"Hongkong","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2484988915","serverProvince":"Shaanxi","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2445388025","serverProvince":"Hebei","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2423017533","serverProvince":"Guangdong","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2409168900","serverProvince":"Shanghai","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2406753698","serverProvince":"Hongkong","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2388316489","serverProvince":"Shandong","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2374913880","serverProvince":"Chongqing","commonEgressLinkId":"2304"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBitsRate":"2364684333","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2360654275","serverProvince":"Shaanxi","commonEgressLinkId":"2304"},{"clientProvince":"Jiangsu","egressLinkDirection":"西安","egressBitsRate":"2359491975","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2313572752","serverProvince":"Anhui","commonEgressLinkId":"2048"},{"clientProvince":"Shandong","egressLinkDirection":"西安","egressBitsRate":"2288652805","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2276947666","serverProvince":"Shaanxi","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2272116486","serverProvince":"Zhejiang","commonEgressLinkId":"512"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBitsRate":"2262874621","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2260268179","serverProvince":"Shanxi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"2227078600","serverProvince":"Fujian","commonEgressLinkId":"1024"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBitsRate":"2213796628","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2196533735","serverProvince":"Tianjin","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2189798080","serverProvince":"Fujian","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2183050022","serverProvince":"Liaoning","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2153404700","serverProvince":"Anhui","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2151753111","serverProvince":"Shaanxi","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2142790753","serverProvince":"Liaoning","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"2137387416","serverProvince":"","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2131488549","serverProvince":"California","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2128215575","serverProvince":"Hubei","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2127667936","serverProvince":"Hunan","commonEgressLinkId":"2816"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBitsRate":"2095106126","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2087330908","serverProvince":"Guangxi","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2075439414","serverProvince":"Anhui","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2071712101","serverProvince":"Hebei","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"2069170166","serverProvince":"Hunan","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"2051122697","serverProvince":"","commonEgressLinkId":"1792"},{"clientProvince":"Shaanxi","egressLinkDirection":"西安","egressBitsRate":"2034919965","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBitsRate":"2021762914","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBitsRate":"2015634676","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBitsRate":"2010256094","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Henan","egressLinkDirection":"西安","egressBitsRate":"2007059064","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1999976929","serverProvince":"Shanxi","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1995139834","serverProvince":"Anhui","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1986283859","serverProvince":"California","commonEgressLinkId":"1024"},{"clientProvince":"Zhejiang","egressLinkDirection":"西安","egressBitsRate":"1974656686","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1973935956","serverProvince":"Hebei","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1970405616","serverProvince":"Shanxi","commonEgressLinkId":"256"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBitsRate":"1965514857","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBitsRate":"1961262932","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1953155661","serverProvince":"Hunan","commonEgressLinkId":"768"},{"clientProvince":"Beijing","egressLinkDirection":"西安","egressBitsRate":"1928895862","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Qinghai","egressLinkDirection":"西安","egressBitsRate":"1925849251","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1905424010","serverProvince":"Henan","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1886095717","serverProvince":"Hongkong","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1885344218","serverProvince":"California","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1869083754","serverProvince":"","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1856542388","serverProvince":"Hubei","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1843109825","serverProvince":"Shaanxi","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1828395925","serverProvince":"Tokyo","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1824798409","serverProvince":"Henan","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1824254138","serverProvince":"Shanghai","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1817823702","serverProvince":"Tokyo","commonEgressLinkId":"1792"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBitsRate":"1786200585","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1779625576","serverProvince":"Tianjin","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1772383911","serverProvince":"Tianjin","commonEgressLinkId":"1024"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBitsRate":"1772186964","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Henan","egressLinkDirection":"西宁","egressBitsRate":"1733016692","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1726918186","serverProvince":"Shaanxi","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1696860726","serverProvince":"Jiangxi","commonEgressLinkId":"1024"},{"clientProvince":"Jiangxi","egressLinkDirection":"西安","egressBitsRate":"1693016721","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBitsRate":"1664870387","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Qinghai","egressLinkDirection":"西宁","egressBitsRate":"1644449076","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Guangdong","egressLinkDirection":"西安","egressBitsRate":"1644030083","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Guangdong","egressLinkDirection":"西安","egressBitsRate":"1624194824","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1621840336","serverProvince":"Shandong","commonEgressLinkId":"768"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBitsRate":"1605713764","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1604335346","serverProvince":"Hunan","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1588508880","serverProvince":"","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1574850699","serverProvince":"Sichuan","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1571605968","serverProvince":"Hubei","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1553788166","serverProvince":"Hubei","commonEgressLinkId":"768"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBitsRate":"1515061152","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1513480176","serverProvince":"Jiangxi","commonEgressLinkId":"2304"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBitsRate":"1510882798","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1499653019","serverProvince":"Sichuan","commonEgressLinkId":"2816"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBitsRate":"1496560840","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Shanxi","egressLinkDirection":"西宁","egressBitsRate":"1495502817","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1493640011","serverProvince":"Henan","commonEgressLinkId":"2048"},{"clientProvince":"Shanghai","egressLinkDirection":"西宁","egressBitsRate":"1493177421","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1487331061","serverProvince":"Jilin","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1482926618","serverProvince":"Hunan","commonEgressLinkId":"2048"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBitsRate":"1464854207","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1454347276","serverProvince":"Anhui","commonEgressLinkId":"2816"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBitsRate":"1449329549","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Hebei","egressLinkDirection":"西安","egressBitsRate":"1443201111","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1441130220","serverProvince":"Fujian","commonEgressLinkId":"1280"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBitsRate":"1438352785","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1427572740","serverProvince":"Fujian","commonEgressLinkId":"1536"},{"clientProvince":"Hubei","egressLinkDirection":"西安","egressBitsRate":"1424848734","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBitsRate":"1407014488","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBitsRate":"1399126829","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBitsRate":"1396851346","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1395607571","serverProvince":"Henan","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1388230021","serverProvince":"Hunan","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1384024341","serverProvince":"","commonEgressLinkId":"2304"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBitsRate":"1376214647","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1371403957","serverProvince":"Tokyo","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1367963252","serverProvince":"Qinghai","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1361837468","serverProvince":"Guangxi","commonEgressLinkId":"1280"},{"clientProvince":"Chongqing","egressLinkDirection":"西安","egressBitsRate":"1353236167","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1353105668","serverProvince":"Fujian","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1351979847","serverProvince":"Tokyo","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1332235689","serverProvince":"Jiangxi","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1331150474","serverProvince":"Hunan","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1321324884","serverProvince":"Fujian","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1311375536","serverProvince":"Jiangxi","commonEgressLinkId":"2048"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBitsRate":"1310921889","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1310698680","serverProvince":"Chongqing","commonEgressLinkId":"1280"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBitsRate":"1292831854","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Gansu","egressLinkDirection":"西安","egressBitsRate":"1288269214","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBitsRate":"1282876225","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"1279107486","serverProvince":"Tianjin","commonEgressLinkId":"1536"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBitsRate":"1277615514","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1269988292","serverProvince":"Shanghai","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1261952586","serverProvince":"Shaanxi","commonEgressLinkId":"1280"},{"clientProvince":"Shaanxi","egressLinkDirection":"西安","egressBitsRate":"1258589585","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1246162676","serverProvince":"Zhejiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1242808729","serverProvince":"Hunan","commonEgressLinkId":"2304"},{"clientProvince":"Jiangsu","egressLinkDirection":"西安","egressBitsRate":"1235499560","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Hebei","egressLinkDirection":"西安","egressBitsRate":"1235218758","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1234637975","serverProvince":"Sichuan","commonEgressLinkId":"1536"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBitsRate":"1225770080","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1216101410","serverProvince":"Ningxia","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1212778503","serverProvince":"Singapore","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1204212628","serverProvince":"Shanxi","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1198312532","serverProvince":"Fujian","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1195740505","serverProvince":"Shaanxi","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1193723055","serverProvince":"Maharashtra","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1190363454","serverProvince":"Jiangxi","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1187365969","serverProvince":"Jiangxi","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1185275869","serverProvince":"Henan","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1181994283","serverProvince":"Hunan","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1172123891","serverProvince":"Qinghai","commonEgressLinkId":"256"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBitsRate":"1168670796","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Qinghai","egressLinkDirection":"西安","egressBitsRate":"1165297097","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1164718209","serverProvince":"Liaoning","commonEgressLinkId":"1792"},{"clientProvince":"Hunan","egressLinkDirection":"西安","egressBitsRate":"1158264632","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1152445722","serverProvince":"Anhui","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1144044134","serverProvince":"Shanxi","commonEgressLinkId":"768"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBitsRate":"1132285146","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1129705727","serverProvince":"Guangxi","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1127759996","serverProvince":"Tianjin","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1123542962","serverProvince":"Heilongjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1119738972","serverProvince":"Tianjin","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1119605575","serverProvince":"Jiangxi","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1117806817","serverProvince":"Qinghai","commonEgressLinkId":"2816"},{"clientProvince":"Chongqing","egressLinkDirection":"西宁","egressBitsRate":"1117091387","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1112831693","serverProvince":"Liaoning","commonEgressLinkId":"512"},{"clientProvince":"Nei Mongol","egressLinkDirection":"西安","egressBitsRate":"1112331283","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1102912361","serverProvince":"Anhui","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"1099877040","serverProvince":"Hubei","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1098246634","serverProvince":"Hebei","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1097492743","serverProvince":"Chongqing","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1090058869","serverProvince":"Henan","commonEgressLinkId":"1792"},{"clientProvince":"Shandong","egressLinkDirection":"西安","egressBitsRate":"1080439598","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1066943898","serverProvince":"Shanghai","commonEgressLinkId":"1280"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBitsRate":"1064897384","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Guangxi","egressLinkDirection":"西安","egressBitsRate":"1059329929","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1052111871","serverProvince":"","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1046754925","serverProvince":"Singapore","commonEgressLinkId":"768"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBitsRate":"1042880037","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"1020637205","serverProvince":"Henan","commonEgressLinkId":"256"},{"clientProvince":"Anhui","egressLinkDirection":"西安","egressBitsRate":"1019003984","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBitsRate":"1008845946","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"1008133259","serverProvince":"Shanxi","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"996331529","serverProvince":"Ha Noi","commonEgressLinkId":"2048"},{"clientProvince":"Hebei","egressLinkDirection":"西安","egressBitsRate":"993142918","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Beijing","egressLinkDirection":"西安","egressBitsRate":"986341442","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xizang","egressLinkDirection":"太原","egressBitsRate":"977929795","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"977594617","serverProvince":"Colorado","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"976133602","serverProvince":"Singapore","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"974600166","serverProvince":"Indiana","commonEgressLinkId":"1792"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBitsRate":"972261667","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"966528413","serverProvince":"Taiwan","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"965839203","serverProvince":"Nei Mongol","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"962487709","serverProvince":"Riau","commonEgressLinkId":"2816"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBitsRate":"961225984","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"958773595","serverProvince":"Anhui","commonEgressLinkId":"256"},{"clientProvince":"","egressLinkDirection":"西宁","egressBitsRate":"954283931","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"949975203","serverProvince":"Ile-de-France","commonEgressLinkId":"256"},{"clientProvince":"Hebei","egressLinkDirection":"西宁","egressBitsRate":"942544765","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"941239830","serverProvince":"Qinghai","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"940605016","serverProvince":"Tianjin","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"939058935","serverProvince":"Tianjin","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"934482465","serverProvince":"Taiwan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"932258803","serverProvince":"Osaka","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"921412824","serverProvince":"Hubei","commonEgressLinkId":"2816"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBitsRate":"920860793","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBitsRate":"916167408","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"914986394","serverProvince":"Sichuan","commonEgressLinkId":"1792"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBitsRate":"911924110","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Sichuan","egressLinkDirection":"西安","egressBitsRate":"900232035","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBitsRate":"899933729","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Ningxia","egressLinkDirection":"西宁","egressBitsRate":"886377552","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"880540244","serverProvince":"Ho Chi Minh","commonEgressLinkId":"768"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBitsRate":"879973538","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"877080026","serverProvince":"California","commonEgressLinkId":"2304"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBitsRate":"872446903","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Yunnan","egressLinkDirection":"西安","egressBitsRate":"867635825","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBitsRate":"865895411","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Sichuan","egressLinkDirection":"西安","egressBitsRate":"860656016","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBitsRate":"857077749","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"855616637","serverProvince":"Florida","commonEgressLinkId":"768"},{"clientProvince":"Jilin","egressLinkDirection":"西安","egressBitsRate":"853903439","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"853373833","serverProvince":"Taiwan","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"845652947","serverProvince":"Sichuan","commonEgressLinkId":"768"},{"clientProvince":"Islamabad","egressLinkDirection":"西宁","egressBitsRate":"833418713","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"831095584","serverProvince":"Henan","commonEgressLinkId":"2304"},{"clientProvince":"Fujian","egressLinkDirection":"西安","egressBitsRate":"829607732","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Jilin","egressLinkDirection":"西安","egressBitsRate":"825757916","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBitsRate":"825651224","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBitsRate":"824258009","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"823013410","serverProvince":"Qinghai","commonEgressLinkId":"2304"},{"clientProvince":"Tianjin","egressLinkDirection":"西安","egressBitsRate":"818745700","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"817631439","serverProvince":"Shanxi","commonEgressLinkId":"1280"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBitsRate":"815316807","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBitsRate":"814605913","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"809344048","serverProvince":"Sichuan","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"806154654","serverProvince":"Hubei","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"802990282","serverProvince":"Tokyo","commonEgressLinkId":"2048"},{"clientProvince":"Zhejiang","egressLinkDirection":"西安","egressBitsRate":"801346629","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBitsRate":"792502498","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBitsRate":"781458243","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBitsRate":"776980142","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBitsRate":"776885169","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"769448874","serverProvince":"California","commonEgressLinkId":"1792"},{"clientProvince":"Zhejiang","egressLinkDirection":"西宁","egressBitsRate":"756335818","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"753785775","serverProvince":"Ciudad Autonoma de Buenos Aires","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"743002749","serverProvince":"Ile-de-France","commonEgressLinkId":"768"},{"clientProvince":"Hunan","egressLinkDirection":"西安","egressBitsRate":"735645120","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"734036840","serverProvince":"Qinghai","commonEgressLinkId":"2048"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBitsRate":"731234776","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"730658765","serverProvince":"Gansu","commonEgressLinkId":"2816"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBitsRate":"728898358","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"726547882","serverProvince":"Yunnan","commonEgressLinkId":"1280"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBitsRate":"725014873","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"721961079","serverProvince":"Guangxi","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"720310842","serverProvince":"Singapore","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"716476370","serverProvince":"Gauteng","commonEgressLinkId":"512"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBitsRate":"716469696","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBitsRate":"713548852","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBitsRate":"709720332","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"707767895","serverProvince":"Liaoning","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"705004268","serverProvince":"Chongqing","commonEgressLinkId":"2048"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBitsRate":"701719339","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Qinghai","egressLinkDirection":"太原","egressBitsRate":"699801045","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Hubei","egressLinkDirection":"西安","egressBitsRate":"696643336","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"696519804","serverProvince":"Georgia","commonEgressLinkId":"256"},{"clientProvince":"Hubei","egressLinkDirection":"西安","egressBitsRate":"693109752","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"691540356","serverProvince":"Gauteng","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"689310707","serverProvince":"Hessen","commonEgressLinkId":"1792"},{"clientProvince":"California","egressLinkDirection":"西宁","egressBitsRate":"689292908","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Tokyo","egressLinkDirection":"太原","egressBitsRate":"683276177","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"675602531","serverProvince":"Ningxia","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"668063701","serverProvince":"Hubei","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"666734544","serverProvince":"Liaoning","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"662702727","serverProvince":"Liaoning","commonEgressLinkId":"1024"},{"clientProvince":"Guizhou","egressLinkDirection":"西安","egressBitsRate":"661339114","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"659911130","serverProvince":"Singapore","commonEgressLinkId":"1024"},{"clientProvince":"Tianjin","egressLinkDirection":"西宁","egressBitsRate":"658632112","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBitsRate":"655562049","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"650979102","serverProvince":"Singapore","commonEgressLinkId":"256"},{"clientProvince":"Jiangsu","egressLinkDirection":"西安","egressBitsRate":"649356321","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBitsRate":"646390519","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"645582209","serverProvince":"Sichuan","commonEgressLinkId":"512"},{"clientProvince":"Tianjin","egressLinkDirection":"西安","egressBitsRate":"644909639","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBitsRate":"641951381","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBitsRate":"641345027","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"640560860","serverProvince":"Tokyo","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"633206744","serverProvince":"Chongqing","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"632692239","serverProvince":"New South Wales","commonEgressLinkId":"2304"},{"clientProvince":"Sichuan","egressLinkDirection":"西宁","egressBitsRate":"631445123","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"630488493","serverProvince":"Jilin","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"630383798","serverProvince":"Karnataka","commonEgressLinkId":"768"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBitsRate":"621134063","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"617023640","serverProvince":"Gansu","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"612752747","serverProvince":"Ningxia","commonEgressLinkId":"2048"},{"clientProvince":"Chongqing","egressLinkDirection":"西安","egressBitsRate":"611669350","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"607085496","serverProvince":"Nordrhein-Westfalen","commonEgressLinkId":"768"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBitsRate":"603563957","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Shaanxi","egressLinkDirection":"西安","egressBitsRate":"602372091","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBitsRate":"597478137","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"596564319","serverProvince":"Liaoning","commonEgressLinkId":"256"},{"clientProvince":"Singapore","egressLinkDirection":"西宁","egressBitsRate":"594942506","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"594768064","serverProvince":"Singapore","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"590749456","serverProvince":"Ho Chi Minh","commonEgressLinkId":"256"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBitsRate":"585327755","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Heilongjiang","egressLinkDirection":"西安","egressBitsRate":"582597581","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"580567149","serverProvince":"Liaoning","commonEgressLinkId":"2816"},{"clientProvince":"Gansu","egressLinkDirection":"西安","egressBitsRate":"579002229","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Fujian","egressLinkDirection":"太原","egressBitsRate":"577600261","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBitsRate":"573711751","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBitsRate":"572497923","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Shandong","egressLinkDirection":"西宁","egressBitsRate":"569663684","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Qinghai","egressLinkDirection":"西安","egressBitsRate":"568608692","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"568043585","serverProvince":"England","commonEgressLinkId":"512"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"567767531","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"564215600","serverProvince":"Mazowieckie","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"563580592","serverProvince":"Agusan del Norte","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"561330467","serverProvince":"Lombardia","commonEgressLinkId":"768"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBitsRate":"559692013","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"554860134","serverProvince":"Qinghai","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"554540877","serverProvince":"California","commonEgressLinkId":"256"},{"clientProvince":"Madhya Pradesh","egressLinkDirection":"西安","egressBitsRate":"550212521","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Guangdong","egressLinkDirection":"西安","egressBitsRate":"546594055","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBitsRate":"546319399","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"545315504","serverProvince":"California","commonEgressLinkId":"2048"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBitsRate":"542431173","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Shanghai","egressLinkDirection":"西安","egressBitsRate":"539792261","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Fujian","egressLinkDirection":"西安","egressBitsRate":"536822089","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"531832153","serverProvince":"Heilongjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"531553588","serverProvince":"Hainan","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"529381158","serverProvince":"Maharashtra","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"529197064","serverProvince":"Chongqing","commonEgressLinkId":"1024"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBitsRate":"528441703","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"525147406","serverProvince":"","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"522736968","serverProvince":"Puebla","commonEgressLinkId":"1792"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBitsRate":"520492802","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"517472016","serverProvince":"Tianjin","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"516393925","serverProvince":"Sichuan","commonEgressLinkId":"1024"},{"clientProvince":"Ningxia","egressLinkDirection":"西安","egressBitsRate":"511799334","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"509735065","serverProvince":"Jiangxi","commonEgressLinkId":"1536"},{"clientProvince":"Jiangxi","egressLinkDirection":"西安","egressBitsRate":"501027908","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Zhejiang","egressLinkDirection":"西安","egressBitsRate":"500128484","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBitsRate":"497315562","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Sichuan","egressLinkDirection":"西安","egressBitsRate":"493063136","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"491194198","serverProvince":"Guangxi","commonEgressLinkId":"1024"},{"clientProvince":"Jiangxi","egressLinkDirection":"西安","egressBitsRate":"491098864","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"490954516","serverProvince":"New York","commonEgressLinkId":"768"},{"clientProvince":"Fujian","egressLinkDirection":"太原","egressBitsRate":"490918279","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"490338013","serverProvince":"Jilin","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"488339544","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"2048"},{"clientProvince":"Chongqing","egressLinkDirection":"西安","egressBitsRate":"486665132","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Shandong","egressLinkDirection":"太原","egressBitsRate":"485755605","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Liaoning","egressLinkDirection":"西安","egressBitsRate":"485167941","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBitsRate":"481606274","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"481544612","serverProvince":"Liaoning","commonEgressLinkId":"768"},{"clientProvince":"Maharashtra","egressLinkDirection":"太原","egressBitsRate":"479554149","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"475287590","serverProvince":"Guizhou","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"473576451","serverProvince":"Gansu","commonEgressLinkId":"512"},{"clientProvince":"Noord-Holland","egressLinkDirection":"西安","egressBitsRate":"470646032","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Hongkong","egressLinkDirection":"西安","egressBitsRate":"468991798","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Nei Mongol","egressLinkDirection":"西宁","egressBitsRate":"463985956","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"463737019","serverProvince":"Hessen","commonEgressLinkId":"1536"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBitsRate":"463313219","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBitsRate":"458116853","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBitsRate":"456136335","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"455650047","serverProvince":"Ile-de-France","commonEgressLinkId":"2816"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBitsRate":"455635935","serverProvince":"","commonEgressLinkId":"1792"},{"clientProvince":"Xizang","egressLinkDirection":"太原","egressBitsRate":"453993439","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Shaanxi","egressLinkDirection":"太原","egressBitsRate":"452435186","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Jiangsu","egressLinkDirection":"西宁","egressBitsRate":"450506999","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"449976055","serverProvince":"Gansu","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"444763629","serverProvince":"Shanxi","commonEgressLinkId":"1792"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBitsRate":"443605198","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"441186690","serverProvince":"Tel Aviv","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"438698191","serverProvince":"Gansu","commonEgressLinkId":"2048"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBitsRate":"438448769","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBitsRate":"437846204","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"436871416","serverProvince":"Jiangxi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"436824117","serverProvince":"Guangxi","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"435906864","serverProvince":"Sankt-Peterburg","commonEgressLinkId":"1536"},{"clientProvince":"Heilongjiang","egressLinkDirection":"西安","egressBitsRate":"435249009","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Shanxi","egressLinkDirection":"西安","egressBitsRate":"432756029","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"428725214","serverProvince":"Qinghai","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"428247565","serverProvince":"Ad Dawhah","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"423885451","serverProvince":"Brussels Hoofdstedelijk Gewest","commonEgressLinkId":"2816"},{"clientProvince":"Hainan","egressLinkDirection":"西安","egressBitsRate":"423788850","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBitsRate":"422154626","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"421935485","serverProvince":"New South Wales","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"415678094","serverProvince":"","commonEgressLinkId":"2048"},{"clientProvince":"Fujian","egressLinkDirection":"太原","egressBitsRate":"414611993","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBitsRate":"403658317","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"402789458","serverProvince":"Nei Mongol","commonEgressLinkId":"1536"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBitsRate":"401937624","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"398659190","serverProvince":"Sao Paulo","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"395709005","serverProvince":"Illinois","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"394362457","serverProvince":"Jilin","commonEgressLinkId":"2304"},{"clientProvince":"","egressLinkDirection":"西安","egressBitsRate":"394220219","serverProvince":"Shanghai","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"394140890","serverProvince":"Gansu","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"388294995","serverProvince":"Ningxia","commonEgressLinkId":"512"},{"clientProvince":"Hainan","egressLinkDirection":"西安","egressBitsRate":"386202167","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBitsRate":"385634205","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"382028171","serverProvince":"Ha Noi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"379606576","serverProvince":"Gansu","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"379563866","serverProvince":"Hyogo","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"377402283","serverProvince":"National Capital Region","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"375747909","serverProvince":"Tokyo","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"373804422","serverProvince":"Taiwan","commonEgressLinkId":"1792"},{"clientProvince":"Henan","egressLinkDirection":"太原","egressBitsRate":"373425545","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"372315796","serverProvince":"Nei Mongol","commonEgressLinkId":"2048"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"371354874","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBitsRate":"371122325","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"369613064","serverProvince":"Tokyo","commonEgressLinkId":"512"},{"clientProvince":"Liaoning","egressLinkDirection":"西宁","egressBitsRate":"364280479","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"363669827","serverProvince":"Gansu","commonEgressLinkId":"2304"},{"clientProvince":"Anhui","egressLinkDirection":"西宁","egressBitsRate":"362148162","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Taiwan","egressLinkDirection":"太原","egressBitsRate":"361855097","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"360149905","serverProvince":"Chongqing","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"359749696","serverProvince":"Bahia","commonEgressLinkId":"1536"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBitsRate":"359276135","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Nouvelle-Aquitaine","egressLinkDirection":"西安","egressBitsRate":"358637460","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"356985198","serverProvince":"Shanxi","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"354251880","serverProvince":"Taiwan","commonEgressLinkId":"1536"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBitsRate":"350329895","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBitsRate":"350009900","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"349125607","serverProvince":"Jiangxi","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"347954504","serverProvince":"Alabama","commonEgressLinkId":"2048"},{"clientProvince":"Hainan","egressLinkDirection":"太原","egressBitsRate":"345980082","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"344902864","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"339966189","serverProvince":"Hainan","commonEgressLinkId":"2048"},{"clientProvince":"Xizang","egressLinkDirection":"太原","egressBitsRate":"338579852","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBitsRate":"337952455","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Moscow","egressLinkDirection":"西安","egressBitsRate":"337154484","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"336652185","serverProvince":"Gansu","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"336500945","serverProvince":"Nordrhein-Westfalen","commonEgressLinkId":"1280"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBitsRate":"332552224","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"332309715","serverProvince":"Nei Mongol","commonEgressLinkId":"2816"},{"clientProvince":"","egressLinkDirection":"西安","egressBitsRate":"332143450","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"332038433","serverProvince":"Heilongjiang","commonEgressLinkId":"1792"},{"clientProvince":"Shanghai","egressLinkDirection":"太原","egressBitsRate":"327635089","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"327607626","serverProvince":"Hessen","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"327231713","serverProvince":"Goias","commonEgressLinkId":"1792"},{"clientProvince":"Singapore","egressLinkDirection":"西安","egressBitsRate":"326018725","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Phnom Penh","egressLinkDirection":"太原","egressBitsRate":"324882788","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBitsRate":"323056849","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"322261367","serverProvince":"Anhui","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"321733343","serverProvince":"Ontario","commonEgressLinkId":"1024"},{"clientProvince":"Guangdong","egressLinkDirection":"西宁","egressBitsRate":"320982873","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"318556812","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"512"},{"clientProvince":"Hongkong","egressLinkDirection":"太原","egressBitsRate":"318243407","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"315615564","serverProvince":"Ontario","commonEgressLinkId":"512"},{"clientProvince":"Gansu","egressLinkDirection":"西安","egressBitsRate":"312701177","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBitsRate":"308862664","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBitsRate":"306493933","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"306129178","serverProvince":"Ningxia","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"306009836","serverProvince":"Istanbul","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"302621186","serverProvince":"Osaka","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"302516511","serverProvince":"Tokyo","commonEgressLinkId":"1536"},{"clientProvince":"Guangdong","egressLinkDirection":"太原","egressBitsRate":"301128103","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"300682918","serverProvince":"Gansu","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"300043515","serverProvince":"Bayern","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"299587121","serverProvince":"Ontario","commonEgressLinkId":"2816"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBitsRate":"299487173","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"299471980","serverProvince":"Guizhou","commonEgressLinkId":"1280"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBitsRate":"295736793","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"294469034","serverProvince":"Ho Chi Minh","commonEgressLinkId":"2816"},{"clientProvince":"Gansu","egressLinkDirection":"西宁","egressBitsRate":"292026506","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBitsRate":"291577497","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Guizhou","egressLinkDirection":"西安","egressBitsRate":"290771520","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Sichuan","egressLinkDirection":"太原","egressBitsRate":"288721003","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"285065036","serverProvince":"Saitama","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"282201644","serverProvince":"Hessen","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"279407692","serverProvince":"England","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"278307860","serverProvince":"Washington","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"277533705","serverProvince":"Georgia","commonEgressLinkId":"1024"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBitsRate":"275573752","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBitsRate":"274936308","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"274254750","serverProvince":"Zuid-Holland","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"273409749","serverProvince":"California","commonEgressLinkId":"1280"},{"clientProvince":"Xizang","egressLinkDirection":"太原","egressBitsRate":"272261584","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBitsRate":"270048159","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"267863047","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"266747846","serverProvince":"Mazowieckie","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"266536285","serverProvince":"Guizhou","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"264875433","serverProvince":"Yunnan","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"264464321","serverProvince":"New York","commonEgressLinkId":"2048"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBitsRate":"264039298","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"258997065","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"256"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"257633169","serverProvince":"","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"256806080","serverProvince":"Nei Mongol","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"256777525","serverProvince":"Heilongjiang","commonEgressLinkId":"512"},{"clientProvince":"Seoul-teukbyeolsi","egressLinkDirection":"太原","egressBitsRate":"251260218","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"250386774","serverProvince":"Taiwan","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"250349877","serverProvince":"Yunnan","commonEgressLinkId":"1536"},{"clientProvince":"Jakarta Raya","egressLinkDirection":"太原","egressBitsRate":"248331843","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"248145104","serverProvince":"Pais Vasco","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"248132398","serverProvince":"Virginia","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"244196274","serverProvince":"Hessen","commonEgressLinkId":"2816"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBitsRate":"242559017","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"","egressLinkDirection":"西安","egressBitsRate":"240782048","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBitsRate":"239477156","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBitsRate":"238652887","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"237399402","serverProvince":"Zabaykal'skiy kray","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"237048272","serverProvince":"Shanxi","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"231548014","serverProvince":"Kuala Lumpur","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"231137306","serverProvince":"Hofudborgarsvaedi","commonEgressLinkId":"1792"},{"clientProvince":"Hubei","egressLinkDirection":"西宁","egressBitsRate":"230996300","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"230451618","serverProvince":"Qinghai","commonEgressLinkId":"1536"},{"clientProvince":"West Bengal","egressLinkDirection":"西安","egressBitsRate":"230045510","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"226823993","serverProvince":"Dhaka","commonEgressLinkId":"256"},{"clientProvince":"Kuala Lumpur","egressLinkDirection":"太原","egressBitsRate":"226495651","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"226077265","serverProvince":"Noord-Holland","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"225099574","serverProvince":"Arizona","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"224987152","serverProvince":"Nei Mongol","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"222759681","serverProvince":"Rio de Janeiro","commonEgressLinkId":"256"},{"clientProvince":"Ningxia","egressLinkDirection":"西安","egressBitsRate":"222390659","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Fujian","egressLinkDirection":"西宁","egressBitsRate":"221318982","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"220985022","serverProvince":"Sichuan","commonEgressLinkId":"2048"},{"clientProvince":"Tunis","egressLinkDirection":"西宁","egressBitsRate":"218949841","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"218773971","serverProvince":"Washington","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"218535880","serverProvince":"Chelyabinskaya oblast'","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"218164511","serverProvince":"Uttar Pradesh","commonEgressLinkId":"768"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBitsRate":"217531147","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBitsRate":"213591705","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Shandong","egressLinkDirection":"西安","egressBitsRate":"212857079","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"211508345","serverProvince":"Heilongjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"210552923","serverProvince":"Jilin","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"210543210","serverProvince":"Chongqing","commonEgressLinkId":"768"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBitsRate":"209324933","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"209222575","serverProvince":"Etela-Savo","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"208918745","serverProvince":"Sichuan","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"208414548","serverProvince":"Virginia","commonEgressLinkId":"1024"},{"clientProvince":"Zug","egressLinkDirection":"太原","egressBitsRate":"206917024","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Guizhou","egressLinkDirection":"西宁","egressBitsRate":"206857554","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"206322656","serverProvince":"Virginia","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"205580983","serverProvince":"Singapore","commonEgressLinkId":"2048"},{"clientProvince":"Jiangxi","egressLinkDirection":"西宁","egressBitsRate":"204405584","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"201229443","serverProvince":"Phnom Penh","commonEgressLinkId":"2048"},{"clientProvince":"","egressLinkDirection":"西安","egressBitsRate":"201192524","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"199348852","serverProvince":"California","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"197115328","serverProvince":"Ohio","commonEgressLinkId":"1280"},{"clientProvince":"Hubei","egressLinkDirection":"太原","egressBitsRate":"196354956","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Jiangsu","egressLinkDirection":"太原","egressBitsRate":"195053218","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Fujian","egressLinkDirection":"太原","egressBitsRate":"194540335","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"194537581","serverProvince":"Osaka","commonEgressLinkId":"512"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBitsRate":"194525234","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"193417796","serverProvince":"Xizang","commonEgressLinkId":"2816"},{"clientProvince":"Anhui","egressLinkDirection":"西安","egressBitsRate":"192621911","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBitsRate":"191959672","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"190620767","serverProvince":"Hainan","commonEgressLinkId":"1280"},{"clientProvince":"Shanxi","egressLinkDirection":"西安","egressBitsRate":"189950915","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Taiwan","egressLinkDirection":"西安","egressBitsRate":"189235309","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"188496312","serverProvince":"Nei Mongol","commonEgressLinkId":"512"},{"clientProvince":"Hunan","egressLinkDirection":"西安","egressBitsRate":"184753159","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"184175314","serverProvince":"Tianjin","commonEgressLinkId":"2304"},{"clientProvince":"Taiwan","egressLinkDirection":"西安","egressBitsRate":"181853131","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"176876752","serverProvince":"Praha, Hlavni mesto","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"176015335","serverProvince":"Qinghai","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"175804254","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"173873612","serverProvince":"Zurich","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"169877278","serverProvince":"Uttar Pradesh","commonEgressLinkId":"2048"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBitsRate":"169601791","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"168781341","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"2816"},{"clientProvince":"Seoul-teukbyeolsi","egressLinkDirection":"西宁","egressBitsRate":"168207894","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"167525933","serverProvince":"Dimashq","commonEgressLinkId":"1280"},{"clientProvince":"Uttar Pradesh","egressLinkDirection":"西安","egressBitsRate":"167297864","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Nei Mongol","egressLinkDirection":"西安","egressBitsRate":"166668927","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"166595651","serverProvince":"Ha Noi","commonEgressLinkId":"512"},{"clientProvince":"Jilin","egressLinkDirection":"西安","egressBitsRate":"165725670","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Nei Mongol","egressLinkDirection":"西安","egressBitsRate":"165051954","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Hainan","egressLinkDirection":"太原","egressBitsRate":"162661014","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Madrid, Comunidad de","egressLinkDirection":"西安","egressBitsRate":"159881003","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Yunnan","egressLinkDirection":"西安","egressBitsRate":"159592722","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Jiangxi","egressLinkDirection":"太原","egressBitsRate":"158433592","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Zhejiang","egressLinkDirection":"太原","egressBitsRate":"156811248","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBitsRate":"156576054","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Heilongjiang","egressLinkDirection":"西宁","egressBitsRate":"156108237","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"155408172","serverProvince":"Gauteng","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"154722763","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"1536"},{"clientProvince":"Taiwan","egressLinkDirection":"太原","egressBitsRate":"154472580","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"154291956","serverProvince":"Yunnan","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"153030089","serverProvince":"New York","commonEgressLinkId":"256"},{"clientProvince":"Anhui","egressLinkDirection":"西安","egressBitsRate":"152872906","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"151842174","serverProvince":"England","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"148972079","serverProvince":"Hainan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"148499248","serverProvince":"Ningxia","commonEgressLinkId":"1792"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBitsRate":"147783337","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"147718164","serverProvince":"Papua","commonEgressLinkId":"1792"},{"clientProvince":"Hainan","egressLinkDirection":"西安","egressBitsRate":"145527307","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"145270640","serverProvince":"Noord-Holland","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"144511414","serverProvince":"Madrid, Comunidad de","commonEgressLinkId":"768"},{"clientProvince":"Hongkong","egressLinkDirection":"西安","egressBitsRate":"142663489","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"142401689","serverProvince":"Delhi","commonEgressLinkId":"1792"},{"clientProvince":"Ningxia","egressLinkDirection":"太原","egressBitsRate":"142153192","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Tokyo","egressLinkDirection":"西安","egressBitsRate":"141943435","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"141276756","serverProvince":"Yunnan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"140657165","serverProvince":"Region Metropolitana de Santiago","commonEgressLinkId":"768"},{"clientProvince":"Hongkong","egressLinkDirection":"太原","egressBitsRate":"140624436","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"140313058","serverProvince":"Praha, Hlavni mesto","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"139962039","serverProvince":"Ile-de-France","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"139397109","serverProvince":"Beyrouth","commonEgressLinkId":"1024"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBitsRate":"139305081","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBitsRate":"139258802","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"136908797","serverProvince":"Geneve","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"136856047","serverProvince":"Gyeonggi-do","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"136632751","serverProvince":"Auvergne-Rhone-Alpes","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"134589480","serverProvince":"Yunnan","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"133890314","serverProvince":"Bursa","commonEgressLinkId":"2816"},{"clientProvince":"Istanbul","egressLinkDirection":"太原","egressBitsRate":"133617735","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"130469788","serverProvince":"Niederosterreich","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"130006786","serverProvince":"Moscow","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"129964650","serverProvince":"Rizal","commonEgressLinkId":"1536"},{"clientProvince":"Taiwan","egressLinkDirection":"太原","egressBitsRate":"129875363","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBitsRate":"127969389","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"127794267","serverProvince":"Ningxia","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"126871995","serverProvince":"Taiwan","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"126790842","serverProvince":"Hainan","commonEgressLinkId":"256"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"126012526","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Illinois","egressLinkDirection":"太原","egressBitsRate":"124913700","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Anhui","egressLinkDirection":"太原","egressBitsRate":"124059975","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Tokyo","egressLinkDirection":"西宁","egressBitsRate":"122007525","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"121661221","serverProvince":"New Mexico","commonEgressLinkId":"2304"},{"clientProvince":"California","egressLinkDirection":"太原","egressBitsRate":"121371331","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBitsRate":"120729688","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"120210190","serverProvince":"Riau","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"119900221","serverProvince":"Quebec","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"119678942","serverProvince":"Osaka","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"119428963","serverProvince":"Yunnan","commonEgressLinkId":"512"},{"clientProvince":"Ankara","egressLinkDirection":"太原","egressBitsRate":"117349371","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"117304665","serverProvince":"Istanbul","commonEgressLinkId":"1280"},{"clientProvince":"Washington","egressLinkDirection":"太原","egressBitsRate":"115665188","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"114662153","serverProvince":"Georgia","commonEgressLinkId":"2304"},{"clientProvince":"Ningxia","egressLinkDirection":"西安","egressBitsRate":"111999147","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"111629395","serverProvince":"Guizhou","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"111530511","serverProvince":"Hovedstaden","commonEgressLinkId":"2048"},{"clientProvince":"Chongqing","egressLinkDirection":"太原","egressBitsRate":"110543699","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"110482743","serverProvince":"California","commonEgressLinkId":"512"},{"clientProvince":"Liaoning","egressLinkDirection":"西安","egressBitsRate":"110273361","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Washington","egressLinkDirection":"西安","egressBitsRate":"109771912","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"108652878","serverProvince":"Illinois","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"107244332","serverProvince":"Budapest","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"104868236","serverProvince":"Hallands lan","commonEgressLinkId":"1536"},{"clientProvince":"Jilin","egressLinkDirection":"太原","egressBitsRate":"104656013","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"103595570","serverProvince":"Uusimaa","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"102922555","serverProvince":"Utrecht","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"101778792","serverProvince":"Guangxi","commonEgressLinkId":"2304"},{"clientProvince":"Heilongjiang","egressLinkDirection":"西安","egressBitsRate":"101492624","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Ohio","egressLinkDirection":"太原","egressBitsRate":"99353294","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"96813338","serverProvince":"Gyeonggi-do","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"94930778","serverProvince":"Udmurtskaya Respublika","commonEgressLinkId":"2048"},{"clientProvince":"Beijing","egressLinkDirection":"西安","egressBitsRate":"94717447","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Hainan","egressLinkDirection":"太原","egressBitsRate":"94350817","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBitsRate":"94181550","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"94053149","serverProvince":"Tokyo","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"94035392","serverProvince":"Minnesota","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"93954295","serverProvince":"Budapest","commonEgressLinkId":"1536"},{"clientProvince":"Liaoning","egressLinkDirection":"太原","egressBitsRate":"93931511","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"92263238","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"89776758","serverProvince":"New South Wales","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"86386854","serverProvince":"Campania","commonEgressLinkId":"2304"},{"clientProvince":"Shanxi","egressLinkDirection":"西安","egressBitsRate":"85990678","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"84777876","serverProvince":"Istanbul","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"84665600","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"256"},{"clientProvince":"Colorado","egressLinkDirection":"太原","egressBitsRate":"84553224","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"83957714","serverProvince":"Geneve","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"82935046","serverProvince":"Oregon","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"82031216","serverProvince":"Maharashtra","commonEgressLinkId":"1536"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBitsRate":"81936337","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"79691322","serverProvince":"Chongqing","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"79371327","serverProvince":"Heilongjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"79353185","serverProvince":"Noord-Holland","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"78682013","serverProvince":"Ile-de-France","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"78241821","serverProvince":"Izmir","commonEgressLinkId":"512"},{"clientProvince":"Gansu","egressLinkDirection":"太原","egressBitsRate":"78235345","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Guizhou","egressLinkDirection":"太原","egressBitsRate":"77021469","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"76226978","serverProvince":"Uusimaa","commonEgressLinkId":"2048"},{"clientProvince":"Guangxi","egressLinkDirection":"西安","egressBitsRate":"75432642","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBitsRate":"73930708","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"73586428","serverProvince":"Guangxi","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"73183057","serverProvince":"Nei Mongol","commonEgressLinkId":"1024"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBitsRate":"72929438","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Hunan","egressLinkDirection":"西宁","egressBitsRate":"72519491","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"72302620","serverProvince":"Sao Paulo","commonEgressLinkId":"1792"},{"clientProvince":"Hamburg","egressLinkDirection":"太原","egressBitsRate":"72161589","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Liaoning","egressLinkDirection":"西安","egressBitsRate":"70056483","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"70048494","serverProvince":"Guizhou","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"69765671","serverProvince":"Dadra and Nagar Haveli","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"69050553","serverProvince":"Ohio","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"68200749","serverProvince":"Sachsen","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"67770748","serverProvince":"Ceara","commonEgressLinkId":"2048"},{"clientProvince":"Ciudad Autonoma de Buenos Aires","egressLinkDirection":"太原","egressBitsRate":"67554598","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"67067555","serverProvince":"Bern","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"66143723","serverProvince":"Hainan","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"66013103","serverProvince":"Stockholms lan","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"65429959","serverProvince":"Jilin","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"64330228","serverProvince":"Macao","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"63671610","serverProvince":"Jilin","commonEgressLinkId":"256"},{"clientProvince":"Shanghai","egressLinkDirection":"西安","egressBitsRate":"62654203","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Yunnan","egressLinkDirection":"西安","egressBitsRate":"61855884","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"61818551","serverProvince":"Ha Noi","commonEgressLinkId":"1280"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBitsRate":"61297351","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"61000837","serverProvince":"Colorado","commonEgressLinkId":"1024"},{"clientProvince":"Guangxi","egressLinkDirection":"西宁","egressBitsRate":"60928829","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"60180591","serverProvince":"Seoul-teukbyeolsi","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"60026224","serverProvince":"San Luis Potosi","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"59748233","serverProvince":"Phnom Penh","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"59684953","serverProvince":"Quintana Roo","commonEgressLinkId":"768"},{"clientProvince":"Noord-Holland","egressLinkDirection":"太原","egressBitsRate":"59306732","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"58872844","serverProvince":"Guizhou","commonEgressLinkId":"2304"},{"clientProvince":"Singapore","egressLinkDirection":"太原","egressBitsRate":"58727896","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Singapore","egressLinkDirection":"太原","egressBitsRate":"58342576","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Singapore","egressLinkDirection":"太原","egressBitsRate":"56821642","serverProvince":"Xinjiang","commonEgressLinkId":"2048"},{"clientProvince":"Abu Zaby","egressLinkDirection":"太原","egressBitsRate":"56422697","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Kerala","egressLinkDirection":"太原","egressBitsRate":"55473486","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"55085024","serverProvince":"Tianjin","commonEgressLinkId":"512"},{"clientProvince":"Tianjin","egressLinkDirection":"太原","egressBitsRate":"54164232","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"53734182","serverProvince":"North Carolina","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"53625342","serverProvince":"Ningxia","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"53493244","serverProvince":"New South Wales","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"52404926","serverProvince":"Nei Mongol","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"51816051","serverProvince":"Washington","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"51631390","serverProvince":"Karnataka","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"51507045","serverProvince":"Vlaams-Brabant","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"51336023","serverProvince":"Tierra del Fuego","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"51150076","serverProvince":"Jakarta Raya","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"50726338","serverProvince":"Primorskiy kray","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"49671621","serverProvince":"New York","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"49111241","serverProvince":"Jawa Barat","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"48501627","serverProvince":"Bac Kan","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"47734935","serverProvince":"Texas","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"47411001","serverProvince":"Dublin","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"46979494","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"1280"},{"clientProvince":"Uttar Pradesh","egressLinkDirection":"太原","egressBitsRate":"46874519","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"46704773","serverProvince":"Georgia","commonEgressLinkId":"512"},{"clientProvince":"Colorado","egressLinkDirection":"太原","egressBitsRate":"46683173","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"46660447","serverProvince":"Tel Aviv","commonEgressLinkId":"1792"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBitsRate":"46454039","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"45528943","serverProvince":"Nei Mongol","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"45383853","serverProvince":"Dublin","commonEgressLinkId":"2304"},{"clientProvince":"Singapore","egressLinkDirection":"西安","egressBitsRate":"45290259","serverProvince":"Xinjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"43480899","serverProvince":"Gyeonggi-do","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"42761639","serverProvince":"Massachusetts","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"42565494","serverProvince":"Yunnan","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"41790072","serverProvince":"Georgia","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"41532310","serverProvince":"Sao Paulo","commonEgressLinkId":"2048"},{"clientProvince":"Singapore","egressLinkDirection":"西安","egressBitsRate":"41279146","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"40501572","serverProvince":"Gia Lai","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"40420557","serverProvince":"Rizal","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"39990297","serverProvince":"Noord-Holland","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"39960767","serverProvince":"Heilongjiang","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"39172094","serverProvince":"Taiwan","commonEgressLinkId":"1024"},{"clientProvince":"Lagos","egressLinkDirection":"太原","egressBitsRate":"39149124","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"California","egressLinkDirection":"西安","egressBitsRate":"39145482","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Yunnan","egressLinkDirection":"太原","egressBitsRate":"39001928","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Heilongjiang","egressLinkDirection":"太原","egressBitsRate":"38984185","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"38821550","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"38454262","serverProvince":"Krung Thep Maha Nakhon","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"38290341","serverProvince":"Jakarta Raya","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"37882909","serverProvince":"Moscow","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"37459781","serverProvince":"Sao Paulo","commonEgressLinkId":"2304"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBitsRate":"37457876","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"37089834","serverProvince":"Vasterbottens lan","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"36445782","serverProvince":"Jilin","commonEgressLinkId":"512"},{"clientProvince":"Parana","egressLinkDirection":"太原","egressBitsRate":"36237613","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Texas","egressLinkDirection":"太原","egressBitsRate":"35970980","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"35429394","serverProvince":"Jakarta Raya","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"35090412","serverProvince":"New York","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"34840911","serverProvince":"Sao Paulo","commonEgressLinkId":"1536"},{"clientProvince":"Fujian","egressLinkDirection":"西安","egressBitsRate":"32572174","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Washington","egressLinkDirection":"太原","egressBitsRate":"32428003","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"32421463","serverProvince":"Mato Grosso do Sul","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"32364591","serverProvince":"National Capital Region","commonEgressLinkId":"1792"},{"clientProvince":"Quebec","egressLinkDirection":"西宁","egressBitsRate":"32307907","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"31977882","serverProvince":"Taiwan","commonEgressLinkId":"2048"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"30878903","serverProvince":"Texas","commonEgressLinkId":"1280"},{"clientProvince":"Beijing","egressLinkDirection":"西安","egressBitsRate":"30464224","serverProvince":"","commonEgressLinkId":"1280"},{"clientProvince":"Tianjin","egressLinkDirection":"西安","egressBitsRate":"30121618","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Hebei","egressLinkDirection":"太原","egressBitsRate":"29232151","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"","egressLinkDirection":"太原","egressBitsRate":"29050388","serverProvince":"Ohio","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"28071133","serverProvince":"Ha Noi","commonEgressLinkId":"768"},{"clientProvince":"National Capital Region","egressLinkDirection":"太原","egressBitsRate":"28031137","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"California","egressLinkDirection":"太原","egressBitsRate":"27817394","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"27515580","serverProvince":"Cebu","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"27193904","serverProvince":"England","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"26744227","serverProvince":"Lombardia","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"26629208","serverProvince":"Baden-Wurttemberg","commonEgressLinkId":"256"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"26509455","serverProvince":"Iowa","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"26125926","serverProvince":"Maharashtra","commonEgressLinkId":"1024"},{"clientProvince":"Rio Grande do Sul","egressLinkDirection":"太原","egressBitsRate":"24787716","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Antananarivo","egressLinkDirection":"太原","egressBitsRate":"24346337","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"22312181","serverProvince":"Arizona","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"21999236","serverProvince":"Stockholms lan","commonEgressLinkId":"512"},{"clientProvince":"Ho Chi Minh","egressLinkDirection":"西安","egressBitsRate":"21903929","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Hongkong","egressLinkDirection":"太原","egressBitsRate":"20741532","serverProvince":"Xinjiang","commonEgressLinkId":"1792"},{"clientProvince":"Hunan","egressLinkDirection":"太原","egressBitsRate":"20251952","serverProvince":"Xinjiang","commonEgressLinkId":"1536"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"19998737","serverProvince":"Guizhou","commonEgressLinkId":"2816"},{"clientProvince":"Shanghai","egressLinkDirection":"西安","egressBitsRate":"19266843","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Singapore","egressLinkDirection":"太原","egressBitsRate":"19153693","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"17450526","serverProvince":"Pennsylvania","commonEgressLinkId":"768"},{"clientProvince":"Beijing","egressLinkDirection":"西宁","egressBitsRate":"17329203","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Guangxi","egressLinkDirection":"太原","egressBitsRate":"17260571","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"16954209","serverProvince":"Yangon","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"16711567","serverProvince":"Gyeonggi-do","commonEgressLinkId":"2816"},{"clientProvince":"Washington","egressLinkDirection":"西宁","egressBitsRate":"16506371","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"16301591","serverProvince":"Gauteng","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"15363549","serverProvince":"Erevan","commonEgressLinkId":"2304"},{"clientProvince":"California","egressLinkDirection":"西安","egressBitsRate":"15317692","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"15170603","serverProvince":"Xizang","commonEgressLinkId":"256"},{"clientProvince":"Jakarta Raya","egressLinkDirection":"太原","egressBitsRate":"15044408","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Nei Mongol","egressLinkDirection":"太原","egressBitsRate":"14512419","serverProvince":"Xinjiang","commonEgressLinkId":"768"},{"clientProvince":"Beijing","egressLinkDirection":"太原","egressBitsRate":"13439017","serverProvince":"","commonEgressLinkId":"512"},{"clientProvince":"Sao Paulo","egressLinkDirection":"西安","egressBitsRate":"12429668","serverProvince":"Xinjiang","commonEgressLinkId":"2816"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"11768916","serverProvince":"Reunion","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"9116507","serverProvince":"Tehran","commonEgressLinkId":"1792"},{"clientProvince":"Xinjiang","egressLinkDirection":"太原","egressBitsRate":"8919383","serverProvince":"Ha Noi","commonEgressLinkId":"2304"},{"clientProvince":"Xinjiang","egressLinkDirection":"西宁","egressBitsRate":"8475439","serverProvince":"Hessen","commonEgressLinkId":"1024"},{"clientProvince":"Moscow","egressLinkDirection":"西安","egressBitsRate":"8167238","serverProvince":"Xinjiang","commonEgressLinkId":"1280"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"7672067","serverProvince":"Misamis Oriental","commonEgressLinkId":"1280"},{"clientProvince":"Shanxi","egressLinkDirection":"太原","egressBitsRate":"6260624","serverProvince":"Xinjiang","commonEgressLinkId":"2304"},{"clientProvince":"Jilin","egressLinkDirection":"西宁","egressBitsRate":"5154201","serverProvince":"Xinjiang","commonEgressLinkId":"1024"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"5074750","serverProvince":"Chiba","commonEgressLinkId":"256"},{"clientProvince":"Hainan","egressLinkDirection":"太原","egressBitsRate":"3639334","serverProvince":"Xinjiang","commonEgressLinkId":"512"},{"clientProvince":"Xinjiang","egressLinkDirection":"西安","egressBitsRate":"843585","serverProvince":"Podkarpackie","commonEgressLinkId":"256"}],"resultType":"table"},"originalUrl":"http://192.168.44.55:9999?query=SELECT%20client_province%20AS%20client_province%2Cegress_link_direction%20AS%20egress_link_direction%2Ccommon_egress_link_id%20AS%20common_egress_link_id%2Cserver_province%20AS%20server_province%2CSUM%28traffic_outbound_byte%29%20AS%20egress_bytes%20FROM%20metric_link%20WHERE%20stat_time%20%3E%3D%201665553865%20AND%20stat_time%20%3C%201665557465%20AND%20notEmpty%28egress_link_direction%29%20GROUP%20BY%20client_province%2Cegress_link_direction%2Ccommon_egress_link_id%2Cserver_province%20ORDER%20BY%20egress_bytes%20DESC&format=json&option=real-time","success":true,"meta":[{"type":"string","name":"client_province","category":"Dimension"},{"type":"string","name":"egress_link_direction","category":"Dimension"},{"type":"long","name":"common_egress_link_id","category":"Dimension"},{"type":"string","name":"server_province","category":"Dimension"},{"type":"long","name":"egress_bytes","category":"Metric"}],"formatType":"json","status":200,"statistics":{"result_rows":914,"bytes_read":654501,"elapsed":4,"rows_read":9082,"result_size":120250}}*/
