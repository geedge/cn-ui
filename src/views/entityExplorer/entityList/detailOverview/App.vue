<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">APP ID</div>
        <div class="row__content">{{entity.appId|| '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.category')}}</div>
        <div class="row__content">{{entity.appCategory|| '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.subcategory')}}</div>
        <div class="row__content">{{entity.appSubcategory || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.riskLevel')}}</div>
        <div class="row__content">{{appRisk(entity.appRisk) || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.remark')}}</div>
        <div class="row__content">{{entity.appDescription || '-'}}</div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.traffic')}}</div>
    <div class="overview__content overview__content-loading">
      <loading :loading="loadingTraffic"></loading>
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
            <div class="row__content-loading">
               <div class="row__charts" :id="`entityDetailSend${entityData.appName}`" ></div>
            </div>
          </div>
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.received')}}：{{unitConvert(entityData.bytesReceivedRate, unitTypes.byte).join(' ')}}ps</div>
            <!-- 曲线-->
            <div class="row__content-loading">
               <div class="row__charts" :id="`entityDetailReceived${entityData.appName}`" ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.relationship')}}</div>
    <div class="overview__content domain__content">
      <div class="overview__tags domain__tags" ref="relationship">
        <div class="overview__domain-tabs overview__domain-tabs-loading">
          <loading :loading="loadingRelationshipOne"></loading>
          <div class="overview__domain-tab">
            <div class="overview__tag domain__tag">
              <span class="tag__value">{{relationshipDataOne.length}}</span>
              <span class="tag__desc">{{$t('entities.relatedDomains')}}</span>
            </div>
            <div class="overview__tag domain__tag-list" v-show="item.show" v-for="(item, index) in relationshipDataOne" :key="index">
              <span class="tag__desc">{{item.domain}}</span>
            </div>
          </div>
          <div class="overview__domain-btn">
            <div class="overview__domain-more" @click="more(relationshipDataOne, 1)" v-if="relationshipShowOne">...</div>
            <div class="overview__domain-more-tabs show-more-list" v-if="relationshipShowMoreOne" v-ele-click-outside="mouseout">
              <div class="domain-more-tab" v-for="item in relationshipMoreDataOne" :key="item">
                <span v-if="item.domain" :title="item.domain">{{item.domain}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="overview__domain-tabs overview__domain-tabs-loading">
          <loading :loading="loadingRelationshipTwo"></loading>
          <div class="overview__domain-tab">
            <div class="overview__tag domain__tag">
              <span class="tag__value">{{relationshipDataTwo.length}}</span>
              <span class="tag__desc">{{$t('entities.relatedServerIp')}}</span>
            </div>
            <div class="overview__tag domain__tag-list" v-show="item.show" v-for="(item, index) in relationshipDataTwo" :key="index">
              <span class="tag__desc">{{item.ip}}</span>
            </div>
          </div>
          <div class="overview__domain-btn">
            <div class="overview__domain-more" @click="more(relationshipDataTwo, 2)" v-if="relationshipShowTwo">...</div>
            <div class="overview__domain-more-tabs show-more-list" v-if="relationshipShowMoreTwo" v-ele-click-outside="mouseout">
              <div class="domain-more-tab" v-for="item in relationshipMoreDataTwo" :key="item">
                <span v-if="item.ip" :title="item.ip">{{item.ip}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.networkQuality')}}</div>
    <div class="overview__content overview__content-loading-net">
      <loading :loading="loadingNetworkQuality"></loading>
      <div class="overview__row overview__row--single-value">
        <chart-single-value
            v-for="(chartInfo, i) in singleValues.chartInfos"
            :chart-info="chartInfo"
            :chart-data="singleValues.chartDatas[i]"
            :key="i"
            class="cn-chart__single-value--detail-overview"
        ></chart-single-value>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('entities.accessLink')}}</div>
    <div class="overview__content">
      <div class="overview__tags">
        <div class="overview__tag overview__tag-loading">
          <loading :loading="loadingOut"></loading>
          <span class="tag__desc">{{$t('entities.outLinkTrafficPercentage')}}</span>
          <span class="tag__value">{{entityData.linkOutId ? entityData.linkOutId : '-'}},</span>
          <span class="tag__desc">{{$t('entities.percentage')}}</span>
          <span class="tag__value">{{entityData.linkOutPercent ? unitConvert(entityData.linkOutPercent, unitTypes.percent).join(' ') : '-'}}</span>
        </div>
        <div class="overview__tag overview__tag-loading">
          <loading :loading="loadingIn"></loading>
          <span class="tag__desc">{{$t('entities.inLinkTrafficPercentage')}}</span>
          <span class="tag__value">{{entityData.linkInId ? entityData.linkInId : '-'}},</span>
          <span class="tag__desc">{{$t('entities.percentage')}}</span>
          <span class="tag__value">{{entityData.linkInPercent ? unitConvert(entityData.linkInPercent, unitTypes.percent).join(' ') : '-'}}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.alert')}}</div>
    <div class="overview__content overview__content-loading">
      <loading :loading="loadingAlert"></loading>
      <div class="overview__row">
        <span v-if="performanceData.length === 0" class="no-recent-alerts"><i class="el-icon-success"></i>{{$t('relationShip.noRecentAlerts')}}</span>
      </div>
      <div class="overview__row overview__row--small-font"   v-for="(performance, index) in entityData.performanceList" :key="index">
        <div class="row__label row__label--width160">{{dateFormatByAppearance(performance.startTime) || '-'}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high" :class="iconClass(performance)">{{performance.eventSeverity}}</div>
          <div>{{performance.eventType}}</div>
        </div>
        <div class="row__desc"></div>
      </div>
      <div class="overview__row overview__row--small-font" v-if="performanceData && performanceData.length > 5">
        <div class="show-more" :class="{'show-more-disabled': performanceData.length === entityData.performanceList.length}" @click="performanceShowMore(10)">{{$t('overall.showMore')}}>></div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('entities.securityEvents')}}</div>
    <div class="overview__content overview__content-loading">
      <loading :loading="loadingSecurityEvents"></loading>
      <div class="overview__row">
        <span v-if="securityData.length === 0" class="no-recent-alerts"><i class="el-icon-success"></i>{{$t('relationShip.noRecentAlerts')}}</span>
      </div>
      <div class="overview__row overview__row--small-font"   v-for="(security, index) in entityData.securityList" :key="index">
        <div class="row__label row__label--width160">{{dateFormatByAppearance(security.startTime) || '-'}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high" :class="iconClass(security)">{{security.eventSeverity}}</div>
          <div>{{security.securityType}}</div>
        </div>
        <div class="row__desc"></div>
      </div>
      <div class="overview__row overview__row--small-font" v-if="securityData && securityData.length > 5">
        <div class="show-more" :class="{'show-more-disabled': securityData.length === entityData.securityList.length}" @click="securityShowMore(10)">{{$t('overall.showMore')}}>></div>
      </div>
    </div>
  </div>
  <div class="overview-map overview-map--app">
    <chart
        :chart-info="chart"
        :chart-data="chartData"
        :entity="entityCopy"
        :query-params="queryParams"
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
import _ from 'lodash'
import ChartSingleValue from '@/views/charts/charts/ChartSingleValue'
import { get } from '@/utils/http'
import relatedServer from '@/mixins/relatedServer'
import { getSecond, getMillisecond } from '@/utils/date-util'
import Loading from '@/components/common/Loading'

export default {
  name: 'App',
  mixins: [entityDetailMixin, relatedServer],
  components: {
    Chart,
    Loading,
    ChartSingleValue
  },
  data () {
    return {
      // entityData: {}
      entityType: 'app',
      trafficUrl: api.entityAppDetailTraffic,
      relationUrl: api.entityAppDetailRelation,
      networkQuantityUrl: api.entityAppDetailNetworkQuantity,
      linkInUrl: api.entityAppDetailLinkIn,
      linkOutUrl: api.entityAppDetailLinkOut,
      performanceUrl: api.entityAppDetailPerformance,
      securityUrl: api.entityAppDetailSecurity,
      trafficUrlMap: api.entityAppDetailTrafficMap,
      relatedServerDomainUrl: api.entityAppRelatedServerDomain,
      relatedServerIpUrl: api.entityAppRelatedServerIp,
      chartData: null,
      listMode: 'list',
      singleValues: {
        chartInfos: [
          {
            params: {
              icon: 'cn-icon cn-icon-time',
              unitType: unitTypes.time,
              iconColor: '#2ca3fe',
              iconBackgroundColor: '#eff6fe'
            },
            type: 507,
            i18n: 'entities.avgRoundTripTime'
          },
          {
            params: {
              icon: 'cn-icon cn-icon-http',
              unitType: unitTypes.time,
              iconColor: '#2ca3fe',
              iconBackgroundColor: '#eff6fe'
            },
            type: 507,
            i18n: 'entities.httpResponseLatency'
          },
          {
            params: {
              icon: 'cn-icon cn-icon-ssl',
              unitType: unitTypes.time,
              iconColor: '#2ca3fe',
              iconBackgroundColor: '#eff6fe'
            },
            type: 507,
            i18n: 'entities.sslConLatency'
          },
          {
            params: {
              icon: 'cn-icon cn-icon-package-loss',
              unitType: unitTypes.percent,
              iconColor: '#2ca3fe',
              iconBackgroundColor: '#eff6fe'
            },
            type: 507,
            i18n: 'entities.sequenceGapLossPercent'
          },
          {
            params: {
              icon: 'cn-icon cn-icon-upload',
              unitType: unitTypes.percent,
              iconColor: '#2ca3fe',
              iconBackgroundColor: '#eff6fe'
            },
            type: 507,
            i18n: 'entities.pktRetransPercent'
          }
        ],
        chartDatas: [null, null, null, null, null],
        loadingTraffic: false,
        loadingRelationshipOne: false,
        loadingRelationshipTwo: false,
        loadingNetworkQuality: false,
        loadingOut: false,
        loadingIn: false,
        loadingAlert: false,
        loadingSecurityEvents: false
      }
    }
  },
  methods: {
    getMillisecond,
    getQueryParams () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        appName: this.entity.appName
      }
      return queryParams
    },
    handleRelationData (result) {
      this.entityData.domainCount = result.domainCount
      this.entityData.ipCount = result.ipCount
    },
    chartGetMap () {
      get((this.trafficUrlMap), this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.chartData = response.data.result
        }
      })
    },
    queryRelated () {
      this.getRelatedServerDataOne(this.relatedServerDomainUrl)
      this.getRelatedServerDataTwo(this.relatedServerIpUrl)
    }
  },
  mounted () {
    this.queryParams = this.getQueryParams()
    this.$nextTick(() => {
      setTimeout(() => {
        this.chartGetMap()
        this.queryRelated()
      }, 250)
    })
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
