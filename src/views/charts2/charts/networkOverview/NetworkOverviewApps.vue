<template>
  <div class="network-overview-apps">
    <div class="network-overview-apps-header">
      <div class="network-overview-apps-title">{{$t('networkOverview.appType.providerAndApp')}}</div>
    </div>

    <div class="app-cards">
      <div class="app-card" @mouseenter="mouseenter(app)" @mouseleave="mouseleave(app)" v-for="(app, index) in appData" :key="app.type + app.name">
        <div class="app-card-title">
          <div class="app-card-title-name">
            <i class="cn-icon" :class="app.type === 'provider' ? 'cn-icon-entity' : 'cn-icon-app2'"></i>
            <span @click="drillDownData(app.type, app.name)">{{app.name}}</span>
          </div>
          <div class="app-card-title-more">
            <span v-show="app.showMore"><i class="cn-icon cn-icon-more-dark" @mouseenter="mouseenterMore(app)"></i></span>
            <span class="app-card-title-more-delete" @click="del(app, index)" v-show="app.moreOptions" @mouseleave="mouseleaveMore(app)"><i class="cn-icon cn-icon-delete"></i>{{$t('overall.delete')}}</span>
          </div>
        </div>
        <div class="app-card__bodys">
          <div class="app-card__body">
            <div class="app-card__body-content">
              <div class="app-card__body-content-value">
                <div class="app-card__body-content-number">{{unitConvert(app.rate, unitTypes.number).join(' ')}}</div>
                <div class="app-card__body-content-percent red" v-if="app.value > 0">
                  <span v-if="app.value <= 5">
                    +{{unitConvert(app.value, unitTypes.percent).join('')}}
                  </span>
                  <span v-else>>500.00%</span>
                </div>
                <div class="app-card__body-content-percent green" v-else-if="app.value < 0">
                  <span v-if="app.value >= -5">
                    -{{unitConvert(app.value, unitTypes.percent).join('').replaceAll('-', '')}}
                  </span>
                  <span v-else>>500.00%</span>
                </div>
                <div v-else-if="app.value === '-' || app.value === 0" class="app-card__body-content-percent">+0.00%</div>
              </div>
            </div>
            <div class="app-card__body-previous">
              <div>Total</div>
              <div v-if="metric === 'Bits/s'">{{unitConvert(app.total, unitTypes.byte).join(' ')}}</div>
              <div v-else>{{unitConvert(app.total, unitTypes.number).join(' ')}}</div>
            </div>
          </div>
          <div class="chart__drawing" v-show="!isNoData" :id="`chart-${app.name}-${app.type}`"></div>
        </div>
      </div>
      <div class="app-card app-card--create">
        <i class="cn-icon cn-icon-add1" @click="addApp"></i>
        <span @click="addApp">{{$t('overall.add')}}</span>
      </div>
    </div>
    <el-drawer
        v-model="showAddApp"
        direction="btt"
        custom-class="add-app-drawer"
        :with-header="false"
        :show-close="false"
    >
      <div class="add-app">
        <div class="add-app__header">
          <div class="header__title">{{$t('overall.add')}}</div>
          <div class="header__operations">
            <div class="header__operation header__operation--cancel" @click="cancelApp">{{$t('overall.cancel')}}</div>
            <div class="header__operation header__operation--save" @click="save">{{$t('overall.save')}}</div>
          </div>
        </div>
        <div class="add-app__body">
          <el-tabs v-model="appTypeTab" @tab-click="appTypeTabChange">
            <el-tab-pane :label="$t('network.providers')" :name="0">
              <div class="body__apps" :class="{'body__apps-no-grid': providerOptions.length === 0}">
                <loading :loading="loadingBody"></loading>
                <chart-no-data v-if="providerOptions.length === 0 && !loadingBody"></chart-no-data>
                <div class="body__app" v-else :class="{'provide-show': app.provideShow}" v-for="(app, index) in providerOptions" :key="index"  @click="appCheckedChange(app, 0)">
                  <div class="body__app-content">
                    <div class="body__app-left">
                      <span><i class="cn-icon" :class="app.icon"></i></span>
                      <span class="body__app-left-title">{{app.value}}</span>
                    </div>
                    <div class="body__app-content-right" v-if="app.provideShow"><span><i class="cn-icon cn-icon-a-allclear"></i></span></div>
                  </div>
                  <div class="body__app-value" v-if="app.remark" :title="app.remark">{{app.remark}}</div>
                  <div v-else>-</div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('networkOverview.appType.app')" :name="1">
              <div class="body__apps" :class="{'body__apps-no-grid': appOptions.length === 0}">
                <loading :loading="loadingBody"></loading>
                <chart-no-data v-if="appOptions.length === 0 && !loadingBody"></chart-no-data>
                <div class="body__app" v-else :class="{'app-show': app.appShow}" v-for="(app, index) in appOptions" :key="index" @click="appCheckedChange(app, 1)">
                  <div class="body__app-content">
                    <div class="body__app-left">
                      <span><i class="cn-icon" :class="app.icon"></i></span>
                      <span class="body__app-left-title">{{app.value}}</span>
                    </div>
                    <div class="body__app-content-right" v-if="app.appShow"><span><i class="cn-icon cn-icon-a-allclear"></i></span></div>
                  </div>
                  <div class="body__app-value" v-if="app.remark" :title="app.remark">{{app.remark}}</div>
                  <div v-else>-</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="body__searcher">
            <el-input v-model="searcherApp" @input="searcherAppChange" size="mini" :placeholder="$t('networkOverview.search')" prefix-icon="el-icon-search"></el-input>
          </div>
          <div class="body__loading"><loading :loading="loading"></loading></div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { storageKey, unitTypes, networkTable, operationType, curTabState } from '@/utils/constants'
