<template>
  <div>
    <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
    <chart-no-data v-if="isNoData && !showError"></chart-no-data>

    <div v-if="!isNoData && !showError && !loading" class="type-data__column">
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark" ></span>{{ $t('entities.tab.relatedApp') }}&nbsp;&nbsp;({{relatedAppList.length}})</div>
        <div class="type-content">
          <div v-for="entity in relatedAppList" class="data-item">{{entity.appName?entity.appName:entity}}</div>
        </div>
      </div>
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark" ></span>{{ $t('entities.tab.relatedIp') }}&nbsp;&nbsp;({{relatedIpList.length}})</div>
        <div class="type-content">
          <div v-for="entity in relatedIpList" class="data-item">{{entity.ip?entity.ip:entity}}</div>
        </div>
      </div>
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark" ></span>{{ $t('entities.tab.relatedDomain') }}&nbsp;&nbsp;({{relatedDomainList.length}})</div>
        <div class="type-content">
          <div v-for="entity in relatedDomainList"  class="data-item">{{entity.domain?entity.domain:entity}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getNowTime, getSecond } from '@/utils/date-util'
import axios from 'axios'
import { api } from '@/utils/api'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'DomainNameResolution',
  mixins: [chartMixin],
  props: {
  },
  data () {
    return {
      relatedAppList: [],
      relatedIpList: [],
      relatedDomainList: [],
      showError: false,
      errorMsg: '',
      loading: true
    }
  },
  mounted () {
    this.initData()
  },
  setup () {
    const { query } = useRoute()
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime
    // 若url携带了，使用携带的值，否则使用默认值。
    const dateRangeValue = rangeParam ? parseInt(query.range) : 60
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const {
        startTime,
        endTime
      } = getNowTime(60)
      timeFilter.value.startTime = startTime
      timeFilter.value.endTime = endTime
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }
    return {
      timeFilter
    }
  },
  methods: {
    initData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        ip: '116.178.70.242'
      }
      this.loading = true
      this.toggleLoading(true)
      const relatedApp = new Promise(resolve => {
        axios.get(api.entity.domainNameResolutionRelatedApp, { params: params }).then(response => {
          const res = response.data
          if (res.code === 200) {
            this.isNoData = res.data.result.length === 0
            this.showError = false
            if (!this.isNoData) {
              this.relatedAppList = res.data.result
            }
          } else {
            this.httpError(res)
          }
        }).catch(e => {
          // console.error(e)
          this.httpError(e)
        }).finally(() => {
          // this.toggleLoading(false)
          resolve()
        })
      })
      const relatedIp = new Promise(resolve => {
        axios.get(api.entity.domainNameResolutionRelatedIP, { params: params }).then(response => {
          const res = response.data
          if (res.code === 200) {
            this.isNoData = res.data.result.length === 0
            this.showError = false
            if (!this.isNoData) {
              this.relatedIpList = res.data.result
            }
          } else {
            this.httpError(res)
          }
        }).catch(e => {
          // console.error(e)
          this.httpError(e)
        }).finally(() => {
          resolve()
        })
      })
      const relatedDomain = new Promise(resolve => {
        axios.get(api.entity.domainNameResolutionRelatedDomain, { params: params }).then(response => {
          const res = response.data
          if (res.code === 200) {
            this.isNoData = res.data.result.length === 0
            this.showError = false
            if (!this.isNoData) {
              this.relatedDomainList = res.data.result
            }
          } else {
            this.httpError(res)
          }
        }).catch(e => {
          // console.error(e)
          this.httpError(e)
        }).finally(() => {
          resolve()
        })
      })
      Promise.all([relatedApp, relatedIp, relatedDomain]).finally(response => {
        this.toggleLoading(false)
        this.loading = false
      })
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
      this.relatedAppList = ['Wechat', 'baidu', 'Wechat', 'baidu', 'Wechat', 'baidu', 'Wechat']
      this.relatedIpList = ['116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242']
      this.relatedDomainList = ['-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com']
    }
  }
}
</script>
