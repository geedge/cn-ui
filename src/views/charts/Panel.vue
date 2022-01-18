<template>
  <div style="padding: 10px 10px 20px 10px; overflow: auto" v-if="!isEntityDetail">
    <div id="cn-panel" class="cn-panel2">
      <div class="panel__time">
        <DateTimeRange class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" ref="dateTimeRange" @change="reload"/>
        <TimeRefresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
      </div>
      <panel-chart-list
          :time-filter="timeFilter"
          :data-list="chartList"
          :panel-lock="panelLock"
      >
      </panel-chart-list>
<!--      <chart
          v-for="chart in chartList"
          :key="chart.id"
          :chart="chart"
          :time-filter="timeFilter"
          :ref="`chart-${chart.id}`"
          :entity="entity"
          @getCurrentTimeRange="getCurrentTimeRange"
      ></chart>-->
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
    <div class="entity-detail__body">
      <div class="cn-panel" @scroll="scroll" id="cn-panel">
        <template v-for="chart in chartList" :key="chart.id">
<!--          <chart
              :chart="chart"
              :ref="`chart-${chart.id}`"
              :entity="entity"
              @getCurrentTimeRange="getCurrentTimeRange"
          ></chart>-->
        </template>
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
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'
import TimeRefresh from '@/components/common/TimeRange/TimeRefresh'

export default {
  name: 'Panel',
  props: {
    entity: Object,
    isEntityDetail: Boolean,
    typeName: String
  },
  components: {
    DateTimeRange,
    TimeRefresh
  },
  data () {
    return {
      chartList: [], // 普通panel的chart
      panelLock: true,
      // entity详情的chart
      detailTabs: [],
      detailChartList: [],
      currentTab: '',
      isCryptocurrency: false// 是否为挖矿列表
    }
  },
  async mounted () {
    this.isCryptocurrency = this.$route.path.indexOf('cryptocurrency') > -1
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
        this.chartList = allCharts
        setTimeout(() => {
          this.$emit('chartLoaded', allCharts)
        })
      }
    },
    changeTab ({ index }) {
      this.currentTab = this.detailTabs[index].id + ''
      this.detailChartList = this.detailTabs[index].children
    },
    scroll (e) {
      this.$emit('scroll', { top: e.target.scrollTop })
    },
    recursionParamsConvert (chart) {
      chart.params = chart.params ? JSON.parse(chart.params) : null
      if (!this.$_.isEmpty(chart.children)) {
        chart.children.forEach(c => {
          this.recursionParamsConvert(c)
        })
      }
    },
    getCurrentTimeRange (callback) {
      const myEndTime = window.$dayJs.tz().valueOf()
      const myStartTime = myEndTime - this.timeFilter.dateRangeValue * 60 * 1000
      callback({ startTime: myStartTime, endTime: myEndTime })
    },
    timeRefreshChange () {
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      }
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
    },
    // methods
    dateTimeRangeChange (s, e, v) {
      this.timeFilter = { startTime: s, endTime: e, dateRangeValue: v }
    },
    reloadCharts () {
      this.chartList.forEach(chart => {
        this.$refs[`chart-${chart.id}`] && this.$refs[`chart-${chart.id}`].reloadChart()
      })
    },
    jumpToTop (top) {
      document.querySelector('#cn-panel').scrollTop = top
    }
  }
}
</script>
