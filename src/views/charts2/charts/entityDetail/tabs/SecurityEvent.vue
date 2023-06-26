<template>
  <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
  <chart-no-data v-if="isNoData && !showError" test-id="no-data"></chart-no-data>

  <div v-if="!isNoData && !showError" class="entity-detail-event-block">
    <div
        class="entity-detail-event-border"
        v-for="(item, index) in eventList"
        :key="item.eventId">
      <div class="cn-detection--list">
        <div class="cn-detection__case entity-detail-security">
          <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor[item.eventSecurity]}`"></div>
          <div class="cn-detection__row">
            <div class="cn-detection__header">
              <span
                  :test-id="`severity-color-block${index}`"
                  class="detection-event-severity-color-block"
                  :style="`background-color: ${eventSeverityColor[item.eventSeverity]}`">
              </span>
              <span class="detection-event-severity-block">{{ toUpperCaseByString(item.securityType) || '-' }}</span>
              <i class="cn-icon cn-icon-attacker"></i>
              <span :test-id="`offender-ip${index}`">{{ item.offenderIp || '-' }}</span>
              <div class="domain">{{ item.offenderDomain }}</div>
              <span class="line">-------</span>
              <span class="circle"></span>
              <i class="cn-icon cn-icon-attacked"></i>
              <span :test-id="`victim-ip${index}`">{{ item.victimIp || '-' }}</span>
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
                    <span>{{ toUpperCaseByString(item.eventSeverity) || '-' }}</span>
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
                    <i class="cn-icon cn-icon-duration"></i>
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
import { getSecond, dateFormatByAppearance } from '@/utils/date-util'
import { eventSeverityColor, entityDetailTabsName } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import axios from 'axios'
import { api } from '@/utils/api'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'
import { toUpperCaseByString } from '@/utils/tools'
import chartNoData from '@/views/charts/charts/ChartNoData'

export default {
  name: 'SecurityEvent',
  mixins: [chartMixin],
  data () {
    return {
      eventList: [],
      showError: false,
      eventSeverityColor,
      errorMsg: ''
    }
  },
  components: { chartNoData },
  setup () {
    const { query } = useRoute()
    const entityType = query.entityType
    const entityName = query.name

    return {
      entityType,
      entityName
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    unitConvert,
    toUpperCaseByString,
    dateFormatByAppearance,
    initData () {
      const params = {
        resource: this.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)
      axios.get(`${api.entity.security}/${this.entityType}`, { params: params }).then(response => {
        const res = response.data

        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.$emit('checkTag', entityDetailTabsName.securityEvent, res.data.result.length)
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
