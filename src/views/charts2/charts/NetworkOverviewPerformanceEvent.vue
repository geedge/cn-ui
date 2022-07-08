<template>
  <div class="performance-event">
    <div class="performance-event-pie">
      <div id="chart1"></div>
      <div class="performance-event-pie-hr"></div>
      <div id="chart2"></div>
    </div>
    <el-button size="small">{{$t('network.dashboards')}}<i class="cn-icon cn-icon-arrow-right"></i></el-button>
  </div>
</template>

<script>
import { pieChartOption1, pieChartOption2 } from '@/views/charts2/charts/options/pie.js'
import * as echarts from 'echarts'
export default {
  name: 'NetworkOverviewPerformanceEvent',
  data () {
    return {
    }
  },
  methods: {
    init () {
      const dom1 = document.getElementById('chart1')
      const dom2 = document.getElementById('chart2')
      const myChart1 = echarts.init(dom1)
      const myChart2 = echarts.init(dom2)
      myChart1.setOption(pieChartOption1)
      myChart2.setOption(pieChartOption2)
    }
  },
  mounted () {
    this.init()
  }
}
</script>
