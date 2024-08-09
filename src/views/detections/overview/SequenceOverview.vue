<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1">
          ${key} experienced exceptions exceeding the threshold number of times.
        </div>
      </div>

      <div class="overview__title">{{ $t('detection.detail.stage') }}1</div>
      <div class="overview__row">
        <div class="row__label">Dns_query</div>
        <div class="row__content">{{ $_.get(myDetection, 'eventInfoList[0].domain', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">Time</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ myDetection.startTime ? dateFormatByAppearance(myDetection.startTime) : '-' }}
        </div>
      </div>
      <div class="overview__title">{{ $t('detection.detail.stage') }}2</div>
      <div class="overview__row">
        <div class="row__label">Decoded_as</div>
        <div class="row__content">{{ $_.get(myDetection, 'eventInfoList[1].client_ip', '-') || '-' }}</div>
      </div>

      <div class="overview__row">
        <div class="row__label">APP</div>
        <div class="row__content">{{ $_.get(myDetection, 'eventInfoList[1].app_transition', '-') || '-' }}</div>
      </div>

      <div class="overview__row">
        <div class="row__label">Time</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ myDetection.startTime ? dateFormatByAppearance(myDetection.startTime) : '-' }}
        </div>
      </div>

      <div v-if="eventFlag===detectionEventType.aggregation">
        <div class="overview__title" style="margin: 10px 0;">{{ $t('detection.timeOfOccurrences') }}</div>
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
