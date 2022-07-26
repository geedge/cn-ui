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
import { panelTypeAndRouteMapping } from '@/utils/constants'
import { typeMapping } from '@/views/charts2/chart-tools'
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
      layout: [],
      npmTabIndex: 0
    }
  },
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    Chart
  },
  watch: {
    chartList (n) {
      if (!_.isEmpty(n)) {
        if (this.panelType === panelTypeAndRouteMapping.networkAppPerformance) {
          this.layout = n.filter(c => c.type === typeMapping.npm.npmTabs || c.params.tabIndex === this.npmTabIndex)
        } else {
          this.layout = [...n]
        }
      }
    },
    npmTabIndex (n) {
      if (this.panelType === panelTypeAndRouteMapping.networkAppPerformance) {
        this.layout = this.chartList.filter(c => c.type === typeMapping.npm.npmTabs || c.params.tabIndex === this.npmTabIndex)
      }
    }
  },
  methods: {
    npmTabChange (index) {
      this.npmTabIndex = parseInt(index)
    }
  }
}
</script>

<style scoped>

</style>
