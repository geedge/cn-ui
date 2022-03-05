import _ from 'lodash'
// 获取初始化时间，默认最近一周
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
// 将时间转化为秒
export function getSecond (time) {
  const ms = getMillisecond(time)
  return ms ? Math.floor(ms / 1000) : null
}
// 将时间转化为毫秒
export function getMillisecond (time) {
  let ms = null
  if (_.isDate(time)) {
    ms = time.getTime()
  } else if (_.isNumber(time)) {
    const timeStr = _.toString(time)
    const difference = timeStr.length - 13
    if (difference >= 0) {
      ms = timeStr.slice(0, 13)
    } else {
      ms = Math.floor(time * (10 ** (0 - difference)))
    }
  }
  return ms
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
  return window.$dayJs.tz(new Date(date)).format('YYYY-MM-DD HH:mm:ss')
}
