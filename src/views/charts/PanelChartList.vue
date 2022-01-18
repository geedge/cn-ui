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
        :row-height="40"
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
            @showFullscreen="showFullscreen"
        ></panel-chart>
      </grid-item>
    </grid-layout>
    <!-- noData -->
    <div v-if="noData" class="no-data">
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
import { getTypeCategory } from './charts/tools'
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
    showFullscreen (show, chartInfo) {
      this.fullscreen.chartInfo = chartInfo
      this.fullscreen.visible = show
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
        this.noData = !n || n.length < 1
        /*const nn = JSON.parse(`
            [
  {
    "id": 1,
    "name": "Sessions",
    "i18n": "overall.sessions",
    "panelId": 1,
    "pid": 0,
    "type": 11,
    "x": 20,
    "y": 1,
    "w": 10,
    "h": 5,
    "params": "{\\"url\\":\\"/interface/traffic/sessions?startTime={{startTime}}&endTime={{endTime}}\\",\\"unitType\\":\\"number\\"}",
    "remark": "",
    "state": 1,
    "buildIn": 0,
    "children": [],
    "parent": null,
    "panel": {
      "id": 1
    }
  },
  {
    "id": 2,
    "name": "Traffic summary",
    "i18n": "trafficSummary.trafficSummary",
    "panelId": 1,
    "pid": 0,
    "type": 93,
    "x": 0,
    "y": 0,
    "w": 30,
    "h": 1,
    "params": "",
    "remark": "",
    "state": 1,
    "buildIn": 0,
    "children": [],
    "parent": null,
    "panel": {
      "id": 1
    }
  },
  {
    "id": 3,
    "name": "Active list",
    "i18n": "trafficSummary.activeList",
    "panelId": 1,
    "pid": 0,
    "type": 93,
    "x": 0,
    "y": 16,
    "w": 30,
    "h": 1,
    "params": "",
    "remark": "",
    "state": 1,
    "buildIn": 0,
    "children": [],
    "parent": null,
    "panel": {
      "id": 1
    }
  },
  {
    "id": 4,
    "name": "Domain analysis statistics",
    "i18n": "trafficSummary.domainStatistics",
    "panelId": 1,
    "pid": 0,
    "type": 93,
    "x": 0,
    "y": 35,
    "w": 30,
    "h": 1,
    "params": "",
    "remark": "",
    "state": 1,
    "buildIn": 0,
    "children": [],
    "parent": null,
    "panel": {
      "id": 1
    }
  },
  {
    "id": 6,
    "name": "Packets",
    "i18n": "overall.packets",
    "panelId": 1,
    "pid": 0,
    "type": 11,
    "x": 20,
    "y": 6,
    "w": 10,
    "h": 5,
    "params": "{\\"url\\":\\"/interface/traffic/packets?startTime={{startTime}}&endTime={{endTime}}\\",\\"unitType\\":\\"number\\"}",
    "remark": "",
    "state": 1,
    "buildIn": 0,
    "children": [],
    "parent": null,
    "panel": {
      "id": 1
    }
  },
  {
    "id": 9,
    "name": "Throughput",
    "i18n": "trafficSummary.throughput",
    "panelId": 1,
    "pid": 0,
    "type": 11,
    "x": 20,
    "y": 11,
    "w": 10,
    "h": 5,
    "params": "{\\"url\\":\\"/interface/traffic/throughput?startTime={{startTime}}&endTime={{endTime}}\\",\\"unitType\\":\\"byte\\"}",
    "remark": "packets",
    "state": 1,
    "buildIn": 0,
    "children": [],
    "parent": null,
    "panel": {
      "id": 1
    }
  },
  {
    "id": 10,
    "name": "Active client",
    "i18n": "trafficSummary.activeClient",
    "panelId": 1,
    "pid": 0,
    "type": 61,
    "x": 0,
    "y": 17,
    "w": 10,
    "h": 9,
    "params": "{\\"url\\":\\"/interface/traffic/activeClientIP?startTime={{startTime}}&endTime={{endTime}}&order={{order}}&limit={{limit}}\\"}",
    "remark": "",
    "state": 1,
    "buildIn": 0,
    "children": [],
    "parent": null,
    "panel": {
      "id": 1
    }
  },
  {
    "id": 11,
    "name": "Domain category",
    "i18n": "trafficSummary.domainCategory",
    "panelId": 1,
    "pid": 0,
    "type": 31,
    "x": 0,
    "y": 36,
    "w": 15,
    "h": 13,
    "params": "{\\"url\\":\\"/interface/traffic/topDomainCategories?startTime={{startTime}}&endTime={{endTime}}&limit={{limit}}\\",\\"nameColumn\\":\\"fqdnCategoryName\\",\\"valueColumn\\":\\"uniqDomains\\",\\"tableNameColumn\\":\\"domain\\",\\"urlTable\\":\\"/interface/traffic/activeDomainCategories?startTime={{startTime}}&endTime={{endTime}}&fqdnCategoryName={{fqdnCategoryName}}&limit={{limit}}&order={{order}}\\",\\"urlChildrenTable\\":\\"/interface/traffic/domainCategoryServerIpList?startTime={{startTime}}&endTime={{endTime}}&order={{order}}&limit={{limit}}&domain={{domain}}\\"}",
    "remark": "",
    "state": 1,
    "buildIn": 0,
    "panel": {
      "id": 1
    }
  },
  {
        "id": 12,
        "name": "Traffic map",
        "i18n": "trafficSummary.trafficMap",
        "panelId": 1,
        "pid": 0,
        "type": 2,
        "x": 0,
        "y": 1,
        "w": 20,
        "h": 15,
        "params": "{\\"url\\":\\"/interface/traffic/map?startTime={{startTime}}&endTime={{endTime}}&country={{country}}&province={{province}}&city={{city}}\\",\\"unitType\\":\\"byte\\",\\"valueColumn\\":\\"bytes\\"}",
        "remark": "traffic summaryyy",
        "state": 1,
        "buildIn": 0,
        "children": [],
        "parent": null,
        "panel": {
          "id": 1
        }
      }
]
          `)*/
        const tempList = n.map(item => {
          const height = item.h
          if (item.params) {
            item.params.showHeader = true
          }
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
