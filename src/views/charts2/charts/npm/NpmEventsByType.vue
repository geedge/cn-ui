<template>
  <div class="npm-event">
    <div class="npm-event-title">{{$t('network.eventByType')}}</div>
    <div class="npm-event-pie">
      <div class="chart-drawing" id="chart"></div>
      <div class="npm-event-pie-legends">
        <div class="npm-event-pie-legend">
          <div class="npm-event-pie-legend-title">{{ $t('overall.type') }}</div>
          <template v-for="(legend, index) in chartData" :key="index">
            <div class="npm-event-pie-legend-type">
              <div class="npm-event-pie-legend-type-icon" :class="iconClass(legend)"></div>
              <div>{{legend.severity}}</div>
            </div>
          </template>
        </div>
        <div class="npm-event-pie-legend">
          <div class="npm-event-pie-legend-title">{{ $t('network.total') }}</div>
          <template v-for="(legend, index) in chartData" :key="index">
            <div class="npm-event-pie-legend-total">{{legend.total}}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { shallowRef } from 'vue'
import * as echarts from 'echarts'
import { pieChartOption3 } from '@/views/charts2/charts/options/echartOption'

export default {
  name: 'NpmEventsByType',
  setup () {
    return {
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      chartData: [
        { value: 1048, severity: 'Critical', total: 323 },
        { value: 1315, severity: 'High', total: 178 },
        { value: 5810, severity: 'Medium', total: 223 },
        { value: 4184, severity: 'Low', total: 178 },
        { value: 3100, severity: 'Info', total: 323 }
      ],
      timer: null
    }
  },
  computed: {
    iconClass () {
      return function (row) {
        let className
        switch (row.severity) {
          case ('Critical'): {
            className = 'critical'
            break
          }
          case ('High'): {
            className = 'high'
            break
          }
          case ('Info'): {
            className = 'info'
            break
          }
          case ('Medium'): {
            className = 'medium'
            break
          }
          case ('Low'): {
            className = 'low'
            break
          }
          default: break
        }
        return className
      }
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
            num += t.total
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
    resize () {
      this.myChart.resize()
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      this.init()
    }, 100)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>
