<template>
  <div style="padding: 10px 0 20px 20px;">
    <div v-if="!$_.isEmpty(tabs)" class="entity-detail-tool">
      <div>
        <i class="cn-icon cn-icon-arrow-left-circle"></i>&nbsp;
        <span>{{typeName}}&nbsp;{{$t('overall.detail')}}</span>
      </div>
      <el-radio-group v-model="tab" size="mini">
        <el-radio-button v-for="tab in tabs" :key="tab.key" :label="tab.label"></el-radio-button>
      </el-radio-group>
    </div>
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
import _ from 'lodash'

export default {
  name: 'Panel',
  props: {
    typeName: String,
    entity: Object,
    tabs: Array
  },
  components: {
    Chart,
    DateTimeRange,
    TimeRefresh
  },
  data () {
    return {
      chartList: []
    }
  },
  async mounted () {
    await this.init()
  },
  setup (props, ctx) {
    let tab = ''
    if (!_.isEmpty(props.tabs)) {
      tab = ref(props.tabs[0].key)
    }
    // data
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })
    const panel = ref({})
    let panelType = 1 // 取得panel的type
    const { params } = useRoute()
    panelType = props.typeName ? panelTypeAndRouteMapping[props.typeName] : panelTypeAndRouteMapping[params.typeName]
    return {
      panelType,
      panel,
      timeFilter,
      api,
      tab
    }
  },
  methods: {
    async init () {
      const panels = await getPanelList({ type: this.panelType })
      if (panels && panels.length > 0) {
        this.panel = panels[0]
      }
      if (this.panel.id) {
        this.chartList = (await getChartList({ panelId: this.panel.id, pageSize: -1 })).map(chart => {
          chart.i = chart.id
          this.recursionParamsConvert(chart)
          return chart
        })
      }
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
