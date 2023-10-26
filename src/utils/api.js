/**
 * @author 陈劲松
 * @date 2021/6/11
 * @description 1.定义api；2.定义通用查询方法，函数名应为 获取详情getItem、获取列表getItemList。例如getUser、getUserList
*/
import axios from 'axios'
import { sortByOrderNum } from '@/permission'
import { storageKey } from '@/utils/constants'
const apiVersion = BASE_CONFIG.apiVersion

export const api = {
  // 系统相关
  permission: '/sys/user/permissions',
  dict: '/sys/dict',
  logout: '/logout',
  pin: 'sys/user/pin',
  appearance: '/sys/appearance',
  permissions: '/sys/user/permissions',
  operationLog: '/sys/log',
  login: '/sys/login',
  // user
  user: '/sys/user',
  timezone: '/sys/timezones',
  // 获取配置
  config: '/sys/config',
  // role
  role: '/sys/role',
  menu: '/sys/role/menu/',
  sysMenu: '/sys/menu/',
  // i18n
  i18nLang: '/sys/i18n/lang',
  i18nSys: '/sys/i18n',
  // chart
  chartList: '/visual/chart/list',
  // galaxyProxy
  galaxyProxy: '/galaxy/setting',
  // 知识库
  knowledgeBase: apiVersion + '/knowledgeBase',
  knowledgeBaseList: apiVersion + '/knowledgeBase/list',
  knowledgeBaseEnable: apiVersion + '/knowledgeBase/status',
  knowledgeBaseLearningStart: apiVersion + '/knowledgeBase/intelligence-learning/start',
  knowledgeBaseLearningStop: apiVersion + '/knowledgeBase/intelligence-learning/stop',
  knowledgeBaseStatistics: apiVersion + '/knowledgeBase/statistics',
  updateKnowledgeUrl: apiVersion + '/knowledgeBase/items/batch',
  knowledgeBaseLog: apiVersion + '/knowledgeBase/audit/log',
  knowledgeBaseTimedistribution: apiVersion + '/knowledgeBase/{{knowledgeId}}/{{type}}/timedistribution',

  // 报告相关
  reportJob: '/report/job',
  reportJobCount: '/report/job/count',
  reportTemp: '/report/temp',
  reportCategory: '/report/category',
  reportBatchDownloadPdf: '/report/job/batchDownloadPdf',
  reportDownloadPdf: '/report/job/downloadPdf',
  reportView: '/report/job/view',
  // 业务
  panel: '/visual/panel',
  chart: '/visual/chart',
  entityList: '/interface/entity/list/basic',
  entityListTotal: '/interface/entity/list/total',
  entityCount: '/interface/entity/total',
  entityFilter: '/interface/entity/filter/count',
  entityFilterTop: '/interface/entity/filter/top',
  ipThroughput: '/interface/entity/ip/detail/throughput',
  domainThroughput: '/interface/entity/domain/detail/throughput',
  appThroughput: '/interface/entity/app/detail/throughput',
  filterTop: '/interface/entity/filter/top',
  entityTotal: '/interface/entity/index/total',
  entityNew: '/interface/entity/index/new',
  entityActive: '/interface/entity/index/active',
  entityTraffic: '/interface/entity/list/traffic',
  ipBytes: '/interface/entity/detail/ip/bytes',
  domainBytes: '/interface/entity/detail/domain/bytes',
  appBytes: '/interface/entity/detail/app/bytes',
  // app detail
  entityAppDetailTraffic: '/interface/entity/detail/overview/app/traffic',
  entityAppDetailRelation: '/interface/entity/detail/overview/app/relation',
  entityAppDetailNetworkQuantity: '/interface/entity/detail/overview/app/networkQuantity',
  entityAppDetailLinkIn: '/interface/entity/detail/overview/app/linkIn',
  entityAppDetailLinkOut: '/interface/entity/detail/overview/app/linkOut',
  entityAppDetailPerformance: '/interface/entity/detail/overview/app/performanceEvent',
  entityAppDetailSecurity: '/interface/entity/detail/overview/app/securityEvent',
  entityAppRelatedServerDomain: '/interface/entity/detail/overview/app/relatedDomain',
  entityAppRelatedServerIp: '/interface/entity/detail/overview/app/relatedServerIp',
  entityAppRelatedServerAppOverview: '/interface/entity/detail/app/serviceOverview',
  entityAppDetailBasic: '/interface/entity/detail/app/basic',
  // domain detail
  entityDomainDetailBasic: '/interface/entity/detail/overview/domain/basic',
  entityDomainDetailTraffic: '/interface/entity/detail/overview/domain/traffic',
  entityDomainDetailRelation: '/interface/entity/detail/overview/domain/relation',
  entityDomainDetailNetworkQuantity: '/interface/entity/detail/overview/domain/networkQuantity',
  entityDomainDetailLinkIn: '/interface/entity/detail/overview/domain/linkIn',
  entityDomainDetailLinkOut: '/interface/entity/detail/overview/domain/linkOut',
  entityDomainDetailPerformance: '/interface/entity/detail/overview/domain/performanceEvent',
  entityDomainDetailSecurity: '/interface/entity/detail/overview/domain/securityEvent',
  entityDomainRelatedServerIp: '/interface/entity/detail/overview/domain/relatedServerIp',
  entityDomainRelatedServerApp: '/interface/entity/detail/overview/domain/relatedApp',
  entityDetectionsIp: '/interface/entity/detail/overview/ip/dnsInfo',
  entityDetectionsIpQueryRate: '/interface/entity/detail/overview/ip/dnsQueryRate',
  entityDomainRelatedServerDomainOverview: '/interface/entity/detail/domain/serviceOverview',
  // ip detail
  entityIpDetailTraffic: '/interface/entity/detail/overview/ip/traffic',
  entityIpDetailTrafficMap: '/interface/entity/detail/ip/trafficMap',
  entityDomainDetailTrafficMap: '/interface/entity/detail/domain/trafficMap',
  entityAppDetailTrafficMap: '/interface/entity/detail/app/trafficMap',
  entityIpDetailRelation: '/interface/entity/detail/overview/ip/relation',
  entityIpDetailNetworkQuantity: '/interface/entity/detail/overview/ip/networkQuantity',
  entityIpDetailLinkIn: '/interface/entity/detail/overview/ip/linkIn',
  entityIpDetailLinkOut: '/interface/entity/detail/overview/ip/linkOut',
  entityIpDetailPerformance: '/interface/entity/detail/overview/ip/performanceEvent',
  entityIpDetailSecurity: '/interface/entity/detail/overview/ip/securityEvent',
  entityIpRelatedServerDomain: '/interface/entity/detail/overview/ip/relatedDomain',
  entityIpRelatedServerApp: '/interface/entity/detail/overview/ip/relatedApp',
  entityIpRelatedServerIpOverview: '/interface/entity/detail/ip/serviceOverview',
  entityIpDetailBasic: '/interface/entity/detail/ip/basic',
  // detection
  detection: {
    securityEvent: {
      eventSeverityTrend: '/interface/detection/security/filter/severityTrend',
      securityType: '/interface/detection/security/filter/securityType',
      offenderIp: '/interface/detection/security/filter/offenderIp',
      offenderLocation: '/interface/detection/security/filter/offenderLocation',
      victimIp: '/interface/detection/security/filter/victimIp',
      victimLocation: '/interface/detection/security/filter/victimLocation',
      eventSeverity: '/interface/detection/security/filter/severity',
      listBasic: '/interface/detection/security/list/basic',
      listCount: '/interface/detection/security/list/count',
      overviewBasic: '/interface/detection/security/detail/overview/basic',
      overviewEvent: '/interface/detection/security/detail/overview/event',
      securityList: apiVersion + '/detection/security/list', // 安全事件列表
      timeDistribution: apiVersion + '/detection/security/severity/timedistribution', // 事件严重等级分布(顶部柱状图)
      severityStatistics: apiVersion + '/detection/security/severity/statistics', // 事件严重等级统计(左侧filter事件严重等级和饼图)
      statusStatistics: apiVersion + '/detection/security/status/statistics', // 事件状态统计
      eventTypeStatistics: apiVersion + '/detection/security/event-type/statistics', // 事件类型统计
      offenderIpStatistics: apiVersion + '/detection/security/offender-ip/statistics', // 攻击者IP统计
      victimIpStatistics: apiVersion + '/detection/security/victim-ip/statistics', // 受害者IP统计
      relationEvent: apiVersion + '/detection/security/ip/relation/event', // IP相关近期事件
      securityCount: apiVersion + '/detection/security/count', // 安全事件总数
      detail: apiVersion + '/detection/security/entity/detail', // 安全事件实体详情，后面得加上实体类型
      ipDetail: apiVersion + '/detection/security/entity/detail/ip', // 安全事件实体详情ip响应
      domainDetail: apiVersion + '/detection/security/entity/detail/domain', // 安全事件实体详情domain响应
      appDetail: apiVersion + '/detection/security/entity/detail/app' // 安全事件实体详情app响应
    },
    performanceEvent: {
      eventSeverityTrend: '/interface/detection/performance/filter/severityTrend',
      eventType: '/interface/detection/performance/filter/eventType',
      eventSeverity: '/interface/detection/performance/filter/severity',
      activeEntity: '/interface/detection/performance/filter/activeEntity',
      listBasic: '/interface/detection/performance/list/basic',
      listCount: '/interface/detection/performance/list/count',
      overviewBasic: '/interface/detection/performance/detail/overview/basic',
      dnsErrorMetric: '/interface/detection/performance/detail/overview/metric/dnsError',
      httpErrorMetric: '/interface/detection/performance/detail/overview/metric/httpError',
      highDnsResponseTimeMetric: '/interface/detection/performance/detail/overview/metric/highDnsResponseTime'
    },
    list: apiVersion + '/rule/detection/list', // 检测规则列表
    detail: apiVersion + '/rule/detection', // 检测规则详情
    delete: apiVersion + '/rule/detection', // 检测规则删除
    // 获取单位列表，如source、type、metric等
    statistics: apiVersion + '/rule/detection/statistics',
    // 规则新建模块
    create: {
      topKeys: apiVersion + '/detection/topKeys', // topKeys列表
      create: apiVersion + '/rule/detection'
    }
  },
  // Dashboard
  dashboard: {
    DnsServiceInsights: {
      alarmInfoCount: '/interface/dns/alarmInfoCount'
    }
  },
  // networkOverview
  netWorkOverview: {
    totalTrafficAnalysis: '/interface/overview/totalTrafficAnalysis',
    drilldownTrafficAnalysis: '/interface/overview/trafficAnalysis',
    eventSeverity: '/interface/overview/eventSeverity',
    eventType: '/interface/overview/eventType',
    ddosEventAnalysis: '/interface/overview/ddosEventAnalysis',
    applicationCycleTrafficTotal: '/interface/overview/applicationCycleTrafficTotal',
    applicationTrafficAnalysis: '/interface/overview/applicationTrafficAnalysis',
    appCompanyTrafficAnalysis: '/interface/overview/appCompanyTrafficAnalysis',
    appCompanyCycleTrafficTotal: '/interface/overview/appCompanyCycleTrafficTotal'
  },
  npm: {
    overview: {
      tcpSessionDelay: '/interface/application/performance/overview/tcpSessionDelay',
      httpResponseDelay: '/interface/application/performance/overview/httpResponseDelay',
      sslConDelay: '/interface/application/performance/overview/sslConDelay',
      tcpLostlenPercent: '/interface/application/performance/overview/tcpLostlenPercent',
      packetRetransPercent: '/interface/application/performance/overview/packetRetransPercent',
      // app类别评分
      appTrafficAnalysis: '/interface/application/performance/overview/appTrafficAnalysis',
      appTcpSessionDelay: '/interface/application/performance/overview/appTcpSessionDelay',
      appHttpResponseDelay: '/interface/application/performance/overview/appHttpResponseDelay',
      appSslConDelay: '/interface/application/performance/overview/appSslConDelay',
      appTcpLostlenPercent: '/interface/application/performance/overview/appTcpLostlenPercent',
      appPacketRetransPercent: '/interface/application/performance/overview/appPacketRetransPercent',
      // 整体流量折线图
      totalTrafficAnalysis: '/interface/application/performance/overview/totalTrafficAnalysis',
      totalNetworkAnalysis: '/interface/application/performance/overview/totalNetworkAnalysis',
      totalHttpResponseDelay: '/interface/application/performance/overview/totalHttpResponseDelay',
      totalSslConDelay: '/interface/application/performance/overview/totalSslConDelay',
      // 各维度下钻会话统计
      relatedSessions: '/interface/application/performance/relatedSessions',
      // 各维度下钻流量曲线图
      trafficGraph: '/interface/application/performance/overview/drilldown/drilldown/dimension/trafficGraph',
      // 各维度下钻网络性能
      networkAnalysis: '/interface/application/performance/overview/drilldown/dimension/networkAnalysis',
      // 各维度下钻网络性能 三级菜单
      allNetworkAnalysis: '/interface/application/performance/overview/drilldown/dimension/allNetworkAnalysis',
      // 下钻地图
      map: '/interface/application/performance/overview/drilldown/dimension/clientLocations/world/trafficAnalysis',
      mapTcp: '/interface/application/performance/overview/drilldown/dimension/clientLocations/world/tcpSessionDelay',
      mapHttp: '/interface/application/performance/overview/drilldown/dimension/clientLocations/world/httpResponseDelay',
      mapSsl: '/interface/application/performance/overview/drilldown/dimension/clientLocations/world/sslConDelay',
      mapPacketLoss: '/interface/application/performance/overview/drilldown/dimension/clientLocations/world/tcpSessionDelay',
      mapPacketRetrans: '/interface/application/performance/overview/drilldown/dimension/clientLocations/world/tcpSessionDelay'
    },
    location: {
      // 折线图
      map: '/interface/application/performance/location/networkMap',
      mapTcp: '/interface/application/performance/location/tcpSessionDelay',
      mapHttp: '/interface/application/performance/location/httpResponseDelay',
      mapSsl: '/interface/application/performance/location/sslConDelay',
      mapPacketLoss: '/interface/application/performance/location/tcpLostlenPercent',
      mapPacketRetrans: '/interface/application/performance/location/packetRetransPercent',
      thoughput: '/interface/application/performance/location/thoughput',
      tcpConnectionEstablishLatency: '/interface/application/performance/location/tcpConnectionEstablishLatency',
      httpResponseLatency: '/interface/application/performance/location/httpResponseLatency',
      sslHandshakeLatency: '/interface/application/performance/location/sslHandshakeLatency',
      packetsLoss: '/interface/application/performance/location/packetsLoss',
      packetsRetrains: '/interface/application/performance/location/packetsRetrains'
    },
    events: {
      list: '/interface/overview/event/list',
      recentEvents: '/interface/overview/event/recentEvents',
      recentEventsD: '/interface/application/performance/overview/drilldown/dimension/recentEvents',
      dimensionEvents: '/interface/overview/event/dimensionEvents'
    }
  },
  linkMonitor: {
    links: '/interface/linkMonitor/links',
    totalTrafficAnalysis: '/interface/link/overview/drilldown/totalTrafficAnalysis',
    networkAnalysis: '/interface/link/overview/drilldown/networkAnalysis',
    linkTrafficDirection: '/interface/linkMonitor/linkTrafficDirection',
    quadrupleIngressAnalysis: '/interface/link/overview/quadrupleIngressAnalysis', // 入口
    quadrupleEgressAnalysis: '/interface/link/overview/quadrupleEgressAnalysis', // 出口
    bigramAnalysis: '/interface/link/overview/bigramAnalysis',
    bigramNextHopAnalysis: '/interface/link/overview/bigramNextHopAnalysis',
    analysis: '/interface/link/overview/analysis',
    nextHopAnalysis: '/interface/link/overview/nextHopAnalysis',
    drilldownQuadrupleIngressAnalysis: '/interface/link/overview/drilldown/quadrupleIngressAnalysis',
    drilldownQquadrupleEgressAnalysis: '/interface/link/overview/drilldown/quadrupleEgressAnalysis'
  },
  dnsInsight: {
    recentEvents: '/interface/dnsInsight/recentEvents',
    activeMaliciousDomain: '/interface/dnsInsight/activeMaliciousDomain',
    totalTrafficAnalysis: '/interface/dns/overview/totalTrafficAnalysis',
    eventChart: '/interface/dnsInsight/eventChart',
    drilldownTrafficAnalysis: '/interface/dns/overview/drilldown/trafficAnalysis'
  },
  entity: {
    throughput: apiVersion + '/entity/detail/traffic/throughput',
    security: apiVersion + '/entity/detail/event/security',
    performance: apiVersion + '/entity/detail/event/performance',
    behaviorPattern: apiVersion + '/entity/detail/behavior/ip',
    // 域名解析：ip相关app、domain
    domainNameResolutionAboutAppsOfIp: apiVersion + '/entity/detail/ip/relate/apps',
    domainNameResolutionAboutDomainsOfIp: apiVersion + '/entity/detail/ip/relate/domains',
    // 域名解析：app相关ip、domain
    domainNameResolutionAboutIpsOfApp: apiVersion + '/entity/detail/app/relate/ips',
    domainNameResolutionAboutDomainsOfApp: apiVersion + '/entity/detail/app/relate/domains',
    // 域名解析：domain相关ip、app、fqdn
    domainNameResolutionAboutAppsOfDomain: apiVersion + '/entity/detail/domain/relate/apps',
    domainNameResolutionAboutIpsOfDomain: apiVersion + '/entity/detail/domain/relate/ips',
    domainNameResolutionAboutFQDNsOfDomain: apiVersion + '/entity/detail/domain/relate/fqdns',
    // 开放端口：ip、domain、app相关
    openPortOfIp: apiVersion + '/entity/detail/ip/relate/ports',
    openPortOfDomain: apiVersion + '/entity/detail/domain/relate/ports',
    openPortOfApp: apiVersion + '/entity/detail/app/relate/ports',
    basicInfo: apiVersion + '/entity/detail/basic',
    tags: apiVersion + '/entity/detail/kb/intelligence/tag',
    informationAggregation: apiVersion + '/entity/detail/kb/intelligence/list',
    // 实体关系
    entityGraph: {
      basicInfo: apiVersion + '/entity/graph/relation/basic',
      tags: apiVersion + '/entity/graph/relation/kb/intelligence/tag',
      relatedEntityCount: apiVersion + '/entity/graph/relation/summaryCount',
      domainRelatedIp: apiVersion + '/entity/graph/relation/domain/relate/ips',
      domainRelatedApp: apiVersion + '/entity/graph/relation/domain/relate/apps',
      domainRelatedSubdomain: apiVersion + '/entity/graph/relation/domain/relate/subdomains',
      ipRelatedDomain: apiVersion + '/entity/graph/relation/ip/relate/domains',
      ipRelatedApp: apiVersion + '/entity/graph/relation/ip/relate/apps',
      appRelatedIp: apiVersion + '/entity/graph/relation/app/relate/ips',
      appRelatedDomain: apiVersion + '/entity/graph/relation/app/relate/domains'
    },
    entityList: {
      list: apiVersion + '/entity/explorer/query/list', // 实体列表
      domainBasicInfo: apiVersion + '/entity/explorer/detail/basic/domain', // Domain实体响应结果
      ipBasicInfo: apiVersion + '/entity/explorer/detail/basic/ip', // ip实体响应
      appBasicInfo: apiVersion + '/entity/explorer/detail/basic/app', // app实体响应
      domainTags: apiVersion + '/entity/explorer/detail/kb/intelligence/tag/domain', // Domain实体标签响应结果
      ipTags: apiVersion + '/entity/explorer/detail/kb/intelligence/tag/ip', // ip实体标签响应结果
      appTags: apiVersion + '/entity/explorer/detail/kb/intelligence/tag/app', // app实体标签响应结果
      domainThroughput: apiVersion + '/entity/explorer/detail/traffic/throughput/domain', // 实体流量信息
      ipThroughput: apiVersion + '/entity/explorer/detail/traffic/throughput/ip', // 实体流量信息
      appThroughput: apiVersion + '/entity/explorer/detail/traffic/throughput/app', // 实体流量信息
      domainPerformance: apiVersion + '/entity/explorer/detail/traffic/performance/domain', // domain网络质量
      ipPerformance: apiVersion + '/entity/explorer/detail/traffic/performance/ip', // ip网络质量
      appPerformance: apiVersion + '/entity/explorer/detail/traffic/performance/app', // app网络质量
      domainRelatedApp: apiVersion + '/entity/explorer/detail/domain/relate/apps', // 域名相关app
      domainRelatedIp: apiVersion + '/entity/explorer/detail/domain/relate/ips', // 域名相关ip
      appRelatedDomain: apiVersion + '/entity/explorer/detail/app/relate/domains', // app相关域名
      appRelatedIp: apiVersion + '/entity/explorer/detail/app/relate/ips', // app相关ip
      ipRelatedApp: apiVersion + '/entity/explorer/detail/ip/relate/apps', // ip相关app
      ipRelatedDomain: apiVersion + '/entity/explorer/detail/ip/relate/domains', // ip相关域名
      ipRelatedPort: apiVersion + '/entity/explorer/detail/ip/relate/ports', // ip开放端口
      domainTrafficMap: apiVersion + '/entity/explorer/detail/traffic/map/domain', // domain流量地图
      ipTrafficMap: apiVersion + '/entity/explorer/detail/traffic/map/ip', // ip流量地图
      appTrafficMap: apiVersion + '/entity/explorer/detail/traffic/map/app', // app流量地图
      summaryCount: apiVersion + '/entity/explorer/query/summaryCount', // 实体基数统计
      aggCountry: apiVersion + '/entity/explorer/top/aggCountry', // 国家实体基数统计
      aggIPAsn: apiVersion + '/entity/explorer/top/agg-ip-asn', // ASN实体基数统计
      aggCity: apiVersion + '/entity/explorer/top/aggCity', // 城市实体基数统计
      aggIPIsp: apiVersion + '/entity/explorer/top/agg-ip-isp', // ip-iap实体基数统计
      aggPort: apiVersion + '/entity/explorer/top/aggPort', // 端口实体基数统计
      aggDomain: apiVersion + '/entity/explorer/top/aggDomainCategory', // 域名类别实体基数统计
      aggAppCategory: apiVersion + '/entity/explorer/top/aggAppCategory', // app类别实体基数统计
      aggTag: apiVersion + '/entity/explorer/top/aggTag', // 标签实体基数统计
      domainSecurity: apiVersion + '/entity/explorer/detail/event/security/domain', // domain安全事件详情
      ipSecurity: apiVersion + '/entity/explorer/detail/event/security/ip', // ip安全事件详情
      appSecurity: apiVersion + '/entity/explorer/detail/event/security/app', // app安全事件详情
      domainEventPerformance: apiVersion + '/entity/explorer/detail/event/performance/domain', // domain服务质量详情
      ipEventPerformance: apiVersion + '/entity/explorer/detail/event/performance/ip', // ip服务质量详情
      appEventPerformance: apiVersion + '/entity/explorer/detail/event/performance/app', // app服务质量详情
      entityActive: apiVersion + '/entity/explorer/overview/active', // entity首页active数据概览
      entityNew: apiVersion + '/entity/explorer/overview/new', // entity首页new数据概览
      entityTotal: apiVersion + '/entity/explorer/overview/total' // entity首页total数据概览
    }
  }
}

