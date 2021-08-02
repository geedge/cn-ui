export const defaultPageSize = 20

export const storageKey = {
  iso36112Capital: 'cn-iso3611-2-capital',
  iso36112WorldLow: 'cn-iso3611-2-world-low',
  i18n: 'cn-i18n',
  languages: 'cn-languages',
  language: 'cn-language',
  timezone: 'cn-timezone',
  timezoneOffset: 'cn-timezone-offset',
  timezoneLocalOffset: 'cn-timezone-local-offset',
  token: 'cn-token',
  username: 'cn-username',
  sysName: 'cn-sys-name',
  sysLogo: 'cn-sys-logo',
  tableTitlePrefix: 'cn-table-title',
  tablePageSizePrefix: 'cn-page-size',
  leftMenuShrink: 'cn-left-menu-shrink',
  unsavedChange: 'cn-unsaved-change'
}

export const iso36112 = {
  [storageKey.iso36112Capital]: 'data/countriesWithCapital.json',
  [storageKey.iso36112WorldLow]: 'worldChinaLow.json'
}

// 统一定义跳转来源
export const fromRoute = {
  trafficSummary: 'trafficSummary',
  networkAppPerformance: 'networkAppPerformance',
  dnsServiceInsights: 'dnsServiceInsights',
  user: 'user'
}

/* panel类别和路由之间的映射 */
export const panelTypeAndRouteMapping = {
  trafficSummary: 1,
  networkAppPerformance: 2,
  dnsServiceInsights: 3,
  ipEntityDetail: 4,
  domainEntityDetail: 5,
  appEntityDetail: 6
}

export const position = {
  tableHeight: {
    normal: 'calc(100% - 48px)' // 常规高度，特例在下方定义
  }
}

export const entityType = {
  ip: 'IP',
  domain: 'Domain',
  app: 'APP'
}

export const entityTypeMappingKey = {
  ip: ['country', 'region']
}

export const unitTypes = {
  time: 'time',
  number: 'number',
  byte: 'byte'
}

export const chartTableDefaultPageSize = 10 // table类型图表默认每页数据量
export const chartTableTopOptions = [10, 100] // table类型图表的TOP-N选项
export const chartPieTableTopOptions = [{ name: 'Sessions', value: 'sessions' }, { name: 'Packets', value: 'packets' }, { name: 'Bytes', value: 'bytes' }] // table类型图表的TOP-N选项
