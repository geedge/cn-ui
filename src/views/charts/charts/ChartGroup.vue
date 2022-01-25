<template>
  <panel-chart-list
      :time-filter="timeFilter"
      :data-list="chartInfo.children"
      :panel-lock="true"
      :entity="entity"
  >
  </panel-chart-list>
</template>

<script>
import chartMixin from '@/views/charts/charts/chart-mixin'

export default {
  name: 'ChartGroup',
  mixins: [chartMixin],
  props: {
    timeFilter: Object
  },
  mounted () {
  }
}
</script>
