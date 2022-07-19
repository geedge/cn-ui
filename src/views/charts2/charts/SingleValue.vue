<template>
  <div class="single-value" v-for="npm in npmNetworkQuantity" :key="npm.name">
    <div class="single-value__title">{{$t(npm.name)}}</div>
    <div class="single-value__content">
      <div class="single-value__content-number">{{unitConvert(npm.number, npm.unitType).join(' ')}}</div>
      <div class="single-value__content-value" :class="npm.trend === 'up' ? 'red' : 'green'">
        <div><i class="cn-icon" :class="npm.trend === 'up' ? 'cn-icon-rise1' : 'cn-icon-decline'"></i></div>
        <div>{{npm.value}}%</div>
      </div>
    </div>
    <div class="single-value__circle">
      <div class="single-value__circle-p95">P95: {{unitConvert(npm.P95, npm.unitType).join(' ')}}</div>
      <div class="single-value__circle-p99">P99: {{unitConvert(npm.P99, npm.unitType).join(' ')}}</div>
    </div>
  </div>
</template>

<script>
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'

export default {
  name: 'SingleValue',
  props: {
    npmNetworkQuantity: Array
  },
  data () {
    return {
      unitTypes,
      unitConvert
    }
  }
}
</script>
