<template>
  <div class="network-overview-apps">
    <div class="line-select-metric">
      <span>{{$t('network.metric')}}:</span>
      <div class="line-select__operation">
        <el-select
            size="mini"
            v-model="metricFilter"
            placeholder=""
            popper-class="app-metric"
            :popper-append-to-body="false"
            @change="metricChange"
        >
          <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <div class="app-cards">
      <div class="app-card" v-for="(app, index) in appData" :key="index">
        <div class="app-card-title">
          <div class="app-card-title-name">
            <i class="cn-icon" :class="app.type === 'provider' ? 'cn-icon-entity' : 'cn-icon-app2'"></i>
            <span>{{app.name}}</span>
          </div>
          <div class="app-card-title-more" v-ele-click-outside="clickOutSide">
            <span><i class="cn-icon cn-icon-more-dark" @click="moreChange(app)"></i></span>
            <span class="app-card-title-more-delete" @click="del(app, index)" v-show="app.moreName"><i class="cn-icon cn-icon-delete"></i>{{$t('overall.delete')}}</span>
          </div>
        </div>
        <div class="app-card__bodys">
          <div class="app-card__body">
            <div class="app-card__body-content">
              <div class="app-card__body-content-value">
                <div class="app-card__body-content-number">{{unitConvert(app.rate, unitTypes.number).join(' ')}}</div>
                <div class="app-card__body-content-percent" :class="app.trend === 'up' ? 'red' : 'green'">
                  <span v-if="app.trend === 'up'">+</span><span v-else-if="app.trend === 'down'">-</span>{{unitConvert(periodicJudgmentCalculationChange(app.rate, app.pRate).total, unitTypes.percent).join('')}}
                </div>
              </div>
            </div>
            <div class="app-card__body-previous">
              <div>Total</div>
              <div>{{unitConvert(app.total, unitTypes.number).join(' ')}}</div>
            </div>
          </div>
          <div class="chart__drawing" :id="`chart-${app.name}-${app.type}`"></div>
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
            <el-tab-pane :label="$t('networkOverview.appType.provider')" :name="0">
              <div class="body__apps">
                <div class="body__app" :class="{'provide-show': app.provideShow}" v-for="app in providerOptions" :key="app.name"  @click="appCheckedChange(app, 0)">
                  <div class="body__app-content">
                    <div class="body__app-left">
                      <span><i class="cn-icon cn-icon-mining-pool"></i></span>
                      <span class="body__app-left-title">{{app.name}}</span>
                    </div>
                    <div class="body__app-content-right" v-if="app.provideShow"><span><i class="cn-icon cn-icon-a-allclear"></i></span></div>
                  </div>
                  <div class="body__app-value">{{app.desc}}</div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('networkOverview.appType.app')" :name="1">
              <div class="body__apps">
                <div class="body__app" :class="{'app-show': app.appShow}" v-for="app in appOptions" :key="app.name" @click="appCheckedChange(app, 1)">
                  <div class="body__app-content">
                    <div class="body__app-left">
                      <span><i class="cn-icon cn-icon-mining-pool"></i></span>
                      <span class="body__app-left-title">{{app.name}}</span>
                    </div>
                    <div class="body__app-content-right" v-if="app.appShow"><span><i class="cn-icon cn-icon-a-allclear"></i></span></div>
                  </div>
                  <div class="body__app-value">{{app.desc}}</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="body__searcher">
            <el-input v-model="searcherApp" @input="searcherAppChange" size="mini" :placeholder="$t('networkOverview.search')" prefix-icon="el-icon-search"></el-input>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { storageKey, unitTypes } from '@/utils/constants'
