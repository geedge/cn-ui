export const defaultPageSize = 20

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
  dnsServiceInsights: 3
}

export const position = {
  tableHeight: {
    normal: 'calc(100% - 48px)' // 常规高度，特例在下方定义
  }
}

export const chartTableDefaultPageSize = 10 // table类型图表默认每页数据量
export const chartTableTopOptions = [10, 50, 100] // table类型图表的TOP-N选项
