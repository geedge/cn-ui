<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{$t('overall.remark')}}</div>
      <div class="overview__row">
        <div class="row__content">{{basicInfo.malwareDescription || '-'}}</div>
      </div>
      <div class="overview__title">Fields</div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.category')}}</div>
        <div class="row__content">{{basicInfo.domainCategoryName}}</div>
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
        <div class="row__content row__content--link">{{$t('detections.viewDetailOf', {ip: detection.domain})}}</div>
      </div>
      <div class="overview__title">{{$t('detections.goToHunt')}}</div>
      <div class="overview__row">
        <div class="row__content row__content--link">{{$t('detections.viewAllRelated')}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { eventSeverityColor } from '@/utils/constants'
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
    }
  },
  methods: {
    query () {
      this.basicInfo = {
        "clientLocationCountry": 1212,
        "clientLocationProvince": "112.2.2.3",
        "clientLocationRegion": "China",
        "clientAsn": "Hebei",
        "serverLocationCountry": "Xingtai",
        "serverLocationProvince": "hehe",
        "serverLocationRegion": "2.2.2.2",
        "serverAsn": "China",
        "domainCategoryName": "Hebei",
        "domainCategoryGroup": "Xingtai",
        "domainReputationScore": "hehe",
        "domainReputationLevel": "high",
        "appCategory": "vpn",
        "appSubcategory": "foreign vpn",
        "appRisk": "critical"
      }
      /*this.queryBasic().then(responses => {
      })*/
    },
    queryBasic () {
      return new Promise((resolve, reject) => {
        try {
          get(api.detection.performanceEvent.overviewBasic, { serverIp: this.detection.appName }).then(response => {
            if (response.code === 200) {
              resolve(response.data.list)
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
