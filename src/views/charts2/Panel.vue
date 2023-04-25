<template>
  <div class="panel-box2" :class="{'panel-box2--entity-detail': entity && entity.entityType}">
    <div class="panel__header" v-if="!entity">
      <div class="panel__title">{{panelName?panelName:(panel.i18n ? $t(panel.i18n) : panel.name)}}
        <div v-if="showScore" class="score">
          <div class="circle-icon"  v-if="score <= 2 || score === '-'" :class="{'data-score-red': score <= 2 || score === '-'}" ></div>
          <div class="circle-icon"  v-else-if="score <= 4" :class="{'data-score-yellow': score <= 4}" ></div>
          <div class="circle-icon"  v-else-if="score <= 6" :class="{'data-score-green': score <= 6}" ></div>
          Score:{{score}}
        </div>
      </div>
      <div class="panel__tools">
        <el-select
            size="mini"
            v-model="metric"
            placeholder=""
            popper-class="common-select"
            v-if="showMetric"
            :popper-append-to-body="false"
            @change="metricChange"
        >
          <template #prefix>
            <span class="select-prefix">Metric:</span>
          </template>
          <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <div class="panel__time">
          <date-time-range
              class="date-time-range"
              :start-time="timeFilter.startTime"
              :end-time="timeFilter.endTime"
              :date-range="timeFilter.dateRangeValue"
              ref="dateTimeRange"
              @change="reload"
          />
          <time-refresh
              class="date-time-range"
              @change="timeRefreshChange"
              :end-time="timeFilter.endTime"
          />
        </div>
      </div>
    </div>
    <chart-list
        ref="chartList"
        :time-filter="timeFilter"
        :metric="metric"
        :chart-list="chartList"
        :panel-type="panelType"
        :panel-lock="panelLock"
        :extra-params="extraParams"
        :entity="entity"
    ></chart-list>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import {
  panelTypeAndRouteMapping,
  curTabState,
  drillDownPanelTypeMapping,
  metricOptions,
  fromRoute
} from '@/utils/constants'
import { getPanelList, getChartList, api } from '@/utils/api'
import { getNowTime, getSecond } from '@/utils/date-util'
import { getTypeCategory } from '@/views/charts/charts/tools'
import { urlParamsHandler, overwriteUrl, getDnsMapData, computeScore } from '@/utils/tools'
import ChartList from '@/views/charts2/ChartList'
import { useStore } from 'vuex'
import { get } from '@/utils/http'

