<template>
  <div class="panel-box2">
    <div class="panel__header">
      <div class="panel__title">{{panelName?panelName:(panel.i18n ? $t(panel.i18n) : panel.name)}}
        <div  v-if="score" class="score">
          <div class="circle-icon"  v-if="score <= 2" :class="{'data-score-red': score <= 2}" ></div>
          <div class="circle-icon"  v-else-if="score <= 4" :class="{'data-score-yellow': score <= 4}" ></div>
          <div class="circle-icon"  v-else-if="score <= 6" :class="{'data-score-green': score <= 6}" ></div>
          Score:{{score}}
        </div>
      </div>
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
    <chart-list
        ref="chartList"
        :time-filter="timeFilter"
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
import { panelTypeAndRouteMapping, bytesColumnNameGroupForNpm, scoreUrl, customTableTitlesForAppPerformance, operationType } from '@/utils/constants'
import { getPanelList, getChartList } from '@/utils/api'
import { getNowTime, getSecond } from '@/utils/date-util'
import { getTypeCategory } from '@/views/charts/charts/tools'
import { computeScore, urlParamsHandler, overwriteUrl } from '@/utils/tools'
import ChartList from '@/views/charts2/ChartList'
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
      chartList: [], // 普通panel的chart
      panelLock: true,
      extraParams: {},
      panelName: '',
      score: null
    }
  },
  computed: {
    npmThirdLevelMenuScore () {
      return this.$store.getters.getNpmThirdLevelMenuScore
    }
  },
  watch: {
    npmThirdLevelMenuScore: {
      deep: true,
      handler (n) {
        const curOperationType = this.$store.getters.getTabOperationType
        if (curOperationType === operationType.thirdMenu) { // 点击的为第三级菜单
          this.score = n
        }
      }
    }
  },
  async mounted () {
    this.panelName = this.$store.getters.getPanelName
    const curOperationType = this.$store.getters.getTabOperationType
    if (this.panelName && this.$route.path === '/panel/networkAppPerformance' && curOperationType !== operationType.thirdMenu) {
      const columnValue = this.$store.getters.getBreadcrumbColumnValue
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        type: this.$store.getters.getDimensionType,
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
    }

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
  },
  setup (props, ctx) {
    const panel = ref({})
    let panelType = 1 // 取得panel的type
    const { params, query } = useRoute()
    const thirdPanel = params.thirdPanel
    const fourthPanel = params.fourthPanel
    if (fourthPanel) {
      panelType = Number(fourthPanel)
    } else if (thirdPanel) {
      panelType = Number(thirdPanel)
    } else {
      panelType = props.entity ? props.entity.type : panelTypeAndRouteMapping[params.typeName]
    }

    function isEntityDetail (t) {
      return [4, 5, 6].indexOf(t) > -1
    }
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime
    // 若url携带了，使用携带的值，否则使用默认值。
    const dateRangeValue = rangeParam ? parseInt(query.range) : (isEntityDetail(panelType) ? 60 * 24 : 60)
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(isEntityDetail(panelType) ? 60 * 24 : 60)
      timeFilter.value.startTime = startTime
      timeFilter.value.endTime = endTime
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }

    return {
      panelType,
      panel,
      timeFilter
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
      const newUrl = urlParamsHandler(window.location.href, query, {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        range: dateRangeValue.value
      })
      overwriteUrl(newUrl)
    },
    timeRefreshChange () {
      // 不是自选时间
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      } else {
        this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
      }
    }
  }
}
</script>
