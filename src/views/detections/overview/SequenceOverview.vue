<template>
  <div class="detection-detail-overview">
    <div class="overview__left overview__left-new">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1">
          <div v-html="handleDescription"></div>
        </div>
      </div>
      <div class="overview__title">{{ $t('overall.fields') }}</div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.list.eventSeverity') }}</div>
        <div class="row__content">{{ getSeverityByCode(myDetection.severity) || '-' }}</div>
      </div>

      <div v-for="(obj, index) in myDetection.eventInfoList" :key="obj.stage_id">
        <div class="overview__title margin-t-18">{{ $t('detection.detail.stage') }}{{ index + 1 }}</div>
        <div v-for="(item, fields) in obj" :key="fields">
          <div class="overview__row" v-if="fields !== 'stage_id' && fields !== 'recv_time'">
            <div class="row__label row__label__capitalize">{{ fields }}</div>
            <div class="row__content" v-if="item">
              <div v-if="$_.isNumber(item)">
                <div v-if="item > 1000000000">
                  <i class="cn-icon cn-icon-time2 row__content__icon"></i>
                  {{ dateFormatByAppearance(item) }}
                </div>
                <div v-else>{{ item }}</div>
              </div>
              <div v-else>{{ item }}</div>
            </div>
            <div class="row__content" v-else>-</div>
          </div>
        </div>
        <div class="overview__row">
          <div class="row__label">Time</div>
          <div class="row__content">
            <i class="cn-icon cn-icon-time2 row__content__icon"></i>
            {{ obj.recv_time ? dateFormatByAppearance(obj.recv_time) : '-' }}
          </div>
        </div>
      </div>

      <div v-if="eventFlag===detectionEventType.aggregation">
        <div class="overview__title overview__title__margin">{{ $t('detection.timeOfOccurrences') }}</div>
        <div class="overview__row">
          <div class="row__content1">
            <events-timeline :timeFilter="timeFilter" :timeData="timeData" @change="changeTimeline"></events-timeline>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dateFormatByAppearance } from '@/utils/date-util'
import EventsTimeline from './EventsTimeline'
import detectionDetailMixin from '@/views/detections/overview/detectionDetailMixin'
import { getSeverityByCode } from '@/utils/tools'

export default {
  name: 'SequenceOverview',
  mixins: [detectionDetailMixin],
  props: {
    detection: Object,
    timeFilter: Object,
    pageObj: Object,
    eventFlag: String,
    q: String
  },
  components: {
    EventsTimeline
  },
  data () {
    return {}
  },
  methods: {
    dateFormatByAppearance,
    getSeverityByCode
  }
}
</script>
