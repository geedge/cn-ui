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
                <div class="app-card__body-content-number">{{unitConvert(app.number, unitTypes.number).join(' ')}}</div>
                <div class="app-card__body-content-percent" :class="app.trend === 'up' ? 'red' : 'green'">
                  <span v-if="app.trend === 'up'">+</span><span v-else-if="app.trend === 'down'">-</span>{{unitConvert(app.value, unitTypes.percent).join('')}}
                </div>
              </div>
            </div>
            <div class="app-card__body-previous">
              <div>Total</div>
              <div>{{unitConvert(app.number1, unitTypes.number).join(' ')}}</div>
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
      appTempData: [
        { value: 1.3912, number: 684600000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-mining-pool' },
        { value: 1.8934, number: 382100000000, previous: 24, number1: 3675, trend: 'up', icon: 'cn-icon-fraudulent-ip' },
        { value: 1.2054, number: 184600000000, previous: 24, number1: 3675, trend: 'up', icon: 'cn-icon-debug' },
        { value: 1.2506, number: 584800000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-language' },
        { value: 1.2506, number: 584800000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-language' },
        { value: 1.2506, number: 584800000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-language' },
        { value: 1.2506, number: 584800000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-language' },
        { value: 1.2506, number: 584800000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-language' },
        { value: 1.2506, number: 584800000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-language' },
        { value: 1.6415, number: 734100000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-authoritative-domain' }
      ],
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
      myChartArray: []
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
      // const params = {
      //   startTime: this.timeFilter.startTime,
      //   endTime: this.timeFilter.endTime
      // }
      this.appData.forEach((app, i) => {
        // 根据app.name和app.type查除接口，获取数据
        app.value = this.appTempData[i % 10].value
        app.number = this.appTempData[i % 10].number
        app.number1 = this.appTempData[i % 10].number1
        app.lineData = [
          [
            '1658128320',
            '0'
          ],
          [
            '1658129184',
            '0'
          ],
          [
            '1658130048',
            '0'
          ],
          [
            '1658130912',
            '0'
          ],
          [
            '1658131776',
            '0'
          ],
          [
            '1658132640',
            '0'
          ],
          [
            '1658133504',
            '0'
          ],
          [
            '1658134368',
            '0'
          ],
          [
            '1658135232',
            '0'
          ],
          [
            '1658136096',
            '0'
          ],
          [
            '1658136960',
            '0'
          ],
          [
            '1658137824',
            '0'
          ],
          [
            '1658138688',
            '0'
          ],
          [
            '1658139552',
            '0'
          ],
          [
            '1658140416',
            '0'
          ],
          [
            '1658141280',
            '0'
          ],
          [
            '1658142144',
            '0'
          ],
          [
            '1658143008',
            '0'
          ],
          [
            '1658143872',
            '0'
          ],
          [
            '1658144736',
            '1'
          ],
          [
            '1658145600',
            '0'
          ],
          [
            '1658146464',
            '0'
          ],
          [
            '1658147328',
            '0'
          ],
          [
            '1658148192',
            '0'
          ],
          [
            '1658149056',
            '0'
          ],
          [
            '1658149920',
            '0'
          ],
          [
            '1658150784',
            '0'
          ],
          [
            '1658151648',
            '0'
          ],
          [
            '1658152512',
            '0'
          ],
          [
            '1658153376',
            '0'
          ],
          [
            '1658154240',
            '1'
          ],
          [
            '1658155104',
            '0'
          ],
          [
            '1658155968',
            '0'
          ],
          [
            '1658156832',
            '0'
          ],
          [
            '1658157696',
            '0'
          ],
          [
            '1658158560',
            '0'
          ],
          [
            '1658159424',
            '0'
          ],
          [
            '1658160288',
            '0'
          ],
          [
            '1658161152',
            '0'
          ],
          [
            '1658162016',
            '0'
          ],
          [
            '1658162880',
            '0'
          ],
          [
            '1658163744',
            '0'
          ],
          [
            '1658164608',
            '0'
          ],
          [
            '1658165472',
            '0'
          ],
          [
            '1658166336',
            '0'
          ],
          [
            '1658167200',
            '0'
          ],
          [
            '1658168064',
            '0'
          ],
          [
            '1658168928',
            '0'
          ],
          [
            '1658169792',
            '0'
          ],
          [
            '1658170656',
            '0'
          ],
          [
            '1658171520',
            '0'
          ],
          [
            '1658172384',
            '0'
          ],
          [
            '1658173248',
            '0'
          ],
          [
            '1658174112',
            '0'
          ],
          [
            '1658174976',
            '0'
          ],
          [
            '1658175840',
            '0'
          ],
          [
            '1658176704',
            '0'
          ],
          [
            '1658177568',
            '0'
          ],
          [
            '1658178432',
            '0'
          ],
          [
            '1658179296',
            '0'
          ],
          [
            '1658180160',
            '0'
          ],
          [
            '1658181024',
            '0'
          ],
          [
            '1658181888',
            '0'
          ],
          [
            '1658182752',
            '0'
          ],
          [
            '1658183616',
            '0'
          ],
          [
            '1658184480',
            '0'
          ],
          [
            '1658185344',
            '0'
          ],
          [
            '1658186208',
            '0'
          ],
          [
            '1658187072',
            '0'
          ],
          [
            '1658187936',
            '0'
          ],
          [
            '1658188800',
            '0'
          ],
          [
            '1658189664',
            '0'
          ],
          [
            '1658190528',
            '0'
          ],
          [
            '1658191392',
            '0'
          ],
          [
            '1658192256',
            '0'
          ],
          [
            '1658193120',
            '0'
          ],
          [
            '1658193984',
            '0'
          ],
          [
            '1658194848',
            '0'
          ],
          [
            '1658195712',
            '0'
          ],
          [
            '1658196576',
            '0'
          ],
          [
            '1658197440',
            '0'
          ],
          [
            '1658198304',
            '0'
          ],
          [
            '1658199168',
            '0'
          ],
          [
            '1658200032',
            '0'
          ],
          [
            '1658200896',
            '0'
          ],
          [
            '1658201760',
            '0'
          ],
          [
            '1658202624',
            '0'
          ],
          [
            '1658203488',
            '0'
          ],
          [
            '1658204352',
            '0'
          ],
          [
            '1658205216',
            '0'
          ],
          [
            '1658206080',
            '0'
          ],
          [
            '1658206944',
            '0'
          ],
          [
            '1658207808',
            '0'
          ],
          [
            '1658208672',
            '0'
          ],
          [
            '1658209536',
            '0'
          ],
          [
            '1658210400',
            '0'
          ],
          [
            '1658211264',
            '0'
          ],
          [
            '1658212128',
            '0'
          ],
          [
            '1658212992',
            '0'
          ],
          [
            '1658213856',
            '0'
          ],
          [
            '1658214720',
            '0'
          ]
        ].map(v => [Number(v[0]) * 1000, Number(v[1]), 'time'])
        this.initChart(app)
      })
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
