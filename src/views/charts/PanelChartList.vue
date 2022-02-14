<template>
  <div :id='`chartList${(isGroup ? "Group" : "") + timestamp}`' class="chart-list" ref="layoutBox">
    <grid-layout
        ref="layout"
        v-if="gridLayoutShow"
        v-model:layout="copyDataList"
        :col-num="30"
        :is-draggable="!panelLock"
        :is-resizable="!panelLock"
        :margin="[10, 10]"
        :row-height="rowHeight"
        :vertical-compact="true"
        :use-css-transforms="false"
    >
      <grid-item
          v-for="item in copyDataList"
          :key="item.id"
          :h="item.h"
          :i="item.i"
          :w="item.w"
          :x="item.x"
          :y="item.y"
          :static="item.static"
          :ref="'grid-item' + item.id"
          :isResizable = "item.type === 'group' ? false: null"
          dragAllowFrom=".chart-header"
          dragIgnoreFrom=".chart-header__tools"
          v-bind="anchorPoint(item)"
      >
        <panel-chart
            :ref="'chart' + item.id"
            :chart-info="item"
            :show-header="true"
            :time-filter="timeFilter"
            :entity="entity"
            @groupShow="groupShow"
            @showFullscreen="showFullscreen"
        ></panel-chart>
      </grid-item>
    </grid-layout>
    <!-- noData -->
    <div v-if="false" class="no-data">
      <div class="no-data-div">No data</div>
    </div>
    <!-- 全屏查看 -->
    <el-dialog
        v-model="fullscreen.visible"
        :show-close="false"
        class="chart-fullscreen"
        destroy-on-close
        fullscreen
        :modal-append-to-body="false"
    >
      <panel-chart
          :ref="'chart-fullscreen' + fullscreen.chartInfo.id"
          :chart-info="fullscreen.chartInfo"
          :is-fullscreen="true"
          :panelLock="panelLock"
          :time-filter="timeFilter"
          @showFullscreen="showFullscreen"
      ></panel-chart>
    </el-dialog>
  </div>
</template>

<script>
import PanelChart from '@/views/charts/PanelChart'
import VueGridLayout from 'vue-grid-layout'
import { getGroupHeight, getTypeCategory } from './charts/tools'
import _ from 'lodash'

export default {
  name: 'PanelChartList',
  components: {
    PanelChart,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  props: {
    timeFilter: Object, // 时间范围
    panelLock: { type: Boolean, default: true },
    isGroup: Boolean,
    entity: Object,
    dataList: Array // 看板中所有图表信息
  },
  data () {
    return {
      gridLayoutLoading: false,
      gridLayoutShow: false,
      rowHeight: 40,
      copyDataList: [],
      noData: false, // no data
      tempDom: { height: '', width: '' },
      stepWidth: null,
      timer: null,
      timestamp: new Date().getTime(),
      fullscreen: {
        visible: false,
        chartData: [],
        chartInfo: {}
      },
      scrollTop: 0,
      scrollTopTimer: null
    }
  },
  methods: {
    init () {
      const dom = document.getElementById(this.isGroup ? `chartListGroup${this.timestamp}` : `chartList${this.timestamp}`)
      if (dom) {
        this.stepWidth = Math.floor(dom.offsetWidth / 12)
      }
    },
    reload () {
      this.copyDataList.forEach(item => {
        this.$refs['chart' + item.id].getChartData()
      })
    },
    showFullscreen (show, chartInfo) {
      this.fullscreen.chartInfo = chartInfo
      this.fullscreen.visible = show
    },
    groupShow (chart) {
      this.copyDataList.forEach((item, index) => {
        if (item.id === chart.id) {
          item.params.collapse = !item.params.collapse
          if (item.params.collapse) {
            item.h = 1
          } else {
            item.h = getGroupHeight(item.children) + 1.5
          }
        }
      })
      this.copyDataList = [...this.copyDataList]
      this.emitter.emit('groupParentCalcHeight', { chart, childrenList: this.copyDataList })
    },
    groupParentCalcHeight (chart, childrenList) {
      // console.log(chart, childrenList)
      setTimeout(() => {
        const parent = this.copyDataList.find(chartitem => chartitem.id === chart.parent.id)
        const children = parent.children.find(item => item.id === chart.id)
        children.h = chart.h
        children.params = chart.params
        let sumGroup = 0
        childrenList.forEach(item => {
          if (item.type === 94) {
            sumGroup++
          }
        })
        parent.h = getGroupHeight(childrenList) + sumGroup * 0.5
        this.copyDataList = [...this.copyDataList]
      }, 100)
    }
  },
  computed: {
    anchorPoint () {
      return function (chart) {
        if (!_.isEmpty(chart.params && chart.params.anchorPoint)) {
          return { 'anchor-point': chart.params.anchorPoint }
        } else {
          return ''
        }
      }
    }
  },
  watch: {
    dataList: {
      deep: true,
      immediate: true,
      handler (n, o) {
        this.gridLayoutShow = false
        this.gridLayoutLoading = true
        // const arr = this.$_.cloneDeep(n)
        this.noData = !n || n.length < 1
        const tempList = n.map(item => {
          if (item.params) {
            item.params.showHeader = true
          }
          const height = item.h
          return {
            ...item,
            i: item.id,
            w: item.w,
            h: height,
            x: item.x || 0,
            y: item.y || 0,
            params: item.params,
            category: getTypeCategory(item.type) // 类别，是echarts还是map等等
          }
        })
        this.$nextTick(() => {
          this.copyDataList = JSON.parse(JSON.stringify(tempList))
          setTimeout(() => {
            this.gridLayoutShow = true
          })
          this.gridLayoutLoading = false
        })
      }
    }
  }
}
</script>
