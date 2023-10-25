import timeFuns from './timeMap'
import { getMillisecond } from '../../utils/date-util'
const Second = 1
const Min = 60 * Second // seconds In 1 minute
const Hour = 60 * Min
const Day = 24 * Hour
const Week = 7 * Day
const Month = 30 * Day
const Year = 12 * Month

export default function getTimeGranularity (timeRange, ruleFun = 'commonGranularity') {
  if (!timeRange || timeRange.length !== 2) {
    console.error('请输入 合适的开始时间和结束时间')
    return
  }

  // 时间间隔 以秒为单位
  const durationBySeconds = Math.abs(new Date(getMillisecond(timeRange[1])).getTime() - new Date(getMillisecond(timeRange[0])).getTime()) / 1000

  // 字符串类型的内置 时间粒度函数
  let timeFunctions = ruleFun
  if (Object.prototype.toString.call(ruleFun) === '[object String]') {
    timeFunctions = timeFuns[ruleFun]
  }
  if (Object.prototype.toString.call(ruleFun) === '[object Function]') {
    timeFunctions = ruleFun
  }
  if (!timeFunctions) {
    console.error('请输入 规则方法,或者内置规则方法名称(commonGranularity,aiLearningGranularity等)')
    return
  }

  return timeFunctions(durationBySeconds, { Second, Min, Hour, Day, Week, Month, Year })
}
