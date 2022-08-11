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
        { name: 'networkAppPerformance.tcpConnectionEstablishLatency' },
        { name: 'networkAppPerformance.httpResponse' },
        { name: 'networkAppPerformance.sslResponseLatency' },
        { name: 'networkAppPerformance.packetLoss' },
        { name: 'overall.packetRetrans' }
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
      const tcp = get(api.npm.overview.tcpSessionDelay, params)
      const http = get(api.npm.overview.httpResponseDelay, params)
      const ssl = get(api.npm.overview.sslConDelay, params)
      const tcpPercent = get(api.npm.overview.tcpLostlenPercent, params)
      const packetPercent = get(api.npm.overview.packetRetransPercent, params)
      Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
        res.forEach(t => {
          if (t.code === 200) {
            this.npmNetworkCycleData.push(t.data.result)
          }
        })
      })
    },
    npmNetworkLastCycleQuery () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        cycle: 1
      }
      const tcp = get(api.npm.overview.tcpSessionDelay, params)
      const http = get(api.npm.overview.httpResponseDelay, params)
      const ssl = get(api.npm.overview.sslConDelay, params)
      const tcpPercent = get(api.npm.overview.tcpLostlenPercent, params)
      const packetPercent = get(api.npm.overview.packetRetransPercent, params)
      Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
        res.forEach(t => {
          if (t.code === 200) {
            this.npmNetworkLastCycleData.push(t.data.result)
          }
        })
      })
    }
  },
  mounted () {
    this.npmNetworkCycleQuery()
    this.npmNetworkLastCycleQuery()
  }
}
</script>
