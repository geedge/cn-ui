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
            <div class="row__charts" :id="`entityDetailSend${entityData.ipAddr}`"></div>
          </div>
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.received')}}：{{unitConvert(entityData.bytesReceivedRate, unitTypes.byte).join(' ')}}ps</div>
            <!-- 曲线-->
            <div class="row__charts" :id="`entityDetailReceived${entityData.ipAddr}`"></div>
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
      <div class="overview__row overview__row--small-font" v-for="security in entityData.securityList">
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
    <chart2
        :chart-info="chart"
        :chart-data="chartData"
        :entity="entityCopy"
        :query-params="getQueryParams"
        :hide-header="true"
        @getCurrentTimeRange="getCurrentTimeRange"
    ></chart2>
  </div>
</template>

<script>
import entityDetailMixin from './entityDetailMixin'
import { api } from '@/utils/api'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import Chart2 from '@/views/charts/Chart2'
import _ from 'lodash'
import {get} from "@/utils/http";

export default {
  name: 'Ip',
  mixins: [entityDetailMixin],
  components: {
    Chart2
  },
  data () {
    return {
      // entityData: {}
      entityType: 'ip',
      trafficUrl: api.entityIpDetailTraffic,
      trafficUrlMap: api.entityIpDetailTrafficMap,
      relationUrl: api.entityIpDetailRelation,
      alertUrl: api.entityIpDetailAlert,
      securityUrl: api.entityIpDetailSecurity,
      listMode: 'list',
      chartData: null
    }
  },
  methods: {
    getQueryParams () {
      const queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        ip: this.entityData.ipAddr,
        country: this.entityData.ipLocationCountry
      }
      return queryParams
    },
    handleRelationData (result) {
      this.entityData.appCount = result.appCount
      this.entityData.domainCount = result.domainCount
    },
    chartGetMap () {
      get((this.trafficUrlMap), this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.chartData = response.data.result
          console.log(this.chartData)
        }
      })
    },
  },
  mounted() {
    this.$nextTick(() => { setTimeout(() => { this.chartGetMap()}, 200)})
  },
  setup (props) {
    const entityCopy = {
      ..._.cloneDeep(props.entity),
      ip: props.entity.ipAddr
    }
    return {
      chart: {
        params: {
          url: '/interface/entity/detail/ip/trafficMap?startTime={{startTime}}&endTime={{endTime}}&country={{country}}&ip={{ip}}',
          unitType: 'number',
          valueColumn: 'sessions'
        },
        id: props.entity.ipAddr,
        type: 2
      },
      entityCopy,
      unitTypes,
      unitConvert
    }
  }
}
</script>
