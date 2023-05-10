<template>
  <div class="chart-list" ref="layoutBox">
    <grid-layout
        id="gridLayout"
        ref="layout"
        v-model:layout="layout"
        :col-num="24"
        :is-draggable="!panelLock"
        :is-resizable="!panelLock"
        :margin="[rowMargin, colMargin]"
        :row-height="rowHeight"
        :vertical-compact="true"
        :use-css-transforms="false"
    >
      <grid-item v-for="item in layout"
                 :x="item.x"
                 :y="item.y"
                 :w="item.w"
                 :h="item.h"
                 :i="item.i"
                 :key="item.i">
        <chart
            :time-filter="timeFilter"
            :metric="metric"
            :extra-params="extraParams"
            :id="item.id"
            :entity="entity"
            ref="chartGrid"
            @npmTabChange="npmTabChange"
            :chart="item"
        ></chart>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import VueGridLayout from 'vue-grid-layout'
import _ from 'lodash'
import Chart from '@/views/charts2/Chart'
import { panelTypeAndRouteMapping, drillDownPanelTypeMapping } from '@/utils/constants'
import { typeMapping } from '@/views/charts2/chart-tools'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
export default {
  name: 'ChartList',
  props: {
    timeFilter: Object,
    metric: String,
    panelType: Number,
    chartList: Array,
    panelLock: Boolean,
    entity: Object,
    extraParams: Object
  },
  data () {
    return {
      panelTypeAndRouteMapping,
      typeMapping,
      layout: [],
      rowHeight: 40,
      rowMargin: 20,
      colMargin: 20,
      debounceFunc: null,
      timeoutFunc: null,
      // 需要动态处理高度的chart
      dynamicHeightCharts: [
        {
          selector: '.app-cards',
          // 需要额外修正的值
          correctionHeight: 24,
          chartType: typeMapping.networkOverview.appList
        },
        {
          selector: '.entity-detail-info',
          correctionHeight: 161,
          chartType: typeMapping.entityDetail.basicInfo
        }
      ]
    }
  },
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    Chart
  },
  setup () {
    const { query } = useRoute()
    const tabIndexParam = query.tabIndex
    const npmTabIndex = ref(tabIndexParam ? parseInt(tabIndexParam) : 0)
    return {
      npmTabIndex
    }
  },
  watch: {
    chartList (n) {
      if (!_.isEmpty(n)) {
        let layout = []
        if (this.panelType === panelTypeAndRouteMapping.networkAppPerformance) {
          layout = n.filter(c => c.type === typeMapping.npm.npmTabs || c.params.tabIndex === this.npmTabIndex)
        } else if (Object.values(drillDownPanelTypeMapping).indexOf(this.panelType) >= -1) {
          layout = n.filter(c => c.type === typeMapping.npm.npmTabs || c.params.tabIndex === this.npmTabIndex || !c.params.hasOwnProperty('tabIndex'))
        } else {
          layout = [...n]
        }

        /* const overviewAppChart = layout.find(c => c.type === typeMapping.networkOverview.appList)
        let actuallyLength = 0
        if (overviewAppChart) {
          const params = overviewAppChart.params.app ? overviewAppChart.params : { app: [] }
          if (params.app.some(p => p.user === parseInt(localStorage.getItem(storageKey.userId)))) {
            actuallyLength = params.app.find(p => p.user === parseInt(localStorage.getItem(storageKey.userId))).list.length + 1
          } else {
            actuallyLength = params.app.find(p => p.user === 'default').list.length + 1
          }
          overviewAppChart.h = actuallyLength % 3 > 0 ? (Math.floor(actuallyLength / 3) + 1) * 2 + 2 : Math.floor(actuallyLength / 3) * 2 + 2
        } */
        this.layout = layout
        const overviewAppChart = layout.find(c => c.type === typeMapping.networkOverview.appList)
        if (overviewAppChart) {
          this.$nextTick(() => {
            this.handleDynamicChartHeight()
          })
        }
      }
    },
    npmTabIndex (n) {
      if (this.panelType === panelTypeAndRouteMapping.networkAppPerformance ||
          Object.values(drillDownPanelTypeMapping).indexOf(this.panelType) >= -1) {
        this.layout = this.chartList.filter(c => c.type === typeMapping.npm.npmTabs || c.params.tabIndex === this.npmTabIndex || !c.params.hasOwnProperty('tabIndex'))
      }
    }
  },
  methods: {
    npmTabChange (index) {
      this.npmTabIndex = parseInt(index)
    },
    resizeLine () {
      this.$refs.chartGrid.resizeLine()
    },
    // 动态处理chart高度
    handleDynamicChartHeight () {
      this.dynamicHeightCharts.forEach(chart => {
        const dom = document.querySelector(chart.selector)
        if (dom) {
          const layout = _.cloneDeep(this.layout)
          const destinationChart = layout.find(c => c.type === chart.chartType)
          const domHeight = dom.offsetHeight
          if (domHeight) {
            destinationChart.h = (domHeight + chart.correctionHeight + this.rowMargin) / (this.rowHeight + this.rowMargin)
            this.layout = layout
          }
        }
      })
    }
  },
  mounted () {
    this.timeoutFunc = setTimeout(() => {
      this.handleDynamicChartHeight()
    }, 400)
    this.handleDynamicChartHeight()
    this.debounceFunc = _.debounce(this.handleDynamicChartHeight, 400)
    window.addEventListener('resize', this.debounceFunc)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
    clearTimeout(this.timeoutFunc)
  }
}
</script>
