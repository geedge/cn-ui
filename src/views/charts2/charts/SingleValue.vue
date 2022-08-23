<template v-if="npmNetworkData.length > 0">
  <div class="single-value" v-for="(npm, index) in npmNetworkData" :key="index">
    <template v-if="index === 0">
      <div class="single-value__title">{{$t(npmNetworkName[index].name)}}</div>
      <div class="single-value__content">
        <div class="single-value__content-number">{{unitConvert(npm.establishLatencyAvg, unitTypes.time).join(' ')}}</div>
        <div v-if="npm.value > 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.value < 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('').replaceAll('-', '')}}
        </div>
        <div v-else-if="npm.value === 0" class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
        <div v-else></div>
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
        <div v-if="npm.value > 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.value < 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('').replaceAll('-', '')}}
        </div>
        <div v-else-if="npm.value === 0" class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
        <div v-else></div>
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
        <div v-if="npm.value > 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.value < 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('').replaceAll('-', '')}}
        </div>
        <div v-else-if="npm.value === 0" class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
        <div v-else></div>
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
        <div v-if="npm.value > 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.value < 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('').replaceAll('-', '')}}
        </div>
        <div v-else-if="npm.value === 0" class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
        <div v-else></div>
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
        <div v-if="npm.value > 0" class="single-value__content-trend single-value__content-trend-red">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('')}}
        </div>
        <div v-else-if="npm.value < 0" class="single-value__content-trend single-value__content-trend-green">
          <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(npm.value, unitTypes.percent).join('').replaceAll('-', '')}}
        </div>
        <div v-else-if="npm.value === 0" class="single-value__content-trend single-value__content-trend-black">
          <i class="cn-icon-constant cn-icon"></i>
        </div>
        <div v-else></div>
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
    npmNetworkName: Array,
    npmNetworkData: Array
  },
  data () {
    return {
      unitTypes,
      unitConvert
    }
  }
}
</script>
