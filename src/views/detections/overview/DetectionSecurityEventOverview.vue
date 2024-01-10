<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{ $t('overall.remark') }}</div>
      <div class="overview__row">
        <div class="row__content1" v-if="detection.eventType === 'Command and Control' && detection.isBuiltin == 1">
          <span>{{detection.victimIp}}</span>&nbsp;&nbsp;communicated with&nbsp;<span>{{detection.offenderIp}}</span>&nbsp;&nbsp;that was associated with the indicator of {{detection.eventName}} activity, {{$_.get(detection, 'eventInfoObj.ioc_value', '') || ''}}.
        </div>
        <div class="row__content1" v-else-if="detection.eventType === 'Anonymity' && detection.isBuiltin == 1">
          <span>{{detection.victimIp}}</span>&nbsp;&nbsp;communicated with&nbsp;<span>{{detection.offenderIp}}</span>&nbsp;&nbsp;that was associated with the indicator of {{detection.eventName}}.
        </div>
        <div class="row__content1" v-else>
          {{ $_.get(basicInfo, 'ruleInfo.description', '-') || '-' }}
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
        <div class="row__content">
          <div v-if="$_.get(basicInfo, 'victimInfo.location.country')">
            <img v-if="basicInfo.victimInfo.location.country===countryNameIdMapping.Unknown || !countryNameIdMapping[basicInfo.victimInfo.location.country]" src="../../../../public/images/flag/Unknown.svg" class="filter-country-flag">
            <img v-else :src="require(`../../../../public/images/flag/${countryNameIdMapping[basicInfo.victimInfo.location.country]}.png`)" class="filter-country-flag" >
          </div>
          {{ locationRegion(basicInfo.victimInfo) }}
        </div>
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
        <div class="row__content">
          <div v-if="$_.get(basicInfo, 'offenderInfo.location.country')">
            <img v-if="basicInfo.offenderInfo.location.country===countryNameIdMapping.Unknown || !countryNameIdMapping[basicInfo.offenderInfo.location.country]" src="../../../../public/images/flag/Unknown.svg" class="filter-country-flag">
            <img v-else :src="require(`../../../../public/images/flag/${countryNameIdMapping[basicInfo.offenderInfo.location.country]}.png`)" class="filter-country-flag" >
          </div>
          {{ locationRegion(basicInfo.offenderInfo) }}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('detections.offenderAsn') }}</div>
        <div class="row__content">{{ $_.get(basicInfo, 'offenderInfo.asn.asn', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{ $t('overall.domain') }}</div>
        <div class="row__content">{{ detection.domain || '-' }}</div>
      </div>
      <template v-if="detection.domain">
        <div class="overview__row">
          <div class="row__label">{{ $t('entities.domainCategory') }}</div>
          <div class="row__content">{{ $_.get(basicInfo, 'domainInfo.category.categoryName', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('entities.domainDetail.categoryGroup') }}</div>
          <div class="row__content">{{ $_.get(basicInfo, 'domainInfo.category.categoryGroup', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detection.domainReputationLevel') }}</div>
          <div class="row__content" v-if="$_.get(basicInfo, 'domainInfo.category.reputationLevel')">
            <div
                class="row__tag row__tag__level"
                :style="`background-color:${riskLevelColor1[basicInfo.domainInfo.category.reputationLevel]}`">
              {{ reputationLevel(basicInfo.domainInfo.category.reputationLevel) || '-' }}
            </div>
          </div>
          <div class="row__content" v-else>-</div>
        </div>
      </template>
      <template v-if="detection.app">
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
                :style="`background-color:${riskLevelColor[basicInfo.appInfo.category.appRisk]}`">
              {{ appRisk(basicInfo.appInfo.category.appRisk) || '-' }}
            </div>
          </div>
          <div class="row__content" v-else>-</div>
        </div>
      </template>
      <template v-if="detection.malware">
        <div class="overview__row">
          <div class="row__label">{{ $t('detections.malware') }}</div>
          <div class="row__content">{{ $_.get(detection, 'malware.malwareName', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detections.malwareAlias') }}</div>
          <div class="row__content">{{ $_.get(detection, 'malware.malwareAlias', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detections.malwareDescription') }}</div>
          <div class="row__content">{{ $_.get(detection, 'malware.mitreAttackDescription', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detections.malwarePlatforms') }}</div>
          <div class="row__content" v-if="$_.get(detection, 'malware.mitreAttackPlatforms')">
            <svg class="icon item-popover-up row__content__svg" aria-hidden="true">
              <use xlink:href="#cn-icon-windows"></use>
            </svg>
            {{ detection.malware.mitreAttackPlatforms }}
          </div>
          <div class="row__content" v-else>-</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detections.malwareTechniques') }}</div>
          <div class="row__content">{{ $_.get(detection, 'malware.mitreAttackTechniques', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detections.malwareGroups') }}</div>
          <div class="row__content">{{ $_.get(detection, 'malware.mitreAttackGroups', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detections.reference') }}</div>
          <div class="row__content row__content--link" v-if="$_.get(detection, 'malware.reference')">
            {{ detection.malware.reference }}
          </div>
          <div class="row__content" v-else>-</div>
        </div>
      </template>
      <template v-else-if="detection.darkweb">
        <div class="overview__row">
          <div class="row__label">{{ $t('detection.nodeType') }}</div>
          <div class="row__content">{{ $_.get(detection, 'darkweb.nodeType', '-') || '-' }}</div>
        </div>
        <template v-if="$_.get(detection.darkweb, 'nodeType', '') === 'tor'">
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.torFingerprint') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.torFingerprint', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.torFlags') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.torFlags', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.torVersion') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.torVersion', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">Tor ORPort</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.torOrPort', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">Tor DirPort</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.torDirPort', '-') || '-' }}</div>
          </div>
        </template>
        <template v-else-if="$_.get(detection.darkweb, 'nodeType', '') === 'i2p'">
          <div class="overview__row">
            <div class="row__label">I2P Hash</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.i2pHash', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.i2pVersion') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.i2pVersion', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.i2pBandwidth') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.i2pBandwidth', '-') || '-' }}</div>
          </div>
        </template>
        <template v-else-if="$_.get(detection.darkweb, 'nodeType', '') === 'mtproxy'">
          <div class="overview__row">
            <div class="row__label">MTProxy Secret</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.mtproxySecret', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.mtproxyPort') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.mtproxyPort', '-') || '-' }}</div>
          </div>
        </template>
        <template v-else-if="$_.get(detection.darkweb, 'nodeType', '') === 'obfs4'">
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.obfs4Fingerprint') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.obfs4Fingerprint', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.obfs4Cert') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.obfs4Cert', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.obfs4IatMode') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.obfs4IatMode', '-') || '-' }}</div>
          </div>
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.obfs4Port') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.obfs4Port', '-') || '-' }}</div>
          </div>
        </template>
        <template v-else-if="$_.get(detection.darkweb, 'nodeType', '') === 'snowflake'">
          <div class="overview__row">
            <div class="row__label">{{ $t('detection.tor.snowflakePort') }}</div>
            <div class="row__content">{{ $_.get(detection, 'darkweb.snowflakePort', '-') || '-' }}</div>
          </div>
        </template>
      </template>
      <template v-else>
        <div class="overview__row">
          <div class="row__label">{{ $t('detection.libraryId') }}</div>
          <div class="row__content">{{ $_.get(detection, 'eventInfoObj.knowledge_id', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detection.libraryName') }}</div>
          <div class="row__content">{{ $_.get(detection, 'eventInfoObj.name', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detection.iocType') }}</div>
          <div class="row__content">{{ $_.get(detection, 'eventInfoObj.ioc_type', '-') || '-' }}</div>
        </div>
        <div class="overview__row">
          <div class="row__label">{{ $t('detection.iocValue') }}</div>
          <div class="row__content">{{ $_.get(detection, 'eventInfoObj.ioc_value', '-') || '-' }}</div>
        </div>
      </template>
    </div>
    <div class="overview__right">
      <div v-if="$_.get(basicInfo, 'ruleInfo.ruleId') >= 10000">
        <div class="overview__title">{{ $t('detections.goToPolicy') }}</div>
        <div class="overview__row">
          <div class="row__content">
            <span class="row__content--span">{{ $t('detections.viewDetailOf') }}</span> &nbsp;
            <span class="row__content--link" @click="goPolicyPage">
              {{ $_.get(basicInfo, 'ruleInfo.name', '-') || '-' }} (ID: {{ $_.get(basicInfo, 'ruleInfo.ruleId', '-') || '-' }})
            </span>
          </div>
        </div>
      </div>
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
                <span>{{ changeI18nOfSeverity(event.severity) }}</span>
              </div>
              <div class="timeline__security-type">{{ event.eventType }}</div>
              <div class="timeline__start-time">{{ dateFormatByAppearance(parseInt(event.startTime)) }}</div>
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
import { eventSeverityColor, unitTypes, countryNameIdMapping, riskLevelMapping, riskLevelColor, riskLevelColor1 } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import _ from 'lodash'
import { changeI18nOfSeverity } from '@/utils/tools'
export default {
  name: 'DetectionOverview',
  props: {
    detection: Object,
    timeFilter: Object
  },
  data () {
    return {
      eventSeverityColor,
      riskLevelColor,
      riskLevelColor1,
      basicInfo: {},
      events: [],
      reference: 'https://attack.mitre.org',
      countryNameIdMapping
    }
  },
  computed: {
    formatT0 () {
      const vm = this
      return function (event) {
        const diffSeconds = parseInt(event.diffSeconds)
        if (diffSeconds === 0) {
          return 'T0'
        }
        const eventStartTime = parseInt(event.startTime)
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
    },
    appRisk () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value == level
        })
        return (m && this.$t(m.label)) || level
      }
    },
    reputationLevel () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.name == level
        })
        return (m && this.$t(m.label)) || level
      }
    },
    locationRegion (info) {
      return function (info) {
        if (!info || !info.location) {
          return '-'
        }
        let result = ''
        if (info.location.country) {
          result += `${info.location.country},`
        }
        if (info.location.province) {
          result += `${info.location.province},`
        }
        if (info.location.city) {
          result += `${info.location.city},`
        }
        result = result.substr(0, result.length - 1)
        if (!result) {
          result = '-'
        }
        return result
      }
    }
  },
  methods: {
    getMillisecond,
    dateFormatByAppearance,
    changeI18nOfSeverity,
    /** 初始化实体详情 */
    initEntityDetail () {
      // 调接口查询攻击者和受害者IP、Domain、APP的更多信息；
      if (this.detection.offenderIp) {
        axios.get(`${api.detection.securityEvent.ipDetail}?resource=${this.detection.offenderIp}`).then(res => {
          if (res.status === 200) {
            this.basicInfo.offenderInfo = res.data.data
          }
        })
      }
      if (this.detection.victimIp) {
        axios.get(`${api.detection.securityEvent.ipDetail}?resource=${this.detection.victimIp}`).then(res => {
          if (res.status === 200) {
            this.basicInfo.victimInfo = res.data.data
          }
        })
      }
      if (this.detection.domain) {
        axios.get(`${api.detection.securityEvent.domainDetail}?resource=${this.detection.domain}`).then(res => {
          if (res.status === 200) {
            this.basicInfo.domainInfo = res.data.data
          }
        })
      }
      if (this.detection.app) {
        axios.get(`${api.detection.securityEvent.appDetail}?resource=${this.detection.app}`).then(res => {
          if (res.status === 200) {
            this.basicInfo.appInfo = res.data.data
          }
        })
      }
      if (this.detection.ruleId) {
        axios.get(`${api.detection.detail}/${this.detection.ruleId}`).then(res => {
          if (res.status === 200) {
            this.basicInfo.ruleInfo = res.data.data
          }
        })
      }
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
          path: '/entity/detail',
          query: {
            entityType: type,
            entityName: name,
            range: this.timeFilter.dateRangeValue
          }
        })
        window.open(href, '_blank')
      }
    },
    goPolicyPage () {
      if (this.basicInfo.ruleInfo.name && Number(this.basicInfo.ruleInfo.ruleId) >= 10000) {
        const { href } = this.$router.resolve({
          path: '/detection/policy',
          query: {
            t: +new Date(),
            name: this.basicInfo.ruleInfo.name,
            ruleId: this.basicInfo.ruleInfo.ruleId
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
  padding-right: 50px;
}
</style>
