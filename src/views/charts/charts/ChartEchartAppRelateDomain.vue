<template>
   <div class="app-detail__related-domain">
      <div class="related-domain__list">
         <div class="related-domain__list-title">{{$t('overall.domain')}}</div>
         <div class="related-domain__list-body">
            <div class="related-domain__list-row" v-for="(data, i) in chartData" :key="i"><i class="cn-icon cn-icon-domain"></i>&nbsp;{{data}}</div>
         </div>
      </div>
      <div class="related-domain__chart">
         <div>
            <div class="related-domain__chart-title">{{$t('entities.byCategory')}}</div>
            <div class="chart-drawing" :id="`chart${chartInfo.id}-0`"></div>
         </div>
         <div>
            <div class="related-domain__chart-title">{{$t('entities.byCredit')}}</div>
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
import chartEchartMixin from './chart-echart-mixin'
import { get, post } from '@/utils/http'
import { reverseSortBy } from '@/utils/tools'

export default {
  name: 'ChartEchartAppRelateDomain',
  mixins: [chartEchartMixin],
  data () {
    return {
    }
  },
  props: {
  },
  methods: {
    initEcharts (id) {
      this.initDom(id, 2)
      const chartParams = this.chartInfo.params
      const domains = this.chartData.toString()
      // const domains = "office.com,dbank.com"
      this.$emit('showLoading', true)

      const typeUrl = chartParams.byCategoryUrl.slice(0, chartParams.byCategoryUrl.indexOf('?'))
      const reputationUrlUrl = chartParams.byReputationUrl.slice(0, chartParams.byReputationUrl.indexOf('?'))

      const byType = new Promise(resolve => {
        get(typeUrl, { domains: domains }).then(response => {
          // post(replaceUrlPlaceholder(chartParams.byCategoryUrl, { domains: domains })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              // this.noData0 = true
            } else {
              // this.noData0 = false
              // const chartOption = this.$_.cloneDeep(this.chartOption)
              const data = response.data.result.sort(reverseSortBy('uniqDomains')).map(d => {
                return {
                  data: d,
                  name: d.categoryName,
                  value: parseInt(d.uniqDomains),
                  unitType: chartParams.unitType
                }
              })
              this.chartOption.series[0].data = data
            }
          }
        }).finally(() => {
          resolve()
        })
      })
      const byReputation = new Promise(resolve => {
        get(reputationUrlUrl, { domains: domains }).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              // this.noData1 = true
            } else {
              // this.noData1 = false
              // const chartOption = this.$_.cloneDeep(this.chartOption)
              const data = response.data.result.sort(reverseSortBy('uniqDomains')).map(d => {
                return {
                  data: d,
                  name: d.reputationLevel,
                  value: parseInt(d.uniqDomains),
                  unitType: chartParams.unitType
                }
              })
              this.chartOption2.series[0].data = data
              // this.myChart2.setOption(chartOption)
            }
          }
        }).finally(() => {
          resolve()
        })
      })
      Promise.all([byType, byReputation]).finally(response => {
        this.loadEchart(2)
      })
    }
  }
}
</script>
