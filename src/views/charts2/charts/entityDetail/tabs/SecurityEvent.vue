<template>
  <chart-error v-if="showError" class="entity-detail-event-error"></chart-error>
  <chart-no-data v-if="isNoData && !showError"></chart-no-data>

  <div v-if="!isNoData && !showError" class="entity-detail-event-block">
    <div
        class="entity-detail-event-border"
        v-for="item in eventList"
        :key="item.eventId">
      <div class="cn-detection--list">
        <div class="cn-detection__case entity-detail-security">
          <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor1[item.eventSecurity]}`"></div>
          <div class="cn-detection__row">
            <div class="cn-detection__header">
          <span
              class="detection-event-severity-color-block"
              :style="`background-color: ${eventSeverityColor1[item.eventSeverity]}`">
          </span>
              <span class="detection-event-severity-block">{{ item.securityType || '-' }}</span>
              <i class="cn-icon cn-icon-attacker"></i>{{ item.offenderIp || '-' }}
              <div class="domain">{{ item.offenderDomain }}</div>
              <span class="line">-------</span>
              <span class="circle"></span>
              <i class="cn-icon cn-icon-attacked"></i>{{ item.victimIp || '-' }}
              <div class="domain">{{ item.victimDomain }}</div>
            </div>
            <div class="cn-detection__body">
              <div class="body__basic-info">
                <div class="basic-info">
                  <div class="basic-info__item" v-if="item.eventSecurity">
                    <i class="cn-icon cn-icon-severity-level"></i>
                    <span>{{ $t('detection.list.eventSecurity') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.eventSecurity || '-' }}</span>
                  </div>
                  <div class="basic-info__item" v-if="item.eventSeverity">
                    <i class="cn-icon cn-icon-severity-level"></i>
                    <span>{{ $t('network.severity') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.eventSeverity || '-' }}</span>
                  </div>
                  <div class="basic-info__item" v-if="item.eventType">
                    <i class="cn-icon cn-icon-event-type"></i>
                    <span>{{ $t('detections.eventType') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.eventType || '-' }}</span>
                  </div>
                  <div class="basic-info__item" v-if="item.malwareName">
                    <i class="cn-icon cn-icon-trojan"></i>
                    <span>{{ $t('detection.list.malwareName') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.malwareName || '-' }}</span>
                  </div>
                  <div class="basic-info__item" v-if="item.cryptominingPool">
                    <i class="cn-icon cn-icon-mining-pool"></i>
                    <span>{{ $t('detection.list.cryptominingPool') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.cryptominingPool || '-' }}</span>
                  </div>
                  <div class="basic-info__item">
                    <i class="cn-icon cn-icon-time2"></i>
                    <span>{{ $t('detection.list.startTime') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ dateFormatByAppearance(item.startTime) || '-' }}</span>
                  </div>
                  <div class="basic-info__item">
                    <i class="cn-icon cn-icon-Duration"></i>
                    <span>{{ $t('overall.duration') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ unitConvert(item.durationMs, 'time', null, null, 0).join(' ') || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getNowTime, getSecond } from '@/utils/date-util'
import { eventSeverityColor1 } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import axios from 'axios'
import { api } from '@/utils/api'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'SecurityEvent',
  mixins: [chartMixin],
  data () {
    return {
      eventList: [],
      showError: false,
      eventSeverityColor1
    }
  },
  setup () {
    const { query } = useRoute()
    const entityType = query.entityType
    const entityName = query.entityName
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime
    // 若url携带了，使用携带的值，否则使用默认值。

    const dateRangeValue = rangeParam ? parseInt(query.range) : 60
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(60)
      timeFilter.value.startTime = startTime
      timeFilter.value.endTime = endTime
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }

    return {
      entityType,
      entityName,
      timeFilter
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    unitConvert,
    initData () {
      const params = {
        type: this.entityType,
        name: this.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)
      axios.get(api.entity.securityEvent, { params: params }).then(response => {
        const res = response.data

        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.showError = false
          if (!this.isNoData) {
            this.eventList = res.data.result
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    }
  }
}
</script>
