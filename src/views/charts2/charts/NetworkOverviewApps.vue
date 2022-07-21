<template>
  <div class="network-overview-apps">
    <div class="line-select-metric">
      <span>{{$t('network.metric')}}:</span>
      <div class="line-select__operation">
        <el-select
            size="mini"
            v-model="metricFilter"
            class="option__select select-topn"
            placeholder=""
            popper-class="option-popper"
        >
          <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <div class="app-cards">
      <div class="app-card" v-for="(app, index) in appData" :key="index">
        <div class="app-card-title">
          <div class="app-card-title-name">
            <span><i class="cn-icon cn-icon-social-network"></i></span>
            <span>{{app.name}}</span>
          </div>
          <el-row class="block-col-2">
            <el-col>
              <el-dropdown
                trigger="click"
                placement="bottom-end"
                popper-class="app-dropdown"
              >
                <span><i class="cn-icon cn-icon-more-dark"></i></span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item><span><i class="cn-icon cn-icon-delete"></i>{{$t('overall.delete')}}</span></el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-col>
          </el-row>
        </div>
        <div class="app-card__bodys">
          <div class="app-card__body">
            <div class="app-card__body-content">
              <div class="app-card__body-content-value">
                <div class="app-card__body-content-number">{{unitConvert(app.number, unitTypes.number).join(' ')}}</div>
                <div class="app-card__body-content-percent" :class="app.trend === 'up' ? 'red' : 'green'">
                  <div>
                    <span v-if="app.trend === 'up'">+</span><span v-else-if="app.trend === 'down'">-</span>{{unitConvert(app.value, unitTypes.percent).join('')}}
                  </div>
                </div>
              </div>
            </div>
            <div class="app-card__body-previous">
              <div>previous 24 hours</div>
              <div>{{unitConvert(app.number1, unitTypes.number).join(' ')}}</div>
            </div>
          </div>
          <div class="chart__drawing" :id="`chart${app.name}`"></div>
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
            <div class="header__operation header__operation--cancel">{{$t('overall.cancel')}}</div>
            <div class="header__operation header__operation--save">{{$t('overall.save')}}</div>
          </div>
        </div>
        <div class="add-app__body">
          <el-tabs v-model="appTypeTab">
            <el-tab-pane :label="$t('networkOverview.appType.provider')" :name="0">
              <div class="body__apps">
                <div class="body__app" v-for="app in providerOptions" :key="app.name">{{app.name}},{{app.desc}}</div>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('networkOverview.appType.app')" :name="1">
              <div class="body__apps">
                <div class="body__app" v-for="app in appOptions" :key="app.name">{{app.name}},{{app.desc}}</div>
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="body__searcher">
            <el-input size="mini"></el-input>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import * as echarts from 'echarts'
import { appListChartOption } from '@/views/charts2/charts/options/echartOption'
import { shallowRef } from 'vue'
export default {
  name: 'NetworkOverviewApps',
  props: {
    chart: Object
  },
  setup () {
    return {
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      metricFilter: '',
      metricOptions: [],
      chartOption: [],
      appData: [],
      // 假数据
      appTempData: [
        { value: 1.3912, number: 684600000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-mining-pool' },
        { value: 1.8934, number: 382100000000, previous: 24, number1: 3675, trend: 'up', icon: 'cn-icon-fraudulent-ip' },
        { value: 1.2054, number: 184600000000, previous: 24, number1: 3675, trend: 'up', icon: 'cn-icon-debug' },
        { value: 1.2506, number: 584800000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-language' },
        { value: 1.6415, number: 734100000000, previous: 24, number1: 3675, trend: 'down', icon: 'cn-icon-authoritative-domain' }
      ],
      unitTypes,
      timer: null,
      showAddApp: false,
      // add弹框中的可选项
      providerOptions: [],
      appOptions: [],
      appTypeTab: 0
    }
  },
  methods: {
    unitConvert,
    init () {
      this.appData.forEach((app, i) => {
        // 根据app.name和app.type查除接口，获取数据
        this.appData[i] = { ...app, ...this.appTempData[i] }
        this.appData[i].lineData = [
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
      const dom = document.getElementById(`chart${obj.name}`)
      this.myChart = echarts.init(dom)
      this.chartOption = appListChartOption
      const seriesTemplate = this.chartOption.series[0]
      this.chartOption.series = [{
        ...seriesTemplate,
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
      this.myChart.setOption(this.chartOption)
    },
    addApp () {
      this.showAddApp = true
      const letter = 'abcdefghijklmnopqrstuvwxyz'
      for (let i = 0; i < 100; i++) {
        this.appOptions.push({
          name: letter[i % 26] + i,
          desc: 'this is a really nice app'
        })
        this.providerOptions.push({
          name: letter[i % 26] + i,
          desc: 'this is a really nice provider'
        })
      }
    },
    resize () {
      this.myChart.resize()
    }
  },
  mounted () {
    if (this.chart.params.app) {
      this.appData = this.chart.params.app
    }
    this.timer = setTimeout(() => {
      this.init()
    }, 100)
    window.addEventListener('resize', this.resize)
  }
}
</script>
