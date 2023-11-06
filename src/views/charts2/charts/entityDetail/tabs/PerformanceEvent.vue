<template>
  <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
  <chart-no-data v-if="isNoData && !showError"></chart-no-data>

  <div v-if="!isNoData && !showError" class="entity-detail-event-block">
    <div
        class="entity-detail-event-border"
        v-for="(item, index) in eventList"
        :key="item.eventId">
      <div class="cn-detection--list">
        <div class="cn-detection__case entity-detail-performance">
          <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor[item.eventSecurity]}`"></div>
          <div class="cn-detection__row">
            <div class="cn-detection__header">
            <span
                :test-id="`severity-color-block${index}`"
                class="detection-event-severity-color-block"
                :style="`background-color: ${eventSeverityColor[item.eventSeverity]}`">
            </span>
              <span class="detection-event-severity-block" style="margin-right: 30px">
              {{ toUpperCaseByString(item.eventType) || '-' }}
            </span>
              <div class="cn-detection__body">
                <div class="body__basic-info">
                  <div class="basic-info">
                    <div class="basic-info__item" v-if="item.eventSeverity">
                      <i class="cn-icon cn-icon-severity-level"></i>
                      <span>{{ $t('network.severity') }}&nbsp;:&nbsp;&nbsp;</span>
                      <span :test-id="`severity${index}`">{{ changeSecurity(item.eventSeverity) }}</span>
                    </div>
                    <div class="basic-info__item">
                      <i class="cn-icon cn-icon-time2"></i>
                      <span>{{ $t('detection.list.startTime') }}&nbsp;:&nbsp;&nbsp;</span>
                      <span :test-id="`start-time${index}`">{{ dateFormatByAppearance(item.startTime) || '-' }}</span>
                    </div>
                    <div class="basic-info__item">
                      <i class="cn-icon cn-icon-duration"></i>
                      <span>{{ $t('overall.duration') }}&nbsp;:&nbsp;&nbsp;&nbsp;</span>
                      <span :test-id="`duration-time${index}`">{{ unitConvert(item.durationMs, 'time', null, null, 0).join(' ') || '-' }}</span>
                    </div>
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
import { dateFormatByAppearance } from '@/utils/date-util'
import { eventSeverityColor, entityDetailTabsName, securityLevel } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import axios from 'axios'
import { api } from '@/utils/api'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import { toUpperCaseByString } from '@/utils/tools'
import ChartNoData from '@/views/charts/charts/ChartNoData'

export default {
  name: 'PerformanceEvent',
  components: { ChartError, ChartNoData },
  mixins: [chartMixin],
  data () {
    return {
      eventList: [],
      showError: false,
      eventSeverityColor,
      errorMsg: ''
    }
  },
  setup () {
    const { query } = useRoute()
    const entityType = query.entityType
    const entityName = query.entityName

    return {
      entityType,
      entityName
    }
  },
  mounted () {
    // this.initData()
    this.isNoData = true
    this.$emit('checkTag', entityDetailTabsName.performanceEvent, 0)
    this.toggleLoading(true)
    const timer = setTimeout(() => {
      this.toggleLoading(false)
      clearInterval(timer)
    }, 200)
  },
  methods: {
    unitConvert,
    toUpperCaseByString,
    dateFormatByAppearance,
    initData () {
      const params = {
        resource: this.entityName
        // startTime: getSecond(this.timeFilter.startTime),
        // endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)
      axios.get(`${api.entity.performance}/${this.entityType}`, { params: params }).then(response => {
        const res = response.data

        if (response.status === 200) {
          this.isNoData = res.data.result.length === 0
          this.$emit('checkTag', entityDetailTabsName.performanceEvent, res.data.result.length)
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
      this.$emit('checkTag', entityDetailTabsName.performanceEvent, 0)
    },
    changeSecurity (value) {
      if (value) {
        const obj = securityLevel.find(d => d.value === value)
        let label = value
        if (obj) {
          label = this.$t(obj.label)
        }
        return label
      } else {
        return '-'
      }
    }
  }
}
</script>
