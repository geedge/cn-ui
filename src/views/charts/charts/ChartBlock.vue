<template>
  <panel-chart-list
      :time-filter="timeFilter"
      :data-list="dataList"
      :panel-lock="true"
      :entity="entity"
  >
  </panel-chart-list>
</template>

<script>
import chartMixin from '@/views/charts/charts/chart-mixin'

export default {
  name: 'ChartBlock',
  mixins: [chartMixin],
  data () {
    return {
      dataList: [],
      time: {},
      firstShow: false
    }
  },
  mounted () {
    this.dataList = JSON.parse(JSON.stringify(this.chartInfo.children))
    this.firstShow = true
  },
  methods: {
    reload () {
      this.dataList = JSON.parse(JSON.stringify(this.chartInfo.children))
    }
  }
}
</script>
