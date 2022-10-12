<template>
  <div class="npm-event">
    <div class="npm-event-title">{{$t('network.eventByType')}}</div>
    <div class="npm-event-pie">
      <chart-no-data v-if="isNoData"></chart-no-data>
      <div class="npm-event-pies" v-else>
        <div class="chart-drawing" id="chart"></div>
        <div class="npm-event-pie-legends">
          <div class="npm-event-pie-legend">
            <div class="npm-event-pie-legend-title" v-if="chartData.length > 0">{{ $t('overall.type') }}</div>
            <template v-for="(legend, index) in chartData" :key="index">
              <div class="npm-event-pie-legend-type">
                <div class="npm-event-pie-legend-type-severity">{{legend.name}}</div>
              </div>
            </template>
          </div>
          <div class="npm-event-pie-legend">
            <div class="npm-event-pie-legend-title" v-if="chartData.length > 0">{{ $t('network.total') }}</div>
            <template v-for="(legend, index) in chartData" :key="index">
              <div class="npm-event-pie-legend-total">{{legend.value}}</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { shallowRef } from 'vue'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import * as echarts from 'echarts'
import { pieChartOption3 } from '@/views/charts2/charts/options/echartOption'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'NpmEventsByType',
  props: {
    type: String
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
    }
  },
  methods: {
    init () {
      const _this = this
      const dom = document.getElementById('chart')
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = pieChartOption3
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
    },
    eventsByTypeData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        type: 'severity'
      }
      this.toggleLoading(true)
      get(api.npm.events.recentEvents, params).then(res => {
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          const arrData = []
          res.data.result.forEach(t => {
            const hit = arrData.find(e => e.name === t.eventType)
            if (hit) {
              arrData.forEach(d => {
                d.value++
              })
            } else {
              arrData.push({ name: t.eventType, value: 1 })
            }
          })
          this.chartData = arrData.sort((a, b) => { return b.value - a.value })
          this.$nextTick(() => {
            this.init()
          })
        } else {
          this.isNoData = true
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    resize () {
      this.myChart.resize()
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      this.eventsByTypeData()
    }, 100)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)
  }
}
</script>
