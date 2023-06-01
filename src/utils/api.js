/**
 * @author 陈劲松
 * @date 2021/6/11
 * @description 1.定义api；2.定义通用查询方法，函数名应为 获取详情getItem、获取列表getItemList。例如getUser、getUserList
*/
import { get, post } from '@/utils/http'
import axios from 'axios'
import { sortByOrderNum } from '@/permission'
import { storageKey } from '@/utils/constants'

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
  knowledgeBase: BASE_CONFIG.apiVersion + '/knowledgeBase',
  knowledgeBaseList: BASE_CONFIG.apiVersion + '/knowledgeBase/list',
  knowledgeBaseEnable: BASE_CONFIG.apiVersion + '/knowledgeBase/status',

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
      overviewEvent: '/interface/detection/security/detail/overview/event'
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
    throughput: BASE_CONFIG.apiVersion + '/entity/detail/traffic/throughput',
    securityEvent: 'interface/entityDetail/securityEvent',
    performanceEvent: 'interface/entityDetail/performanceEvent',
    domainNameResolutionRelatedApp: 'interface/entity/detail/overview/ip/relatedApp',
    domainNameResolutionRelatedIP: 'interface/entity/detail/overview/ip/relatedIp',
    domainNameResolutionRelatedDomain: 'interface/entity/detail/overview/ip/relatedDomain',
    openPort: ''
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
  if (response.data.list || response.data.result) {
    return response.data.list || response.data.result
  } else if (response.data.result === 0) {
    return response.data.result
  } else {
    return response.data
  }
}
export async function getData (url, params = {}, isQueryList) {
  const request = new Promise((resolve, reject) => {
    try {
      get(url, params).then(response => {
        if (response.code === 200) {
          resolve(handleResult(response))
        } else {
          reject(response)
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
  const request = new Promise(resolve => {
    post(api.permission, { token: localStorage.getItem(storageKey.token) }).then(response => {
      resolve({
        menuList: sortByOrderNum(response.data.menus),
        buttonList: response.data.buttons,
        roleList: response.data.roles
      })
    })
  })
  return await request
}

export async function getI18n () {
  const dictData = await getDictList({ type: 'lang' })
  const langs = dictData.map(d => d.value).join(',')
  localStorage.setItem(storageKey.languages, langs)
  const request = new Promise(resolve => {
    get(api.i18nLang, { l: langs }).then(response => {
      response.data.cn = response.data.zh
      resolve(response.data)
    })
  })
  return await request
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
