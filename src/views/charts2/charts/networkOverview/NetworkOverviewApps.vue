<template>
  <div class="network-overview-apps">
    <div class="network-overview-apps-header">
      <div class="network-overview-apps-title">{{$t('networkOverview.appType.providerAndApp')}}</div>
      <chart-error v-if="showError" tooltip :content="errorMsg" max-width="350" width="280" />
    </div>

    <div class="app-cards">
      <div class="app-card" @mouseenter="mouseenter(app)" @mouseleave="mouseleave(app)" v-for="(app, index) in appData" :key="app.type + app.name" test-id="app-data-card">
        <div class="app-card-title">
          <div class="app-card-title-name">
            <i class="cn-icon" :class="app.type === 'provider' ? 'cn-icon-entity' : 'cn-icon-app2'" :test-id="`icon${index}`"></i>
            <span @click="drillDownData(app.type, app.name)" :test-id="`name${index}`">{{app.name}}</span>
          </div>
          <div class="app-card-title-more">
            <span v-show="app.showMore"><i class="cn-icon cn-icon-more-dark" @mouseenter="mouseenterMore(app)" test-id="mouseenter-dark"></i></span>
            <span class="app-card-title-more-delete" @click="del(app, index)" v-show="app.moreOptions" @mouseleave="mouseleaveMore(app)" test-id="mouseleave-more"><i class="cn-icon cn-icon-delete"></i>{{$t('overall.delete')}}</span>
          </div>
        </div>
        <div class="app-card__bodys">
          <div class="app-card__body">
            <div class="app-card__body-content">
              <div class="app-card__body-content-value">
                <div class="app-card__body-content-number" :test-id="`rate${index}`">{{valueToRangeValue(app.rate, unitTypes.number).join(' ')}}</div>
                <div class="app-card__body-content-percent red" v-if="app.value > 0" :test-id="`percent${index}`">
                  <span v-if="app.value <= 5">
                    +{{unitConvert(app.value, unitTypes.percent).join('')}}
                  </span>
                  <span v-else>>500.00%</span>
                </div>
                <div class="app-card__body-content-percent green" v-else-if="app.value < 0" :test-id="`percent${index}`">
                  <span v-if="app.value >= -5">
                    -{{unitConvert(app.value, unitTypes.percent).join('').replace(/-/g, '')}}
                  </span>
                  <span v-else>>500.00%</span>
                </div>
                <div v-else-if="app.value === '-' || app.value === 0" class="app-card__body-content-percent">+0.00%</div>
              </div>
            </div>
            <div class="app-card__body-unit">{{$t(metricShow.label)}}</div>
            <div class="app-card__body-previous">
              <div>{{$t('network.total')}}</div>
              <div v-if="metric === 'Bits/s'" :test-id="`total${index}`">{{valueToRangeValue(app.total, unitTypes.byte).join(' ')}}</div>
              <div v-else :test-id="`total${index}`">{{valueToRangeValue(app.total, unitTypes.number).join(' ')}}</div>
            </div>
          </div>
          <div class="chart__drawing" v-show="!isNoData" :id="`chart-${app.name}-${app.type}`"></div>
        </div>
      </div>
      <div class="app-card app-card--create">
        <i class="cn-icon cn-icon-add1" @click="addApp"></i>
        <span @click="addApp" test-id="add">{{$t('overall.add')}}</span>
      </div>
    </div>
    <el-drawer
        v-model="showAddApp"
        direction="btt"
        class="add-app-drawer"
        :with-header="false"
        :show-close="false"
    >
      <div class="add-app">
        <div class="add-app__header">
          <div class="header__title">{{$t('overall.add')}}</div>
          <div class="header__operations">
            <div class="header__operation header__operation--cancel" @click="cancelApp" test-id="cancel-app">{{$t('overall.cancel')}}</div>
            <div class="header__operation header__operation--save" @click="save">{{$t('overall.save')}}</div>
          </div>
        </div>
        <div class="add-app__body">
          <el-tabs v-model="appTypeTab" @tab-click="appTypeTabChange">
            <el-tab-pane :name="0">
              <template #label>
                <i class="cn-icon cn-icon-providers"></i>&nbsp;&nbsp;{{$t('network.providers')}}
              </template>
              <div class="body__apps" :class="{'body__apps-no-grid': providerOptions.length === 0}">
                <loading :loading="loadingBody"></loading>
                <chart-no-data v-if="providerOptions.length === 0 && !loadingBody" test-id="noData"></chart-no-data>
                <div class="body__app" v-else :class="{'provide-show': app.provideShow}" v-for="(app, index) in providerOptions" :key="index"  @click="appCheckedChange(app, 0)" :test-id="`provide${index}`">
                  <div class="body__app-content">
                    <div class="body__app-left">
                      <span><i class="cn-icon" :class="app.icon" :test-id="`provide-icon${index}`"></i></span>
                      <span class="body__app-left-title" :test-id="`provide-title${index}`">{{app.value}}</span>
                    </div>
                    <div class="body__app-content-right" v-if="app.provideShow"><span><i class="cn-icon cn-icon-a-allclear"></i></span></div>
                  </div>
                  <div class="body__app-value" v-if="app.remark" :title="app.remark" :test-id="`provide-remark${index}`">{{app.remark}}</div>
                  <div v-else>-</div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane :name="1">
              <template #label>
                <i class="cn-icon cn-icon-app-name"></i>&nbsp;&nbsp;{{$t('networkOverview.appType.app')}}
              </template>
              <div class="body__apps" :class="{'body__apps-no-grid': appOptions.length === 0}">
                <loading :loading="loadingBody"></loading>
                <chart-no-data v-if="appOptions.length === 0 && !loadingBody"></chart-no-data>
                <div class="body__app" v-else :class="{'app-show': app.appShow}" v-for="(app, index) in appOptions" :key="index" @click="appCheckedChange(app, 1)" :test-id="`app${index}`">
                  <div class="body__app-content">
                    <div class="body__app-left">
                      <span><i class="cn-icon" :class="app.icon" :test-id="`app-icon${index}`"></i></span>
                      <span class="body__app-left-title" :test-id="`app-title${index}`">{{app.value}}</span>
                    </div>
                    <div class="body__app-content-right" v-if="app.appShow"><span><i class="cn-icon cn-icon-a-allclear"></i></span></div>
                  </div>
                  <div class="body__app-value" v-if="app.remark" :title="app.remark" :test-id="`app-remark${index}`">{{app.remark}}</div>
                  <div v-else>-</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="body__searcher">
            <el-input v-model="searcherApp" @input="searcherAppChange" size="small" :placeholder="$t('networkOverview.search')" prefix-icon="Search" test-id="search-input"></el-input>
          </div>
          <div class="body__loading"><loading :loading="loading"></loading></div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import { storageKey, unitTypes, networkTable, operationType, curTabState, metricOptions } from '@/utils/constants'
