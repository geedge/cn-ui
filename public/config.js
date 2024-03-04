const BASE_CONFIG = {
  baseUrl: 'http://192.168.44.54:8090/',
  version: '24.03',
  apiVersion: 'v1'
}
// 默认时间过滤条件，单位分钟. 0表示请求接口时不传时间参数
const DEFAULT_TIME_FILTER_RANGE = {
  dashboard: 60, // 所有dashboard
  entity: {
    list: 60, // 实体列表
    trafficLine: 60, // 实体详情--通用--流量曲线
    subscriberKpi: 60, // 实体详情--subscriber--kpi
    subscriberTopApp: 60, // 实体详情--subscriber--topApp
    subscriberMap: 60, // 实体详情--subscriber--地图
    informationAggregation: 0, // 实体详情--通用--信息聚合
    relatedEntity: 60 * 24 * 7, // 实体详情--通用--相关实体
    openPort: 60 * 24 * 7, // 实体详情--通用--开放端口
    deviceInformation: 60 * 24 * 7, // 实体详情--subscriber--设备信息
    accountInformation: 60 * 24 * 7, // 实体详情--subscriber--账户信息
    securityEvent: 60 * 24 * 7, // 实体详情--通用--安全事件
    performanceEvent: 60 * 24 * 7, // 实体详情--通用--性能事件
    behaviorPattern: 60 * 24 * 7 // 实体详情--IP--行为模式
  },
  detection: 60 // 事件日志列表
}
