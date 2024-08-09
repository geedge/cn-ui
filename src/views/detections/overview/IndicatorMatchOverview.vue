<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1">
          ${key} experienced exceptions exceeding the threshold number of times.
        </div>
      </div>
<!--      <div class="overview__title">{{ $t('overall.summary') }}</div>-->
      <div class="overview__title">{{ $t('overall.fields') }}</div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.list.startTime') }}</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ detection.startTime ? dateFormatByAppearance(detection.startTime) : '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.detail.matchTime') }}</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ detection.startTime ? dateFormatByAppearance(detection.startTime) : '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.clientIp') }}</div>
<!--        <div class="row__content">{{ detection.victimIp || '-' }}</div>-->
        <div class="row__content">192.168.12.34</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('npm.clientLocation') }}</div>
        <div class="row__content">
          <div>
<!--          <div v-if="$_.get(basicInfo, 'victimInfo.location.country')">-->
<!--            <img v-if="basicInfo.victimInfo.location.country===countryNameIdMapping.Unknown || !countryNameIdMapping[basicInfo.victimInfo.location.country]" src="../../../../public/images/flag/Unknown.svg" class="filter-country-flag">-->
<!--            <img v-else :src="require(`../../../../public/images/flag/${countryNameIdMapping[basicInfo.victimInfo.location.country]}.png`)" class="filter-country-flag" >-->
            <img :src="require(`../../../../public/images/flag/CN.png`)" class="filter-country-flag" >
          </div>
          China, beijing
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.serverIp') }}</div>
        <!--<div class="row__content">{{ detection.victimIp || '-' }}</div>-->
        <div class="row__content">192.168.12.34</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.detail.serverLocation') }}</div>
        <div class="row__content">
          <div>
            <!--          <div v-if="$_.get(basicInfo, 'victimInfo.location.country')">-->
            <!--            <img v-if="basicInfo.victimInfo.location.country===countryNameIdMapping.Unknown || !countryNameIdMapping[basicInfo.victimInfo.location.country]" src="../../../../public/images/flag/Unknown.svg" class="filter-country-flag">-->
            <!--            <img v-else :src="require(`../../../../public/images/flag/${countryNameIdMapping[basicInfo.victimInfo.location.country]}.png`)" class="filter-country-flag" >-->
            <img :src="require(`../../../../public/images/flag/CN.png`)" class="filter-country-flag" >
          </div>
          China, beijing
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.detail.indicatorValues') }}</div>
        <div class="row__content">Tor</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.domain') }}</div>
        <div class="row__content">baidu.com</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.app') }}</div>
        <div class="row__content">Wechat</div>
      </div>
    </div>

  </div>
</template>

<script>
import { dateFormatByAppearance } from '@/utils/date-util'
import detectionDetailMixin from '@/views/detections/overview/detectionDetailMixin'
export default {
  name: 'IndicatorMatchOverview',
  mixins: [detectionDetailMixin],
  props: {
    detection: Object,
    timeFilter: Object,
    q: String
  },
  data () {
    return {
      basicInfo: {}
    }
  },
  methods: {
    dateFormatByAppearance
  }
}
</script>
