<template>
  <div class="chart-one-situation-statistics">
    <div class="situation-statistics-main">
      <div class="situation-statistics-main-left">
        <el-progress
          type="circle"
          :color="chartInfo.params.color"
          width="76"
          :percentage="$_.get(chartData, 'percent', '-') "
        />
      </div>
      <div class="situation-statistics-main-right">
        <div> {{ $_.get(chartData, 'count', '-') }} </div>
        <div class="situation-statistic-main-right-font">{{ $t(`dns.numberOfNodes`) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'ChartOneSituationStatistics',
  props: {
    chartInfo: Object,
    chartData: [Array, Object]
  }
}
</script>
