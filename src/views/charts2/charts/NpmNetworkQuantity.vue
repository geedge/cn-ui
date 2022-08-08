<template>
  <div class="npm-network-quantity">
    <single-value
      :npm-network-cycle-data="npmNetworkCycleData"
      :npm-network-last-cycle-data="npmNetworkLastCycleData"
      :npm-network-name="npmNetworkName"
    ></single-value>
  </div>
</template>

<script>
import SingleValue from '@/views/charts2/charts/SingleValue'
import { get } from '@/utils/http'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'

export default {
  name: 'NpmNetworkQuantity',
  components: { SingleValue },
  props: {
    chart: Object,
    timeFilter: Object
  },
  data () {
    return {
      npmNetworkName: [
        { name: 'networkAppPerformance.tcpConnectionEstablishLatency'},
        { name: 'networkAppPerformance.httpResponse'},
        { name: 'networkAppPerformance.sslResponseLatency'},
        { name: 'networkAppPerformance.packetLoss'},
        { name: 'overall.packetRetrans'}
      ],
      npmNetworkCycleData: [],
      npmNetworkLastCycleData: []
    }
  },
  methods: {
    npmNetworkCycleQuery () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 0
      }
      // const tcp = get(api.npm.overview.tcpSessionDelay, params)
      // const http = get(api.npm.overview.httpResponseDelay, params)
      // const ssl = get(api.npm.overview.sslConDelay, params)
      // const tcpPercent = get(api.npm.overview.tcpLostlenPercent, params)
      // const packetPercent = get(api.npm.overview.packetRetransPercent, params)
      this.npmNetworkCycleData = [
        {
          establishLatencyAvg: 0.51,
          establishLatencyP50: 0.16,
          establishLatencyP90: 0.12,
          establishLatencyP95: 0.34,
          establishLatencyP99: 0.73
        }, {
          httpResponseLatencyAvg: 0.52,
          httpResponseLatencyP50: 0.16,
          httpResponseLatencyP90: 0.12,
          httpResponseLatencyP95: 0.34,
          httpResponseLatencyP99: 0.73
        }, {
          sslConLatencyAvg: 0.53,
          sslConLatencyP50: 0.16,
          sslConLatencyP90: 0.12,
          sslConLatencyP95: 0.34,
          sslConLatencyP99: 0.73
        }, {
          sequenceGapLossAvg: 0.54,
          sequenceGapLossP50: 0.16,
          sequenceGapLossP90: 0.12,
          sequenceGapLossP95: 0.34,
          sequenceGapLossP99: 0.73
        }, {
          pktRetransAvg: 0.55,
          pktRetransP50: 0.16,
          pktRetransP90: 0.12,
          pktRetransP95: 0.34,
          pktRetransP99: 0.73
        }
      ]
      // Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
      //   if (res.code === 200) {
      //     console.log(res)
      //   }
      // })
    },
    npmNetworkLastCycleQuery () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 1
      }
      // const tcp = get(api.npm.overview.tcpSessionDelay, params)
      // const http = get(api.npm.overview.httpResponseDelay, params)
      // const ssl = get(api.npm.overview.sslConDelay, params)
      // const tcpPercent = get(api.npm.overview.tcpLostlenPercent, params)
      // const packetPercent = get(api.npm.overview.packetRetransPercent, params)
      this.npmNetworkLastCycleData = [
        {
          establishLatencyAvg: 0.64
        },
        {
          httpResponseLatencyAvg: 0.34
        },
        {
          sslConLatencyAvg: 0.86
        },
        {
          sequenceGapLossAvg: 0.32
        },
        {
          pktRetransAvg: 0.66
        }
      ]
      // Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
      //   if (res.code === 200) {
      //     console.log(res)
      //   }
      // })
    }
  },
  mounted () {
    this.npmNetworkCycleQuery()
    this.npmNetworkLastCycleQuery()
  }
}
</script>
