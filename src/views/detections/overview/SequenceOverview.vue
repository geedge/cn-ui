<template>
  <div class="detection-detail-overview">
    <div class="overview__left overview__left-new">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1">
          <div v-html="handleDescription"></div>
        </div>
      </div>

      <div v-for="(obj, index) in myDetection.eventInfoList" :key="obj.stage_id">
        <div class="overview__title margin-t-18">{{ $t('detection.detail.stage') }}{{ index + 1 }}</div>
        <div v-for="(item, fields) in obj" :key="fields">
          <div class="overview__row" v-if="fields !== 'stage_id'">
            <div class="row__label row__label__capitalize">{{ fields }}</div>
            <div class="row__content">{{ item || '-' }}</div>
          </div>
        </div>
        <div class="overview__row">
          <div class="row__label">Time</div>
          <div class="row__content">
            <i class="cn-icon cn-icon-time2 row__content__icon"></i>
            {{ myDetection.startTime ? dateFormatByAppearance(myDetection.startTime) : '-' }}
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
    dateFormatByAppearance
  }
}
</script>