/* panel */
export async function getPanelList (params) {
  return await getData(api.panel, params, true)
}
export async function getPanel (id) {
  return await getData(`${api.chart}/${id}`)
}
/* chart */
export async function getChartList (params) {
  return await getData(api.chart, params, true)
}
export async function getChart (id) {
  return await getData(`${api.chart}/${id}`)
}
/* entity列表 */
export async function getEntityList (params) {
  return await getData(api.entityList, params, true)
}
/* entity总数 */
export async function getEntityCount (params) {
  return await getData(api.entityCount, params)
}
/* ip类型entity过滤器数据 */
export async function getEntityFilter (params) {
  return await getData(api.entityFilter, params, true)
}
/* 字典 */
export async function getDictList (params) {
  return await getData(api.dict, params, true)
}
function handleResult (response) {
  if (response.data && (response.data.list || response.data.result)) {
    return response.data.list || response.data.result
  } else if (response.data && response.data.result === 0) {
    return response.data.result
  } else {
    return response.data
  }
}
export async function getData (url, params = {}, isQueryList) {
  const request = new Promise((resolve, reject) => {
    try {
      axios.get(url, { params }).then(response => {
        if (response.status === 200) {
          resolve(handleResult(response.data))
        } else {
          reject(response.data)
        }
      })
    } catch (e) {
      reject(e)
    }
  }).catch(response => {
    console.error(response)
  })
  return await request
}

export async function getPermission () {
  const request = new Promise((resolve, reject) => {
    axios.post(api.permission, { token: localStorage.getItem(storageKey.token) }).then(response => {
      if (response.status === 200) {
        resolve({
          menuList: sortByOrderNum(response.data.data.menus),
          buttonList: response.data.data.buttons,
          roleList: response.data.data.roles
        })
      } else {
        reject(response.data)
      }
    })
  })
  return await request
}

export async function getI18n () {
  const dictData = await getDictList({ type: 'lang' })
  if (dictData) {
    const langs = dictData.map(d => d.value).join(',')
    localStorage.setItem(storageKey.languages, langs)
    const request = new Promise(resolve => {
      axios.get(api.i18nLang, { params: { l: langs } }).then(response => {
        response.data.data.cn = response.data.data.zh
        resolve(response.data.data)
      })
    })
    return await request
  }
  return null
}

/* 获得原始的3611-2 json字符串数据 */
export async function getIso36112JsonData (suffix) {
  const url = `${window.location.protocol}//${window.location.host}/geojson/${suffix}.json`
  const request = new Promise(resolve => {
    axios({ url }).then(response => {
      resolve(response.data || response || null)
    }).catch(err => {
      console.error(err)
    })
  })
  return await request
}