import * as echarts from 'echarts'
import { appListChartOption } from '@/views/charts2/charts/options/echartOption'
import { shallowRef } from 'vue'
import { get, put } from '@/utils/http'
import { api } from '@/utils/api'
import _ from 'lodash'
import { getSecond } from '@/utils/date-util'
export default {
  name: 'NetworkOverviewApps',
  props: {
    chart: Object,
    timeFilter: Object
  },
  setup () {
    return {
      myChart: shallowRef([])
    }
  },
  data () {
    return {
      metricFilter: 'Bits/s',
      metricOptions: [
        {
          value: 'Bits/s',
          label: 'Bits/s'
        },
        {
          value: 'Packets/s',
          label: 'Packets/s'
        },
        {
          value: 'Sessions/s',
          label: 'Sessions/s'
        }
      ],
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
      appShowName: false,
      searcherApp: '',
      appShowTypeTab: 0,
      initialAppOptionsData: [],
      initialProviderOptionsData: [],
      // 选中的app，不区分app和provider
      toSaveApp: [],
      myChartArray: [],
      appShowType: 'bytes'
    }
  },
  methods: {
    unitConvert,
    clickOutSide () {
      this.appData.forEach(t => {
        t.moreName = false
      })
    },
    init () {
      this.appDataQuery(this.appData)
    },
    appDataQuery (data) {
      const appLabels = []
      const providerLabels = []
      let appData = []
      let providerData = []
      data.forEach(t => {
        if (t.type === 'app') {
          appLabels.push(t)
        } else if (t.type === 'provider') {
          providerLabels.push(t)
        }
      })
      if (appLabels) {
        const params = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          appLabels: appLabels.map(item => {
            return item.name
          }).join(',')
        }
        const app1 = get(api.netWorkOverview.applicationCycleTrafficTotal, params)
        const app2 = get(api.netWorkOverview.applicationTrafficAnalysis, params)
        this.resultTotal = [
          {
            type: 'bytes',
            analysis: {
              rate: 2,
              total: 3145435
            }
          },
          {
            type: 'packets',
            analysis: {
              rate: 2,
              total: 3245435
            }
          },
          {
            type: 'sessions',
            analysis: {
              rate: 2,
              total: 23345
            }
          }
        ]
        this.resultAnalysis = [
          {
            type: 'bytes',
            l11: {
              analysis: {
                rate: 2
              },
              values: [
                [
                  1435781430781,
                  '12'
                ],
                [
                  1435781431781,
                  '13'
                ]
              ]
            },
            a0: {
              analysis: {
                rate: 4
              },
              values: [
                [
                  1435781430781,
                  '12'
                ],
                [
                  1435781431781,
                  '31'
                ]
              ]
            }
          },
          {
            type: 'packets',
            l11: {
              analysis: {
                rate: 3
              },
              values: [
                [
                  1435781430781,
                  '13'
                ],
                [
                  1435781431781,
                  '21'
                ]
              ]
            },
            a0: {
              analysis: {
                rate: 3
              },
              values: [
                [
                  1435781430781,
                  '11'
                ],
                [
                  1435781431781,
                  '21'
                ]
              ]
            }
          },
          {
            type: 'sessions',
            l11: {
              analysis: {
                rate: 2
              },
              values: [
                [
                  1435781430781,
                  '1'
                ],
                [
                  1435781431781,
                  '1'
                ]
              ]
            }
          }
        ]
        this.resultTotal.forEach(t => {
          this.resultAnalysis.forEach((v, i) => {
            if (t.type === v.type) {
              this.resultAnalysis[i].total = t
            }
          })
        })
        appData = this.resultAnalysis
        Promise.all([app1, app2]).then(res => {
          if (res.code === 200) {
            console.log(1)
          }
        })
        this.appData.forEach((app, i) => {
          if (app.type === 'app') {
            appData.forEach(t => {
              if (t.type === this.appShowType && this.appShowType === 'bytes') {
                // app.value = t.total.analysis.rate === 0 ? 0 : (t[app.name].analysis.rate - t.total.analysis.rate) / t.total.analysis.rate
                app.rate = t[app.name].analysis.rate
                app.pRate = t.total.analysis.rate
                app.total = t.total.analysis.total
                app.lineData = t[app.name].values.map(v => [Number(v[0]), Number(v[1]), 'time'])
                app.trend = this.periodicJudgmentCalculationChange(app.rate, app.pRate).value
              }
            })
            this.initChart(app)
          }
        })
      }
      if (providerLabels) {
        const params = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          appCompanies: providerLabels.map(item => { return item.name }).join(',')
        }
        const app1 = get(api.netWorkOverview.appCompanyCycleTrafficTotal, params)
        const app2 = get(api.netWorkOverview.appCompanyTrafficAnalysis, params)
        this.resultTotal = [
          {
            type: 'bytes',
            analysis: {
              rate: 20,
              total: 3245435
            }
          },
          {
            type: 'packets',
            analysis: {
              rate: 2,
              total: 3245435
            }
          },
          {
            type: 'sessions',
            analysis: {
              rate: 2,
              total: 23345
            }
          }
        ]
        this.resultAnalysis = [
          {
            type: 'bytes',
            l11: {
              analysis: {
                rate: 2
              },
              values: [
                [
                  1435781430781,
                  '12'
                ],
                [
                  1435781431781,
                  '13'
                ]
              ]
            },
            a0: {
              analysis: {
                rate: 6
              },
              values: [
                [
                  1435781430781,
                  '12'
                ],
                [
                  1435781431781,
                  '31'
                ]
              ]
            },
            d3: {
              analysis: {
                rate: 8
              },
              values: [
                [
                  1435781430781,
                  '121'
                ],
                [
                  1435781431781,
                  '131'
                ],
                [
                  1435781432781,
                  '321'
                ],
                [
                  1435781433781,
                  '331'
                ]
              ]
            }
          },
          {
            type: 'packets',
            l11: {
              analysis: {
                rate: 3
              },
              values: [
                [
                  1435781430781,
                  '13'
                ],
                [
                  1435781431781,
                  '21'
                ]
              ]
            },
            a0: {
              analysis: {
                rate: 3
              },
              values: [
                [
                  1435781430781,
                  '11'
                ],
                [
                  1435781431781,
                  '21'
                ]
              ]
            }
          },
          {
            type: 'sessions',
            l11: {
              analysis: {
                rate: 2
              },
              values: [
                [
                  1435781430781,
                  '1'
                ],
                [
                  1435781431781,
                  '1'
                ]
              ]
            }
          }
        ]
        this.resultTotal.forEach(t => {
          this.resultAnalysis.forEach((v, i) => {
            if (t.type === v.type) {
              this.resultAnalysis[i].total = t
            }
          })
        })
        Promise.all([app1, app2]).then(res => {
          if (res.code === 200) {
            console.log(1)
          }
        })
        providerData = this.resultAnalysis
        this.appData.forEach((app, i) => {
          if (app.type === 'provider') {
            providerData.forEach(t => {
              if (t.type === this.appShowType && this.appShowType === 'bytes') {
                // app.value = t.total.analysis.rate === 0 ? 0 : (t[app.name].analysis.rate - t.total.analysis.rate) / t.total.analysis.rate
                app.rate = t[app.name].analysis.rate
                app.pRate = t.total.analysis.rate
                app.total = t.total.analysis.total
                app.lineData = t[app.name].values.map(v => [Number(v[0]), Number(v[1]), 'time'])
                app.trend = this.periodicJudgmentCalculationChange(app.rate, app.pRate).value
              }
            })
            this.initChart(app)
          }
        })
      }
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
    initChart (obj) {
      let chart = this.myChart.find(m => m.name === obj.name && m.type === obj.type)
      if (!chart) {
        chart = echarts.init(document.getElementById(`chart-${obj.name}-${obj.type}`))
        const chartOption = _.cloneDeep(appListChartOption)
        chartOption.series = [{
          ...chartOption.series[0],
          data: obj.lineData,
          lineStyle: {
            color: obj.trend === 'up' ? '#7FA054' : '#35ADDA'
          },
          areaStyle: {
            opacity: 0.1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: obj.trend === 'up' ? '#7FA054' : '#35ADDA'
              },
              {
                offset: 1,
                color: obj.trend === 'up' ? '#7FA054' : '#35ADDA'
              }
            ])
          }
        }]
        chart.setOption(chartOption)
        this.myChart.push(chart)
        this.$nextTick(() => {
          chart.resize()
        })
      }
    },
    addApp () {
      this.showAddApp = true
      this.searcherApp = ''
      const letter = 'abcdefghijklmnopqrstuvwxyz'
      const appOptions = []
      const providerOptions = []
      for (let i = 0; i < 100; i++) {
        appOptions.push({
          name: letter[i % 26] + i,
          desc: 'this is a really nice app',
          appShow: false
        })
        providerOptions.push({
          name: letter[i % 26] + i,
          desc: 'this is a really nice provider',
          provideShow: false
        })
      }
      const oldApps = this.appData ? this.appData.filter(a => a.type === 'app') : []
      const oldProviders = this.appData ? this.appData.filter(a => a.type === 'provider') : []
      this.appOptions = appOptions.filter(a => {
        return !oldApps.some(o => o.name === a.name)
      })
      this.providerOptions = providerOptions.filter(a => {
        return !oldProviders.some(o => o.name === a.name)
      })
      this.initialAppOptionsData = [...this.appOptions]
      this.initialProviderOptionsData = [...this.providerOptions]
    },
    cancelApp () {
      this.showAddApp = false
    },
    appTypeTabChange (val) {
      this.appShowTypeTab = val.index
      this.searcherApp = ''
      this.searcherAppChange(this.searcherApp)
    },
    searcherAppChange (val) {
      if (val) {
        if (this.appShowTypeTab == 0) {
          this.providerOptions = this.initialProviderOptionsData.filter(t => t.name.indexOf(val) > -1)
        } else if (this.appShowTypeTab == 1) {
          this.appOptions = this.initialAppOptionsData.filter(t => t.name.indexOf(val) > -1)
        }
      } else {
        if (this.appShowTypeTab == 0) {
          this.providerOptions = this.initialProviderOptionsData
        } else if (this.appShowTypeTab == 1) {
          this.appOptions = this.initialAppOptionsData
        }
      }
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
    save () {
      if (this.toSaveApp.length > 0) {
        const toSaveParams = this.chart.params.app ? this.chart.params : { app: [] }
        if (toSaveParams.app.some(p => p.user === parseInt(localStorage.getItem(storageKey.userId)))) {
          toSaveParams.app.forEach(p => {
            if (p.user === parseInt(localStorage.getItem(storageKey.userId))) {
              p.list = [...p.list, ...this.toSaveApp]
            }
          })
        } else {
          const defaultApp = toSaveParams.app.find(p => p.user === 'default')
          toSaveParams.app.push({
            user: parseInt(localStorage.getItem(storageKey.userId)),
            list: [...defaultApp.list, ...this.toSaveApp]
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
          if (t.name === app.name) {
            t.provideShow = !t.provideShow
            if (t.provideShow) {
              this.toSaveApp.push({ type: 'provider', name: app.name })
            } else {
              const index = this.toSaveApp.findIndex(a => a.name === app.name)
              if (index > -1) {
                this.toSaveApp.splice(index, 1)
              }
            }
          }
        })
      } else if (num === 1) {
        this.appOptions.forEach(t => {
          if (t.name === app.name) {
            t.appShow = !t.appShow
            if (t.appShow) {
              this.toSaveApp.push({ type: 'app', name: app.name })
            } else {
              const index = this.toSaveApp.findIndex(a => a.name === app.name)
              if (index > -1) {
                this.toSaveApp.splice(index, 1)
              }
            }
          }
        })
      }
    },
    moreChange (app) {
      this.appData.forEach(t => {
        if (t.name === app.name && t.type === app.type) {
          t.moreName = !t.moreName
        }
      })
    },
    periodicJudgmentCalculationChange (period, pperiod) {
      const periodicData = {}
      if (period > pperiod) {
        periodicData.value = 'up'
        periodicData.total = (period - pperiod) / pperiod
      } else if (period < pperiod) {
        periodicData.value = 'down'
        periodicData.total = (pperiod - period) / pperiod
      } else {
        periodicData.value = ''
      }
      return periodicData
    },
    resize () {
      this.myChart.forEach(t => {
        t.resize()
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
    }
    this.timer = setTimeout(() => {
      this.init()
    }, 100)
    window.addEventListener('resize', this.resize)
  }
}
</script>
