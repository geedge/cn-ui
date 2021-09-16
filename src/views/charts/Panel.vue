<template>
  <div style="padding: 10px 0 20px 20px;" v-if="!isEntityDetail">
    <div class="cn-panel" id="cn-panel">
      <div class="panel__time">
        <DateTimeRange class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" ref="dateTimeRange" @change="reload"/>
        <TimeRefresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
      </div>
      <chart v-for="chart in chartList" :key="chart.id" :chart="chart" :time-filter="timeFilter" :ref="`chart-${chart.id}`" :entity="entity"></chart>
      <!--    <grid-layout v-model:layout="chartList"
                       :col-num="12"
                       :row-height="30"
                       :is-draggable="draggable"
                       :is-resizable="resizable"
                       :vertical-compact="compact"
                       :use-css-transforms="true"
          >
            <grid-item v-for="item in chartList" :key="item.i"
                       :x="item.x"
                       :y="item.y"
                       :w="item.w"
                       :h="item.h"
                       :i="item.i"
            >
              <span class="text">{{ item.i }}</span>
            </grid-item>
          </grid-layout>-->
    </div>
  </div>
  <div class="cn-entity-detail" id="cn-entity-detail" v-else>
    <div class="entity-detail__header">
      <div class="detail-header__title">
        <span class="title__icon-circle">
          <i class="cn-icon cn-icon-ip"></i>
        </span>
        <span class="title__name">{{entity.name}}</span></div>
      <div class="detail-header__operation">
        <div class="panel__time">
          <DateTimeRange class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" ref="dateTimeRange" @change="reload"/>
          <TimeRefresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
        </div>
        <el-tabs
            v-model="currentTab"
            @tab-click="changeTab"
        >
          <el-tab-pane
              v-for="tab in detailTabs"
              :label="tab.i18n ? $t(tab.i18n) : tab.name"
              :name="`${tab.id}`"
              :key="tab.id"
              :ref="`chart-${tab.id}`"
          >
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="entity-detail__body">
      <div class="cn-panel">
        <chart v-for="chart in detailChartList" :key="chart.id" :chart="chart" :time-filter="timeFilter" :ref="`chart-${chart.id}`" :entity="entity"></chart>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { panelTypeAndRouteMapping } from '@/utils/constants'
import { api, getPanelList, getChartList } from '@/utils/api'
import { getNowTime } from '@/utils/date-util'
import Chart from './Chart'
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'
import TimeRefresh from '@/components/common/TimeRange/TimeRefresh'

export default {
  name: 'Panel',
  props: {
    entity: Object,
    isEntityDetail: Boolean
  },
  components: {
    Chart,
    DateTimeRange,
    TimeRefresh
  },
  data () {
    return {
      chartList: [], // 普通panel的chart
      // entity详情的chart
      detailTabs: [],
      detailChartList: [],
      currentTab: ''
    }
  },
  async mounted () {
    await this.init()
    if (!this.$_.isEmpty(this.detailTabs)) {
      this.currentTab = this.detailTabs[0].id + ''
    }
  },
  setup (props, ctx) {
    // data
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })
    const panel = ref({})
    let panelType = 1 // 取得panel的type
    const { params } = useRoute()
    panelType = props.entity ? props.entity.type : panelTypeAndRouteMapping[params.typeName]
    return {
      panelType,
      panel,
      timeFilter,
      api
    }
  },
  methods: {
    async init () {
      const panels = await getPanelList({ type: this.panelType })
      if (panels && panels.length > 0) {
        this.panel = panels[0]
      }
      if (this.panel.id) {
        const allCharts = (await getChartList({ panelId: this.panel.id, pageSize: -1 })).map(chart => {
          chart.i = chart.id
          this.recursionParamsConvert(chart)
          return chart
        })
        if (this.isEntityDetail) {
          if (!this.$_.isEmpty(allCharts)) {
            const rootChart = allCharts[0]
            this.detailTabs = rootChart.children
            if (!this.$_.isEmpty(this.detailTabs)) {
              this.detailChartList = this.detailTabs[0].children
            }
          }
        } else {
          this.chartList = allCharts
        }
      }
    },
    changeTab ({ index }) {
      this.currentTab = this.detailTabs[index].id + ''
      this.detailChartList = this.detailTabs[index].children
    },
    recursionParamsConvert (chart) {
      chart.params = chart.params ? JSON.parse(chart.params) : null
      if (!this.$_.isEmpty(chart.children)) {
        chart.children.forEach(c => {
          this.recursionParamsConvert(c)
        })
      }
    },
    timeRefreshChange () {
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      }
      /* if (!this.$refs.dateTimeRange) {
        this.reloadCharts()
        return
      }
      if (this.$refs.dateTimeRange.isCustom) {
        this.reloadCharts()
      } else {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      } */
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
      /* this.$nextTick(() => {
        this.reloadCharts()
      }) */
    },
    // methods
    dateTimeRangeChange (s, e, v) {
      this.timeFilter = { startTime: s, endTime: e, dateRangeValue: v }
    },
    reloadCharts () {
      this.chartList.forEach(chart => {
        this.$refs[`chart-${chart.id}`] && this.$refs[`chart-${chart.id}`].reloadChart()
      })
    }
  }
}
</script>
<style lang="scss">
@import '~@/components/charts/panel.scss';
</style>
