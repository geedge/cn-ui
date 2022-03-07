<template>
  <div class="chart-two-situation-statistics">
    <div
      class="situation-statistics-main"
      v-for="(value, key,index) in chartData ? chartData : []"
      :key="index"
    >
      <div class="situation-statistics-top">
        <div class="situation-statistics-main-left">
          <el-progress
            type="circle"
            :color="chartInfo.params.color[index]"
            width="76"
            :percentage="value.percent ? value.percent : 0"
          />
        </div>
        <div class="situation-statistics-main-right">
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
    chartData: [Array, Object],
  },
  data() {
    return {
      // result: {
      //   doh: {
      //     count: 111,
      //     percent: 0.85,
      //   },
      //   dot: {
      //     count: 111,
      //     percent: 80.85,
      //   },
      // },
    }
  },
}
</script>
