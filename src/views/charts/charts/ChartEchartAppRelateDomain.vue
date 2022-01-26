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
import { replaceUrlPlaceholder, lineToSpace } from '@/utils/tools'
import { get } from '@/utils/http'

export default {
  name: 'ChartEchartAppRelateDomain',
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
    initAppRelatedDomain (id) {
      const chartParams = this.chartInfo.params
      const dom = document.getElementById(`chart${this.chartInfo.id}-0`)
      const dom2 = document.getElementById(`chart${this.chartInfo.id}-1`)
      !this.myChart && (this.myChart = echarts.init(dom))
      !this.myChart2 && (this.myChart2 = echarts.init(dom2))
      this.chartOption = this.$_.cloneDeep(ipHostedDomain)
      this.$emit('showLoading', true)
      this.chartOption.series[0].data = [
        {
          name: 'test1',
          value: 32
        },
        {
          name: 'test2',
          value: 21
        },
        {
          name: 'test3',
          value: 20
        },
        {
          name: 'test4',
          value: 7
        }
      ]
      this.loadEchartPie()
      /*
        get(replaceUrlPlaceholder(chartParams.url, { appName: this.entity.appName })).then(response => {
           if (response.code === 200) {
              if (this.$_.isEmpty(response.data.result)) {
                 this.noData = true
              } else {
                 this.detailData = response.data.result
                 this.noData = false
              }
           }
        }).finally(() => {
           setTimeout(() => {
              this.$emit('showLoading', false)
           }, 250)
        })
         */
    },

    loadEchartPie () {
      this.$emit('showLoading', true)
      try {
        this.myChart.setOption(this.chartOption)
        this.myChart2.setOption(this.chartOption)
      } finally {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 200)
      }
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.initAppRelatedDomain(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>
