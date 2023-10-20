<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1" v-if="basicInfo.malwareInfo">
          <template v-if="basicInfo.malwareInfo.threatType === 'command and control'">
            <span
              class="row__content--link"
              @click="goDetail('ip', detection.victimIp)">
              {{ detection.victimIp }}
            </span>&nbsp;
            <span>{{$t('detection.commandAndControl')}}</span>
            <span class="row__content--link" @click="goDetail('ip', detection.eventInfoObj.ioc_value)">
              {{ detection.eventInfoObj.ioc_value || '-' }}
            </span>
          </template>
          <template v-else>
            <span
                class="row__content--link"
                @click="goDetail('ip', detection.victimIp)">
              {{ detection.victimIp }}
            </span>&nbsp;
            <span>{{$t('detection.payloadAndDelivery')}}</span>
            <span
                class="row__content--link"
                @click="goDetail('ip', detection.eventInfoObj.ioc_value)">
              {{ detection.eventInfoObj.ioc_value }}
            </span>
          </template>
        </div>
      </div>
      <div class="overview__title">Fields</div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detection.list.startTime') }}</div>
        <div class="row__content">
          <i class="cn-icon cn-icon-time2 row__content__icon"></i>
          {{ detection.startTime ? dateFormatByAppearance(detection.startTime) : '-' }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.victimIp') }}</div>
        <div class="row__content">{{ detection.victimIp || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.victimLocation') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'victimInfo.location.country', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.victimAsn') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'victimInfo.asn.asn', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.offenderIp') }}</div>
        <div class="row__content">{{ detection.offenderIp || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.offenderLocation') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'offenderInfo.location.country', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.offenderAsn') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'offenderInfo.asn.asn', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.domain') }}</div>
        <div class="row__content">{{ detection.domain || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('entities.domainCategory') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'domainInfo.category.categoryName', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('entities.domainDetail.categoryGroup') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'domainInfo.category.categoryGroup', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('entities.reputationLevel') }}</div>
        <div class="row__content" v-if="$_.get(basicInfo, 'domainInfo.category.reputationLevel')">
          <div
            class="row__tag row__tag__level"
            :style="`background-color:${eventSeverityColor[basicInfo.domainInfo.category.reputationLevel]}`">
            {{ basicInfo.domainInfo.category.reputationLevel }}
          </div>
        </div>
        <div class="row__content" v-else>-</div>
      </div>
      <div class="overview__row">
        <div class="row__label">APP</div>
        <div class="row__content">{{ $_.get(basicInfo, 'appInfo.category.appName', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">APP {{ $t('entities.category') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'appInfo.category.appCategory', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">APP {{ $t('entities.subcategory') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'appInfo.category.appSubcategory', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.appRisk') }}</div>
        <div class="row__content" v-if="$_.get(basicInfo, 'appInfo.category.appRisk')">
          <div
            class="row__tag row__tag__level"
            :style="`background-color:${eventSeverityColor[basicInfo.appInfo.category.appRisk]}`">
            {{ basicInfo.appInfo.category.appRisk }}
          </div>
        </div>
        <div class="row__content" v-else>-</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.malware') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'malwareInfo.malwareName', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.malwareAlias') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'malwareInfo.malwareAlias', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.malwareDescription') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'malwareInfo.mitreAttackDescription', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.malwarePlatforms') }}</div>
        <div class="row__content" v-if="$_.get(basicInfo, 'malwareInfo.mitreAttackPlatforms')">
          <svg class="icon item-popover-up row__content__svg" aria-hidden="true">
            <use xlink:href="#cn-icon-windows"></use>
          </svg>
          {{ basicInfo.malwareInfo.mitreAttackPlatforms }}
        </div>
        <div class="row__content" v-else>-</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.malwareTechniques') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'malwareInfo.mitreAttackTechniques', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.malwareGroups') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'malwareInfo.mitreAttackGroups', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.reference') }}</div>
        <div class="row__content row__content--link" v-if="$_.get(basicInfo, 'malwareInfo.reference')">
          {{ basicInfo.malwareInfo.reference }}
        </div>
        <div class="row__content">-</div>
      </div>
    </div>
    <div class="overview__right">
      <div class="overview__title">{{ $t('detections.goToVictim') }}</div>
      <div class="overview__row">
        <div class="row__content">
          <span class="row__content--span">{{ $t('detections.viewDetailOf') }}</span> &nbsp;
          <span
            class="row__content--link"
            @click="goDetail('ip', detection.victimIp)">{{ detection.victimIp }}</span>
        </div>
      </div>
      <div class="overview__title">{{ $t('detections.goToOffender') }}</div>
      <div class="overview__row">
        <div class="row__content">
          <span class="row__content--span">{{ $t('detections.viewDetailOf') }}</span> &nbsp;
          <span
            class="row__content--link"
            @click="goDetail('ip', detection.offenderIp)"
            >{{ detection.offenderIp }}</span
          >&nbsp;&nbsp;
          <span
            class="row__content--link"
            @click="goDetail('domain', detection.domain)"
            >{{ detection.domain }}</span
          >
        </div>
      </div>
<!--      <div class="overview__title">{{ $t('detections.goToHunt') }}</div>-->
<!--      <div class="overview__row">-->
<!--        <div class="row__content row__content&#45;&#45;link">-->
<!--          {{ $t('detections.viewAllRelated') }}-->
<!--        </div>-->
<!--      </div>-->
      <div class="overview__title">
        {{ $t('detections.relatedDetections') }}
      </div>
      <div class="overview__row-timeline">
        <div class="row-timeline" v-for="event in events" :key="event">
          <div
            class="row-timeline__time-info"
            :style="
              event.startTime === basicInfo.startTime
                ? 'color: #333;font-weight: bold;'
                : ''
            "
          >
            {{ formatT0(event) }}
          </div>
          <div class="row-timeline__line">
            <div
              class="line-point-larger"
              v-if="event.startTime === basicInfo.startTime"
            >
              <div class="line-point"></div>
            </div>
            <div v-else class="line-point"></div>
          </div>
          <div class="row-timeline__card">
            <div>
              <div class="timeline__severity timeline__severity--high">
                <i
                  class="cn-icon cn-icon-alert-level"
                  :style="`color:${eventSeverityColor[event.severity]}`"
                ></i>
                <span>{{ event.severity }}</span>
              </div>
              <div class="timeline__security-type">{{ event.eventType }}</div>
              <div class="timeline__start-time">{{ dateFormatByAppearance(event.startTime) }}</div>
            </div>
          </div>
          <div class="row-timeline__foot">
            <div
              class="detection-ip"
              :class="{
                'detection-ip__current':
                  [detection.offenderIp, detection.victimIp].indexOf(
                    event.offenderIp,
                  ) > -1,
              }"
            >
              <i class="cn-icon cn-icon-attacker"></i>
              <span>{{ event.offenderIp }}</span>
            </div>
            <div
              class="detection-ip"
              :class="{
                'detection-ip__current':
                  [detection.offenderIp, detection.victimIp].indexOf(
                    event.victimIp,
                  ) > -1,
              }"
            >
              <i class="cn-icon cn-icon-attacked"></i>
              <span>{{ event.victimIp }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { api } from '@/utils/api'
import { getMillisecond, dateFormatByAppearance } from '@/utils/date-util'
import { eventSeverityColor, unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import _ from 'lodash'
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
      const vm = this
      return function (event) {
        const diffSeconds = this.detection.startTime - event.startTime
        if (diffSeconds === 0) {
          return 'T0'
        }
        const eventStartTime = event.startTime
        const entityStartTime = vm.detection.startTime

        if (_.isNumber(diffSeconds) && _.isNumber(eventStartTime) && _.isNumber(entityStartTime)) {
          const suffix = unitConvert(diffSeconds, unitTypes.time, 's', null, 0).join('')
          if (eventStartTime > entityStartTime) {
            return `T0+${suffix}`
          } else if (eventStartTime < entityStartTime) {
            return `T0-${suffix}`
          }
        }
        return ''
      }
    }
  },
  methods: {
    getMillisecond,
    dateFormatByAppearance,
    /** 初始化实体详情 */
    initEntityDetail () {
      // 为完整填充IP信息，攻击者ip、受害者ip都进行调用；
      // 根据detection的eventInfo对象的ioc_type进行判断，若为domain，malware信息从domain详情中获取，并填充domain信息
      // 若ioc_type为ip，则调用ip接口，填充malware信息
      // 最后调用app，填充app信息。经上获取完整实体详情则最少需要调用4次接口
      const offenderIPDetail = axios.get(`${api.detection.securityEvent.ipDetail}/resource=${this.detection.offenderIp}`)
      const victimIPDetail = axios.get(`${api.detection.securityEvent.ipDetail}/resource=${this.detection.victimIp}`)
      let ipDetail
      let domainDetail
      let promiseList = []
      const appDetail = axios.get(`${api.detection.securityEvent.appDetail}/resource=${this.detection.app}`)
      if (this.detection.eventInfoObj.ioc_type.toLowerCase() === 'domain') {
        domainDetail = axios.get(`${api.detection.securityEvent.domainDetail}/resource=${this.detection.eventInfoObj.ioc_value}`)
        promiseList = [offenderIPDetail, victimIPDetail, domainDetail, appDetail]
      }
      if (this.detection.eventInfoObj.ioc_type.toLowerCase() === 'ip') {
        ipDetail = axios.get(`${api.detection.securityEvent.ipDetail}/resource=${this.detection.eventInfoObj.ioc_value}`)
        domainDetail = axios.get(`${api.detection.securityEvent.domainDetail}/resource=${this.detection.domain}`)
        promiseList = [offenderIPDetail, victimIPDetail, domainDetail, appDetail, ipDetail]
      }

      Promise.all(promiseList).then((responses) => {
        responses.forEach((res, i) => {
          if (res.status === 200) {
            if (i === 0) {
              this.basicInfo.offenderInfo = res.data.data
            }
            if (i === 1) {
              this.basicInfo.victimInfo = res.data.data
            }
            if (i === 2) {
              this.basicInfo.domainInfo = res.data.data
            }
            if (i === 3) {
              this.basicInfo.appInfo = res.data.data
            }
            if (i === 4) {
              this.basicInfo.malwareInfo = res.data.data.malwareInfo
            }
          } else {
            console.error(res)
          }
        })
        if (this.detection.eventInfoObj.ioc_type.toLowerCase() === 'domain') {
          this.basicInfo.malwareInfo = this.basicInfo.domainInfo.malware || {}
        }
      })
    },
    queryEvent () {
      axios.get(api.detection.securityEvent.relationEvent, {
        params: {
          // startTime: this.detection.startTime,
          unbiasedTime: this.detection.startTime,
          offenderIp: this.detection.offenderIp,
          victimIp: this.detection.victimIp,
          biasSecond: 3600
        }
      }).then((response) => {
        if (response.status === 200) {
          this.events = response.data.data.result.sort((e1, e2) => e1.startTime - e2.startTime)
        } else {
          this.events = []
        }
      })
    },
    goDetail (type, name) {
      if (name) {
        const { href } = this.$router.resolve({
          path: '/entityDetail',
          query: {
            entityType: type,
            entityName: name
          }
        })
        window.open(href, '_blank')
      }
    }
  },
  mounted () {
    this.initEntityDetail()
    this.queryEvent()
  }
}
</script>

<style scoped>
.row__label {
  width: 176px;
}
.row__content {
  width: calc(100% - 176px);
}
</style>
