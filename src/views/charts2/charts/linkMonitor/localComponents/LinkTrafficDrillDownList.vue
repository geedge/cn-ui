<template>
  <div class="link-traffic-list">
    <loading :loading="loading"></loading>

    <chart-error v-if="showError" :content="errorMsg" />
    <div v-else>
      <div class="link-traffic-list-center">
        <div class="link-traffic-list-center-label">{{$t('network.total')}}</div>
        <div class="link-traffic-list-center-value" v-if="lineData && lineData.analysis" test-id="line-tabContent">
          <span>{{unitConvert(lineData.analysis.avg, unitTypes.number)[0]}}</span>
          <span>
            <span>{{unitConvert(lineData.analysis.avg, unitTypes.number)[1]}}</span>
            <span v-if="lineData.unitType">{{lineData.unitType}}</span>
          </span>
        </div>
      </div>
      <div class="link-traffic-list-center">
        <div class="link-traffic-list-center-label">{{$t('linkMonitor.bandwidthUsage')}}</div>
        <div class="link-traffic-list-center-value" v-if="lineData && lineData.analysis && bandWidth" test-id="line-percent">{{unitConvert(lineData.analysis.avg / bandWidth, unitTypes.percent).join('')}}</div>
        <div class="link-traffic-list-center-value" v-else>-</div>
      </div>
      <div class="link-traffic-list-center">
        <div class="link-traffic-list-center-label">{{$t('linkMonitor.npmScore')}}</div>
        <div class="link-traffic-list-center-value" test-id="line-score">{{linkTrafficListData.npmScore || '-'}}</div>
      </div>
      <div class="link-traffic-list-center">
        <div class="link-traffic-list-center-label">{{$t('networkAppPerformance.tcpConnectionEstablishLatency')}}</div>
        <div class="link-traffic-list-center-value" test-id="line-tcp">{{unitConvert(Math.floor(linkTrafficListData.establishLatencyMs), unitTypes.time).join('')}}</div>
      </div>
      <div class="link-traffic-list-center">
        <div class="link-traffic-list-center-label">{{$t('networkAppPerformance.httpResponse')}}</div>
        <div class="link-traffic-list-center-value" test-id="line-http">{{unitConvert(Math.floor(linkTrafficListData.httpResponseLatency), unitTypes.time).join('')}}</div>
      </div>
      <div class="link-traffic-list-center">
        <div class="link-traffic-list-center-label">{{$t('networkAppPerformance.sslResponseLatency')}}</div>
        <div class="link-traffic-list-center-value" test-id="line-ssl">{{unitConvert(Math.floor(linkTrafficListData.sslConLatency), unitTypes.time).join('')}}</div>
      </div>
      <div class="link-traffic-list-center">
        <div class="link-traffic-list-center-label">{{$t('networkAppPerformance.packetLoss')}}</div>
        <div class="link-traffic-list-center-value" test-id="line-packetLoss">{{unitConvert(linkTrafficListData.tcpLostlenPercent, unitTypes.percent).join('')}}</div>
      </div>
      <div class="link-traffic-list-center">
        <div class="link-traffic-list-center-label">{{$t('overall.packetRetrans')}}</div>
        <div class="link-traffic-list-center-value" test-id="line-packetRetrans">{{unitConvert(linkTrafficListData.pktRetransPercent, unitTypes.percent).join('')}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { storageKey, unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import { api } from '@/utils/api'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSecond } from '@/utils/date-util'
import { computeScore } from '@/utils/tools'
import Loading from '@/components/common/Loading'
import ChartError from '@/components/common/Error'
import axios from 'axios'
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
    ChartError,
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
      loading: false,
      showError: false,
      errorMsg: ''
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
          // params.egressParam = true
          params.egressParam = condition.find(c => c.indexOf('common_egress_link_id') > -1 || c.indexOf('egress_link_direction') > -1)
          params.ingressParam = condition.find(c => c.indexOf('common_ingress_link_id') > -1 || c.indexOf('ingress_link_direction') > -1)
          let bandwidthAll = 0
          let ingressLinkId = null
          let egressLinkId = null
          let linkDirection = null
          const egressParamSplit = params.egressParam.split('=')
          const ingressParamSplit = params.ingressParam.split('=')
          if (egressParamSplit[0] && (egressParamSplit[0].trim() === 'common_egress_link_id')) {
            egressLinkId = egressParamSplit[1].trim()
          } else if (egressParamSplit[0].trim() === 'egress_link_direction') {
            linkDirection = egressParamSplit[1].trim()
          }
          if (ingressParamSplit[0] && (ingressParamSplit[0].trim() === 'common_ingress_link_id')) {
            ingressLinkId = ingressParamSplit[1].trim()
          }
          if (egressLinkId && ingressLinkId) {
            this.cnLinkInfo.forEach(e => {
              if (ingressLinkId === e.originalLinkId) {
                bandwidthAll += e.bandwidth
              }
              if (egressLinkId === e.originalLinkId) {
                bandwidthAll += e.bandwidth
              }
            })
          } else if (linkDirection) {
            this.cnLinkInfo.forEach(e => {
              if (linkDirection === `'${e.nextHop}'`) {
                bandwidthAll += e.bandwidth
              }
            })
          }
          this.bandWidth = bandwidthAll
        }
      }
      this.loading = true
      axios.get(api.linkMonitor.networkAnalysis, { params: params }).then(res => {
        res = res.data
        if (res.code === 200) {
          this.showError = false
          this.isNoData = res.data.result.length === 0
          const data = {
            establishLatencyMs: res.data.result[0].establishLatencyMs || null,
            httpResponseLatency: res.data.result[0].httpResponseLatency || null,
            sslConLatency: res.data.result[0].sslConLatency || null,
            tcpLostlenPercent: res.data.result[0].tcpLostlenPercent || null,
            pktRetransPercent: res.data.result[0].pktRetransPercent || null
          }
          this.linkTrafficListData = res.data.result[0]
          this.linkTrafficListData.npmScore = computeScore(data)
        } else {
          this.showError = true
          this.errorMsg = res.message
        }
      }).catch(e => {
        this.showError = true
        this.errorMsg = e.message
        this.isNoData = false
      }).finally(() => {
        this.loading = false
      })
    }
  },
  mounted () {
    this.linkTrafficData()
  },
  beforeUnmount () {
    this.unitConvert = null
  }
}
</script>
