import _ from 'lodash'
import { storageKey } from '@/utils/constants'

// 将时间转化为秒
export function getSecond (time) {
  const ms = getMillisecond(time)
  return ms ? Math.floor(ms / 1000) : null
}
// 将时间转化为毫秒
export function getMillisecond (time) {
  let ms = null
  if (_.isDate(time)) {
    ms = window.$dayJs.tz(new Date(time)).valueOf()
  } else if (_.isNumber(time)) {
    const timeStr = _.toString(time)
    const difference = timeStr.length - 13
    if (difference >= 0) {
      ms = window.$dayJs.tz(new Date(Number(timeStr.slice(0, 13)))).valueOf()
    } else {
      ms = window.$dayJs.tz(new Date(Math.floor(time * (10 ** (0 - difference))))).valueOf()
    }
  } else if (_.isString(time)) {
    try {
      ms = window.$dayJs.tz(new Date(time)).valueOf()
    } catch (e) {
      ms = null
    }
  }
  return ms || null
}
// 初始化日期
export function getNowTime (interval) {
  const endTime = window.$dayJs.tz().valueOf()
  const startTime = endTime - interval * 60 * 1000
  return {
    startTime,
    endTime
  }
}
// 日期格式转换
export function rTime (date) {
  return window.$dayJs.tz(new Date(date)).format('MM-DD HH:mm')
}
// 时间格式转换
export function dateFormat (date, format = 'YYYY-MM-DD HH:mm:ss') {
  let d = date
  // date不是数字，则视为时间字符串，例如2022-02-22 22:22
  if (isNaN(date)) {
    d = window.$dayJs(date).valueOf() + parseInt(localStorage.getItem('cn-timezone-local-offset'))
  } else {
    d = getMillisecond(date)
  }
  d = window.$dayJs(d).tz().format(format)
  return d
}
// 时间格式转换，使用appearance的时间格式
export function dateFormatByAppearance (date) {
  return dateFormat(date, localStorage.getItem(storageKey.dateFormat))
}
