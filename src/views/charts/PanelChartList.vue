<template>
  <div :id='`chartList${(isGroup ? "Group" : "") + timestamp}`' class="chart-list" ref="layoutBox">
    <grid-layout
        id="gridLayout"
        ref="layout"
        v-model:layout="normalCopyDataList"
        :col-num="30"
        :is-draggable="!panelLock"
        :is-resizable="!panelLock"
        :margin="[10, 10]"
        :row-height="rowHeight"
        :vertical-compact="true"
        :use-css-transforms="false"
    >
      <grid-item
          v-for="item in normalCopyDataList"
          :key="item.id"
          :h="item.h"
          :i="item.i"
          :w="item.w"
          :x="item.x"
          :y="item.y"
          :static="item.static"
          :ref="'grid-item' + item.id"
          :isResizable="isGroup ? false: null"
          dragAllowFrom=".chart-header"
          dragIgnoreFrom=".chart-header__tools"
          v-bind="anchorPoint(item)"
      >
        <panel-chart
            :ref="'chart' + item.id"
            :chart-info="item"
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
import { getGroupHeight, isGroup, getTypeCategory } from './charts/tools'
import _ from 'lodash'
import { useRouter } from 'vue-router'
import DnsScreen from '@/views/charts/wholeScreenScroll/DnsScreen'
import { wholeScreenRouterMapping } from '@/utils/constants'
import { ref } from 'vue'

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
      copyDataList: [], // 所有的图表
      normalCopyDataList: [], // 非整屏滚动的图表
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
        if (this.$refs['chart' + item.id]) {
          this.$refs['chart' + item.id].getChartData()
        }
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
            item.h = getGroupHeight(item.children) + 0.4 + 1
          }
        }
      })
      this.copyDataList = [...this.copyDataList]
      this.normalCopyDataList = this.copyDataList.filter(function (item) {
        return item.y >= -1
      })
      this.emitter.emit('groupParentCalcHeight', { chart, childrenList: this.copyDataList })
    },
    groupParentCalcHeight (chart, childrenList) {
      setTimeout(() => {
        const parent = this.copyDataList.find(chartitem => chartitem.id === chart.parent.id)
        const children = parent.children.find(item => item.id === chart.id)
        children.h = chart.h
        children.params = chart.params
        // 第二个是空隙，第三个是标题的高度
        parent.h = getGroupHeight(childrenList) + 0.4 + 1
        this.copyDataList = [...this.copyDataList]
        this.normalCopyDataList = this.copyDataList.filter(function (item) {
          return item.y >= -1
        })
      }, 100)
    },
    changeChartRowHeight (e) {
      const width = e.currentTarget.innerWidth
      if (width < 1440) {
        this.rowHeight = 25
      } else if (width >= 1440 && width < 1920) {
        this.rowHeight = 32.5
      } else if (width >= 1920 && width < 2560) {
        this.rowHeight = 40
      } else {
        this.rowHeight = 55
      }
    }
  },
  mounted () {
    this.debounceFunc = this.$_.debounce(this.changeChartRowHeight, 100)
    window.addEventListener('resize', this.debounceFunc)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
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
  setup (props) {
    const { currentRoute } = useRouter()
    const clientWidth = document.getElementsByTagName('html')[0].clientWidth
    const rowHeight = ref(0)
    if (clientWidth < 1440) {
      rowHeight.value = 25
    } else if (clientWidth >= 1440 && clientWidth < 1920) {
      rowHeight.value = 32.5
    } else if (clientWidth >= 1920 && clientWidth < 2560) {
      rowHeight.value = 40
    } else {
      rowHeight.value = 55
    }
    return {
      rowHeight,
      currentPath: currentRoute.value.path
    }
  },
  watch: {
    dataList: {
      deep: true,
      immediate: true,
      handler (n, o) {
        this.gridLayoutShow = false
        this.gridLayoutLoading = true

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
          this.normalCopyDataList = this.copyDataList.filter(function (item) {
            return item.y >= -1
          })
          setTimeout(() => {
            this.gridLayoutShow = true
          })
          setTimeout(() => {
            this.copyDataList.forEach(item => {
              if (isGroup(item.type) && !item.firstShow) {
                item.firstShow = true
                this.copyDataList = [...this.copyDataList]
                this.normalCopyDataList = this.copyDataList.filter(function (item) {
                  return item.y >= -1
                })
                this.emitter.emit('groupParentCalcHeight', { chart: item, childrenList: this.copyDataList })
              }
            })
          }, 200)
          this.gridLayoutLoading = false
        })
      }
    }
  }
}
</script>
