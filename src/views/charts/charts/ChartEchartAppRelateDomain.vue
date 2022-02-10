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
      this.loadEchart(2)
    }
  }
}
</script>
