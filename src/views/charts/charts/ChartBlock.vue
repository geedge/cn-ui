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
  props: {
    timeFilter: Object
  },
  data () {
    return {
      dataList: [],
      time: {},
      firstShow: false
    }
  },
  mounted () {
    this.dataList = JSON.parse(JSON.stringify(this.chartInfo.children))
    // this.time = JSON.parse(JSON.stringify(this.timeFilter))
    this.firstShow = true
  },
  methods: {
    reload () {
      console.log(123132)
      this.dataList = JSON.parse(JSON.stringify(this.chartInfo.children))
      // this.time = JSON.parse(JSON.stringify(this.timeFilter))
    }
  }
}
</script>
