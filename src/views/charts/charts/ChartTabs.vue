<template>
  <el-tabs
      class="cn-chart cn-chart__tabs"
      v-model="activeTab"
      @tab-click="changeTab"
      :ref="`chart-${chartInfo.id}`"
  >
    <el-tab-pane
        v-for="tab in chartInfo.children"
        :label="tab.i18n ? $t(tab.i18n) : tab.name" :name="`${tab.id}`"
        :key="tab.id"
        :ref="`chart-${chartInfo.id}`"
    >
      <template v-for="chart in tab.children" :key="chart.id">
        <panel-chart
            :ref="'chart' + chart.id"
            :chart-info="chart"
            :show-header="true"
            :time-filter="timeFilter"
            @showFullscreen="showFullscreen"
        ></panel-chart>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import _ from 'lodash'
import PanelChart from '@/views/charts/PanelChart'
export default {
  name: 'ChartTabs',
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String], // 数据在父组件查询后传入，本组件内不查询，只根据接传递的数据来渲染
    queryParams: Object // 接口请求参数
  },
  components: {
    PanelChart
  },
  computed: {
    timeFilter () {
      return {
        startTime: this.queryParams.startTime,
        endTime: this.queryParams.endTime
      }
    }
  },
  methods: {
    showFullscreen () {

    },
    changeTab (tab) {
      this.activeTab = tab.paneName
    }
  },
  setup (props) {
    let activeTab = ''
    if (!_.isEmpty(props.chartInfo.children)) {
      activeTab = `${props.chartInfo.children[0].id}`
    }
    return {
      activeTab
    }
  }
}
</script>
