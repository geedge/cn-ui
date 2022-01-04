<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.location')}}</div>
        <div class="row__content">{{entityData.ipLocationCountry || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">ASN</div>
        <div class="row__content">{{entityData.ipAsn || '-'}}</div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.traffic')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.peak')}}</div>
        <div class="row__content">{{entityData.max}} Kb/s</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.mean')}}</div>
        <div class="row__content">{{entityData.avg}} Kb/s</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.throughput')}}</div>
        <div class="row__contents">
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.sent')}}：{{entityData.bytesSentRate}}bps</div>
            <!-- 曲线-->
            <div class="row__charts" :id="`entityDetailSend${entityData.ipAddr}`" ></div>
          </div>
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.received')}}：{{entityData.bytesReceivedRate}}bps</div>
            <!-- 曲线-->
            <div class="row__charts" :id="`entityDetailReceived${entityData.ipAddr}`" ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.relationship')}}</div>
    <div class="overview__content">
      <div class="overview__tags">
        <div class="overview__tag">
          <span class="tag__value">{{entityData.domainCount}}</span>
          <span class="tag__desc">{{$t('entities.relatedDomains')}}</span>
        </div>
        <div class="overview__tag">
          <span class="tag__value">{{entityData.appCount}}</span>
          <span class="tag__desc">{{$t('entities.relatedServerIp')}}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.alert')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label">{{$t('entities.recentAlert')}}</div>
        <div class="row__content">{{entityData.alertNum || '-'}}</div>
      </div>
      <div class="overview__row overview__row--small-font" v-for="alert in entityData.alertList">
        <div class="row__label row__label--width160">{{alert.startTime}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high">{{alert.alertSeverity}}</div>
          <div>{{alert.alertName}}</div>
        </div>
        <div class="row__desc"></div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="show-more">{{$t('overall.showMore')}}>></div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('entities.securityEvents')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label">{{$t('entities.recentSecurity')}}</div>
        <div class="row__content">{{entityData.securityNum || '-'}}</div>
      </div>
      <div class="overview__row overview__row--small-font" v-for="security in entityData.securityList">
        <div class="row__label row__label--width160">{{security.startTime}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high">{{security.securitySeverity}}</div>
          <div>{{security.sourceName}}</div>
        </div>
        <div class="row__desc"></div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="show-more">{{$t('overall.showMore')}}>></div>
      </div>
    </div>
  </div>
</template>

<script>
import entityDetailMixin from './entityDetailMixin'
import { api } from '@/utils/api'

export default {
  name: 'Ip',
  mixins: [entityDetailMixin],
  data () {
    return {
      // entityData: {}
      entityType: 'ip',
      trafficUrl: api.entityIpDetailTraffic,
      relationUrl: api.entityIpDetailRelation,
      alertUrl: api.entityIpDetailAlert,
      securityUrl: api.entityIpDetailSecurity,
      listMode: 'list'
    }
  },
  methods: {
    getQueryParams () {
      const now = new Date()
      const queryParams = {
        startTime: Math.floor(now.getTime() / 1000 - 3600),
        endTime: Math.floor(now.getTime() / 1000),
        ip: this.entityData.ipAddr
      }
      return queryParams
    },
    handleRelationData (result) {
      this.entityData.appCount = result.appCount
      this.entityData.domainCount = result.domainCount
    }
  }
}
</script>
