import { ElMessageBox, ElMessage } from 'element-plus'
import i18n from '@/i18n'
import _ from 'lodash'
import { storageKey, iso36112, topDomain, echartsFontSize, dbGeoDataTableName, networkTable, dbDrilldownTableConfig } from '@/utils/constants'
import { getIso36112JsonData, getDictList } from '@/utils/api'
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

export function computeScore (data) {
  let score = 0
  let k = 0
  let totalScore = 0
  const scoreArr = []
  let num = 0
  Object.keys(data).forEach(t => {
    if (!data[t]) {
      num += 1
    }
    if (t === 'establishLatencyMs' || t === 'tcpLostlenPercent' || t === 'pktRetransPercent') {
      k = 0.3
    } else if (t === 'httpResponseLatency' || t === 'sslConLatency') {
      k = 0.05
    }
    if (t === 'establishLatencyMs' || t === 'httpResponseLatency' || t === 'sslConLatency') {
      if (!data[t] && data[t] !== 0) {
        score = 1
      } else if (data[t] <= 50) {
        score = 1
      } else if (data[t] > 200) {
        score = 0
      } else {
        score = (data[t] - 200) / (50 - 200)
      }
    } else if (t === 'tcpLostlenPercent' || t === 'pktRetransPercent') {
      if (!data[t] && data[t] !== 0) {
        score = 1
      } else if (data[t] <= 0.01) {
        score = 1
      } else if (data[t] > 0.05) {
        score = 0
      } else {
        score = (data[t] - 0.05) / (0.01 - 0.05)
      }
    }
    scoreArr.push(score * k)
  })
  scoreArr.forEach(t => {
    totalScore += t
  })
  totalScore = Math.ceil(totalScore * 6)
  if (totalScore > 6) {
    totalScore = 6
  }
  if (num === 5) {
    return '-'
  }
  return totalScore
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
export async function getDnsMapData (type) {
  const codeValueMap = new Map()
  const dnsData = await getDictList({ type: type, pageSize: -1 })
  if (dnsData && dnsData.length > 0) {
    dnsData.forEach(mapData => {
      const code = mapData.code
      if (code.indexOf('-') > -1) {
        const range = mapData.code.split('-')
        if (range && range.length >= 2) {
          const start = range[0].trim()
          const eEnd = range[1].trim()
          mapData.value = (start <= code && code <= eEnd) ? mapData.value : code
          for (let i = start; i <= eEnd; i++) {
            codeValueMap.set(i, mapData.value)
          }
        }
      } else {
        codeValueMap.set(code, mapData.value)
      }
    })
  }
  return codeValueMap
}
export function handleSpecialValue (value) {
  value = value.replaceAll("'", "\\\\'")
    .replaceAll('"', '\\"')
    .replaceAll('&', '%26')
  return value
}
export function combineTabList (tableType, list, commonTabList) {
  const curTableInCode = networkTable[tableType] ? networkTable[tableType] : networkTable.networkOverview
  const listInCode = curTableInCode ? curTableInCode.tabList : []
  list.forEach(tab => {
    // 配置的内容
    const tabName = tab ? (tab.name ? tab.name : tab) : ''
    // 配置的内容
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
  })
}
/*
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
*/
export async function getDefaultCurTab (tableType, metric, columnName) {
  const tabList = await getUserDrilldownTableConfig(tableType, metric)
  const curTab = tabList.filter(item => item.label === columnName)[0]
  return curTab
}

export async function readDrilldownTableConfigByUser () {
  // 获取用户定制的自定义配置
  const userId = localStorage.getItem(storageKey.userId)
  const userLocalCongfig = await db[dbDrilldownTableConfig].get({ id: userId })
  let defaultDrillDownTableConfigs = []
  if (userLocalCongfig) {
    defaultDrillDownTableConfigs = userLocalCongfig.config
  }
  return defaultDrillDownTableConfigs
}

export async function getConfigVersion (id) {
  let defaultCongfigInDb = await db[dbDrilldownTableConfig].get({ id: id })
  let version
  if (defaultCongfigInDb) {
    version = defaultCongfigInDb ? defaultCongfigInDb.version : ''
  } else {
    defaultCongfigInDb = await db[dbDrilldownTableConfig].get({ id: 'default' })
  }
  return version
}

export async function combinDrilldownTableWithUserConfig () {
  const defaultCongfigInDb = await db[dbDrilldownTableConfig].get({ id: 'default' })
  const defaultConfigs = defaultCongfigInDb ? defaultCongfigInDb.config : []
  const curUserConfig = await readDrilldownTableConfigByUser()
  if (defaultConfigs && curUserConfig && curUserConfig.length > 0) {
    defaultConfigs.forEach(defaultConfig => {
      const currentTableConfig = curUserConfig.find(config => config.route === defaultConfig.route)
      if (currentTableConfig) {
        const tableConfig = defaultConfig.tables.find(table => table.id === defaultConfig.route)
        const newTableConfig = currentTableConfig.tables.find(table => table.id === defaultConfig.route)
        tableConfig.hiddenColumns = newTableConfig.hiddenColumns
        tableConfig.tabs.forEach(tab => {
          const newTab = newTableConfig.tabs.find(newTab => newTab.name === tab.name)
          if (newTab) {
            tab.hiddenDrilldownTabs = newTab.hiddenDrilldownTabs
            tab.checked = newTab.checked
          }
        })
      }
    })
  }
  return defaultConfigs
}

export async function getUserDrilldownTableConfig (tableType, curMetric) {
  let list = []
  // 获取用户定制的自定义配置，如果没有，则使用默认的自定义配置
  const drillDownTableConfigs = await combinDrilldownTableWithUserConfig()
  const currentTableConfig = drillDownTableConfigs.find(config => config.route === tableType)
  const commonTabList = currentTableConfig ? currentTableConfig.tabs : []
  const tables = currentTableConfig ? currentTableConfig.tables : []
  if (tables && tables.length > 0) {
    const curTableOldConfig = tables.find(table => table.id === tableType)
    const curTable = curTableOldConfig || null
    if (curTable) {
      list = curTable ? curTable.tabs : []
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
