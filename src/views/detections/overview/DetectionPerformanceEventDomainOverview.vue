<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{$t('overall.remark')}}</div>
      <div class="overview__row">
        <div class="row__content">
            <span
              class="row__content--link"
              @click="goDetail('domain', detection.domain)"
              >{{ detection.domain }}</span
            >
          <template v-if="detection.eventType === 'dns error'">
            <span>
              {{$t('detections.dnsQueryError')}}
            </span>
          </template>
          <template v-if="detection.eventType === 'http error'">
            <span>
              {{$t('detections.httpQueryError')}}
            </span>
          </template>
          <template v-if="detection.eventType === 'high dns response time'">
            <span>
              {{$t('detections.responseTime')}}
            </span>
          </template>
        </div>
      </div>
      <div class="overview__title">Fields</div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.category')}}</div>
        <div class="row__content">{{basicInfo.domainCategoryName || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.group')}}</div>
        <div class="row__content">{{basicInfo.domainCategoryGroup || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.credit')}}</div>
        <div class="row__content">{{basicInfo.domainReputationScore || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.reputationLevel')}}</div>
        <div class="row__content">
          <div class="row__tag" :style="`background-color:${eventSeverityColor[basicInfo.domainReputationLevel]}`">{{basicInfo.domainReputationLevel || '-'}}</div>
        </div>
      </div>
    </div>
    <div class="overview__right">
      <div class="overview__title">{{$t('detections.goToEntity')}}</div>
      <div class="overview__row">
        <div class="row__content">
          <span>{{ $t('detections.viewDetailOf') }}</span> &nbsp;
          <span
              class="row__content--link"
              @click="goDetail('domain', computeSecondaryDomain(detection.domain))">{{computeSecondaryDomain(detection.domain)}}</span>
        </div>
      </div>
      <div class="overview__title">{{$t('detections.goToHunt')}}</div>
      <div class="overview__row">
        <div class="row__content row__content--link">{{$t('detections.viewAllRelated')}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { api, getData } from '@/utils/api'
import { eventSeverityColor, topDomain } from '@/utils/constants'
export default {
  name: 'DetectionPerformanceEventDomainOverview',
  props: {
    detection: Object
  },
  data () {
    return {
      eventSeverityColor,
      basicInfo: {}
    }
  },
  computed: {
    computeLocation () {
      return function (basicInfo) {
        let result = ''
        if (basicInfo.serverLocationCountry) {
          result += basicInfo.serverLocationCountry
        }
        if (basicInfo.serverLocationProvince) {
          if (result) {
            result += ', '
          }
          result += basicInfo.serverLocationProvince
        }
        if (basicInfo.serverLocationRegion) {
          if (result) {
            result += ', '
          }
          result += basicInfo.serverLocationRegion
        }
        return result || '-'
      }
    },
    computeSecondaryDomain () {
      return function (name) {
        // 命中的顶级域名
        let hitTopDomain = ''
        // 同顶级域名比对
        const hits = []
        topDomain.forEach(td => {
          const hitIndex = name.lastIndexOf(td)
          if (hitIndex > -1 && hitIndex + td.length === name.length) {
            hits.push(td)
          }
        })
        if (hits.length > 0) {
          hits.sort((a, b) => {
            return b.split('.').length - a.split('.').length
          })
          hitTopDomain = hits[0]
        } else {
          const arr = name.split('.')
          hitTopDomain = arr[arr.length - 1]
        }
        const index = name.lastIndexOf(hitTopDomain)
        const preArr = name.substring(0, index).split('.')
        return [preArr[preArr.length - 2], hitTopDomain].join('.')
      }
    }
  },
  methods: {
    query () {
      this.queryBasic().then(responses => {
        responses && (this.basicInfo = responses)
      })
    },
    queryBasic () {
      return new Promise((resolve, reject) => {
        try {
          getData(api.detection.performanceEvent.overviewBasic, { appName: this.detection.appName, startTime: this.detection.startTime }).then(data => {
            resolve(data[0])
          }).catch(error => {
            reject(error)
          })
        } catch (e) {
          reject(e)
        }
      })
    },
    goDetail (type, name) {
      const { href } = this.$router.resolve({
        path: '/entityDetail',
        query: {
          entityType: type,
          name: name
        }
      })
      window.open(href, '_blank')
    }
  },
  mounted () {
    this.query()
  }
}
</script>
