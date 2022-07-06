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
export default {
  name: 'ChartList',
  props: {
    timeFilter: Object,
    chartList: Array,
    panelLock: Boolean,
    entity: Object
  },
  data () {
    return {
      layout: []
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
        this.layout = [...n]
      }
    }
  }
}
</script>

<style scoped>

</style>
