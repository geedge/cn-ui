<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{$t('overall.remark')}}</div>
      <div class="overview__row">
        <div class="row__content">{{basicInfo.malwareDescription || '-'}}</div>
      </div>
      <div class="overview__title">Fields</div>
      <div class="overview__row">
        <div class="row__label">{{$t('detection.list.startTime')}}</div>
        <div class="row__content">{{basicInfo.startTime ? dayJs.tz(getMillisecond(basicInfo.startTime)).format('YYYY-MM-DD HH:mm:ss') : '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.victimIp')}}</div>
        <div class="row__content">{{basicInfo.victimIp || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.victimLocation')}}</div>
        <div class="row__content">{{basicInfo.victimLocationCountry || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.victimAsn')}}</div>
        <div class="row__content">{{basicInfo.victimAsn || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.offenderIp')}}</div>
        <div class="row__content">{{basicInfo.offenderIp || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.offenderLocation')}}</div>
        <div class="row__content">{{basicInfo.offenderLocationCountry || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.offenderAsn')}}</div>
        <div class="row__content">{{basicInfo.offenderAsn || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('overall.domain')}}</div>
        <div class="row__content">{{basicInfo.domain || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.domainCategory')}}</div>
        <div class="row__content">{{basicInfo.domainCategoryName || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.domainDetail.categoryGroup')}}</div>
        <div class="row__content">{{basicInfo.domainCategoryGroup || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.reputationLevel')}}</div>
        <div class="row__content">
          <div class="row__tag" :style="`background-color:${eventSeverityColor[basicInfo.domainReputationLevel]}`">{{basicInfo.domainReputationLevel || '-'}}</div>
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">APP</div>
        <div class="row__content">{{basicInfo.appName || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">APP {{$t('entities.category')}}</div>
        <div class="row__content">{{basicInfo.appCategory || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">APP {{$t('entities.subcategory')}}</div>
        <div class="row__content">{{basicInfo.appSubcategory || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('overall.appRisk')}}</div>
        <div class="row__content">
          <div class="row__tag" :style="`background-color:${eventSeverityColor[basicInfo.appRisk]}`">{{basicInfo.appRisk || '-'}}</div>
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.malware')}}</div>
        <div class="row__content">{{basicInfo.malwareName || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.malwareAlias')}}</div>
        <div class="row__content">{{basicInfo.malwareAlias || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.malwareDescription')}}</div>
        <div class="row__content">{{basicInfo.malwareDescription || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.malwarePlatforms')}}</div>
        <div class="row__content">{{basicInfo.malwarePlatforms || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.malwareTechniques')}}</div>
        <div class="row__content row__content--link">{{basicInfo.malwareTechniques || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.malwareGroups')}}</div>
        <div class="row__content row__content--link">{{basicInfo.malwareGroups || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('detections.reference')}}</div>
        <div class="row__content row__content--link">{{reference || '-'}}</div>
      </div>
<!--      <template v-if="detection.securityType === 'command and control' || detection.securityType === 'payload_delivery'">
      </template>-->
    </div>
    <div class="overview__right">
      <div class="overview__title">{{$t('detections.goToVictim')}}</div>
      <div class="overview__row">
        <div class="row__content row__content--link">{{$t('detections.viewDetailOf', {ip: basicInfo.victimIp})}}</div>
      </div>
      <div class="overview__title">{{$t('detections.goToOffender')}}</div>
      <div class="overview__row">
        <div class="row__content row__content--link">{{$t('detections.viewDetailOf', {ip: basicInfo.offenderIp})}}</div>
      </div>
      <div class="overview__title">{{$t('detections.goToHunt')}}</div>
      <div class="overview__row">
        <div class="row__content row__content--link">{{$t('detections.viewAllRelated')}}</div>
      </div>
      <div class="overview__title">{{$t('detections.relatedDetections')}}</div>
      <div class="overview__row-timeline">
        <div class="row-timeline" v-for="event in events" :key="event">
          <div class="row-timeline__time-info" :style="event.startTime === basicInfo.startTime ? 'color: #333;font-weight: bold;' : ''">{{formatT0(event.startTime)}}</div>
          <div class="row-timeline__line">
            <div class="line-point-larger" v-if="event.startTime === basicInfo.startTime">
              <div class="line-point"></div>
            </div>
            <div v-else class="line-point"></div>
          </div>
          <div class="row-timeline__card">
            <div>
              <div class="timeline__severity timeline__severity--high">
                <i class="cn-icon cn-icon-alert-level" :style="`color:${eventSeverityColor[event.eventSeverity]}`"></i>
                <span>{{event.eventSeverity}}</span>
              </div>
              <div class="timeline__security-type">{{event.securityType}}</div>
              <div class="timeline__start-time">{{dayJs.tz(getMillisecond(event.startTime)).format('YYYY-MM-DD HH:mm:ss')}}</div>
            </div>
          </div>
          <div class="row-timeline__foot">
            <div class="detection-ip" :class="{'detection-ip__current': [basicInfo.offenderIp, basicInfo.victimIp].indexOf(event.offenderIp) > -1}">
              <i class="cn-icon cn-icon-attacker"></i>
              <span>{{event.offenderIp}}</span>
            </div>
            <div class="detection-ip" :class="{'detection-ip__current': [basicInfo.offenderIp, basicInfo.victimIp].indexOf(event.victimIp) > -1}">
              <i class="cn-icon cn-icon-attacked"></i>
              <span>{{event.victimIp}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getMillisecond } from '@/utils/date-util'
import { eventSeverityColor } from '@/utils/constants'
export default {
  name: 'DetectionOverview',
  props: {
    detection: Object
  },
  data () {
    return {
      eventSeverityColor,
      basicInfo: {},
      events: [],
      reference: 'https://attack.mitre.org'
    }
  },
  computed: {
    formatT0 () {
      return function (startTime) {
        return startTime === this.basicInfo.startTime ? 'T0' : 'T0-10m'
      }
    }
  },
  methods: {
    getMillisecond,
    query () {
      this.basicInfo = {
      }
      this.events = [
      ]
      Promise.all([this.queryBasic(), this.queryEvent()]).then(responses => {
      })
    },
    queryBasic () {
      return new Promise((resolve, reject) => {
        try {
          get(api.detection.securityEvent.overviewBasic, { eventId: this.detection.eventId }).then(response => {
            if (response.code === 200) {
              let data = response.data.result[0]
                    if (!this.$_.isEmpty(data)) {
                this.basicInfo = data
              }
              resolve(response.data.result)
            } else {
              reject(response)
            }
          })
        } catch (e) {
          reject(e)
        }
      })
    },
    queryEvent () {
      return new Promise((resolve, reject) => {
        try {
          get(api.detection.securityEvent.overviewEvent, { eventId: this.detection.eventId }).then(response => {
            if (response.code === 200) {
              let data = response.data.result
              if (!this.$_.isEmpty(data)) {
                this.events = response.data.result
              }
              resolve(response.data.result)
            } else {
              reject(response)
            }
          })
        } catch (e) {
          reject(e)
        }
      })
    }
  },
  mounted () {
    this.query()
  }
}
</script>
