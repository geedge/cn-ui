<template>
  <div class="npm-network-quantity">
    <single-value
      :npm-network-cycle-data="npmNetworkCycleData"
      :npm-network-name="npmNetworkName"
      :time-filter="timeFilter"
    ></single-value>
  </div>
</template>

<script>
import SingleValue from '@/views/charts2/charts/SingleValue'
import { get } from '@/utils/http'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
export default {
  name: 'NpmNetworkQuantity',
  components: { SingleValue },
  mixins: [chartMixin],
  data () {
    return {
      npmNetworkName: [
        { name: 'networkAppPerformance.tcpConnectionEstablishLatency' },
        { name: 'networkAppPerformance.httpResponse' },
        { name: 'networkAppPerformance.sslResponseLatency' },
        { name: 'networkAppPerformance.packetLoss' },
        { name: 'overall.packetRetrans' }
      ],
      npmNetworkCycleData: []
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
      this.toggleLoading(true)
      Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
        res.forEach(t => {
          if (t.code === 200) {
            this.npmNetworkCycleData.push(t.data.result)
          }
        })
      }).finally(() => {
        this.toggleLoading(false)
      })
    }

  },
  mounted () {
    this.npmNetworkCycleQuery()
  }
}
</script>
