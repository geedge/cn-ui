<template>
  <chart-no-data v-if="isNoData && !showError"></chart-no-data>
  <div
      class="detection-border"
      v-for="item in eventList"
      :key="item.eventId"
      style="margin-bottom: 10px;">
    <div class="cn-detection--list">
      <div class="cn-detection__case" style="height: 46px">
        <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor1[item.eventSecurity]}`"></div>
        <div class="cn-detection__row">
          <div class="cn-detection__header">
            <span
                class="detection-event-severity-color-block"
                :style="`background-color: ${eventSeverityColor1[item.eventSeverity]}`">
            </span>
            <span class="detection-event-severity-block" style="margin-right: 30px">
              {{ item.eventType || '-' }}
            </span>
            <div class="cn-detection__body">
              <div class="body__basic-info">
                <div class="basic-info">
                  <div class="basic-info__item" v-if="item.eventSeverity">
                    <i class="cn-icon cn-icon-severity-level"></i>
                    <span>{{ $t('network.severity') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.eventSeverity || '-' }}</span>
                  </div>
                  <div class="basic-info__item">
                    <i class="cn-icon cn-icon-time2"></i>
                    <span>{{ $t('detection.list.startTime') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ dateFormatByAppearance(item.startTime) || '-' }}</span>
                  </div>
                  <div class="basic-info__item">
                    <i class="cn-icon cn-icon-Duration"></i>
                    <span>{{ $t('overall.duration') }}&nbsp;:&nbsp;&nbsp;&nbsp;</span>
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
import { getMillisecond, getNowTime, getSecond } from '@/utils/date-util'
import { eventSeverityColor1 } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import axios from '_axios@0.21.4@axios'
import { api } from '@/utils/api'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'PerformanceEvent',
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
  mounted () {
    this.initData()
  },
  computed: {
    pointColor () {
      return function (item) {
        let color = '#8FA1BE'
        if (item.startTime && item.endTime) {
          if (getMillisecond(item.endTime) - getMillisecond(item.startTime) < 5 * 60 * 1000) {
            color = '#D84C4C'
          }
        }
        return { backgroundColor: color }
      }
    }
  },
  methods: {
    unitConvert,
    initData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)
      axios.get(api.entity.performanceEvent, { params: params }).then(response => {
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

<style scoped>
.detection-border {
  border: 1px solid #E2E5EC;
  border-radius: 4px;
}

.basic-info__item-duration {
  display: inline-block;
  height: 6px;
  width: 6px;
  border-radius: 50%;
  margin-right: 8px;
}
</style>
