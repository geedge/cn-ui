<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">APP ID</div>
        <div class="row__content">{{entityData.appId|| '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.category')}}</div>
        <div class="row__content">{{entityData.appCategory|| '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.subcategory')}}</div>
        <div class="row__content">{{entityData.appSubcategory || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.riskLevel')}}</div>
        <div class="row__content">{{entityData.appRisk || '-'}}</div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.traffic')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.peak')}}</div>
        <div class="row__content">{{unitConvert(entityData.max, unitTypes.byte).join(' ')}}/s</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.mean')}}</div>
        <div class="row__content">{{unitConvert(entityData.avg, unitTypes.byte).join(' ')}}/s</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.throughput')}}</div>
        <div class="row__contents">
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.sent')}}：{{unitConvert(entityData.bytesSentRate, unitTypes.byte).join(' ')}}ps</div>
            <!-- 曲线-->
            <div class="row__charts" :id="`entityDetailSend${entityData.appName}`" ></div>
          </div>
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.received')}}：{{unitConvert(entityData.bytesReceivedRate, unitTypes.byte).join(' ')}}ps</div>
            <!-- 曲线-->
            <div class="row__charts" :id="`entityDetailReceived${entityData.appName}`" ></div>
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
          <span class="tag__value">{{entityData.ipCount}}</span>
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
      <div class="overview__row overview__row--small-font"   v-for="alert in entityData.alertList">
        <div class="row__label row__label--width160">{{alert.startTime}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high">{{alert.alertSeverity}}</div>
          <div>{{alert.alertName}}</div>
        </div>
        <div class="row__desc"></div>
      </div>
      <div class="overview__row overview__row--small-font" v-if="entityData.alertList && entityData.alertList.length > 3">
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
      <div class="overview__row overview__row--small-font"   v-for="security in entityData.securityList">
        <div class="row__label row__label--width160">{{security.startTime}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high">{{security.securitySeverity}}</div>
          <div>{{security.sourceName}}</div>
        </div>
        <div class="row__desc"></div>
      </div>
      <div class="overview__row overview__row--small-font" v-if="entityData.securityList && entityData.securityList.length > 3">
        <div class="show-more">{{$t('overall.showMore')}}>></div>
      </div>
    </div>
  </div>
  <div class="overview-map">
    <chart
        :chart="chart"
        :entity="entityCopy"
        :hide-header="true"
        @getCurrentTimeRange="getCurrentTimeRange"
    ></chart>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import entityDetailMixin from './entityDetailMixin'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import Chart from '@/views/charts/Chart'
import _ from "lodash";

export default {
  name: 'App',
  mixins: [entityDetailMixin],
  components: {
    Chart
  },
  data () {
    return {
      // entityData: {}
      entityType: 'app',
      trafficUrl: api.entityAppDetailTraffic,
      relationUrl: api.entityAppDetailRelation,
      alertUrl: api.entityAppDetailAlert,
      securityUrl: api.entityAppDetailSecurity,
      listMode: 'list'
    }
  },
  methods: {
    getQueryParams () {
      const queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        appName: this.entityData.appName
      }
      return queryParams
    },
    handleRelationData (result) {
      this.entityData.domainCount = result.domainCount
      this.entityData.ipCount = result.ipCount
    }
  },
  setup (props) {
    return {
      chart: {
        params: {
          url: '/interface/entity/detail/app/trafficMap?startTime={{startTime}}&endTime={{endTime}}&country={{country}}&appName={{appName}}',
          unitType: 'number',
          valueColumn: 'sessions'
        },
        type: 2
      },
      unitTypes,
      entityCopy: {
        ..._.cloneDeep(props.entity)
      },
      unitConvert
    }
  }
}
</script>
