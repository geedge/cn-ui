<template>
  <div class="single-value" v-for="(npm, index) in npmNetworkCycleData" :key="index">
    <template v-if="index === 0">
      <div class="single-value__title">{{$t(npmNetworkName[index].name)}}</div>
      <div class="single-value__content">
        <div class="single-value__content-number">{{unitConvert(npm.establishLatencyAvg, unitTypes.time).join(' ')}}</div>
        <div v-if="npm.trend === 'up' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.trend === 'down' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
      </div>
      <div class="single-value__circle">
        <div class="single-value__circle-p95">P95: {{unitConvert(npm.establishLatencyP95, unitTypes.time).join(' ')}}</div>
        <div class="single-value__circle-p99">P99: {{unitConvert(npm.establishLatencyP99, unitTypes.time).join(' ')}}</div>
      </div>
    </template>
    <template v-if="index === 1">
      <div class="single-value__title">{{$t(npmNetworkName[index].name)}}</div>
      <div class="single-value__content">
        <div class="single-value__content-number">{{unitConvert(npm.httpResponseLatencyAvg, unitTypes.time).join(' ')}}</div>
        <div v-if="npm.trend === 'up' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.trend === 'down' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
      </div>
      <div class="single-value__circle">
        <div class="single-value__circle-p95">P95: {{unitConvert(npm.httpResponseLatencyP95, unitTypes.time).join(' ')}}</div>
        <div class="single-value__circle-p99">P99: {{unitConvert(npm.httpResponseLatencyP99, unitTypes.time).join(' ')}}</div>
      </div>
    </template>
    <template v-if="index === 2">
      <div class="single-value__title">{{$t(npmNetworkName[index].name)}}</div>
      <div class="single-value__content">
        <div class="single-value__content-number">{{unitConvert(npm.sslConLatencyAvg, unitTypes.time).join(' ')}}</div>
        <div v-if="npm.trend === 'up' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.trend === 'down' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
      </div>
      <div class="single-value__circle">
        <div class="single-value__circle-p95">P95: {{unitConvert(npm.sslConLatencyP95, unitTypes.time).join(' ')}}</div>
        <div class="single-value__circle-p99">P99: {{unitConvert(npm.sslConLatencyP99, unitTypes.time).join(' ')}}</div>
      </div>
    </template>
    <template v-if="index === 3">
      <div class="single-value__title">{{$t(npmNetworkName[index].name)}}</div>
      <div class="single-value__content">
        <div class="single-value__content-number">{{unitConvert(npm.sequenceGapLossAvg, unitTypes.percent).join(' ')}}</div>
        <div v-if="npm.trend === 'up' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.trend === 'down' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
      </div>
      <div class="single-value__circle">
        <div class="single-value__circle-p95">P95: {{unitConvert(npm.sequenceGapLossP95, unitTypes.percent).join(' ')}}</div>
        <div class="single-value__circle-p99">P99: {{unitConvert(npm.sequenceGapLossP99, unitTypes.percent).join(' ')}}</div>
      </div>
    </template>
    <template v-if="index === 4">
      <div class="single-value__title">{{$t(npmNetworkName[index].name)}}</div>
      <div class="single-value__content">
        <div class="single-value__content-number">{{unitConvert(npm.pktRetransAvg, unitTypes.percent).join(' ')}}</div>
        <div v-if="npm.trend === 'up' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.trend === 'down' && npm.value !== 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
      </div>
      <div class="single-value__circle">
        <div class="single-value__circle-p95">P95: {{unitConvert(npm.pktRetransP95, unitTypes.percent).join(' ')}}</div>
        <div class="single-value__circle-p99">P99: {{unitConvert(npm.pktRetransP99, unitTypes.percent).join(' ')}}</div>
      </div>
    </template>
  </div>
</template>

<script>
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
export default {
  name: 'SingleValue',
  props: {
    npmNetworkCycleData: Array,
    npmNetworkLastCycleData: Array,
    npmNetworkName: Array
  },
  data () {
    return {
      unitTypes,
      unitConvert,
      npmNetworkData: [],
      timer: null
    }
  },
  methods: {
    npmNetworkQuantity (cycle, lastCycle) {
      cycle.forEach(t => {
        lastCycle.forEach(e => {
          Object.keys(t).forEach(r => {
            Object.keys(e).forEach(d => {
              if (r === d) {
                t.trend = this.chainCalculation(t[r], e[d]).value
                t.value = this.chainCalculation(t[r], e[d]).total
              }
            })
          })
        })
      })
      this.npmNetworkData = cycle
    },
    chainCalculation (period, pperiod) {
      const periodicData = {}
      if (period > pperiod) {
        periodicData.value = 'up'
        periodicData.total = (period - pperiod) / pperiod
      } else if (period < pperiod) {
        periodicData.value = 'down'
        periodicData.total = (pperiod - period) / pperiod
      } else {
        periodicData.value = ''
        periodicData.total = 0
      }
      return periodicData
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      this.npmNetworkQuantity(this.npmNetworkCycleData, this.npmNetworkLastCycleData)
    }, 500)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>
