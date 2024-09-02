<template>
  <div class="detection-detail__loading" v-if="loading">
    <loading :loading="loading" class="detail__loading" :style="`top:${loadingTop}px;`"></loading>
  </div>
  <div class="detection-detail-overview">
    <div class="overview__left overview__left-new">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1">
          <div v-html="handleDescription"></div>
        </div>
      </div>

      <div v-if="isExpire">
        <div class="data-expired">
          {{ $t('detection.detail.dataExpired') }}
        </div>
      </div>
      <div v-else>
        <div class="overview__title">{{ $t('overall.fields') }}</div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detection.list.startTime') }}</div>
          <div class="row__content">
            <i class="cn-icon cn-icon-time2 row__content__icon"></i>
            {{ dateFormatByAppearance(myDetection.startTime) || '-' }}
          </div>
        </div>
        <div class="overview__row" v-if="myDetection.endTime">
          <div class="row__label" v-if="parseInt(detection.status)===0">{{$t('detection.lastTime')}}</div>
          <div class="row__label" v-if="parseInt(detection.status)===1">{{$t('detection.list.endTime')}}</div>
          <div class="row__content">
            <i class="cn-icon cn-icon-time2 row__content__icon"></i>
            {{ dateFormatByAppearance(myDetection.endTime) || '-' }}
          </div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('overall.duration') }}</div>
          <div class="row__content">
            <i class="cn-icon cn-icon-duration row__content__icon"></i>
            <div v-if="parseInt(myDetection.durationS) > 10">
              {{unitConvert(parseInt(myDetection.durationS), 'time', 's', null, 0).join(' ') || '-'}}
            </div>
            <div v-if="parseInt(myDetection.durationS) <= 10">{{ $t('detection.list.lastingSeconds')}}</div>
          </div>
        </div>
        <div class="overview__row" v-if="myDetection.status === 0">
          <div class="row__label">{{ $t('overall.status') }}</div>
          <div class="row__content">
            <div class="detection-row-active">{{ $t('detections.active') }}</div>
          </div>
        </div>
        <div class="overview__title">{{ $t('overall.summary') }}</div>
        <div class="overview__row overview__row__display">
          <div class="row__content1">
            <div class="row__content__charts" :ref="`myChart${myDetection.eventId}`" :id="`myChart${myDetection.eventId}`"></div>
          </div>
          <div class="row__content1" v-if="seriesDataNum>1">
            <div class="charts__visual__map">
              <div v-for="item in mapColor" :key="item.startTime" :style="`background: ${item.color};width:${item.width};`"></div>
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
              <events-timeline :timeFilter="timeFilter" :timeData="timeData" :lineWidth="lineWidth" :activeIndex="activeIndex" @change="changeTimeline"></events-timeline>
            </div>
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
