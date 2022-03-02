<template>
  <div class="chart-two-situation-statistics">
    <div
      class="situation-statistics-main"
      v-for="(value, index) in result"
      :key="index"
    >
    <div v-if="value.type === 'doh'" class="situation-statistics-top">
      <div class="situation-statistics-main-left">
        <el-progress type="circle" :color="chartInfo.params.color[0]" width="100" :percentage="(parseInt((value.num/value.all)*100))" />
      </div>
      <div class="situation-statistics-main-right">
        <div>{{ value.all }}</div>
        <div>{{ $t(`dns.numberOfNodesSupportingDoHProtocol`) }}</div>
      </div>
    </div>
    <div v-if="value.type === 'dot'" class="situation-statistics-bottom">
      <div class="situation-statistics-main-left">
        <el-progress type="circle" :color="chartInfo.params.color[1]" width="100" :percentage="(parseInt((value.num/value.all)*100))" />
      </div>
      <div class="situation-statistics-main-right">
        <div>{{ value.all }}</div>
        <div>{{ $t(`dns.numberOfNodesSupportingDoTProtocol`) }}</div>
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
        encryptedDns1: {
          num: 1800,
          all: 10000,
          type: 'doh'
        },
        encryptedDns2: {
          num: 13500,
          all: 22000,
          type: 'dot'
        }
      }
    }
  }

}
</script>
