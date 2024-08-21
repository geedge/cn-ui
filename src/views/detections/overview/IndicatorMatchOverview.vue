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
        <div class="row__label">{{ $t('detection.list.startTime') }}</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ myDetection.startTime ? dateFormatByAppearance(myDetection.startTime) : '-' }}
        </div>
      </div>
      <div class="overview__row" v-if="myDetection.endTime">
        <div class="row__label">{{ $t('detection.list.endTime') }}</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ myDetection.endTime ? dateFormatByAppearance(myDetection.endTime) : '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.duration') }}</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-duration row__content__icon"></i>
          {{ unitConvert(parseInt(detection.durationS), 'time', 's', null, 0).join(' ') || '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.list.eventSeverity') }}</div>
        <div class="row__content">{{ getSeverityByCode(myDetection.severity) || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.clientIp') }}</div>
        <div class="row__content">{{ myDetection.clientIp || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.clientLocation') }}</div>
        <div class="row__content">
          <div v-if="myDetection.clientCountryRegion">
            <span>
              <img v-if="myDetection.clientCountryRegion===countryNameIdMapping.Unknown || !countryNameIdMapping[myDetection.clientCountryRegion]" src="../../../../public/images/flag/Unknown.svg" class="filter-country-flag">
              <img v-else :src="require(`../../../../public/images/flag/${countryNameIdMapping[myDetection.clientCountryRegion]}.png`)" class="filter-country-flag" >
            </span>
            {{ myDetection.clientCountryRegion || '-' }}, {{ myDetection.clientSuperAdminArea || '-' }}
          </div>
          <div v-else>-</div>
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.serverIp') }}</div>
        <div class="row__content">{{ myDetection.serverIp || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.detail.serverLocation') }}</div>
        <div class="row__content">
          <div v-if="myDetection.serverCountryRegion">
            <span>
              <img v-if="myDetection.serverCountryRegion===countryNameIdMapping.Unknown || !countryNameIdMapping[myDetection.serverCountryRegion]" src="../../../../public/images/flag/Unknown.svg" class="filter-country-flag">
              <img v-else :src="require(`../../../../public/images/flag/${countryNameIdMapping[myDetection.serverCountryRegion]}.png`)" class="filter-country-flag" >
            </span>
            {{ myDetection.serverCountryRegion || '-' }}, {{ myDetection.serverSuperAdminArea || '-' }}
          </div>
          <div v-else>-</div>
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
import unitConvert from '@/utils/unit-convert'
import { getSeverityByCode } from '@/utils/tools'
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
    dateFormatByAppearance,
    unitConvert,
    getSeverityByCode
  }
}
</script>
