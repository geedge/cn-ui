<template>
  <div class="npm-event dns-event">
    <div class="npm-event-pie dns-event-pie">
      <chart-no-data v-if="isNoData"></chart-no-data>

      <div class="npm-event-pies dns-event-pies" v-else>
        <!--pie图-->
        <div class="chart-drawing" id="chart1"></div>

        <div class="npm-event-pie-legends">
          <div class="npm-event-pie-legend">
            <div class="npm-event-pie-legend-title" v-if="chartData.length > 0">{{ $t('overall.type') }}</div>
            <template v-for="(legend, index) in chartData" :key="index">
              <div class="npm-event-pie-legend-type">
                <span class="color-block" :style="{background: chartColor6[index]}"></span>
                <div class="npm-event-pie-legend-type-severity">{{ legend.name }}</div>
              </div>
            </template>
          </div>

          <div class="npm-event-pie-legend">
            <div class="npm-event-pie-legend-title" v-if="chartData.length > 0">{{ $t('network.total') }}</div>
            <template v-for="(legend, index) in chartData" :key="index">
              <div class="npm-event-pie-legend-total">{{ legend.value }}</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { shallowRef } from 'vue'
import * as echarts from 'echarts'
import { pieChartOption3 } from '@/views/charts2/charts/options/echartOption'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import { chartColor6 } from '@/utils/constants'

export default {
  name: 'DnsEventChartByPie',
  props: {
    type: String,
    timeFilter: Object,
    pieData: Array
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
      isNoData: false,
      chartColor6: chartColor6
    }
  },
  watch: {
    timeFilter: {
      deep: true,
      handler (n) {
        this.eventsByTypeData()
      }
    },
    pieData: {
      deep: true,
      handler (n) {
        this.eventsByTypeData()
      }
    }
  },
  methods: {
    init () {
      const _this = this
      const dom = document.getElementById('chart1')
      if (!this.myChart) {
        this.myChart = echarts.init(dom)
        this.chartOption = pieChartOption3
        this.chartOption.color = chartColor6
        this.chartOption.series[0].data = this.chartData
        this.chartOption.series[0].label = {
          show: true,
          position: 'center',
          fontFamily: 'NotoSansHans-Medium',
          fontSize: 20,
          fontWeight: 500,
          formatter: function () {
            let num = 0
            _this.chartData.forEach(t => {
              num += t.value
            })
            return num
          }
        }
        this.myChart.on('mouseover', function (params) {
          _this.chartOption.series[0].label.show = false
          _this.myChart.setOption(_this.chartOption)
        })
        this.myChart.on('mouseout', function (params) {
          _this.chartOption.series[0].label.show = true
          _this.myChart.setOption(_this.chartOption)
        })
        this.myChart.setOption(this.chartOption)
      } else {
        this.chartOption.color = chartColor6
        this.chartOption.series[0].data = this.chartData
        this.chartOption.series[0].label = {
          show: true,
          position: 'center',
          fontFamily: 'NotoSansHans-Medium',
          fontSize: 20,
          fontWeight: 500,
          formatter: function () {
            let num = 0
            _this.chartData.forEach(t => {
              num += t.value
            })
            return num
          }
        }
        this.myChart.setOption(this.chartOption)
      }
    },
    eventsByTypeData () {
      if (this.pieData.length > 0) {
        this.chartData = this.pieData
        this.init()
      }
    },
    resize () {
      this.myChart.resize()
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.eventsByTypeData()
    })
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.resize)
  }
}
</script>
