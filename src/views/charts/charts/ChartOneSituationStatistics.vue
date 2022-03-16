<template>
  <div class="cn-chart__one-situation-statistics">
    <div class="one-situation-statistics__box">
      <div class="box__progress">
        <el-progress
          type="circle"
          :color="chartInfo.params.color"
          width="76"
          :percentage="$_.get(chartData, 'percent', '-') "
        />
      </div>
      <div class="box__count">
        <div> {{ $_.get(chartData, 'count', '-') }} </div>
        <div>{{ $t(`dns.numberOfNodes`) }}</div>
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
