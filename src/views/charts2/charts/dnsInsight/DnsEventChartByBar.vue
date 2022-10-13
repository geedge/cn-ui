<template>
  <div class="npm-event dns-event">
    <div class="npm-event-pie dns-event-pie">
      <chart-no-data v-if="isNoData"></chart-no-data>

      <div class="npm-event-pies dns-event-pies" v-else>
        <!--堆叠柱状图-->
        <div style="width: 100%;height: 100%" id="chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { shallowRef } from 'vue'
import * as echarts from 'echarts'
import { stackedBarChartOption } from '@/views/charts2/charts/options/echartOption'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'DnsEventChartByPie',
  props: {
    type: String,
    timeFilter: Object,
    series: Array
  },
  components: {
    ChartNoData
  },
  mixins: [chartMixin],
  setup () {
    return {
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      chartData: [],
      timer: null,
      isNoData: false
    }
  },
  watch: {
    timeFilter: {
      handler (n) {
        this.eventsByTypeData()
      }
    },
    series: {
      deep: true,
      handler (n) {
        this.eventsByTypeData()
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.eventsByTypeData()
    })
    window.addEventListener('resize', this.resize)
  },
  methods: {
    init () {
      const _this = this
      const dom = document.getElementById('chart')
      if (!this.myChart) {
        this.myChart = echarts.init(dom)
        this.chartOption = stackedBarChartOption
        this.chartOption.series = this.series

        this.myChart.on('mouseover', function (params) {
          _this.myChart.setOption(_this.chartOption)
        })
        this.myChart.on('mouseout', function (params) {
          _this.myChart.setOption(_this.chartOption)
        })

        this.myChart.setOption(this.chartOption)
      } else {
        this.chartOption.series = this.series
        this.myChart.setOption(this.chartOption)
      }
    },
    eventsByTypeData () {
      this.toggleLoading(false)
      if (this.series.length > 0) {
        this.init()
        this.toggleLoading(true)
      }
    },
    resize () {
      this.myChart.resize()
    }
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.resize)
  }
}
</script>
