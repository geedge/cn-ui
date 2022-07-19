<template>
  <div class="npm-network-quantity">
    <single-value :npm-network-quantity="npmNetworkQuantity"></single-value>
  </div>
</template>

<script>
import SingleValue from '@/views/charts2/charts/SingleValue'

export default {
  name: 'NpmNetworkQuantity',
  components: { SingleValue },
  data () {
    return {
      npmNetworkQuantity: [
        { name: 'networkAppPerformance.tcpConnectionEstablishLatency', value: 6, number: 145, P95: 56, P99: 150, unitType: 'time', trend: 'up' },
        { name: 'networkAppPerformance.httpResponse', value: 6, number: 184, P95: 57, P99: 192, unitType: 'time', trend: 'up' },
        { name: 'networkAppPerformance.sslResponseLatency', value: 2, number: 0.1, P95: 0, P99: 0, unitType: 'time', trend: 'down' },
        { name: 'networkAppPerformance.packetLoss', value: 2, number: 0.0192, P95: 0.0099, P99: 0.0099, unitType: 'percent', trend: 'down' },
        { name: 'overall.packetRetrans', value: 2, number: 0.0386, P95: 0.0299, P99: 0.0416, unitType: 'percent', trend: 'down' }
      ]
    }
  }
}
</script>
