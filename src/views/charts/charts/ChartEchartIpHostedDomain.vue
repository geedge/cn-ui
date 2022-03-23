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
import { replaceUrlPlaceholder } from '@/utils/tools'
import { get } from '@/utils/http'
import chartEchartMixin from './chart-echart-mixin'

export default {
  name: 'ChartEchartIpHostedDomain',
  mixins: [chartEchartMixin],
  data () {
    return {
    }
  },
  props: {
    entity: Object
  },
  methods: {
    initEcharts (id) {
      this.initDom(id, 2)
      const chartParams = this.chartInfo.params
      const domains = this.chartData.toString()
      const byType = new Promise(resolve => {
        get(replaceUrlPlaceholder(chartParams.byCategoryUrl, { domains: domains })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              // this.noData0 = true
            } else {
              // this.noData0 = false
              //chartOption = this.$_.cloneDeep(this.chartOption)
              const data = response.data.result.map(d => {
                return {
                  data: d,
                  name: d.categoryName,
                  value: parseInt(d.uniqDomains),
                  unitType: chartParams.unitType
                }
              })
              this.chartOption.series[0].data = data
              //this.myChart.setOption(this.chartOption)
            }
          }
           resolve()
        })
      })
      const byCredit = new Promise(resolve => {
        get(replaceUrlPlaceholder(chartParams.byReputationUrl, { domains: domains })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              // this.noData1 = true
            } else {
              // this.noData1 = false
              //this.chartOption2 = this.$_.cloneDeep(this.chartOption)
              const data = response.data.result.map(d => {
                return {
                  data: d,
                  name: d.reputationLevel,
                  value: parseInt(d.uniqDomains),
                  unitType: chartParams.unitType
                }
              })
              this.chartOption2.series[0].data = data
             // this.myChart2.setOption(this.chartOption2)
            }
          }
           resolve()
        })
      })

      Promise.all([byType, byCredit]).finally(response => {
         this.loadEchart(2)
      })
    }
  }
}
</script>
