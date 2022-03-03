<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{$t('overall.remark')}}</div>
      <div class="overview__row">
        <div class="row__content">{{basicInfo.malwareDescription || '-'}}</div>
      </div>
      <div class="overview__title">Fields</div>
      <div class="overview__row">
        <div class="row__label">{{$t('overall.location')}}</div>
        <div class="row__content">{{computeLocation(basicInfo)}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">ASN</div>
        <div class="row__content">{{basicInfo.serverAsn || '-'}}</div>
      </div>
    </div>
    <div class="overview__right">
      <div class="overview__title">{{$t('detections.goToEntity')}}</div>
      <div class="overview__row">
        <div class="row__content row__content--link">{{$t('detections.viewDetailOf', {ip: detection.serverIp})}}</div>
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
export default {
  name: 'DetectionPerformanceEventIpOverview',
  props: {
    detection: Object
  },
  data () {
    return {
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
      this.queryBasic().then(responses => {
        responses && (this.basicInfo = responses)
      })
    },
    queryBasic () {
      return new Promise((resolve, reject) => {
        try {
          getData(api.detection.performanceEvent.overviewBasic, { serverIp: this.detection.serverIp }).then(data => {
            resolve(data[0])
          }).catch(error => {
            reject(error)
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
