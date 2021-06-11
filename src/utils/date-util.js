// 获取初始化时间，默认最近一周
import moment from 'moment-timezone'

Date.prototype.setStart = function () {
  this.setHours(0)
  this.setMinutes(0)
  this.setSeconds(0)
}
Date.prototype.setEnd = function () {
  this.setHours(23)
  this.setMinutes(59)
  this.setSeconds(59)
}

export function getDefaultDate () {
  let start = this.getDays(-7)
  let end = this.getDays(0)
  start.setStart()
  end.setEnd()
  // let start = this.getHoursTime(-1);
  // let end = this.getHoursTime(0);
  start = this.timeFormate(start, 'yyyy-MM-dd hh:mm:ss')
  end = this.timeFormate(end, 'yyyy-MM-dd hh:mm:ss')
  this.selectDate = [start, end]
}

export function getHoursTime (hours) {
  const today = new Date().getTime()
  const date = new Date(today + (hours * 60 * 60 * 1000))
  return date
}

// 初始化日期
export function getDays (days) {
  const today = new Date().getTime()
  return new Date(today + (days * 24 * 60 * 60 * 1000))
}
export function formatDate (date, type) {
  const yy = date.getFullYear()
  const dateM = date.getMonth() + 1
  const mm = dateM > 9 ? dateM : `0${dateM}`
  const dateD = date.getDate()
  const dd = dateD > 9 ? dateD : `0${dateD}`
  if (type) {
    return `${yy}${type}${mm}${type}${dd}`
  }
  return `${yy}${mm}${dd}`
}
export function timeFormate (date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  const time = new Date(date)
  let fm = fmt
  // fmt 自定义格式,如：yy-MM-dd
  let week = ''
  switch (time.getDay()) {
    case 0:
      week = '周日'
      break
    case 1:
      week = '周一'
      break
    case 2:
      week = '周二'
      break
    case 3:
      week = '周三'
      break
    case 4:
      week = '周四'
      break
    case 5:
      week = '周五'
      break
    case 6:
      week = '周六'
      break
    default:
      week = ''
      break
  }
  const o = {
    'M+': time.getMonth() + 1, // 月份
    'd+': time.getDate(), // 日
    hh: time.getHours(), // 小时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds(), // 秒
    'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
    S: time.getMilliseconds(), // 毫秒
    w: week
  }
  if (/(y+)/.test(fm)) {
    fm = fm.replace(RegExp.$1, (time.getFullYear().toString()).substr(4 - RegExp.$1.length))
  }
  Object.keys(o).forEach((k) => {
    if (new RegExp(`(${k})`).test(fm)) {
      fm = fm.replace(RegExp.$1, (RegExp.$1.length === 1)
        ? (o[k])
        : ((`00${o[k]}`).substr((`${o[k]}`).length)))
    }
  })
  return fm
}
// 格式化tag为字符串表达式
export function tagsToString (metric, arr) {
  let str = metric
  let sepStr = ''
  arr.forEach((item, index) => {
    if (index === 0) {
      str += '{'
      if (item.value.length === 1) {
        str += `${item.name}='${item.value.join('|')}'`
        sepStr = ','
      } else if (item.value.length > 1) {
        str += `${item.name}=~'${item.value.join('|')}'`
        sepStr = ','
      }
    } else {
      if (item.value.length === 1) {
        str += sepStr + `${item.name}='${item.value.join('|')}'`
        sepStr = ','
      } else if (item.value.length > 1) {
        str += sepStr + `${item.name}=~'${item.value.join('|')}'`
        sepStr = ','
      }
    }
  })
  if (str.indexOf('{') > -1) {
    str += '}'
  }
  if (str.endsWith('{}')) {
    str = str.substring(0, str.indexOf('{'))
  }
  return str
}
export function getStep (startTime, endTime) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  let step = '15s'
  const numInterval = end.getTime() - start.getTime()
  const oneDay = 86400000
  const sevenDay = 604800000
  const thirtyDay = 2592000000
  if (numInterval < oneDay) { // 小于1天，step为15s
    step = '15s'
  } else if (numInterval < sevenDay) {
    step = '5m'
  } else if (numInterval < thirtyDay) {
    step = '10m'
  } else {
    step = '30m'
  }
  return step
}
export function isEmptyObject (obj) {
  if (obj) {
    let name = ''
    // eslint-disable-next-line
    for (name in obj) { return false; }
    return true
  }
  return true
}
export function validateEmail (rule, value, callback) {
  if (value === '') {
    callback(new Error('请输入邮箱'))
  } else if (!this.emailReg.test(value)) {
    callback(new Error('邮箱格式不正确'))
  } else {
    callback()
  }
}
export function getNumStr (num) {
  if (num >= 1000) {
    const kbNum = num / 1000
    if (kbNum >= 1000) {
      const mbNum = kbNum / 1000
      if (mbNum > 1000) {
        const gbNum = mbNum / 1000
        if (gbNum > 1000) {
          const tbNum = gbNum / 1000
          if (tbNum > 1000) {
            const pbNum = tbNum / 1000
            return `${pbNum.toFixed(2)}PB`
          }
          return `${tbNum.toFixed(2)}TB`
        }
        return `${gbNum.toFixed(2)}GB`
      }
      return `${mbNum.toFixed(2)}MB`
    }
    return `${kbNum.toFixed(2)}KB`
  }
  return num.toFixed(2)
}
// 将本地时区转为系统配置的时区
export function computeTimezone (sourceTime) {
  let offset = localStorage.getItem('cn-sys-timezone')
  offset = moment.tz(offset).format('Z')
  if (offset && offset !== 'undefined') {
    offset = Number.parseInt(offset)
    const date = new Date(sourceTime)
    const localOffset = date.getTimezoneOffset() * 60 * 1000 // 默认 一分钟显示时区偏移的结果
    const utcTime = sourceTime + localOffset
    return utcTime + (offset * 60 * 60 * 1000)
  } else {
    return sourceTime
  }
}
// 将本地时区转为系统配置的时区
export function computeTimezoneTime (sourceTime) {
  let offset = localStorage.getItem('cn-sys-timezone')
  offset = moment.tz(offset).format('Z')
  if (offset && offset !== 'undefined') {
    offset = Number.parseInt(offset)
    const date = new Date(sourceTime)
    const localOffset = date.getTimezoneOffset() * 60 * 1000 // 默认 一分钟显示时区偏移的结果
    const utcTime = date.getTime() + localOffset
    return utcTime + (offset * 60 * 60 * 1000)
  } else {
    return sourceTime
  }
}
export function getTimezontDateRange (offset = -1) {
  return [
    new Date(new Date(this.computeTimezone(new Date().getTime())).setHours(new Date(this.computeTimezone(new Date().getTime())).getHours() + offset)),
    new Date(this.computeTimezone(new Date().getTime()))
  ]
}
export function getOffsetTimezoneData (offset = 0) {
  return new Date(this.computeTimezone(new Date().getTime())).setHours(new Date(this.computeTimezone(new Date().getTime())).getHours() + offset)
}
export function debounce (fn, delay) {
  // 记录上一次的延时器
  let timer = null
  delay = delay || 200
  return function () {
    const args = arguments
    const that = this
    // 清除上一次延时器
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(that, args)
    }, delay)
  }
}
export function UTCTimeToConfigTimezone (utcTime) {
  let offset = localStorage.getItem('cn-sys-timezone')
  offset = moment.tz(offset).format('Z')
  if (offset && offset !== 'undefined') {
    let time = utcTime
    if (typeof time === 'string' && /(\d+?-){2}\d+?\s(\d+?:)*\d+/.test(time)) {
      time = new Date(time).getTime()
    }
    offset = Number.parseInt(offset)
    time += offset * 60 * 60 * 1000
    return time
  } else {
    return utcTime
  }
}
export function configTimezoneToUTCTime (configTime) {
  let offset = localStorage.getItem('cn-sys-timezone')
  offset = moment.tz(offset).format('Z')
  if (offset && offset !== 'undefined') {
    let time = configTime
    if (typeof time === 'string' && /(\d+?-){2}\d+?\s(\d+?:)*\d+/.test(time)) {
      time = new Date(time).getTime()
    }
    offset = Number.parseInt(offset)
    time -= offset * 60 * 60 * 1000
    return time
  } else {
    return configTime
  }
}
