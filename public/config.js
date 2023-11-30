const BASE_CONFIG = {
  baseUrl: 'http://192.168.44.54:8090/',
  version: '23.10',
  apiVersion: 'v1'
}
// 默认时间过滤条件，单位分钟. 0表示请求接口时不传时间参数
const DEFAULT_TIME_FILTER_RANGE = {
  dashboard: 60,
  entity: {
    list: 60,
    trafficLine: 60,
    subscriberKpi: 60,
    subscriberTopApp: 60,
    informationAggregation: 0,
    relatedEntity: 60 * 24 * 7,
    openPort: 60 * 24 * 7,
    deviceInformation: 60 * 24 * 7,
    accountInformation: 60 * 24 * 7,
    securityEvent: 60 * 24 * 7,
    performanceEvent: 60 * 24 * 7,
    behaviorPattern: 60 * 24 * 7
  },
  detection: 60
}
