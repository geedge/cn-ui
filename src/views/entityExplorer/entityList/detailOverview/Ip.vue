<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.location')}}</div>
        <div class="row__content">{{ipLocationRegion(entity)}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">ASN</div>
        <div class="row__content">{{entity.ipAsn || '-'}}</div>
      </div>
    </div>
  </div>
  <div class="overview-item" v-if="entityData.dnsServerRole">
    <div class="overview__title">{{$t('overall.dnsServerInfo')}}</div>
    <div class="overview__content overview__content-loading">
      <loading :loading="loadingDns" size="small" inner-style="left: 8.75rem;" style="width: 50%;"></loading>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.dnsServerInfo.role')}}</div>
        <div class="row__content">{{$_.get(entityData, 'dnsServerRole') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.dnsServerInfo.mechanism')}}</div>
        <div class="row__content">{{$_.get(entityData, 'dnsServerOrg') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.dnsServerInfo.software')}}</div>
        <div class="row__content">{{$_.get(entityData, 'dnsServerSoftware') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.dnsServerInfo.system')}}</div>
        <div class="row__content">{{$_.get(entityData, 'dnsServerOs') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.dnsServerInfo.protocol')}}</div>
        <div class="row__content">{{detectionIpSupporting(entityData) || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.dnsServerInfo.queryRate')}}</div>
        <div class="row__contents">
          <div class="row__content">
            <div class="row__charts-msg">{{unitConvert(entityData.queryRate, unitTypes.byte).join(' ')}}ps</div>
            <!-- 曲线-->
            <div class="row__content-loading">
              <loading :loading="!loadingDns && loading" size="small"></loading>
              <div class="row__charts" :id="`entityDnsServerInfo${entity.ipAddr}`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.traffic')}}</div>
    <div class="overview__content overview__content-loading">
      <loading :loading="loadingTraffic" size="small" inner-style="left: 8.75rem;" style="width: 50%;"></loading>
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
              <div class="row__charts" :id="`entityDetailSend${entity.ipAddr}`"></div>
            </div>
          </div>
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.received')}}：{{unitConvert(entityData.bytesReceivedRate, unitTypes.byte).join(' ')}}ps</div>
            <!-- 曲线-->
            <div class="row__content-loading">
              <div class="row__charts" :id="`entityDetailReceived${entity.ipAddr}`"></div>
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
          <loading :loading="loadingRelationshipOne" size="small" inner-style="left: 1rem;" style="width: 50%;"></loading>
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
          <loading :loading="loadingRelationshipTwo" size="small" inner-style="left: 1rem;" style="width: 50%;"></loading>
          <div class="overview__domain-tab">
            <div class="overview__tag domain__tag">
              <span class="tag__value">{{relationshipDataTwo.length}}</span>
              <span class="tag__desc">{{$t('entities.relatedApp')}}</span>
            </div>
            <div class="overview__tag domain__tag-list" v-show="item.show" v-for="(item, index) in relationshipDataTwo" :key="index">
              <span class="tag__desc">{{item.appName}}</span>
            </div>
          </div>
          <div class="overview__domain-btn">
            <div class="overview__domain-more" @click="more(relationshipDataTwo, 2)" v-if="relationshipShowTwo">...</div>
            <div class="overview__domain-more-tabs show-more-list" v-if="relationshipShowMoreTwo" v-ele-click-outside="mouseout">
              <div class="domain-more-tab" v-for="item in relationshipMoreDataTwo" :key="item">
                <span v-if="item.appName" :title="item.appName">{{item.appName}}</span>
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
      <loading :loading="loadingNetworkQuality" size="small"></loading>
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
          <loading :loading="loadingOut" size="small"></loading>
          <span class="tag__desc">{{$t('entities.outLinkTrafficPercentage')}}</span>
          <span class="tag__value">{{entityData.linkOutId ? entityData.linkOutId : '-'}},&nbsp;</span>
          <span class="tag__desc">{{$t('entities.percentage')}}</span>
          <span class="tag__value">{{entityData.linkOutPercent ? unitConvert(entityData.linkOutPercent, unitTypes.percent).join(' ') : '-'}}</span>
        </div>
        <div class="overview__tag overview__tag-loading">
          <loading :loading="loadingIn" size="small"></loading>
          <span class="tag__desc">{{$t('entities.inLinkTrafficPercentage')}}</span>
          <span class="tag__value">{{entityData.linkInId ? entityData.linkInId : '-'}},&nbsp;</span>
          <span class="tag__desc">{{$t('entities.percentage')}}</span>
          <span class="tag__value">{{entityData.linkInPercent ? unitConvert(entityData.linkInPercent, unitTypes.percent).join(' ') : '-'}}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.alert')}}</div>
    <div class="overview__content overview__content-loading">
      <loading :loading="loadingAlert" size="small" inner-style="left: 10rem"></loading>
      <div class="overview__row" v-if="performanceData.length === 0">
        <span  class="no-recent-alerts"><i class="el-icon-success"></i>{{$t('relationShip.noRecentAlerts')}}</span>
      </div>
      <div class="overview__row" v-if="performanceData.length > 0">
        <div class="row__label">{{$t('entities.recentAlert')}}</div>
        <div class="row__content">{{entityData.performanceNum}}</div>
      </div>
      <div class="overview__row overview__row--small-font" v-for="(performance, index) in entityData.performanceList" :key="index">
        <div class="row__label row__label--width160">{{dateFormatByAppearance(performance.startTime) || '-'}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high" :class="iconClass(performance)">{{performance.eventSeverity}}</div>
          <div>{{performance.eventType}}</div>
        </div>
        <div class="row__content-loading"  style="position: relative;" >
          <loading :loading="!loadingAlert && loadingPerformance[index]?loadingPerformance[index]:false" :id="`loading${entity.ipAddr}_${index}`" size="small"></loading>
          <div class="row__charts"  :id="`entityPerformanceChart${entity.ipAddr}_${index}`"></div>
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
      <loading :loading="loadingSecurityEvents" size="small" inner-style="left: 10rem"></loading>
      <div class="overview__row" v-if="securityData.length === 0">
        <span class="no-recent-alerts"><i class="el-icon-success"></i>{{$t('relationShip.noRecentAlerts')}}</span>
      </div>
      <div class="overview__row" v-if="securityData.length > 0">
        <div class="row__label">{{$t('entities.recentSecurity')}}</div>
        <div class="row__content">{{entityData.securityNum}}</div>
      </div>
      <div class="overview__row overview__row--small-font" v-for="(security, index) in entityData.securityList" :key="index">
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
  <div class="overview-map overview-map--ip">
    <chart
        :chart-info="chart"
        :chart-data="chartData"
        :entity="entityCopy"
        :query-params="queryParams"
        :hide-header="true"
        :loading="loadingMap"
        @getCurrentTimeRange="getCurrentTimeRange"
    ></chart>
  </div>
</template>

<script>
import entityDetailMixin from './entityDetailMixin'
import ChartSingleValue from '@/views/charts/charts/ChartSingleValue'
import { api } from '@/utils/api'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import Chart from '@/views/charts/Chart'
import _ from 'lodash'
import { get } from '@/utils/http'
import relatedServer from '@/mixins/relatedServer'
import { getSecond, getMillisecond } from '@/utils/date-util'
import Loading from '@/components/common/Loading'

export default {
  name: 'Ip',
  mixins: [entityDetailMixin, relatedServer],
  components: {
    Loading,
    Chart,
    ChartSingleValue
  },
  data () {
    return {
      entityType: 'ip',
      trafficUrl: api.entityIpDetailTraffic,
      trafficUrlMap: api.entityIpDetailTrafficMap,
      relationUrl: api.entityIpDetailRelation,
      networkQuantityUrl: api.entityIpDetailNetworkQuantity,
      linkInUrl: api.entityIpDetailLinkIn,
      linkOutUrl: api.entityIpDetailLinkOut,
      performanceUrl: api.entityIpDetailPerformance,
      securityUrl: api.entityIpDetailSecurity,
      relatedServerDomainUrl: api.entityIpRelatedServerDomain,
      relatedServerAppUrl: api.entityIpRelatedServerApp,
      entityDetectionsIpUrl: api.entityDetectionsIp,
      entityDetectionsIpQueryRateUrl: api.entityDetectionsIpQueryRate,
      listMode: 'list',
      chartData: null,
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
        chartDatas: [null, null, null, null, null]
      },
      timer: null,
      loadingDns: false,
      loading: false,
      loadingTraffic: false,
      loadingRelationshipOne: false,
      loadingRelationshipTwo: false,
      loadingNetworkQuality: false,
      loadingOut: false,
      loadingIn: false,
      loadingAlert: false,
      loadingSecurityEvents: false,
      loadingMap: false
    }
  },
  computed: {
    ipLocationRegion () {
      return function (entityData) {
        let result = ''
        if (entityData.ipLocationCountry) {
          result += `${entityData.ipLocationCountry},`
        }
        if (entityData.ipLocationProvince) {
          result += `${entityData.ipLocationProvince},`
        }
        if (entityData.ipLocationCity) {
          result += `${entityData.ipLocationCity},`
        }
        result = result.substr(0, result.length - 1)
        if (!result) {
          result = '-'
        }
        return result
      }
    },
    detectionIpSupporting () {
      return function (entityData) {
        let result = ''
        if (entityData.dnssecSupport) {
          result += 'DNSSec/'
        }
        if (entityData.dohSupport) {
          result += 'DoH/'
        }
        if (entityData.dotSupport) {
          result += 'Dot'
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
    getQueryParams () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        ip: this.entity.ipAddr
      }
      return queryParams
    },
    getPerformanceQueryParams () {
      const queryParams = {
        serverIp: this.entity.ipAddr
      }
      return queryParams
    },
    handleRelationData (result) {
      this.entityData.appCount = result.appCount
      this.entityData.domainCount = result.domainCount
    },
    chartGetMap () {
      this.loadingMap = true
      get((this.trafficUrlMap), this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.chartData = response.data.result
        }
        this.loadingMap = false
      })
    },
    queryRelated () {
      this.getRelatedServerDataOne(this.relatedServerDomainUrl)
      this.getRelatedServerDataTwo(this.relatedServerAppUrl)
    }
  },
  mounted () {
    this.queryParams = this.getQueryParams()
    this.chartGetMap()
    this.$nextTick(() => {
      setTimeout(() => {
        this.queryRelated()
      }, 250)
    })
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
