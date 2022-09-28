<template>
  <div class="link-traffic-list">
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('network.total')}}</div>
      <div class="link-traffic-list-center-value">{{unitConvert(linkTrafficListData.bytesTotal, unitTypes.bps).join('')}}</div>
    </div>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('linkMonitor.bandwidthUsage')}}</div>
      <div class="link-traffic-list-center-value" v-if="bandWidth">{{unitConvert(linkTrafficListData.bytesTotal / bandWidth, unitTypes.percent).join('')}}</div>
      <div class="link-traffic-list-center-value" v-else>-</div>
    </div>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('linkMonitor.npmScore')}}</div>
      <div class="link-traffic-list-center-value">{{linkTrafficListData.npmScore || '-'}}</div>
    </div>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('networkAppPerformance.tcpConnectionEstablishLatency')}}</div>
      <div class="link-traffic-list-center-value">{{unitConvert(Math.floor(linkTrafficListData.establishLatencyMs), unitTypes.time).join('')}}</div>
    </div>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('networkAppPerformance.httpResponse')}}</div>
      <div class="link-traffic-list-center-value">{{unitConvert(Math.floor(linkTrafficListData.httpResponseLatency), unitTypes.time).join('')}}</div>
    </div>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('networkAppPerformance.sslResponseLatency')}}</div>
      <div class="link-traffic-list-center-value">{{unitConvert(Math.floor(linkTrafficListData.sslConLatency), unitTypes.time).join('')}}</div>
    </div>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('networkAppPerformance.packetLoss')}}</div>
      <div class="link-traffic-list-center-value">{{unitConvert(linkTrafficListData.tcpLostlenPercent, unitTypes.percent).join('')}}</div>
    </div>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('overall.packetRetrans')}}</div>
      <div class="link-traffic-list-center-value">{{unitConvert(linkTrafficListData.pktRetransPercent, unitTypes.percent).join('')}}</div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { storageKey, unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSecond } from '@/utils/date-util'
import { computeScore } from '@/utils/tools'
import Login from '@/Login'

export default {
  name: 'linkTrafficList',
  mixins: [chartMixin],
  setup () {
    const { query } = useRoute()
    // const d = `common_egress_link_id='${256}' AND common_ingress_link_id='${256}'`
    const queryCondition = ref(query.queryCondition || '')
    return {
      queryCondition
    }
  },
  data () {
    return {
      unitTypes,
      unitConvert,
      timer: null,
      linkTrafficListData: {},
      cnLinkInfo: JSON.parse(localStorage.getItem(storageKey.linkInfo)),
      bandWidth: 0
    }
  },
  methods: {
    linkTrafficData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      if (this.queryCondition) {
        params.q = this.queryCondition
      }
      this.toggleLoading(true)
      get(api.linkMonitor.networkAnalysis, params).then(res => {
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          const dataArr = [0, 1, 2, 3, 4]
          let scoreAll = 0
          dataArr.forEach(e => {
            const score = computeScore(res.data.result[0], e)
            scoreAll += score
          })
          this.linkTrafficListData = res.data.result[0]
          this.linkTrafficListData.npmScore = Math.ceil(scoreAll * 6)
          if (this.linkTrafficListData.npmScore > 6) {
            this.linkTrafficListData.npmScore = 6
          }
          let condition = ''
          if (this.queryCondition.indexOf('AND') > -1) {
            condition = this.queryCondition.split(/["|'](.*?)["|']/)
          } else {
            condition = this.queryCondition
          }
          this.cnLinkInfo.forEach(e => {
            if (condition.length > 1 && condition[1] === e.originalLinkId) {
              this.bandWidth = e.bandwidth
            }
          })
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.linkTrafficData()
  }
}
</script>
