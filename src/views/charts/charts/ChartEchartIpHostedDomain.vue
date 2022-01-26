<template>
  <!-- IP详情 托管域名 -->
   <div class="ip-detail__hosted-domain">
      <div class="hosted-domain__list">
         <div class="hosted-domain__list-title">{{$t('overall.domain')}}</div>
         <div class="hosted-domain__list-body">
            <div class="hosted-domain__list-row" v-for="(data, i) in chartData" :key="i">{{data}}</div>
         </div>
      </div>
      <div class="hosted-domain__chart">
         <div>
            <div class="hosted-domain__chart-title">{{$t('entities.byCategory')}}</div>
            <div class="chart-drawing" :id="`chart${chartInfo.id}-0`"></div>
         </div>
         <div>
            <div class="hosted-domain__chart-title">{{$t('entities.byCredit')}}</div>
            <div class="chart-drawing" :id="`chart${chartInfo.id}-1`"></div>
         </div>
      </div>
   </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  ipHostedDomain
} from '@/views/charts/charts/options/pie'
import { replaceUrlPlaceholder } from '@/utils/tools'
import { get } from '@/utils/http'

export default {
  name: 'ChartEchartIpHostedDomain',
  data () {
    return {
      myChart: null,
      myChart2: null,
      chartOption: null
    }
  },
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    entity: Object
  },
  methods: {
    initIpHostedDomain (id) {
      const chartParams = this.chartInfo.params
      const dom = document.getElementById(id + '-0')
      const dom2 = document.getElementById(id + '-1')
      !this.myChart && (this.myChart = echarts.init(dom))
      !this.myChart2 && (this.myChart2 = echarts.init(dom2))
      this.chartOption = this.$_.cloneDeep(ipHostedDomain)
      this.$emit('showLoading', true)
      const byType = new Promise(resolve => {
        get(replaceUrlPlaceholder(chartParams.byTypeUrl, { ip: this.entity.ip })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              // this.noData0 = true
            } else {
              // this.noData0 = false
              const chartOption = this.$_.cloneDeep(this.chartOption)
              const data = response.data.result.map(d => {
                return {
                  data: d,
                  name: d.category,
                  value: parseInt(d.count),
                  unitType: chartParams.unitType
                }
              })
              chartOption.series[0].data = data
              this.myChart.setOption(chartOption)
            }
          }
          resolve()
        })
      })
      const byCredit = new Promise(resolve => {
        get(replaceUrlPlaceholder(chartParams.byCreditUrl, { ip: this.entity.ip })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              // this.noData1 = true
            } else {
              // this.noData1 = false
              const chartOption = this.$_.cloneDeep(this.chartOption)
              const data = response.data.result.map(d => {
                return {
                  data: d,
                  name: d.reputation,
                  value: parseInt(d.count),
                  unitType: chartParams.unitType
                }
              })
              chartOption.series[0].data = data
              this.myChart2.setOption(chartOption)
            }
          }
          resolve()
        })
      })
      Promise.all([byType, byCredit]).finally(response => {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 1000)
      })
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.initIpHostedDomain(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>
