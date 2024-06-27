import vue from '@/main.js'
// import Moment from "moment/moment";
// import {transformToUTCTime} from './TimeZone.js'

// 默认Schema 延时15s ,时间粒度 1s
const defaultSchema = {
  doc: {
    measurements: {
      granularity: 1,
      ingestion_delay: 15
    }
  }
}

let schemaDict = null
function getSchemaFromLocal (schemaType) {
  let schemaData = null
  // if(schemaDict?.[schemaType]){
  //   schemaData=schemaDict
  // }else{
  schemaData = localStorage.getItem('TSGSchema')
  // }
  if (!schemaData) {
    return null
  }
  const storeData = JSON.parse(schemaData)[schemaType]
  // 如果根据key没有找到数据，直接返回空
  if (!storeData) {
    return null
  }
  const parsedData = storeData
  const currentTimestamp = new Date().getTime()

  // 将当前的时间戳和保存在storage中的timestamp进行比较
  // 如果时间差小于等于过期时间说明没有过期，直接返回数据
  // 否则，说明数据已经过期，将storage中的key清除
  if (currentTimestamp - parsedData.timestamp <= parsedData.expire) {
    return parsedData.value ? JSON.parse(parsedData.value) : parsedData.value
  } else {
    setDashboardSchema(schemaType, '')
  }
  return null
}

/**
 * 向localStorage中添加字段
 * @param {*} schemaType 保存数据的key
 * @param {*} value 保存的数据
 * @param {*} expire 过期时间，默认为1分钟
 */
function setDashboardSchema (schemaType, value, expire = 60000) {
  const schemaData = localStorage.getItem('TSGSchema')
  if (!schemaData) {
    localStorage.setItem('TSGSchema', '{}')
  }
  const TSGSchema = JSON.parse(localStorage.getItem('TSGSchema'))
  TSGSchema[schemaType] = {
    value: value,
    expire: expire,
    timestamp: new Date().getTime()
  }
  const stringfiedData = JSON.stringify(TSGSchema)
  localStorage.setItem('TSGSchema', stringfiedData)
  schemaDict = TSGSchema
}

// 获取过期时间毫秒数
function getExpireTime (data) {
  const expireDate = data.expireDate
  if (!expireDate) {
    return 24 * 60 * 60 * 1000
  }
  const expireTime = new Date().getTime() - expireDate
  return expireTime
}

function getSchemaFromRemote (schemaType) {
  return vue.$get(`/interface/gateway/api/galaxy/v1/metadata/schema/${schemaType}`).then(res => {
    if (res.status === 200) {
      const expireTime = getExpireTime(res.data)
      setDashboardSchema(schemaType, JSON.stringify(res.data), expireTime)
      return res.data
    }
    return defaultSchema
  }).catch(err => {
    console.error(err)
    return defaultSchema
  })
}

// async  延时时间
// 转换时间  start  end   schmaType 相对时间  绝对时间
// 时间粒度

// 获取Schema数据,存在于local 直接取,不存在 直接请求,存本地
async function getSchemaInfo (schemaType = '') {
  let schemaInfo = getSchemaFromLocal(schemaType)
  if (!schemaInfo) {
    schemaInfo = await getSchemaFromRemote(schemaType)
  }
  return schemaInfo
}

/*
* 这里对 时间的延时
* 时间范围做处理
* 默认 不做 UTC 转换处理
*
* granularity 单位必须是S 秒
* */
async function getTimeQueryParams ({ start, end, schemaType = '', granularity = 1, toUtc = false, delay = false }) {
  const schemaData = await getSchemaInfo(schemaType)

  const schema_ingestion_delay = schemaData?.doc?.measurements?.ingestion_delay || 0
  const schema_granularity = schemaData?.doc?.measurements?.granularity || 1

  // 这里需要考虑  传入的是UTC 时间,Moment 可以正常处理吗
  const delayTime = delay ? schema_ingestion_delay : 0
  // let startDate = Moment(start).subtract(delayTime, 'seconds')
  // let endDate = Moment(end).subtract(delayTime, 'seconds')
  const startDate = '1'
  const endDate = '2'

  let startStr = startDate.format('YYYY-MM-DD HH:mm:ss')
  let endStr = endDate.format('YYYY-MM-DD HH:mm:ss')

  // 前端计算时间粒度,不能比Schema 支持的最小时间粒度 小
  const alignmentPeriod = schema_granularity > granularity ? schema_granularity : granularity

  // UTC 转换
  if (toUtc) {
    // startStr = transformToUTCTime(startStr)
    // endStr = transformToUTCTime(endStr)
    startStr = 'transformToUTCTime(startStr)'
    endStr = 'transformToUTCTime(endStr)'
  }
  return {
    start: startStr,
    end: endStr,
    granularity: 'PT' + schema_granularity + 'S',
    alignmentPeriod: 'PT' + alignmentPeriod + 'S'
  }
}

export default {
  getTimeQueryParams,
  getSchemaInfo
}
export { getSchemaFromLocal, getSchemaInfo, setDashboardSchema, getSchemaFromRemote, getTimeQueryParams }
