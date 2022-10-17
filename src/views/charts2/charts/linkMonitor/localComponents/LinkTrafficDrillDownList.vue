<template>
  <div class="link-traffic-list">
    <loading :loading="loading"></loading>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('network.total')}}</div>
      <div class="link-traffic-list-center-value">{{unitConvert(lineData[0].analysis.avg, unitTypes.bps).join('')}}</div>
    </div>
    <div class="link-traffic-list-center">
      <div class="link-traffic-list-center-label">{{$t('linkMonitor.bandwidthUsage')}}</div>
      <div class="link-traffic-list-center-value" v-if="bandWidth">{{unitConvert(linkTrafficListData.totalBitsRate / bandWidth, unitTypes.percent).join('')}}</div>
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
import Loading from '@/components/common/Loading'
export default {
  name: 'linkTrafficList',
  mixins: [chartMixin],
  props: {
    lineData: Array
  },
  setup () {
    const { query } = useRoute()
    const queryCondition = ref(query.queryCondition || '')
    return {
      queryCondition
    }
  },
  components: {
    Loading
  },
  data () {
    return {
      unitTypes,
      unitConvert,
      timer: null,
      linkTrafficListData: {},
      cnLinkInfo: JSON.parse(localStorage.getItem(storageKey.linkInfo)),
      bandWidth: 0,
      loading: false
    }
  },
  watch: {
    timeFilter: {
      handler (n) {
        this.linkTrafficData()
      }
    }
  },
  methods: {
    linkTrafficData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      if (this.queryCondition) {
        const condition = this.queryCondition.toLowerCase().split(' or ')
        if (condition.length > 1) {
          params.egressParam = condition.find(c => c.indexOf('common_egress_link_id') > -1 || c.indexOf('egress_link_direction') > -1)
          params.ingressParam = condition.find(c => c.indexOf('common_ingress_link_id') > -1 || c.indexOf('ingress_link_direction') > -1)
        }
      }
      this.loading = true
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
          const condition = this.queryCondition.toLowerCase().split(' or ')
          if (condition.length > 1) {
            let bandwidthAll = 0
            const condition0 = condition[0].split('=')
            const condition1 = condition[1].split('=')
            let ingressLinkId = null
            let egressLinkId = null
            if (condition0[0] && (condition0[0].trim() === 'common_egress_link_id' || condition0[0].trim() === 'egress_link_direction')) {
              egressLinkId = condition0[1].trim()
            }
            if (condition0[0] && (condition0[0].trim() === 'common_ingress_link_id' || condition0[0].trim() === 'ingress_link_direction')) {
              ingressLinkId = condition0[1].trim()
            }
            if (condition1[0] && (condition1[0].trim() === 'common_egress_link_id' || condition1[0].trim() === 'egress_link_direction')) {
              egressLinkId = condition1[1].trim()
            }
            if (condition1[0] && (condition1[0].trim() === 'common_ingress_link_id' || condition1[0].trim() === 'ingress_link_direction')) {
              ingressLinkId = condition1[1].trim()
            }
            this.cnLinkInfo.forEach(e => {
              if (ingressLinkId === e.originalLinkId) {
                bandwidthAll += e.bandwidth
              }
              if (egressLinkId === e.originalLinkId) {
                bandwidthAll += e.bandwidth
              }
            })
            this.bandWidth = bandwidthAll
          }
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.loading = false
      })
    }
  },
  mounted () {
    this.linkTrafficData()
  }
}
</script>
