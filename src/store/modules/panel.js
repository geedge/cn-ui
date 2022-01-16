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
    }
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
