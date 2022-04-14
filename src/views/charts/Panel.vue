<template>
  <div style="padding: 10px 10px 20px 10px; overflow: auto" v-if="!isEntityDetail" @scroll="wholeScreenScroll">
    <div id="cn-panel" class="cn-panel2">
      <div class="panel__time">
        <date-time-range class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" :date-range="timeFilter.dateRangeValue" ref="dateTimeRange" @change="reload"/>
        <time-refresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
      </div>
      <panel-chart-list
          ref="panelChartList"
          :time-filter="timeFilter"
          :data-list="chartList"
          :panel-lock="panelLock"
          :entity="entity"
          :whole-screen-scroll="panel.params && panel.params.wholeScreenScroll"
      >
      </panel-chart-list>
    </div>
  </div>
  <div class="cn-entity-detail" id="cn-entity-detail" v-else>
    <div class="entity-detail__body">
      <div class="cn-panel2" id="cn-panel">
        <panel-chart-list
            ref="panelChartList"
            :time-filter="timeFilter"
            :data-list="chartList"
            :panel-lock="panelLock"
            :entity="entity"
        >
        </panel-chart-list>
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
import { scrollToTop } from '@/utils/tools'
import {
  isGroup,
  isBlock,
  getGroupHeight
} from './charts/tools'

export default {
  name: 'Panel',
  props: {
    entity: Object,
    isEntityDetail: Boolean,
    typeName: String
  },
  data () {
    return {
      chartList: [], // 普通panel的chart
      panelLock: true,
      // entity详情的chart
      detailTabs: [],
      detailChartList: [],
      currentTab: '',
      isCryptocurrency: false, // 是否为挖矿列表
      scroll: {
        prevent: false, // 阻止滚动
        prevScrollTop: 0 // 前一次滚动条位置
      }
    }
  },
  async mounted () {
    this.emitter.on('groupParentCalcHeight', this.groupParentCalcHeight)
    this.isCryptocurrency = this.$route.path.indexOf('cryptocurrency') > -1
    await this.init()
    if (!this.$_.isEmpty(this.detailTabs)) {
      this.currentTab = this.detailTabs[0].id + ''
    }
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
        if (this.panel.params) {
          this.panel.params = JSON.parse(this.panel.params)
        } else {
          this.panel.params = {}
        }
        const allCharts = (await getChartList({ panelId: this.panel.id, pageSize: -1 })).map(chart => {
          chart.i = chart.id
          this.recursionParamsConvert(chart)
          return chart
        })
        // allCharts = allCharts.filter(chart => chart.type === 24)
        this.chartList = allCharts
        setTimeout(() => {
          this.$emit('chartLoaded', allCharts)
        }, 1000)
      }
    },
    changeTab ({ index }) {
      this.currentTab = this.detailTabs[index].id + ''
      this.detailChartList = this.detailTabs[index].children
    },
    recursionParamsConvert (chart) {
      chart.params = chart.params ? JSON.parse(chart.params) : {}
      chart.firstShow = false
      if (isGroup(chart.type)) {
        chart.oldH = chart.h
        /* chart.params = {
          collapse: false
        } */
        chart.h = getGroupHeight(chart.children) + 1.5
        if (chart.params.collapse) {
          chart.h = 1
        }
      }
      if (isBlock(chart.type)) {
        let sumGroup = 0
        chart.children.forEach(item => {
          if (isGroup(item.type)) {
            sumGroup++
          }
        })
        chart.h += sumGroup * 0.5
      }
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
      // 不是自选时间
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      } else {
        this.$refs.panelChartList.reload()
      }
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
    },
    // methods
    dateTimeRangeChange (s, e, v) {
      this.timeFilter = { startTime: s, endTime: e, dateRangeValue: v }
      // this.chartList = [...this.chartList]
      this.$nextTick(() => {
        this.$refs.panelChartList.reload()
      })
    },
    reloadCharts () {
      this.chartList.forEach(chart => {
        this.$refs[`chart-${chart.id}`] && this.$refs[`chart-${chart.id}`].reloadChart()
      })
    },
    groupParentCalcHeight (params) {
      this.$refs.panelChartList.groupParentCalcHeight(params.chart, params.childrenList)
    },
    wholeScreenScroll (e) {
      if (this.scroll.prevent) {
        return
      }
      this.scroll.prevent = true
      const clientHeight = e.target.clientHeight
      const currentScrollTop = e.target.scrollTop
      if (currentScrollTop > this.scroll.prevScrollTop) {
        // 向下滚动，若top在clientHeight内，则整屏滚动下去
        this.scroll.prevScrollTop = currentScrollTop
        if (currentScrollTop < clientHeight) {
          scrollToTop(e.target, clientHeight, 200, 'down')
          setTimeout(() => {
            this.scroll.prevScrollTop = e.target.scrollTop
          }, 210)
        }
      } else if (currentScrollTop < this.scroll.prevScrollTop) {
        // 向上滚动，若top在clientHeight内，则滚动到最顶部
        this.scroll.prevScrollTop = currentScrollTop
        if (currentScrollTop < clientHeight) {
          scrollToTop(e.target, 0, 200, 'up')
          setTimeout(() => {
            this.scroll.prevScrollTop = e.target.scrollTop
          }, 210)
        }
      }
      const vm = this
      setTimeout(() => {
        vm.scroll.prevent = false
      }, 210)
    }
  }
}
</script>
