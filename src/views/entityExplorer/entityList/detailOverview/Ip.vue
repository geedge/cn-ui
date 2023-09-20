<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.location')}}</div>
        <div class="row__content">
          <div v-if="entity.location" style="display: flex">
            <div v-if="entity.location.country">
              <img v-if="entity.location.country===countryNameIdMapping.Unknown || !countryNameIdMapping[entity.location.country]" src="../../../../../public/images/flag/Unknown.svg" class="filter-country-flag">
              <img v-else :src="require(`../../../../../public/images/flag/${countryNameIdMapping[entity.location.country]}.png`)" class="filter-country-flag" >
            </div>
            {{ipLocationRegion(entity.location)}}
          </div>
          <div v-else>-</div>
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">ASN</div>
        <div class="row__content">{{$_.get(entity, 'asn.asn', '-') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.openPort')}}</div>
        <div class="row__content">{{ openPort }}</div>
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
            <div class="row__charts-msg">{{valueToRangeValue(entityData.queryRate, unitTypes.bps).join(' ')}}</div>
            <!-- 曲线-->
            <div class="row__content-loading">
              <loading :loading="!loadingDns && loading" size="small"></loading>
              <div class="row__charts" :id="`entityDnsServerInfo${entity.entityValue}`"></div>
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
        <div class="row__content">
          {{valueToRangeValue(entityData.max, unitTypes.bps).join(' ') !== '- ' ? valueToRangeValue(entityData.max, unitTypes.bps).join(' ') : '-'}}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.average')}}</div>
        <div class="row__content">
          {{valueToRangeValue(entityData.avg, unitTypes.bps).join(' ') !== '- ' ? valueToRangeValue(entityData.avg, unitTypes.bps).join(' ') : '-'}}
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.throughput')}}</div>
        <div class="row__contents">
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.sent')}}:
              {{valueToRangeValue(entityData.bytesSentRate, unitTypes.bps).join(' ') !== '- ' ? valueToRangeValue(entityData.bytesSentRate, unitTypes.bps).join(' ') : '-'}}
            </div>
            <!-- 曲线-->
            <div class="row__content-loading">
              <div class="row__charts" :id="`entityDetailSend${entity.entityValue}`"></div>
            </div>
          </div>
          <div class="row__content row__content-accept">
            <div class="row__charts-msg">{{$t('overall.received')}}:
              {{valueToRangeValue(entityData.bytesReceivedRate, unitTypes.bps).join(' ') !== '- ' ? valueToRangeValue(entityData.bytesReceivedRate, unitTypes.bps).join(' ') : '-'}}
            </div>
            <!-- 曲线-->
            <div class="row__content-loading">
              <div class="row__charts" :id="`entityDetailReceived${entity.entityValue}`"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.networkQualityRating')}}</div>
        <div style="position: relative;">
          <div class="entity-score" v-if="!loadingNetworkQuality">
            <div v-if="score !== '-'">
              <div class="circle-icon"  v-if="score <= 2 || score === '-'" :class="{'data-score-red': score <= 2 || score === '-'}" ></div>
              <div class="circle-icon"  v-else-if="score <= 4" :class="{'data-score-yellow': score <= 4}" ></div>
              <div class="circle-icon"  v-else-if="score <= 6" :class="{'data-score-green': score <= 6}" ></div>
            </div>
            {{score}}
          </div>
          <loading :loading="loadingNetworkQuality" size="small" style="left: 1rem;width: 50%;"></loading>
        </div>
      </div>
    </div>
  </div>

  <div class="overview-item">
    <div class="overview__title">{{$t('overall.relationship')}}</div>
    <div class="overview__content domain__content">
      <div class="overview__tags domain__tags" ref="relationship"></div>
      <div class="overview__row overview__row-related">
        <div class="row__label row__label--width130">{{$t('entities.tab.relatedApp')}}</div>
        <div class="row__content">
          <div v-if="loadingRelationshipOne" style="position: relative;width: 450px;">
            <loading :loading="loadingRelationshipOne" size="small" style="left: 1rem;"></loading>
          </div>

          <div class="data-item" v-show="item.show" v-for="(item, index) in relationshipDataOne" :key="index">
            {{item.value}}
          </div>
          <div v-if="relationshipDataOne.length===0 && !loadingRelationshipOne">-</div>

          <div v-if="relationshipShowOne">
            <div class="data-item show-more-related" id="related-app-more" @click.stop="showMoreApp" style="position: relative">...</div>
            <div v-if="isShowMoreApp" class="app-popover_block" id="showRelatedApp">
              <div class="popover-content" v-for="(item, index) in relationshipDataOne" :key="index">
                <span v-if="!item.show">{{item.value}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="overview__row overview__row-related">
        <div class="row__label row__label--width130">{{$t('entities.relatedDomain')}}</div>
        <div class="row__content">
          <div v-if="loadingRelationshipTwo" style="position: relative;width: 450px;">
            <loading :loading="loadingRelationshipTwo" size="small" style="left: 1rem;"></loading>
          </div>

          <div class="data-item" v-show="item.show" v-for="(item, index) in relationshipDataTwo" :key="index">
            {{item.value}}
          </div>
          <div v-if="relationshipDataTwo.length===0 && !loadingRelationshipTwo">-</div>

          <div v-if="relationshipShowTwo">
            <div class="data-item show-more-related" id="related-domain-more" @click.stop="showMoreDomain" style="position: relative">...</div>
            <div v-if="isShowMoreDomain" class="domain-popover_block" id="showRelatedDomain">
              <div v-for="(item, index) in relationshipDataTwo" :key="index">
                <span v-if="!item.show">{{item.value}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="overview-item">
    <div class="overview__title">{{$t('overall.performanceEvents')}}</div>
    <div class="overview__content overview__content-loading">
      <loading :loading="loadingAlert" size="small" inner-style="left: 10rem"></loading>
      <div class="overview__row" v-if="performanceData.length === 0">
        <span  class="no-recent-alerts"><i class="el-icon-success"></i>{{$t('relationShip.noRecentAlerts')}}</span>
      </div>
      <div class="overview__row" v-if="performanceData.length > 0">
        <div class="row__label row__label--width130">{{$t('entities.recentAlert')}}</div>
        <div class="row__content">{{entityData.performanceNum}}</div>
      </div>
      <div class="overview__row overview__row--small-font" v-for="(performance, index) in entityData.performanceList" :key="index">
        <div class="row__label row__label--width130">{{dateFormatByAppearance(performance.startTime) || '-'}}</div>
        <div class="row__content row__content--width90">
          <div class="alert-level-tag alert-level-tag--high" :class="iconClass(performance)">{{performance.eventSeverity}}</div>
        </div>
        <div class="row__content-loading" style="position: relative;">
          <div class="performance-event-remark">{{performance.eventType}}</div>
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
        <div class="row__label row__label--width130">{{$t('entities.recentSecurity')}}</div>
        <div class="row__content">{{entityData.securityNum}}</div>
      </div>

      <div class="overview__row overview__row--small-font" v-for="(security, index) in entityData.securityList" :key="index">
        <div class="row__label row__label--width130">{{dateFormatByAppearance(security.startTime) || '-'}}</div>
        <div class="row__content row__content--width90">
          <div class="alert-level-tag alert-level-tag--high" :class="iconClass(security)">{{security.eventSeverity}}</div>
        </div>
        <div class="cn-detection__header" >
          <i class="cn-icon cn-icon-attacker"></i>
          <span>{{ security.offenderIp }}</span>
          <div class="domain" v-if="security.offenderIp===security.serverIp">{{ security.domain }}</div>
          <span class="line">-------</span>
          <span class="circle"></span>
          <i class="cn-icon cn-icon-attacked"></i>
          <span>{{ security.victimIp }}</span>
          <div class="domain" v-if="security.victimIp===security.serverIp">{{ security.domain }}</div>
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
import { api } from '@/utils/api'
import { unitTypes, countryNameIdMapping } from '@/utils/constants'
import { valueToRangeValue } from '@/utils/unit-convert'
import Chart from '@/views/charts/Chart'
import _ from 'lodash'
import relatedServer from '@/mixins/relatedServer'
import { dateFormatByAppearance, getMillisecond } from '@/utils/date-util'
import Loading from '@/components/common/Loading'
import axios from 'axios'

export default {
  name: 'Ip',
  mixins: [entityDetailMixin, relatedServer],
  components: {
    Loading,
    Chart
  },
  data () {
    return {
      entityType: 'ip',
      // trafficUrl: api.entityIpDetailTraffic,
      trafficUrl: api.entity.entityList.ipThroughput,
      // trafficUrlMap: api.entityIpDetailTrafficMap,
      trafficUrlMap: api.entity.entityList.ipTrafficMap,
      relationUrl: api.entityIpDetailRelation,
      // networkQuantityUrl: api.entityIpDetailNetworkQuantity,
      networkQuantityUrl: api.entity.entityList.ipPerformance,
      linkInUrl: api.entityIpDetailLinkIn,
      linkOutUrl: api.entityIpDetailLinkOut,
      performanceUrl: api.entity.entityList.ipEventPerformance,
      // performanceUrl: api.entityIpDetailPerformance,
      // securityUrl: api.entityIpDetailSecurity,
      securityUrl: api.entity.entityList.ipSecurity,
      relatedServerDomainUrl: api.entity.entityList.ipRelatedDomain,
      relatedServerAppUrl: api.entity.entityList.ipRelatedApp,
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
      loadingMap: false,
      openPort: '-',
      countryNameIdMapping
    }
  },
  computed: {
    ipLocationRegion () {
      return function (entityData) {
        if (!entityData) {
          return '-'
        }
        let result = ''
        if (entityData.country) {
          result += `${entityData.country},`
        }
        if (entityData.province) {
          result += `${entityData.province},`
        }
        if (entityData.city) {
          result += `${entityData.city},`
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
    dateFormatByAppearance,
    getQueryParams () {
      return {
        resource: this.entity.entityValue
      }
    },
    getPerformanceQueryParams () {
      return {
        serverIp: this.entity.entityValue
      }
    },
    handleRelationData (result) {
      this.entityData.appCount = result.appCount
      this.entityData.domainCount = result.domainCount
    },
    chartGetMap () {
      this.loadingMap = true
      axios.get(this.trafficUrlMap, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          this.chartData = response.data.data.result
        }
        this.loadingMap = false
      })
    },
    queryRelated () {
      this.getRelatedServerDataOne(this.relatedServerAppUrl)
      this.getRelatedServerDataTwo(this.relatedServerDomainUrl)
    },
    getOpenPort () {
      const params = {
        // startTime: getSecond(this.timeFilter.startTime),
        // endTime: getSecond(this.timeFilter.endTime),
        resource: this.entity.entityValue
      }

      axios.get(api.entity.entityList.ipRelatedPort, { params: params }).then(res => {
        if (res.status === 200 && res.data.data.result.length) {
          this.openPort = ''
          res.data.data.result.forEach(item => {
            this.openPort += item.port + '/' + item.l7Protocol + ','
          })
          this.openPort = this.openPort.slice(0, -1)
        }
      })
    }
  },
  mounted () {
    this.queryParams = this.getQueryParams()
    this.$nextTick(() => {
      setTimeout(() => {
        this.chartGetMap()
        this.getOpenPort()
        this.queryRelated()
      }, 250)
    })
  },
  setup (props) {
    const entityCopy = {
      ..._.cloneDeep(props.entity),
      ip: props.entity.entityValue
    }
    return {
      chart: {
        params: {
          url: `${api.entity.entityList.ipTrafficMap}?resource={{resource}}&country={{country}}`,
          unitType: 'number',
          valueColumn: 'sessions'
        },
        id: props.entity.entityValue,
        type: 2
      },
      entityCopy,
      unitTypes,
      valueToRangeValue
    }
  }
}
</script>