export default {
  name: 'Panel',
  props: {
    entity: Object,
    typeName: String
  },
  components: {
    ChartList
  },
  data () {
    return {
      panelTypeAndRouteMapping,
      metricOptions,
      chartList: [], // 普通panel的chart
      panelLock: true,
      extraParams: {},
      panelName: '',
      dnsRcodeMapData: [],
      dnsQtypeMapData: [],
      score: null,
      curTabState: curTabState
    }
  },
  computed: {
    // npmThirdLevelMenuScore () {
    //   return this.$store.getters.getNpmThirdLevelMenuScore
    // }
    // 显示顶部的Metric单位选项标识
    showMetric () {
      return this.panelType === panelTypeAndRouteMapping.networkOverview || this.panelType === panelTypeAndRouteMapping.networkOverviewDrillDown
    }
  },
  watch: {
    // npmThirdLevelMenuScore: {
    //   deep: true,
    //   immediate: true,
    //   handler (n) {
    //     this.score = n
    //   }
    // }
    timeFilter: {
      handler () {
        if (this.$route.path === '/panel/networkAppPerformance' && (this.queryCondition || this.networkOverviewBeforeTab)) {
          this.scoreCalculation()
        }
      }
    }
  },
  async mounted () {
    // this.panelName = this.$store.getters.getPanelName
    const pName = this.$route.query.panelName ? this.$t(this.$route.query.panelName) : ''
    const curTabProp = this.$route.query.dimensionType ? this.$route.query.dimensionType : null
    if (this.$route.params.typeName === fromRoute.dnsServiceInsights) {
      this.dnsQtypeMapData = await getDnsMapData('dnsQtype')
      this.dnsRcodeMapData = await getDnsMapData('dnsRcode')
      this.$store.commit('setDnsQtypeMapData', this.dnsQtypeMapData)
      this.$store.commit('setDnsRcodeMapData', this.dnsRcodeMapData)
    }
    if (curTabProp === 'qtype') {
      this.panelName = this.dnsQtypeMapData.get(pName)
    } else if (curTabProp === 'rcode') {
      this.panelName = this.dnsRcodeMapData.get(pName)
    } else {
      this.panelName = pName
    }

    // const curOperationType = this.$store.getters.getTabOperationType
    /* const curOperationType = this.getUrlParam(this.curTabState.tabOperationType, '', true)
    if (this.panelName && this.$route.path === '/panel/networkAppPerformance' && curOperationType !== operationType.thirdMenu) {
      // const columnValue = this.$store.getters.getBreadcrumbColumnValue
      const columnValue = this.getUrlParam(this.curTabState.fourthMenu, '')
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        // type: this.$store.getters.getDimensionType,
        type: this.$route.query.dimensionType ? this.$route.query.dimensionType : '',
        params: columnValue || ''
      }
      const requestGroup = []
      scoreUrl.forEach(url => {
        if (url) {
          const request = get(url, queryParams, true)
          requestGroup.push(request)
        }
      })
      const scoreGroup = []
      let score = 0
      Promise.all(requestGroup).then(res => {
        res.forEach(t => {
          if (t.code === 200) {
            const data = t.data.result ? t.data.result[0] : null
            if (data) {
              customTableTitlesForAppPerformance.forEach(item => {
                if (data[bytesColumnNameGroupForNpm[item.prop]]) {
                  score = computeScore(data, item.scoreType)
                  scoreGroup.push(score)
                } else {
                  scoreGroup.push(0)
                }
              })
            }
          }
        })
      }).finally(() => {
        scoreGroup.forEach(i => {
          score = Number(score) + Number(i)
        })
        score = Math.ceil(score * 6)
        if (score > 6) {
          score = 6
        }
        this.score = score || 0
      })
    } else if (this.$route.path === '/panel/networkAppPerformance' && curOperationType === operationType.thirdMenu) {
      this.score = this.$store.getters.getNpmThirdLevelMenuScore
    } */

    await this.init()
    const vm = this
    this.emitter.on('reloadChartList', async function () {
      vm.chartList = []
      vm.chartList = (await getChartList({ panelId: vm.panel.id, pageSize: -1 })).map(chart => {
        chart.i = chart.id
        // 递归初始化各属性
        vm.initChartAttr(chart)
        return chart
      })
    })
    if (this.$route.path === '/panel/networkAppPerformance' && (this.queryCondition || this.networkOverviewBeforeTab)) {
      this.scoreCalculation()
    }
  },
  setup (props) {
    // todo 目前在panel页面测试，后续会挪到router里
    const store = useStore()
    const cancelList = store.state.panel.httpCancel

    // 进入页面时，发现有未结束的请求，终止请求
    if (cancelList.length > 0) {
      cancelList.forEach((cancel, index) => {
        cancel()
        delete cancelList[index]
      })
    }

    const panel = ref({})
    let panelType = 1 // 取得panel的type
    let { params, query, path } = useRoute()

    // 获取路由跳转过的历史状态，赋值给当前界面，起到保留状态的作用，如浏览器的回退前进等
    const routerObj = store.getters.getRouterHistoryList.find(item => item.t === query.t)
    if (routerObj) {
      params = routerObj.params
      query = routerObj.query
      path = routerObj.path

      // 如果当前界面之前载入过，获取状态后更新地址栏，以便后续的赋值操作
      const newUrl = urlParamsHandler(window.location.href, useRoute().query, query)
      overwriteUrl(newUrl)
    }

    const thirdPanel = query.thirdPanel
    const fourthPanel = query.fourthPanel
    if (fourthPanel) {
      panelType = Number(fourthPanel)
    } else if (thirdPanel) {
      panelType = Number(thirdPanel)
    } else {
      panelType = props.entity ? props.entity.type : panelTypeAndRouteMapping[params.typeName]
    }

    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime
    // 若url携带了，使用携带的值，否则使用默认值。

    const dateRangeValue = rangeParam ? parseInt(query.range) : 60
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(60)
      timeFilter.value.startTime = startTime
      timeFilter.value.endTime = endTime
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }

    // npm是否展示分数
    const showScorePanel = [drillDownPanelTypeMapping.npmOverviewIp, drillDownPanelTypeMapping.npmOverviewDomain, drillDownPanelTypeMapping.npmOverviewApp, drillDownPanelTypeMapping.npmOverviewCommon, drillDownPanelTypeMapping.npmThirdMenu]
    const showScore = showScorePanel.indexOf(panelType) > -1

    const metric = ref(query.metric || 'Bits/s')

    const queryCondition = ref(query.queryCondition || '')
    const dimensionType = ref(query.dimensionType || '')
    // 三级菜单判断
    const tabOperationType = ref(query.tabOperationType)
    const networkOverviewBeforeTab = ref(query.networkOverviewBeforeTab || '')
    return {
      panelType,
      panel,
      timeFilter,
      showScore,
      metric,
      path,
      queryCondition,
      dimensionType,
      tabOperationType,
      networkOverviewBeforeTab
    }
  },
  methods: {
    async init () {
      const panels = await getPanelList({ type: this.panelType })
      if (panels && panels.length > 0) {
        this.panel = panels[0]
      }
      if (this.panel.id) {
        if (this.panel.params) {
          this.panel.params = JSON.parse(this.panel.params)
        } else {
          this.panel.params = {}
        }
        this.chartList = (await getChartList({ panelId: this.panel.id, pageSize: -1 })).map(chart => {
          chart.i = chart.id
          // 递归初始化各属性
          this.initChartAttr(chart)
          return chart
        })
      }
    },
    initChartAttr (chart) {
      chart.i = chart.id
      chart.category = getTypeCategory(chart.type)
      // 初始化params
      chart.params = chart.params ? JSON.parse(chart.params) : {}
      chart.firstShow = false
      if (!this.$_.isEmpty(chart.children)) {
        chart.children.forEach(c => {
          this.initChartAttr(c)
        })
      }
    },
    reload (startTime, endTime, dateRangeValue) {
      this.timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime), dateRangeValue: dateRangeValue }
      const { query } = this.$route
      this.$store.commit('setTimeRangeArray', [this.timeFilter.startTime, this.timeFilter.endTime])
      this.$store.commit('setTimeRangeFlag', dateRangeValue.value)

      const newUrl = urlParamsHandler(window.location.href, query, {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        range: dateRangeValue.value
      })
      overwriteUrl(newUrl)
    },
    timeRefreshChange () {
      // 不是自选时间
      if (this.$refs.dateTimeRange) {
        if (!this.$refs.dateTimeRange.isCustom) {
          const value = this.timeFilter.dateRangeValue
          this.$refs.dateTimeRange.quickChange(value)
        } else {
          this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
        }
      } else {
        this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
      }
    },
    getUrlParam (param, defaultValue, isNumber) {
      if (isNumber) {
        return this.$route.query[param] ? Number(this.$route.query[param]) : defaultValue
      } else {
        return this.$route.query[param] ? this.$route.query[param] : defaultValue
      }
    },
    metricChange (value) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        metric: value
      })
      overwriteUrl(newUrl)
    },
    scoreCalculation () {
      let condition = ''
      let url = ''
      if (this.queryCondition.indexOf(' OR ') > -1) {
        condition = this.queryCondition.split(/["|'](.*?)["|']/)
      } else {
        condition = this.queryCondition
      }
      const type = this.dimensionType || this.networkOverviewBeforeTab
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 0
      }
      if (condition && (typeof condition !== 'object') && type) {
        if (type === 'clientIp') {
          params.q = `ip='${condition.split(/'(.*?)'/)[1]}' and side='client'`
        } else if (type === 'serverIp') {
          params.q = `ip='${condition.split(/'(.*?)'/)[1]}' and side='server'`
        } else if (type === 'clientCity') {
          params.q = `client_city='${condition.split(/'(.*?)'/)[1]}'`
        } else if (type === 'serverCity') {
          params.q = `server_city='${condition.split(/'(.*?)'/)[1]}'`
        } else {
          params.q = condition
        }
        params.type = type
      } else if (condition.length > 1 && type && type === 'ip') {
        params.q = `${type}='${condition[1]}'`
        params.type = type
      } else if (condition.length > 1 && type && type !== 'ip') {
        if (type === 'country' || type === 'asn' || type === 'province' || type === 'city' || type === 'isp') {
          params.q = `${type}='${condition[1]}'`
          params.type = type
        } else if (type === 'idcRenter') {
          params.q = `idc_renter='${condition[1]}'`
          params.type = type
        } else {
          params.q = `${condition[0]}'${condition[1]}'`
          params.type = type
        }
      }
      if (parseFloat(this.tabOperationType) === 3) {
        url = api.npm.overview.allNetworkAnalysis
      } else {
        url = api.npm.overview.networkAnalysis
      }
      if ((type && condition) || type) {
        params.type = params.type || type
        get(url, params).then(res => {
          if (res.code === 200) {
            const data = {
              establishLatencyMs: res.data.result.establishLatencyMsAvg || null,
              httpResponseLatency: res.data.result.httpResponseLatencyAvg || null,
              sslConLatency: res.data.result.sslConLatencyAvg || null,
              tcpLostlenPercent: res.data.result.tcpLostlenPercentAvg || null,
              pktRetransPercent: res.data.result.pktRetransPercentAvg || null
            }
            this.score = computeScore(data)
          }
        })
      }
    }
  },
  /**
   * 页面销毁前，更新历史中已保存的状态
   * 之所以会在下钻时、销毁前保存状态，是因为panel第一次下钻时，beforeUnmount获取不到下钻前参数
   */
  beforeUnmount () {
    const query = this.$_.cloneDeep(this.$route.query)
    const routerObj = this.$store.getters.getRouterHistoryList.find(item => item.t === query.t)
    // const routerObj = window.localRouterHistoryList.find(item => item.t === query.t)
    if (routerObj !== undefined) {
      if (Object.getOwnPropertyNames(query).length >= Object.getOwnPropertyNames(routerObj.query).length) {
        routerObj.query = query
      }
    }

    this.emitter.off('reloadChartList')
    this.$store = null
    this.emitter = null
  }
}
</script>
