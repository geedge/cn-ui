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
                <div class="npm-event-pie-legend-type-icon" :class="legend.eventSeverity"></div>
                <div class="npm-event-pie-legend-type-severity">{{legend.eventSeverity}}</div>
              </div>
            </template>
          </div>
          <div class="npm-event-pie-legend">
            <div class="npm-event-pie-legend-title" v-if="chartData.length > 0">{{ $t('network.total') }}</div>
            <template v-for="(legend, index) in chartData" :key="index">
              <div class="npm-event-pie-legend-total">{{legend.count}}</div>
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

export default {
  name: 'NpmEventsByType',
  props: {
    chart: Object,
    timeFilter: Object,
    type: String
  },
  components: {
    ChartNoData
  },
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
  methods: {
    init () {
      const _this = this
      const dom = document.getElementById('chart')
      this.myChart = echarts.init(dom)
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
            num += t.count
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
    eventsVyTypeData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        type: 'severity'
      }
      get(api.npm.events.list, params).then(res => {
        if (res.code === 200) {
          if (res.data.result.length <= 0) {
            this.isNoData = true
            return
          }
          res.data.result.forEach(t => {
            if (t.eventSeverity === 'critical') {
              t.index = 0
            } else if (t.eventSeverity === 'high') {
              t.index = 1
            } else if (t.eventSeverity === 'info') {
              t.index = 4
            } else if (t.eventSeverity === 'low') {
              t.index = 3
            } else if (t.eventSeverity === 'medium') {
              t.index = 2
            }
          })
          this.chartData = res.data.result.sort((a, b) => { return a.index - b.index })
          this.chartData = this.chartData.map(t => {
            return {
              ...t,
              value: t.count
            }
          })
          this.init()
        } else {
          this.isNoData = true
        }
      })
    },
    resize () {
      this.myChart.resize()
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      this.eventsVyTypeData()
    }, 100)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>
