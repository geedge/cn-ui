<template>
  <div class="detection-detail-overview">
    <div class="overview__left overview__left-new">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1">
          <div v-html="handleDescription"></div>
        </div>
      </div>
      <div class="overview__title">{{ $t('overall.summary') }}</div>
      <div class="overview__row overview__row__display">
        <div class="row__content1">
          <div class="row__content__charts" :id="`myChart${detection.eventId}`"></div>
        </div>
        <div class="row__content1" v-if="seriesDataNum>1">
          <div class="charts__visual__map">
            <div v-for="(item, index) in mapColor" :key="index" :style="`background: ${item};`"></div>
          </div>
        </div>
        <div class="row__content1 row__display">
          <div v-for="(item, index) in markLineData" :key="item.label" class="row__mark__line" @click="highLightMarkLine(index)">
            <div class="mark__line__block" :style="{background: item.itemStyle.color}"></div>
            <div class="mark__line__text">{{ item.label }}</div>
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
