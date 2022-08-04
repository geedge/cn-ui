<template>
  <div class="panel-box">
    <div class="panel__header">
      <div class="panel__title">{{panel.i18n ? $t(panel.i18n) : panel.name}}</div>
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
import { panelTypeAndRouteMapping } from '@/utils/constants'
import { getPanelList, getChartList } from '@/utils/api'
import { getNowTime } from '@/utils/date-util'
import { getTypeCategory } from '@/views/charts/charts/tools'
import ChartList from '@/views/charts2/ChartList'
import { typeMapping } from '@/views/charts2/chart-tools'

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
      extraParams: {}
    }
  },
  async mounted () {
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
    const { params } = useRoute()
    panelType = props.entity ? props.entity.type : panelTypeAndRouteMapping[params.typeName]

    function isEntityDetail (t) {
      return [4, 5, 6].indexOf(t) > -1
    }
    // date
    const dateRangeValue = isEntityDetail(panelType) ? 60 * 24 : 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })

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
    timeRefreshChange (startTime, endTime, dateRangeValue) {

    },
    reload () {

    }
  }
}
</script>
