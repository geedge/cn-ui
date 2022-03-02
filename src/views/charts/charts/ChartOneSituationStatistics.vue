<template>
  <div class="chart-one-situation-statistics">
    <div class="situation-statistics-main" v-if="chartInfo.id === 686">
      <div class="situation-statistics-main-left">
        <el-progress type="circle" :color="chartInfo.params.color" width="100" :percentage="percentage" />
      </div>
      <div class="situation-statistics-main-right">
        <div>{{ result.Dnssec.all }}</div>
        <div>{{ $t(`dns.numberOfNodes`) }}</div>
      </div>
    </div>

    <div class="situation-statistics-main" v-if="chartInfo.id === 687">
      <div class="situation-statistics-main-left">
        <el-progress type="circle" width="100" :color="chartInfo.params.color" :percentage="percentage" />
      </div>
      <div class="situation-statistics-main-right">
        <div>{{ result.IPV6.all }}</div>
        <div>{{ $t(`dns.numberOfNodes`) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartOneSituationStatistics',
  props: {
    chartInfo: Object,
    chartData: [Array, Object]
  },
  data () {
    return {
      result: {
        Dnssec: {
          num: 5200,
          all: 18000
        },
        IPV6: {
          num: 2000,
          all: 10000
        }
      }
    }
  },
  computed: {
    percentage () {
      if (this.chartInfo.id === 686) {
        return parseInt((this.result.Dnssec.num / this.result.Dnssec.all) * 100)
      } else {
        return parseInt((this.result.IPV6.num / this.result.IPV6.all) * 100)
      }
    }
  }
}
</script>
