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
      <panel-chart-list
          :time-filter="timeFilter"
          :data-list="tab.children"
          :panel-lock="true"
          :entity="entity"
      >
      </panel-chart-list>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import _ from 'lodash'
import chartMixin from '@/views/charts/charts/chart-mixin'

export default {
  name: 'ChartTabs',
  computed: {
    timeFilter () {
      return {
        startTime: this.queryParams.startTime,
        endTime: this.queryParams.endTime
      }
    }
  },
  mixins: [chartMixin],
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
