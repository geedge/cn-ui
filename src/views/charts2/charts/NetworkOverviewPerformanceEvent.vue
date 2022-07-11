<template>
  <div class="performance-event">
    <div class="performance-event-pie">
      <div id="chart1"></div>
      <div class="performance-event-pie-hr"></div>
      <div id="chart2"></div>
    </div>
    <el-button class="pie-button" size="small">{{$t('network.dashboards')}}<i class="cn-icon cn-icon-arrow-right"></i></el-button>
  </div>
</template>

<script>
import { pieChartOption1, pieChartOption2 } from '@/views/charts2/charts/options/pie.js'
import * as echarts from 'echarts'
import { shallowRef } from 'vue'
export default {
  name: 'NetworkOverviewPerformanceEvent',
  setup () {
    return {
      myChart: shallowRef(null),
      myChart2: shallowRef(null)
    }
  },
  data () {
    return {
      chartOption: {},
      chartOption2: {},
      chartData: [
        { value: 1048, name: '666', describe: 'Critical' },
        { value: 735, name: '777', describe: 'High' },
        { value: 580, name: '888', describe: 'Medium' },
        { value: 484, name: '999', describe: 'Low' },
        { value: 300, name: '100', describe: 'Info' }
      ],
      chartData2: [
        { value: 1048, name: '111', describe: 'name1' },
        { value: 735, name: '222', describe: 'name2' },
        { value: 580, name: '333', describe: 'name3' },
        { value: 484, name: '444', describe: 'name4' },
        { value: 300, name: '555', describe: 'name5' }
      ]
    }
  },
  methods: {
    init () {
      const dom = document.getElementById('chart1')
      const dom2 = document.getElementById('chart2')
      if (dom) {
        this.myChart = echarts.init(dom)
        this.chartOption = pieChartOption1
        this.chartOption.series[0].data = this.chartData
        this.myChart.setOption(pieChartOption1)
      }
      if (dom2) {
        this.myChart2 = echarts.init(dom2)
        this.chartOption2 = pieChartOption2
        this.chartOption2.series[0].data = this.chartData2
        this.myChart2.setOption(pieChartOption2)
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
