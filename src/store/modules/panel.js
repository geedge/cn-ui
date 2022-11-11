import { dnsServerRole } from '@/utils/constants'

const panel = {
  state: {
    showRightBox: false,
    chart: '',
    delChart: false,
    groupId: '',
    type: '',
    timeRange: [],
    nowTimeType: {},
    headerH: 0.5,
    headerHPadding: 0.5,
    rowHeight: 150,
    chartListId: '',
    chartLastPosition: {
      x: 0,
      y: 0
    },
    chartList: [],
    currentMap: dnsServerRole.RTDNSM,
    /*
    点击tab：会修改networkOverviewCurrentTab
    点击value：
            panelName、
            breadcrumbColumnName、
            breadcrumbColumnValue、
            networkOverviewCurrentTab、
            queryCondition
    点击顶部第二级菜单：与点击菜单相同
    点击顶部第三级菜单：
            panelName、
            breadcrumbColumnValue、
            queryCondition
    点击顶部第四级菜单（切换value）：
            panelName、
            breadcrumbColumnValue、
            queryCondition
     */
    // panelName: '', // 网络概况的Panel的名称
    // breadcrumbColumnName: '', // 点击tab里的value，都会修改此值,为面包屑的菜单
    // dimensionType: '', // 维度
    // breadcrumbColumnValue: '', // 点击tab里的value，都会修改此值,为面包屑的菜单
    // networkOverviewCurrentTab: null, // 只代表选中的tab，有时会与面包屑中显示的值不同
    // networkOverviewBeforeTab: null, // 点击表格的值时使用，记录点击当前tab表格的值之前点击的表格值所属的tab
    // queryCondition: '', // 数据查询的条件
    networkOverviewTabList: [], // 存储tab列表的一些状态：如是否选中
    // tabOperationType: 0, // 操作类型:2-二级菜单；3-三级菜单；4-四级菜单；5-切换tab；6-切换metric；7-操作Customize
    // tabOperationBeforeType: 0, // 记录上次的操作类型
    npmThirdLevelMenuScore: null, // npm overview 第三级菜单的panel分数
    npmLocationCountry: '', // npm location的查询条件--国家
    npmLocationSide: 'server', // npm location的查询条件--方向
    refreshTime: null, // 自动刷新时间的秒数
    refreshFlag: true, // 关闭自动刷新标志，true为off，false即开启自动刷新
    timeRangeArray: [], // 时间范围列表：开始/结束时间
    timeRangeFlag: null, // 时间范围标志，默认60即一小时，-1为手动选择的时间范围
    routerPath: '', // 当前路由路径
    httpCancel: null, // 终止http请求
    rangeEchartsData: {}, // 框选echarts图表
    routerHistoryList: [] // 路由跳转记录列表
  },
  mutations: {
    setShowRightBox (state, flag) {
      state.showRightBox = flag
    },
    setChart (state, chart) {
      state.chart = chart
    },
    setDelChart (state, flag) {
      state.delChart = flag
    },
    setType (state, type) {
      state.type = type
    },
    setGroupId (state, id) {
      state.groupId = id
    },
    setPanelTime (state, time) {
      state.timeRange = time
    },
    setPanelNowTimeType (state, nowTimeType) {
      state.nowTimeType = nowTimeType
    },
    setChartLastPosition (state, position) {
      state.chartLastPosition = position
    },
    setHeaderH (state, h) {
      state.headerH = h.headerH
      state.headerHPadding = h.headerHPadding
      state.rowHeight = h.rowHeight
    },
    cleanPanel (state) {
      state.showRightBox = false
      state.chart = ''
      state.delChart = false
      state.groupId = ''
      state.type = ''
    },
    setChartListId (state, id) {
      state.chartListId = id
    },
    setChartList (state, chart) {
      state.chartList.push(chart)
    },
    cleanChartList (state) {
      state.chartList = []
    },
    setCurrentMap (state, currentMap) {
      state.currentMap = currentMap
    },
    // setPanelName (state, panelName) {
    // state.panelName = panelName
    // },
    // setBreadcrumbColumnName (state, breadcrumbColumnName) {
    // state.breadcrumbColumnName = breadcrumbColumnName
    // },
    // setDimensionType (state, dimensionType) {
    // state.dimensionType = dimensionType
    // },
    // setBreadcrumbColumnValue (state, breadcrumbColumnValue) {
    // state.breadcrumbColumnValue = breadcrumbColumnValue
    // },
    // setNetworkOverviewCurrentTab (state, networkOverviewCurrentTab) {
    // state.networkOverviewCurrentTab = networkOverviewCurrentTab
    // },
    // setQueryCondition (state, queryCondition) {
    // state.queryCondition = queryCondition
    // },
    setNetworkOverviewTabList (state, networkOverviewTabList) {
      state.networkOverviewTabList = networkOverviewTabList
    },
    // setTabOperationType (state, tabOperationType) {
    // state.tabOperationType = tabOperationType
    // },
    // setNetworkOverviewBeforeTab (state, networkOverviewBeforeTab) {
    // state.networkOverviewBeforeTab = networkOverviewBeforeTab
    // },
    // setTabOperationBeforeType (state, tabOperationBeforeType) {
    // state.tabOperationBeforeType = tabOperationBeforeType
    // },
    setNpmLocationCountry (state, country) {
      state.npmLocationCountry = country
    },
    setNpmLocationSide (state, side) {
      state.npmLocationSide = side
    },
    setNpmThirdLevelMenuScore (state, score) {
      state.npmThirdLevelMenuScore = score
    },
    setRefreshTime (state, time) {
      state.refreshTime = time
    },
    setRefreshFlag (state, flag) {
      state.refreshFlag = flag
    },
    setTimeRangeArray (state, array) {
      state.timeRangeArray = array
    },
    setTimeRangeFlag (state, flag) {
      state.timeRangeFlag = flag
    },
    setRouterPath (state, path) {
      state.routerPath = path
    },
    setHttpCancel (state, cancel) {
      state.httpCancel = cancel
    },
    setRangeEchartsData (state, data) {
      state.rangeEchartsData = data
    },
    setRouterHistoryList (state, list) {
      state.routerHistoryList = list
    }
  },
  getters: {
    getShowRightBox (state) {
      return state.showRightBox
    },
    getChart (state) {
      return state.chart
    },
    getType (state) {
      return state.type
    },
    getGroupId (state) {
      return state.groupId
    },
    getTimeRange (state) {
      return state.timeRange
    },
    getNowTimeType (state) {
      return state.nowTimeType
    },
    getDelChart (state) {
      return state.delChart
    },
    getHeaderH (state) {
      return state.headerH
    },
    getHeaderHPadding (state) {
      return state.headerHPadding
    },
    getRowHeight (state) {
      return state.rowHeight
    },
    getChartLastPosition (state, position) {
      return state.chartLastPosition
    },
    getChartListId (state, id) {
      return state.chartListId
    },
    getChartList (state) {
      return state.chartList
    },
    getCurrentMap (state) {
      return state.currentMap
    },
    // getPanelName (state) {
    // return state.panelName
    // },
    // getBreadcrumbColumnName (state) {
    // return state.breadcrumbColumnName
    // },
    // getDimensionType (state) {
    // return state.dimensionType
    // },
    // getBreadcrumbColumnValue (state) {
    // return state.breadcrumbColumnValue
    // },
    // getNetworkOverviewCurrentTab (state) {
    // return state.networkOverviewCurrentTab
    // },
    // getQueryCondition (state) {
    // return state.queryCondition
    // },
    getNetworkOverviewTabList (state) {
      return state.networkOverviewTabList
    },
    // getTabOperationType (state) {
    // return state.tabOperationType
    // },
    // getNetworkOverviewBeforeTab (state) {
    // return state.networkOverviewBeforeTab
    // },
    // getTabOperationBeforeType (state) {
    // return state.tabOperationBeforeType
    // },
    getNpmLocationCountry (state) {
      return state.npmLocationCountry
    },
    getNpmLocationSide (state) {
      return state.npmLocationSide
    },
    getNpmThirdLevelMenuScore (state) {
      return state.npmThirdLevelMenuScore
    },
    getTimeRangeArray (state) {
      return state.timeRangeArray
    },
    getTimeRangeFlag (state) {
      return state.timeRangeFlag
    },
    getRouterPath (state) {
      return state.routerPath
    },
    getRouterHistoryList (state) {
      return state.routerHistoryList
    }
  },
  actions: {
    dispatchShowRightBox (store, flag) {
      store.commit('setShowRightBox', flag)
    },
    dispatchChart (store, chart) {
      store.commit('setShowRightBox', chart)
    },
    dispatchDelChart (store, playload) {
      store.commit('setDelChart', true)
      store.commit('setChart', playload.chart)
      store.commit('setType', playload.type)
    },
    dispatchPanelTime (store, playload) {
      store.commit('setPanelTime', playload.time)
      store.commit('setPanelNowTimeType', playload.nowTimeType)
    },
    dispatchEditChart (store, playload) {
      store.commit('setShowRightBox', true)
      store.commit('setChart', playload.chart)
      store.commit('setType', playload.type)
    },
    dispatchHeaderH (store, playload) {
      store.commit('setHeaderH', playload.headerH)
    },
    clearPanel (store) {
      store.commit('cleanPanel')
    }
  }
}
export default panel
