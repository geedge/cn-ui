const Second = 1
const Min = 60 * Second // seconds In 1 minute
const Hour = 60 * Min
const Day = 24 * Hour
const Week = 7 * Day
const Month = 30 * Day
const Year = 12 * Month

const timeUnitDict = {
  S: Second,
  M: Min,
  H: Hour,
  D: Day,
  W: Week,
  Mon: Month,
  Y: Year
}

// 计算  粒度
function calcGranularity (type, exactMs) {
  let value = null
  if (type === 'S') {
    value = Math.ceil(exactMs / 1000)
  }
  if (type === 'M') {
    value = Math.ceil(exactMs / (60 * 1000))
  }
  if (type === 'H') {
    value = Math.ceil(exactMs / (60 * 60 * 1000))
  }

  if (type === 'D') {
    value = Math.ceil(exactMs / (24 * 60 * 60 * 1000))
  }

  return ({ timeRangeMs, step, limit }) => {
    let res = 1
    let accumulation = 0
    while (1) {
      if (value < accumulation + step) {
        res = accumulation || 1 // 至少是1
        break
      }
      accumulation += step
    }
    if (step !== 1) {
      res = correctionGranularity({ calcResult: res, timeRangeMs, limit, type, step, exactMs })
    }
    return res
  }
}

// 修正时间粒度 如果计算误差大 按照1 的步长计算 , 误差范围30%
function correctionGranularity ({ calcResult, timeRangeMs, limit, type, step, exactMs }) {
  let pointCount = null
  let isDeviationAccept = null

  // 计算误差
  let res = calcResult
  pointCount = timeRangeMs / (res * timeUnitDict[type] * 1000)
  isDeviationAccept = calcDeviation(pointCount, limit, res)
  if (isDeviationAccept) {
    return res
  }

  // res +step  计算误差
  res = res + step
  pointCount = timeRangeMs / (res * timeUnitDict[type] * 1000)
  isDeviationAccept = calcDeviation(pointCount, limit, res)
  if (isDeviationAccept) {
    return res
  }

  // 直接使用1为步长, 计算时间粒度,不用校验精度
  return calcGranularity(type, exactMs)({ timeRangeMs, step: 1, limit })
}

// 获取计算偏差
function calcDeviation (pointCount, limit, calcResult) {
  // 偏差0.5 可以接受
  return Math.abs(pointCount - limit) / limit <= 0.5
}

// 计算级别  秒 分  小时 ....
function calcMagnitude (exactMs, options) {
  // 这里的拆分 可能导致粒度过大 ...
  // 60s 以下  秒级粒度
  if (exactMs < 60 * 1000) {
    return 'S'
  }
  /* 60分钟以下 分钟级粒度 */
  if (exactMs >= 60 * 1000 && exactMs < 60 * 60 * 1000) {
    return 'M'
  }
  /* 24小时以下 小时级粒度 */
  if (exactMs >= 60 * 60 * 1000 && exactMs < 24 * 60 * 60 * 1000) {
    return 'H'
  }
  /* 一天以下 天级粒度 */
  if (exactMs >= 24 * 60 * 60 * 1000) {
    return 'D'
  }

  /* 周级 暂时不做 ... */
  /* 月级粒度 */
}

// 返回的时间粒度是  秒
export function getGranularity (timeRange = [], opt = {}, unit = 's') {
  if (!timeRange || timeRange.length !== 2) {
    console.error('请输入 合适的开始时间和结束时间')
    return
  }
  const durationBySeconds = Math.abs((new Date(timeRange[0]).getTime() - new Date(timeRange[1]).getTime()) / 1000)
  return autoGranularity(durationBySeconds, opt, unit)
}

// 返回的时间粒度是  秒
export function autoGranularity (durationBySeconds = 0, opt = {}, unit = 's') {
  const options = {
    limit: opt.limit || 100,
    sStep: opt.sStep || 10,
    mStep: opt.mStep || 10,
    hStep: opt.hStep || 1,
    dStep: opt.dStep || 1
  }
  const timeRangeMs = durationBySeconds * 1000
  const exactMs = timeRangeMs / options.limit

  const granularityMagnitude = calcMagnitude(exactMs, options)
  let granularity = null
  let granularityObj = {}

  // 秒级粒度
  if (granularityMagnitude === 'S') {
    granularity = calcGranularity('S', exactMs)({ timeRangeMs, step: options.sStep, limit: options.limit })
    granularityObj = {
      granularity: granularity,
      type: 'S',
      second: granularity
    }
  }
  /* 分钟级粒度 */
  if (granularityMagnitude === 'M') {
    granularity = calcGranularity('M', exactMs)({ timeRangeMs, step: options.mStep, limit: options.limit })
    granularityObj = {
      granularity: granularity,
      type: 'M',
      second: granularity * 60
    }
  }
  /* 小时级粒度 */
  if (granularityMagnitude === 'H') {
    granularity = calcGranularity('H', exactMs)({ timeRangeMs, step: options.hStep, limit: options.limit })
    granularityObj = {
      granularity: granularity,
      type: 'H',
      second: granularity * 60 * 60
    }
  }
  /* 天级粒度 */
  if (granularityMagnitude === 'D') {
    granularity = calcGranularity('D', exactMs)({ timeRangeMs, step: options.dStep, limit: options.limit })
    granularityObj = {
      granularity: granularity,
      type: 'D',
      second: granularity * 60 * 60 * 24
    }
  }
  if (!granularity) {
    console.error('计算时间粒度失败')
    return null
  }
  if (unit === 's') {
    return granularityObj.second
  }

  return granularityObj
}
