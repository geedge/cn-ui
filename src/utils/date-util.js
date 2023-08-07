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
// 日期转换为时间戳
export function toTime (date) {
  return new Date(date).getTime()
}
// 时间格式转换
export function dateFormat (date, format = 'YYYY-MM-DD HH:mm:ss') {
  let d
  // date不是数字，则视为utc时区的时间字符串，例如2022-02-22 22:22
  if (isNaN(date)) {
    d = window.$dayJs(date).valueOf() + parseInt(localStorage.getItem(storageKey.timezoneLocalOffset)) * 3600000
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
// 带时区的日期转为utc日期
export function dateFormatToUTC (date, format = 'YYYY-MM-DD HH:mm:ss') {
  let d = date
  // date不是数字，则视为utc时区的时间字符串，例如2022-02-22 22:22
  if (isNaN(date)) {
    d = window.$dayJs(date).valueOf() - parseInt(localStorage.getItem(storageKey.timezoneLocalOffset)) * 3600000
  } else {
    d = getMillisecond(date)
  }
  d = window.$dayJs(d).tz().format(format)
  return d
}

/**
 * 时间戳转年月日时分秒，置于数组中，配合el-date-picker使用
 * @param time
 * @returns {number[]}
 */
export function timestampToList (time) {
  // 根据地址获取当前时区
  const newTimezone = window.$dayJs.tz().utcOffset() / 60
  // 缓存的本地时区
  const localTimezone = parseInt(localStorage.getItem(storageKey.timezoneLocalOffset))
  const date = new Date(getMillisecond(time + (newTimezone - localTimezone) * 3600))

  const Y = date.getFullYear()
  const M = date.getMonth()
  const D = date.getDate()
  const H = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()

  return [Y, M, D, H, m, s]
}
/**
 * 返回浏览器本地时区和服务器时区的毫秒差
 * @returns {number}
 */
export function millTimestampDiffFromTz () {
  return parseInt(localStorage.getItem(storageKey.timezoneLocalOffset)) * 3600 * 1000 - window.$dayJs.tz().utcOffset() * 60 * 1000
}
/**
 * echarts时间类型横坐标formatter
 * @returns {String}
 */
export function xAxisTimeFormatter (value) {
  const date = new Date(value - millTimestampDiffFromTz())
  const dayStart = new Date(value - millTimestampDiffFromTz())
  dayStart.setHours(0)
  dayStart.setMinutes(0)
  dayStart.setSeconds(0)
  dayStart.setMilliseconds(0)
  const hourStart = new Date(value - millTimestampDiffFromTz())
  hourStart.setMinutes(0)
  hourStart.setSeconds(0)
  hourStart.setMilliseconds(0)
  const HHmm = (date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()) +
    ':' +
    (date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes())
  // 如果是一天的开始
  if (date.getTime() === dayStart.getTime()) {
    return '{day|' + dateFormat(date, 'YYYY-MM-DD') + '}'
  } else if (date.getTime() === hourStart.getTime()) {
    return '{hour|' + HHmm + '}'
  } else {
    return HHmm
  }
}
export const xAxisTimeRich = {
  day: {
    fontWeight: 'bold'
  },
  hour: {
    fontWeight: 'bold'
  }
}