import * as echarts from 'echarts'
import { appListChartOption } from '@/views/charts2/charts/options/echartOption'
import { shallowRef } from 'vue'
import { get, put } from '@/utils/http'
import { api } from '@/utils/api'
import _ from 'lodash'
import { getSecond } from '@/utils/date-util'
import { getChainRatio, overwriteUrl, urlParamsHandler, getUserDrilldownTableConfig } from '@/utils/tools'
import loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { appStackedLineTooltipFormatter } from '@/views/charts/charts/tools'
import chartMixin from '@/views/charts2/chart-mixin'

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
      appShowType: 'bytes',
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
      urlChangeParams: {}
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
      this.init()
    }
  },
  methods: {
    unitConvert,
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
            return item.name
          }).join(',')
        }
        prevRequest = get(api.netWorkOverview.applicationCycleTrafficTotal, params)
        request = get(api.netWorkOverview.applicationTrafficAnalysis, params)
        this.handleData(prevRequest, request, 'app')
      }
      if (providerCards.length > 0) {
        params = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          appCompanies: providerCards.map(item => {
            return item.name
          }).join(',')
        }
        prevRequest = get(api.netWorkOverview.appCompanyCycleTrafficTotal, params)
        request = get(api.netWorkOverview.appCompanyTrafficAnalysis, params)
        this.handleData(prevRequest, request, 'provider')
      }
    },
    handleData (prevRequest, request, _t) {
      this.toggleLoading(true)
      Promise.all([prevRequest, request]).then(res => {
        this.isNoData = (res[0].data.result.length && res[1].data.result.length) === 0
        if (this.isNoData) {
          this.appData = this.appData.map(t => {
            return {
              name: t.name,
              type: t.type
            }
          })
        }
        if (res[0].code === 200 && res[1].code === 200) {
          const prevData = res[0].data.result
          const data = res[1].data.result
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
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    metricChange (value) {
      if (value === 'Bits/s') {
        this.appShowType = 'bytes'
      } else if (value === 'Packets/s') {
        this.appShowType = 'packets'
      } else if (value === 'Sessions/s') {
        this.appShowType = 'sessions'
      }
      this.init()
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
        const tableType = this.$route.params ? this.$route.params.typeName : 'networkOverview'
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
          params.forEach(t => {
            t.seriesName = this.$t(t.seriesName)
          })
          return appStackedLineTooltipFormatter(params)
        }
        chart.setOption(chartOption)
        this.myChart.push(chart)
        this.$nextTick(() => {
          chart.resize()
        })
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
    addApp (pageNo, val, show) {
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
      if (parseFloat(this.appTypeTab) === 0) {
        params.type = 'overviewProvide'
        get(api.dict, params).then(res => {
          if (res.code === 200) {
            res.data.list = res.data.list.filter(l => !this.appData.some(pd => pd.type === 'provider' && pd.name === l.value))
            this.pageObj.pages = res.data.pages
            res.data.list.forEach(t => {
              this.toSaveApp.forEach(e => {
                if (t.value === e.name) {
                  t.provideShow = e.provideShow
                }
              })
            })
            if (val) {
              this.providerOptions = res.data.list
            } else if (!val && !show) {
              this.providerOptions = res.data.list
            } else {
              this.providerOptions.push(...res.data.list)
              this.appListData([], this.providerOptions)
            }
          }
          this.loading = false
          this.loadingBody = false
        })
      } else if (parseFloat(this.appTypeTab) === 1) {
        params.type = 'overviewApp'
        get(api.dict, params).then(res => {
          res.data.list = res.data.list.filter(l => !this.appData.some(pd => pd.type === 'app' && pd.name === l.value))
          if (res.code === 200) {
            this.pageObj.pages = res.data.pages
            res.data.list.forEach(t => {
              this.toSaveApp.forEach(e => {
                if (t.value === e.name) {
                  t.appShow = e.appShow
                }
              })
            })
            if (val) {
              this.appOptions = res.data.list
            } else if (!val && !show) {
              this.appOptions = res.data.list
            } else {
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
    appTypeTabChange () {
      this.pageObj.pageNo = 1
      this.searcherApp = ''
      this.addApp()
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
        put(api.chart, toSaveChart).then(res => {
          if (res.code === 200) {
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
    // moreChange (app) {
    //   this.appData.forEach(t => {
    //     if (t.name === app.name && t.type === app.type) {
    //       t.moreOptions = !t.moreOptions
    //     }
    //   })
    // },
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
    if (this.chart.params && this.chart.params.app) {
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
  }
}
</script>
