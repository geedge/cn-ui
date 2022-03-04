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
  i18n: '/sys/i18n/lang',
  dict: '/sys/dict',
  user: '/sys/user',
  role: '/sys/role',
  galaxyProxy: '/galaxy/setting',
  operationLog: '/sys/log',
  chartList: '/visual/chart/list',
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
  entityAlertNum: '/interface/entity/list/alertNum',
  entitySecurityNum: '/interface/entity/list/detectionNum',
  ipBytes: '/interface/entity/detail/ip/bytes',
  domainBytes: '/interface/entity/detail/domain/bytes',
  appBytes: '/interface/entity/detail/app/bytes',
  // app detail
  entityAppDetailTraffic: '/interface/entity/detail/overview/app/traffic',
  entityAppDetailRelation: '/interface/entity/detail/overview/app/relation',
  entityAppDetailNetworkQuantity: '/interface/entity/detail/overview/app/networkQuantity',
  entityAppDetailLinkIn: '/interface/entity/detail/overview/app/linkIn',
  entityAppDetailLinkOut: '/interface/entity/detail/overview/app/linkOut',
  entityAppDetailAlert: '/interface/entity/detail/overview/app/alert',
  entityAppDetailSecurity: '/interface/entity/detail/overview/app/security',
  entityAppRelatedServerDomain: '/interface/entity/detail/overview/app/relatedDomain',
  entityAppRelatedServerIp: '/interface/entity/detail/overview/app/relatedServerIp',
  // domain detail
  entityDomainDetailBasic: '/interface/entity/detail/overview/domain/basic',
  entityDomainDetailTraffic: '/interface/entity/detail/overview/domain/traffic',
  entityDomainDetailRelation: '/interface/entity/detail/overview/domain/relation',
  entityDomainDetailNetworkQuantity: '/interface/entity/detail/overview/domain/networkQuantity',
  entityDomainDetailLinkIn: '/interface/entity/detail/overview/domain/linkIn',
  entityDomainDetailLinkOut: '/interface/entity/detail/overview/domain/linkOut',
  entityDomainDetailAlert: '/interface/entity/detail/overview/domain/alert',
  entityDomainDetailSecurity: '/interface/entity/detail/overview/domain/security',
  entityDomainRelatedServerIp: '/interface/entity/detail/overview/domain/relatedServerIp',
  entityDomainRelatedServerApp: '/interface/entity/detail/overview/domain/relatedApp',
  // ip detail
  entityIpDetailTraffic: '/interface/entity/detail/overview/ip/traffic',
  entityIpDetailTrafficMap: '/interface/entity/detail/ip/trafficMap',
  entityDomainDetailTrafficMap: '/interface/entity/detail/domain/trafficMap',
  entityAppDetailTrafficMap: '/interface/entity/detail/app/trafficMap',
  entityIpDetailRelation: '/interface/entity/detail/overview/ip/relation',
  entityIpDetailNetworkQuantity: '/interface/entity/detail/overview/ip/networkQuantity',
  entityIpDetailLinkIn: '/interface/entity/detail/overview/ip/linkIn',
  entityIpDetailLinkOut: '/interface/entity/detail/overview/ip/linkOut',
  entityIpDetailAlert: '/interface/entity/detail/overview/ip/alert',
  entityIpDetailSecurity: '/interface/entity/detail/overview/ip/security',
  entityIpRelatedServerDomain: '/interface/entity/detail/overview/ip/relatedDomain',
  entityIpRelatedServerApp: '/interface/entity/detail/overview/ip/relatedApp',
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
      overviewBasic: '/interface/detection/security/detail/overview/basic',
      overviewEvent: '/interface/detection/security/detail/overview/event'
    },
    performanceEvent: {
      eventSeverityTrend: '/interface/detection/performance/filter/severityTrend',
      eventType: '/interface/detection/performance/filter/eventType',
      eventSeverity: '/interface/detection/performance/filter/severity',
      activeEntity: '/interface/detection/performance/filter/activeEntity',
      listBasic: '/interface/detection/performance/list/basic',
      overviewBasic: '/interface/detection/performance/detail/overview/basic'
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

export async function getData (url, params = {}, isQueryList) {
  const request = new Promise((resolve, reject) => {
    try {
      get(url, params).then(response => {
        if (response.code === 200) {
          resolve(isQueryList ? response.data.list || response.data.result : response.data.result || response.data)
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

export async function getConfigJson () {
  const request = new Promise(resolve => {
    get(`${process.env.BASE_URL}config.json?Timestamp=${new Date().getTime()}`).then(config => {
      resolve(config)
    })
  })
  return await request
}

export async function getPermission () {
  const request = new Promise(resolve => {
    post(api.permission, { token: localStorage.getItem('cn-token') }).then(response => {
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
    get(api.i18n, { l: langs }).then(response => {
      response.data.cn = response.data.zh
      resolve(response.data)
    })
  })
  return await request
}

/* 获得原始的3611-2 json字符串数据 */
export async function getIso36112JsonData (suffix) {
  const request = new Promise(resolve => {
    axios({
      url: `${window.location.protocol}//${window.location.host}:${window.location.port}/geojson/${suffix}.json`
    }).then(response => {
      resolve(response.data || response || null)
    })
  })
  return await request
}
