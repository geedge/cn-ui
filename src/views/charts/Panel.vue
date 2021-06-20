<template>
  <div class="cn-panel">
    <chart v-for="(chart, index) in chartList" :key="index" :chart="chart"></chart>
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
</template>

<script>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { panelTypeAndRouteMapping } from '@/utils/constants'
import { api, getPanelList, getChartList } from '@/utils/api'
import Chart from './Chart'

export default {
  name: 'Panel',
  components: {
    Chart
  },
  data () {
    return {

    }
  },
  methods: {
  },
  async mounted () {
    const panels = await getPanelList({ type: this.panelType })
    if (panels && panels.length > 0) {
      this.panel = panels[0]
    }
    if (this.panel.id) {
      this.chartList = (await getChartList({ panelId: this.panel.id })).map(chart => {
        chart.i = chart.id
        return chart
      })
    }
  },
  setup () {
    const chartList = ref([])
    const panel = ref({})
    let panelType = 1 // 取得panel的type
    const { params } = useRoute()
    panelTypeAndRouteMapping[params.typeName] && (panelType = panelTypeAndRouteMapping[params.typeName])
    return {
      panelType,
      chartList,
      panel,
      api
    }
  }
}
</script>
<style lang="scss">
@import '~@/components/charts/panel.scss';
</style>
