import { autoGranularity } from './autoGranularity'

const Second = 1
const Min = 60 * Second // seconds In 1 minute
const Hour = 60 * Min
const Day = 24 * Hour
const Week = 7 * Day
const Month = 30 * Day
const Year = 12 * Month

/*
* 驶入时间间隔   单位是S
* 输出式按键粒度 单位是S
* */

/* 通用-时间粒度，step整分钟 */
function commonGranularity (durationBySeconds = 0) {
  /* 增加时间粒度处理 */
  if (durationBySeconds <= Hour) {
    return Min // max: 60
  } else if (durationBySeconds > Hour && durationBySeconds <= 3 * Hour) {
    return Min * 2 // max:90
  } else if (durationBySeconds > 3 * Hour && durationBySeconds <= 6 * Hour) {
    return Min * 5 // max: 72
  } else if (durationBySeconds > 6 * Hour && durationBySeconds <= 24 * Hour) {
    return Min * 10 // max:144
  } else if (durationBySeconds > Day && durationBySeconds <= 2 * Day) {
    return Min * 20 // max:144
  } else if (durationBySeconds > 2 * Day && durationBySeconds <= Week) {
    return Hour // 168
  } else if (durationBySeconds > Week && durationBySeconds <= Month) {
    return Hour * 6 // 120
  } else if (durationBySeconds > Month && durationBySeconds <= 3 * Month) {
    return Hour * 12 // 180
  } else if (durationBySeconds > 3 * Month && durationBySeconds <= Year) {
    return Day * 2 // 182
  }

  // 默认 100个点,自动计算
  return autoGranularity(durationBySeconds, {
    limit: 100
  })
}

/* 专用-报告的时间粒度 step整小时 */
function aiLearningGranularity (durationBySeconds = 0) {
  if (durationBySeconds <= Day) {
    return Hour // max: 24
  } else if (durationBySeconds > Day && durationBySeconds <= 2 * Day) {
    return Hour * 2 // 24
  } else if (durationBySeconds > 2 * Day && durationBySeconds <= Week) {
    return Hour * 6 // 28
  } else if (durationBySeconds > Week && durationBySeconds <= 15 * Day) {
    return Hour * 12 // 30
  } else if (durationBySeconds > 15 * Day && durationBySeconds <= Month) {
    return Hour * 24 // 30
  }
  // 预留逻辑：若超过1个月，默认30个点,自动计算
  return autoGranularity(durationBySeconds, {
    limit: 30
  })
}

// 需要内置的 可以陆续在下面继续写

export default {

  /* 通用-粗略的 时间粒度  */
  commonGranularity,

  /* 专用-知识库智能学习 时间粒度 */
  aiLearningGranularity
}