import * as echarts from 'echarts'
import { appListChartOption } from '@/views/charts2/charts/options/echartOption'
import { shallowRef } from 'vue'
import { api } from '@/utils/api'
import _ from 'lodash'
import { getSecond } from '@/utils/date-util'
import { getChainRatio, overwriteUrl, urlParamsHandler, getUserDrilldownTableConfig } from '@/utils/tools'
import loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { appStackedLineTooltipFormatter } from '@/views/charts/charts/tools'
import chartMixin from '@/views/charts2/chart-mixin'
import axios from 'axios'

export default {
  name: 'NetworkOverviewApps',
  components: {
    loading,
    ChartNoData
  },
  mixins: [chartMixin],
  data () {
    return {
      appData: [],
      // 假数据
      appTempData: [],
      valueToRangeValue,
      unitConvert,
      unitTypes,
      timer: null,
      showAddApp: false,
      // add弹框中的可选项
      providerOptions: [],
      appOptions: [],
      appTypeTab: 0,
      searcherApp: '',
      // 选中的app，不区分app和provider
      toSaveApp: [],
      pageObj: { // 分页对象
        pageNo: 1,
        pageSize: 24,
        pages: 0
      },
      loading: false,
      timerScroll: null,
      offset: 0,
      flag: false,
      timerSearch: null,
      loadingBody: false,
      curTabState: curTabState,
      urlChangeParams: {},
      showError: false,
      errorMsg: '',
      metricShow: {
        value: 'Bits/s',
        label: 'metric.bps'
      }
    }
  },
  props: {
    metric: {
      type: String,
      default: 'Bits/s'
    }
  },
  setup () {
    return {
      myChart: shallowRef([])
    }
  },
  watch: {
    showAddApp: {
      deep: true,
      handler (n) {
        this.searcherApp = ''
        if (n) {
          window.addEventListener('scroll', this.handleScroll, true)
        } else {
          window.removeEventListener('scroll', this.handleScroll, true)
        }
      }
    },
    timeFilter (n) {
      this.init()
    },
    metric (n) {
      this.metricShow = metricOptions.find(item => item.value === this.metric)
      this.init()
    }
  },
  methods: {
    clickOutSide () {
      this.appData.forEach(t => {
        t.moreOptions = false
      })
    },
    init () {
      const appCards = []
      const providerCards = []
      this.appData.forEach(d => {
        if (d.type === 'app') {
          appCards.push(d)
        } else if (d.type === 'provider') {
          providerCards.push(d)
        }
      })
      let prevRequest
      let request
      let params
      if (appCards.length > 0) {
        params = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          appLabels: appCards.map(item => {
            return `'${item.name}'`
          }).join(',')
        }
        prevRequest = axios.get(api.netWorkOverview.applicationCycleTrafficTotal, { params: params })
        request = axios.get(api.netWorkOverview.applicationTrafficAnalysis, { params: params })
        this.handleData(prevRequest, request, 'app')
      } else {
        this.toggleLoading(false)
      }
      if (providerCards.length > 0) {
        params = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          appCompanies: providerCards.map(item => {
            return `'${item.name}'`
          }).join(',')
        }
        prevRequest = axios.get(api.netWorkOverview.appCompanyCycleTrafficTotal, { params: params })
        request = axios.get(api.netWorkOverview.appCompanyTrafficAnalysis, { params: params })
        this.handleData(prevRequest, request, 'provider')
      } else {
        this.toggleLoading(false)
      }
    },
    handleData (prevRequest, request, _t) {
      this.toggleLoading(true)
      Promise.all([prevRequest, request]).then(res => {
        this.isNoData = (res[0].data.data.result.length && res[1].data.data.result.length) === 0
        if (this.isNoData) {
          this.appData = this.appData.map(t => {
            return {
              name: t.name,
              type: t.type
            }
          })
        }
        if (res[0].status === 200 && res[1].status === 200) {
          this.showError = false
          const prevData = res[0].data.data.result
          const data = res[1].data.data.result
          let toCompareType = 'bytes'
          if (this.metric === 'Sessions/s') {
            toCompareType = 'sessions'
          } else if (this.metric === 'Packets/s') {
            toCompareType = 'packets'
          }
          data.forEach(d => {
            if (d.type === toCompareType) {
              const prevTypeData = prevData.find(p => p.type === toCompareType)
              Object.keys(d).forEach(app => {
                if (app !== 'type') {
                  this.appData.forEach(d2 => {
                    if (d2.type === _t && d2.name === app) {
                      d2.rate = d[app].analysis.rate
                      d2.pRate = prevTypeData ? (prevTypeData[app] ? prevTypeData[app].rate : 0) : 0
                      d2.total = d[app].analysis.total
                      d2.lineData = d[app].values.map(v => [Number(v[0]), Number(v[1]), 'time'])
                      d2.value = getChainRatio(d2.rate, d2.pRate)
                      this.initChart(d2)
                    }
                  })
                }
              })
            }
          })
        } else {
          this.showError = true
          this.errorMsg = this.errorMsgHandler(res[0])
        }
      }).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    getUrlParam (param, defaultValue, isNumber) {
      if (isNumber) {
        return this.$route.query[param] ? Number(this.$route.query[param]) : defaultValue
      } else {
        return this.$route.query[param] ? this.$route.query[param] : defaultValue
      }
    },
    async drillDownData (type, value) {
      let tabType = ''
      if (type === 'provider') {
        tabType = 'network.providers'
      } else if (type === 'app') {
        tabType = 'network.applications'
      }
      if (tabType) {
        const oldCurTab = this.getUrlParam(this.curTabState.networkOverviewBeforeTab, '')
        const curTable = networkTable.networkOverview
        const tableType = this.$route.path.replace('/panel/', '') || 'networkOverview'
        const metric = this.getUrlParam(this.curTabState.tableMetric, 'Bits/s')
        const list = await getUserDrilldownTableConfig(tableType, metric)
        const tabGroup = list.filter(item => item.label === tabType)
        if (tabGroup && tabGroup.length > 0) {
          this.urlChangeParams[this.curTabState.networkOverviewBeforeTab] = tabGroup[0].prop
        }
        this.urlChangeParams[this.curTabState.tabOperationBeforeType] = this.getUrlParam(this.curTabState.tabOperationType, '', true)
        this.urlChangeParams[this.curTabState.tabOperationType] = operationType.fourthMenu

        const queryCondition = []
        const searchProps = tabGroup[0].dillDownProp
        searchProps.forEach(item => {
          queryCondition.push(item + "='" + value + "'")
        })
        this.urlChangeParams[this.curTabState.queryCondition] = queryCondition.join(' OR ')

        const curTab = tabGroup[0]
        if (curTab.lineQueryCondition) {
          const lineQueryCondition = []
          curTab.lineQueryCondition.forEach(item => {
            lineQueryCondition.push(item.replaceAll('$param', value))
          })
          this.urlChangeParams[this.curTabState.lineQueryCondition] = lineQueryCondition.join(' OR ')
        }

        this.$store.getters.menuList.forEach(menu => {
          if (this.$_.isEmpty(menu.children) && menu.route) {
            if (this.$route.path === menu.route) {
              menu.columnName = tabType
              menu.columnValue = value
              this.urlChangeParams[this.curTabState.panelName] = value
              this.urlChangeParams[this.curTabState.thirdMenu] = tabType
              this.urlChangeParams[this.curTabState.dimensionType] = tabGroup[0] ? tabGroup[0].prop : ''
              this.urlChangeParams[this.curTabState.fourthMenu] = value
            }
          } else if (!this.$_.isEmpty(menu.children)) {
            menu.children.forEach(child => {
              if (this.$route.path === child.route) {
                child.columnName = tabType
                child.columnValue = value
                this.urlChangeParams[this.curTabState.panelName] = value
                this.urlChangeParams[this.curTabState.thirdMenu] = tabType
                this.urlChangeParams[this.curTabState.dimensionType] = tabGroup[0] ? tabGroup[0].prop : ''
                this.urlChangeParams[this.curTabState.fourthMenu] = value
              }
            })
          }
        })
        let toPanel = null
        list.forEach((item, index) => {
          if (item.label === tabType) {
            item.checked = false
            toPanel = item.panelId
          }
          if (oldCurTab && (item.prop === oldCurTab)) {
            item.checked = true
          }
        })
        this.$store.commit('setNetworkOverviewTabList', list)
        const tabObjGroup = list.filter(item => item.checked)
        if (tabObjGroup && tabObjGroup.length > 0) {
          const curTab = tabObjGroup[0]
          this.urlChangeParams[this.curTabState.curTab] = curTab
        }
        this.changeUrlTabState()
        this.$router.push({
          query: {
            ...this.$route.query,
            thirdPanel: curTable.panelIdOfThirdMenu ? curTable.panelIdOfThirdMenu : '',
            fourthPanel: toPanel || '',
            t: +new Date()
          }
        })
      }
    },
    changeUrlTabState () {
      if (this.urlChangeParams && JSON.stringify(this.urlChangeParams) !== '{}') {
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, this.urlChangeParams)
        overwriteUrl(newUrl)
      }
      this.urlChangeParams = {}
    },
    initChart (obj) {
      if (!this.isUnitTesting) {
        let chart = this.myChart.find(m => m.name === obj.name && m.type === obj.type)
        if (!chart) {
          chart = echarts.init(document.getElementById(`chart-${obj.name}-${obj.type}`))
          const chartOption = _.cloneDeep(appListChartOption)
          chartOption.series = [{
            ...chartOption.series[0],
            data: obj.lineData.map(v => [Number(v[0]) * 1000, Number(v[1]), 'number']),
            lineStyle: {
              color: '#35ADDA'
            },
            areaStyle: {
              opacity: 0.1,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#35ADDA'
                },
                {
                  offset: 1,
                  color: '#35ADDA'
                }
              ])
            }
          }]
          chartOption.tooltip.formatter = (params) => {
            return appStackedLineTooltipFormatter(params)
          }
          chart.setOption(chartOption)
          this.myChart.push(chart)
          this.$nextTick(() => {
            chart.resize()
          })
        }
      }
    },
    handleScroll (e) {
      const clientHeight = e.target.clientHeight
      const scrollTop = e.target.scrollTop
      const scrollHeight = e.target.scrollHeight
      if (scrollTop && (clientHeight + scrollTop) >= scrollHeight) {
        if (this.pageObj.pages > this.pageObj.pageNo) {
          this.loading = true
          this.pageObj.pageNo = this.pageObj.pageNo + 1
          this.addApp(this.pageObj.pageNo, this.searcherApp, this.loading)
        }
      }
    },
    addApp (pageNo, val, show, index) {
      if (!index) {
        index = '0'
      }
      this.showAddApp = true
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        pageSize: this.pageObj.pageSize,
        q: ''
      }
      if (val && show) { // 搜索有值 并且 true
        params.q = val
        params.pageNo = pageNo
      } else if (!val && show) { // 搜索无值 并且 true
        val = ''
        params.pageNo = pageNo
      } else if (val && !show) { // 搜索有值 并且 false
        params.q = val
        params.pageNo = 1
      } else {
        params.pageNo = 1
      }
      if (parseFloat(index) === 0) {
        params.type = 'overviewProvide'
        axios.get(api.dict, { params: params }).then(response => {
          const res = response.data
          if (response.status === 200 && res.data.list) {
            res.data.list = res.data.list.filter(l => !this.appData.some(pd => pd.type === 'provider' && pd.name === l.value))
            this.pageObj.pages = res.data.pages
            res.data.list.forEach(t => {
              this.toSaveApp.forEach(e => {
                if (t.value === e.name) {
                  t.provideShow = e.provideShow
                }
              })
            })
            if (!show) { // 非滚动滚动条操作，直接覆盖之前的数据
              this.providerOptions = res.data.list
            } else { // 滚动条操作，则将新数据和之前的数据组合
              this.providerOptions.push(...res.data.list)
              this.appListData([], this.providerOptions)
            }
          }
          this.loading = false
          this.loadingBody = false
        })
      } else if (parseFloat(index) === 1) {
        params.type = 'overviewApp'
        axios.get(api.dict, { params: params }).then(response => {
          const res = response.data
          if (response.status === 200) {
            res.data.list = res.data.list.filter(l => !this.appData.some(pd => pd.type === 'app' && pd.name === l.value))
            this.pageObj.pages = res.data.pages
            res.data.list.forEach(t => {
              this.toSaveApp.forEach(e => {
                if (t.value === e.name) {
                  t.appShow = e.appShow
                }
              })
            })
            if (!show) { // 非滚动滚动条操作，直接覆盖之前的数据
              this.appOptions = res.data.list
            } else { // 滚动条操作，则将新数据和之前的数据组合
              this.appOptions.push(...res.data.list)
              this.appListData(this.appOptions, [])
            }
          }
          this.loading = false
          this.loadingBody = false
        })
      }
    },
    appListData (appOptions, providerOptions) {
      const oldApps = this.appData ? this.appData.filter(a => a.type === 'app') : []
      const oldProviders = this.appData ? this.appData.filter(a => a.type === 'provider') : []
      this.appOptions = appOptions.filter(a => {
        return !oldApps.some(o => o.name === a.value)
      })
      this.providerOptions = providerOptions.filter(a => {
        return !oldProviders.some(o => o.name === a.value)
      })
    },
    cancelApp () {
      this.showAddApp = false
    },
    appTypeTabChange (n) {
      // 此处的tab-click有延迟，获取的是上一个路由，jest单测里获取的是click，为兼容故继续使用tab-click而非tab-change
      this.pageObj.pageNo = 1
      this.searcherApp = ''
      this.addApp('', '', '', n.index)
      this.loadingBody = true
      window.addEventListener('scroll', this.scrollChange, true)
      this.timerScroll = setTimeout(() => {
        window.removeEventListener('scroll', this.scrollChange, true)
      }, 500)
    },
    scrollChange (e) {
      e.target.scrollTop = 0
    },
    searcherAppChange (val) {
      clearTimeout(this.timerSearch)
      window.addEventListener('scroll', this.scrollChange, true)
      this.timerSearch = setTimeout(() => {
        if (this.flag) {
          return false
        }
        this.flag = true
        this.pageObj.pageNo = 1
        this.searcherApp = val
        this.addApp(this.pageObj.pageNo, val)
        this.flag = false
        window.removeEventListener('scroll', this.scrollChange, true)
      }, 500)
    },
    // 保存变更，并且在增、删app后，根据当前app数量更改整体高度
    saveChart (toSaveChart) {
      return new Promise(resolve => {
        axios.put(api.chart, toSaveChart).then(res => {
          if (res.status === 200) {
            this.emitter.emit('reloadChartList')
            resolve()
          }
        })
      })
    },
    del (app, index) {
      const appData = _.cloneDeep(this.appData)
      appData.splice(index, 1)
      const toSaveParams = this.chart.params.app ? this.chart.params : { app: [] }
      if (toSaveParams.app.some(p => p.user === parseInt(localStorage.getItem(storageKey.userId)))) {
        toSaveParams.app.forEach(p => {
          if (p.user === parseInt(localStorage.getItem(storageKey.userId))) {
            p.list = appData.map(p => {
              return {
                type: p.type,
                name: p.name
              }
            })
          }
        })
      } else {
        toSaveParams.app.push({
          user: parseInt(localStorage.getItem(storageKey.userId)),
          list: appData.map(p => {
            return {
              type: p.type,
              name: p.name
            }
          })
        })
      }
      const toSaveChart = {
        ...this.chart,
        params: JSON.stringify(toSaveParams)
      }
      this.saveChart(toSaveChart).then(res => {
        this.appData.splice(index, 1)
      })
    },
    deleteDuplicate (arr) {
      const arr1 = []
      arr.forEach(a => {
        if (!arr1.find(a1 => a.name === a1.name && a.type === a1.type)) {
          arr1.push(a)
        }
      })
      return arr1
    },
    save () {
      if (this.toSaveApp.length > 0) {
        const toSaveParams = this.chart.params.app ? this.chart.params : { app: [] }
        if (toSaveParams.app.some(p => p.user === parseInt(localStorage.getItem(storageKey.userId)))) {
          toSaveParams.app.forEach(p => {
            if (p.user === parseInt(localStorage.getItem(storageKey.userId))) {
              p.list = this.deleteDuplicate([...p.list, ...this.toSaveApp])
            }
          })
        } else {
          const defaultApp = toSaveParams.app.find(p => p.user === 'default')
          toSaveParams.app.push({
            user: parseInt(localStorage.getItem(storageKey.userId)),
            list: this.deleteDuplicate([...defaultApp.list, ...this.toSaveApp])
          })
        }
        const toSaveChart = {
          ...this.chart,
          params: JSON.stringify(toSaveParams)
        }
        this.saveChart(toSaveChart).then(res => {
          this.appData = _.cloneDeep(toSaveParams.app.find(p => p.user === parseInt(localStorage.getItem(storageKey.userId))).list)
          this.$nextTick(() => {
            this.init()
            this.showAddApp = false
            this.toSaveApp = []
          })
        })
      }
    },
    appCheckedChange (app, num) {
      if (num === 0) {
        this.providerOptions.forEach(t => {
          if (t.value === app.value) {
            t.provideShow = !t.provideShow
            if (t.provideShow) {
              this.toSaveApp.push({ type: 'provider', name: app.value, provideShow: t.provideShow })
            } else {
              const index = this.toSaveApp.findIndex(a => a.name === app.value)
              if (index > -1) {
                this.toSaveApp.splice(index, 1)
              }
            }
          }
        })
      } else if (num === 1) {
        this.appOptions.forEach(t => {
          if (t.value === app.value) {
            t.appShow = !t.appShow
            if (t.appShow) {
              this.toSaveApp.push({ type: 'app', name: app.value, appShow: t.appShow })
            } else {
              const index = this.toSaveApp.findIndex(a => a.name === app.value)
              if (index > -1) {
                this.toSaveApp.splice(index, 1)
              }
            }
          }
        })
      }
    },
    resize () {
      this.myChart.forEach(t => {
        t.resize()
      })
    },
    mouseenterMore (app) {
      this.appData.forEach(t => {
        if (t.name === app.name && t.type === app.type) {
          t.moreOptions = true
        }
      })
    },
    mouseleaveMore (app) {
      this.appData.forEach(t => {
        if (t.name === app.name && t.type === app.type) {
          t.moreOptions = false
        }
      })
    },
    mouseenter (app) {
      this.appData.forEach(t => {
        if (t.name === app.name && t.type === app.type) {
          t.showMore = true
        }
      })
    },
    mouseleave (app) {
      this.appData.forEach(t => {
        if (t.name === app.name && t.type === app.type) {
          t.showMore = false
          t.moreOptions = false
        }
      })
    }
  },
  mounted () {
    this.metricShow = metricOptions.find(item => item.value === this.metric)
    if (this.chart && this.chart.params && this.chart.params.app) {
      const userId = parseInt(localStorage.getItem(storageKey.userId))
      const apps = _.cloneDeep(this.chart.params.app)
      let app = apps.find(p => p.user === userId)
      if (!app) {
        app = apps.find(p => p.user === 'default')
      }
      this.appData = app.list
      this.init()
      window.addEventListener('resize', this.resize)
    }
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.resize)
    clearTimeout(this.timerScroll)
    clearTimeout(this.timerSearch)
    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
    this.unitConvert = null
    this.valueToRangeValue = null
  }
}
</script>
