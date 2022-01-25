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
      firstShow: false
    }
  },
  watch: {
    // 'chartInfo.children': {
    //   immediate: true,
    //   deep: true,
    //   handle (n) {
    //     if (!this.firstShow) {
    //       this.dataList = JSON.parse(JSON.stringify(this.chartInfo.children))
    //       this.firstShow = true
    //     }
    //   }
    // }
  },
  mounted () {
    this.dataList = JSON.parse(JSON.stringify(this.chartInfo.children))
    this.firstShow = true
  }
}
</script>
