<template>
  <div class="chart-two-situation-statistics">
    <div
      class="situation-statistics-main"
      v-for="(value, index) in chartData"
      :key="index"
    >
      <div  class="situation-statistics-top">
        <div class="situation-statistics-main-left">
          <el-progress
            type="circle"
            :color="chartInfo.params.color[0]"
            width="76"
            :percentage="value.percent"
          />
        </div>
        <div class="situation-statistics-main-right">
          <div>{{ value.count }}</div>
          <div>{{ $t(`dns.numberOfNodesSupporting${index}Protocol`)}}</div>
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
  
}
</script>
