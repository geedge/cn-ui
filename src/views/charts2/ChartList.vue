<template>
  <div class="chart-list" ref="layoutBox">
    <grid-layout
        id="gridLayout"
        ref="layout"
        v-model:layout="layout"
        :col-num="24"
        :is-draggable="!panelLock"
        :is-resizable="!panelLock"
        :margin="[20, 20]"
        :row-height="40"
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
            :extra-params="extraParams"
            :id="item.id"
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
import { panelTypeAndRouteMapping, storageKey, drillDownPanelTypeMapping } from '@/utils/constants'
import { typeMapping } from '@/views/charts2/chart-tools'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
export default {
  name: 'ChartList',
  props: {
    timeFilter: Object,
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
      layout: []
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
        if (this.panelType === panelTypeAndRouteMapping.networkAppPerformance) {
          this.layout = n.filter(c => c.type === typeMapping.npm.npmTabs || c.params.tabIndex === this.npmTabIndex)
        } else if (Object.values(drillDownPanelTypeMapping).indexOf(this.panelType) >= -1) {
          this.layout = n.filter(c => c.type === typeMapping.npm.npmTabs || c.params.tabIndex === this.npmTabIndex || !c.params.hasOwnProperty('tabIndex'))
        } else {
          this.layout = [...n]
        }
        const overviewAppChart = n.find(c => c.type === typeMapping.networkOverview.appList)
        let actuallyLength = 0
        if (overviewAppChart) {
          const params = overviewAppChart.params.app ? overviewAppChart.params : { app: [] }
          if (params.app.some(p => p.user === parseInt(localStorage.getItem(storageKey.userId)))) {
            actuallyLength = params.app.find(p => p.user === parseInt(localStorage.getItem(storageKey.userId))).list.length + 1
          } else {
            actuallyLength = params.app.find(p => p.user === 'default').list.length + 1
          }
          overviewAppChart.h = actuallyLength % 3 > 0 ? (Math.floor(actuallyLength / 3) + 1) * 2 + 2 : Math.floor(actuallyLength / 3) * 2 + 2
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
    }
  }
}
</script>

<style scoped>

</style>
