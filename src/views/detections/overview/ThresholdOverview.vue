<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1">
          ${key} experienced exceptions exceeding the threshold number of times.
        </div>
      </div>
      <div class="overview__title">{{ $t('overall.summary') }}</div>
      <div class="overview__row overview__row__display">
        <div class="row__content1">
          <div class="row__content__charts" :id="`myChart${detection.eventId}`"></div>
        </div>
        <div class="row__content1">
          <div class="charts__visual__map"></div>
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
import { lineOption } from '@/views/detections/options/detectionOptions'
import { detectionEventType } from '@/utils/constants'
import EventsTimeline from '@/views/detections/overview/EventsTimeline'
import detectionDetailMixin from '@/views/detections/overview/detectionDetailMixin'

export default {
  name: 'ThresholdOverview',
  props: {
    detection: Object,
    timeFilter: Object,
    eventFlag: String,
    q: String
  },
  mixins: [detectionDetailMixin],
  components: {
    EventsTimeline
  },
  data () {
    return {
      myChart: null,
      lineOption: lineOption,
      myDetection: {},
      detectionEventType
    }
  },
  mounted () {
    window.addEventListener('resize', this.resize)
    this.myDetection = this.detection
  },
  methods: {
    resize () {
      if (this.myChart) {
        this.myChart.resize()
      }
    }
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.resize)
  }
}
</script>
