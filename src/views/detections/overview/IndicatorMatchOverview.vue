<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1">
          ${key} experienced exceptions exceeding the threshold number of times.
        </div>
      </div>
      <div class="overview__title">{{ $t('overall.fields') }}</div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.list.startTime') }}</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ myDetection.startTime ? dateFormatByAppearance(myDetection.startTime) : '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.detail.matchTime') }}</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ myDetection.matchTime ? dateFormatByAppearance(myDetection.matchTime) : '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.clientIp') }}</div>
        <div class="row__content">{{ myDetection.clientIp || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('npm.clientLocation') }}</div>
        <div class="row__content">
          <div>
            <img v-if="myDetection.client_country_region===countryNameIdMapping.Unknown || !countryNameIdMapping[myDetection.client_country_region]" src="../../../../public/images/flag/Unknown.svg" class="filter-country-flag">
            <img v-else :src="require(`../../../../public/images/flag/${countryNameIdMapping[myDetection.client_country_region]}.png`)" class="filter-country-flag" >
          </div>
          {{ myDetection.client_country_region || '-' }}, {{ myDetection.client_super_admin_area || '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.serverIp') }}</div>
        <div class="row__content">{{ myDetection.serverIp || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.detail.serverLocation') }}</div>
        <div class="row__content">
          <div>
            <img v-if="myDetection.server_country_region===countryNameIdMapping.Unknown || !countryNameIdMapping[myDetection.server_country_region]" src="../../../../public/images/flag/Unknown.svg" class="filter-country-flag">
            <img v-else :src="require(`../../../../public/images/flag/${countryNameIdMapping[myDetection.server_country_region]}.png`)" class="filter-country-flag" >
          </div>
          {{ myDetection.server_country_region || '-' }}, {{ myDetection.server_super_admin_area || '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.detail.indicatorValues') }}</div>
        <div class="row__content">{{ myDetection.indicatorValues || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.domain') }}</div>
        <div class="row__content">{{ myDetection.domain || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.app') }}</div>
        <div class="row__content">{{ myDetection.app || '-' }}</div>
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
import detectionDetailMixin from '@/views/detections/overview/detectionDetailMixin'
import { countryNameIdMapping } from '@/utils/constants'
import EventsTimeline from '@/views/detections/overview/EventsTimeline'
export default {
  name: 'IndicatorMatchOverview',
  mixins: [detectionDetailMixin],
  props: {
    detection: Object,
    timeFilter: Object,
    q: String
  },
  components: {
    EventsTimeline
  },
  data () {
    return {
      countryNameIdMapping
    }
  },
  methods: {
    dateFormatByAppearance
  }
}
</script>
