<template>
  <div class="chart-two-situation-statistics">
    <div
      class="chart-two-situation-statistics-main"
      v-for="(value, key,index) in result ? result : []"
      :key="index"
    >
      <div class="chart-two-situation-statistics-top">
        <div class="chart-two-situation-statistics-main-left">
          <el-progress
            type="circle"
            :color="chartInfo.params.color[index]"
            width="76"
            :percentage="value.percent ? value.percent : 0"
          />
        </div>
        <div class="chart-two-situation-statistics-main-right">
          <div>{{ value.count ? value.count : '-' }}</div>
          <div>{{ $t(`dns.numberOfNodesSupporting${key}Protocol`) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartTwoSituationStatistics',
  props: {
    chartInfo: Object,
    chartData: [Array, Object]
  },
  data () {
    return {
      result: {
        doh: {
          count: 111,
          percent: 0.85,
        },
        dot: {
          count: 111,
          percent: 80.85,
        },
      },
    }
  },
  mounted(){
    console.log(this.chartInfo);
    console.log(this.chartData);
  }
}
</script>
