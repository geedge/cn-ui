<template>
  <div class="dns-event-chart">
    <chart-no-data v-if="isNoData"></chart-no-data>
    <template v-else>
      <div class="dns-event-chart-pie">
        <dns-event-chart-by-pie :timeFilter="timeFilter" :pieData="pieData"/>
      </div>
      <div class="dns-event-chart-bar">
        <dns-event-chart-by-bar :timeFilter="timeFilter" :series="series"/>
      </div>
    </template>
  </div>
</template>

<script>
import { shallowRef } from 'vue'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import dnsEventChartByPie from './DnsEventChartByPie'
import dnsEventChartByBar from './DnsEventChartByBar'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'

export default {
  name: 'DnsEventChart',
  props: {
    type: String
  },
  components: {
    ChartNoData,
    dnsEventChartByPie,
    dnsEventChartByBar
  },
  mixins: [chartMixin],
  setup () {
    return {
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      pieData: [], // 饼状图数据
      series: [], // 柱状图的series数据
      isNoData: false
    }
  },
  watch: {
    timeFilter: {
      deep: true,
      handler (n) {
        this.initData()
      }
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      get(api.dnsInsight.eventChart, params).then(res => {
        const data = res.data.result
        this.pieData = []

        if (data !== undefined && data.length > 0) {
          this.isNoData = false
          const series = []
          data.forEach((item, index) => {
            this.pieData.push({
              name: item.type,
              value: item.analysis.sum
            })

            const tempArr = []
            tempArr.push(item.values)
            series.push({
              data: item.values,
              stack: 'total',
              name: item.type,
              barWidth: 26,
              type: 'bar',
              emphasis: {
                focus: 'series'
              }
            })
          })
          this.series = series
        } else {
          this.isNoData = true
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
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
