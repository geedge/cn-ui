<template>
   <div style="height: calc(100vh - 70px);width: 100%;" v-if="isWholeScreenScroll" id="dnsScreenAnchor">
     <dns-screen v-if="currentPath === wholeScreenRouterMapping.dns"
                 :copy-data-list="copyDataList"
                 ref="dnsScreen"
                 :time-filter="timeFilter"
                 @finishOne="finishOne"
                 :entity="entity">
     </dns-screen>
   </div>
  <div :id='`chartList${(isGroup ? "Group" : "") + timestamp}`' class="chart-list" ref="layoutBox">
    <grid-layout
            id="gridLayout"
        ref="layout"
        v-if="gridLayoutShow"
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
            @finishOne="finishOne"
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
import { getGroupHeight, getTypeCategory, isGroup } from './charts/tools'
import _ from 'lodash'
import { useRouter } from 'vue-router'
import DnsScreen from '@/views/charts/wholeScreenScroll/DnsScreen'
import { wholeScreenRouterMapping } from '@/utils/constants'
import { ref } from 'vue'

export default {
  name: 'PanelChartList',
  components: {
    PanelChart,
    DnsScreen,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  props: {
    timeFilter: Object, // 时间范围
    panelLock: { type: Boolean, default: true },
    wholeScreenScroll: { type: Boolean, default: false },
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
      scrollTopTimer: null,
      wholeScreenRouterMapping,
      isWholeScreenScroll: false,
      haveDoneChartNum: 0,
      allDone: false
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

      this.$refs.dnsScreen.reload()
    },
    showFullscreen (show, chartInfo) {
      this.fullscreen.chartInfo = chartInfo
      this.fullscreen.visible = show
    },
    finishOne () {
      this.haveDoneChartNum++
      // console.log("this.haveDoneChartNum="+this.haveDoneChartNum)
      if (this.haveDoneChartNum >= this.copyDataList.length) {
        // this.allDone = true
        setTimeout(() => {
          this.$emit('finish')
        }, 200)
      }
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
    chartHeightData (e) {
      if (e.currentTarget.innerWidth < 1280) {
        this.rowHeight = 25
      } else if (e.currentTarget.innerWidth >= 1280 && e.currentTarget.innerWidth <= 1440) {
        this.rowHeight = 25
      } else if (e.currentTarget.innerWidth >= 1440 && e.currentTarget.innerWidth < 1920) {
        this.rowHeight = 32.5
      } else if (e.currentTarget.innerWidth >= 1920 && e.currentTarget.innerWidth <= 2048) {
        this.rowHeight = 40
      } else if (e.currentTarget.innerWidth >= 2048 && e.currentTarget.innerWidth <= 2560) {
        this.rowHeight = 55
      } else if (e.currentTarget.innerWidth > 2560) {
        this.rowHeight = 55
      }
    }
  },
  mounted () {
    window.addEventListener('resize', this.$_.debounce(this.chartHeightData, 100))
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.chartHeightData)
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
    const htmlHeight = document.getElementsByTagName('html')[0].clientWidth
    const rowHeight = ref(0)
    if (htmlHeight < 1280) {
      rowHeight.value = 25
    } else if (htmlHeight >= 1280 && htmlHeight <= 1440) {
      rowHeight.value = 25
    } else if (htmlHeight >= 1440 && htmlHeight < 1920) {
      rowHeight.value = 32.5
    } else if (htmlHeight >= 1920 && htmlHeight <= 2048) {
      rowHeight.value = 40
    } else if (htmlHeight >= 2048 && htmlHeight <= 2560) {
      rowHeight.value = 55
    } else if (htmlHeight > 2560) {
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

        this.isWholeScreenScroll = false

        // const arr = this.$_.cloneDeep(n)
        this.noData = !n || n.length < 1
        if (n) {
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
              this.isWholeScreenScroll = this.wholeScreenScroll// 为了解决加载页面时，滚动条先长后短的问题，即 数据要一起显示
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
}
</script>
