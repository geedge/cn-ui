<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.category')}}</div>
        <div class="row__content" v-high-light="keywordList">{{ $_.get(entityData, 'category.categoryName', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.domainDetail.categoryGroup')}}</div>
        <div class="row__content" v-high-light="keywordList">{{ $_.get(entityData, 'category.categoryGroup', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.reputationLevel')}}</div>
        <div class="row__content">{{$_.get(entityData, 'category.reputationLevel', '-') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.registration')}}</div>
        <div class="row__content">{{$_.get(entityData, 'whois.registrantCountry', '-') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.org')}}</div>
        <div class="row__content" v-high-light="keywordList">{{ $_.get(entityData, 'whois.registrantOrg', '-') || '-' }}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.icpCompanyName')}}</div>
        <div class="row__content">{{$_.get(entityData, 'icp.icpCompanyName', '-') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.icpLicense')}}</div>
        <div class="row__content">{{$_.get(entityData, 'icp.icpSiteLicense', '-') || '-'}}</div>
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
            <div class="row__charts-msg">{{$t('overall.sent')}}：
              {{valueToRangeValue(entityData.bytesSentRate, unitTypes.bps).join(' ') !== '- ' ? valueToRangeValue(entityData.bytesSentRate, unitTypes.bps).join(' ') : '-'}}
            </div>
            <!-- 曲线-->
            <div class="row__content-loading">
              <div class="row__charts" :id="`entityDetailSend${entity.entityValue}`" >{</div>
            </div>
          </div>
          <div class="row__content row__content-accept">
            <div class="row__charts-msg">{{$t('overall.received')}}：
              {{valueToRangeValue(entityData.bytesReceivedRate, unitTypes.bps).join(' ') !== '- ' ? valueToRangeValue(entityData.bytesReceivedRate, unitTypes.bps).join(' ') : '-'}}
            </div>
            <!-- 曲线-->
            <div class="row__content-loading">
              <div class="row__charts" :id="`entityDetailReceived${entity.entityValue}`" ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.networkQualityRating')}}</div>
        <div style="position: relative;">
          <div class="entity-score" v-if="!loadingNetworkQuality && score !=='-'">
            <span v-for="(dot, i) in scoreDot" :key="i" :class="dot.class"></span>
            <span style="padding-left: 4px;">{{score}}</span>
          </div>
          <div class="entity-score" v-else>{{score}}</div>
          <loading :loading="loadingNetworkQuality" size="small" style="left: 1rem;width: 50%;"></loading>
        </div>
      </div>
    </div>
  </div>

  <div class="overview-item">
    <div class="overview__title">{{$t('overall.relationship')}}</div>
    <div class="overview__content domain__content">
      <div class="overview__tags domain__tags" ref="relationship"></div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.tab.relatedApp')}}</div>
        <div class="row__content overview__row-related">
          <div v-if="loadingRelationshipOne" style="position: relative;width: 450px;">
            <loading :loading="loadingRelationshipOne" size="small" style="left: 1rem;"></loading>
          </div>

          <div class="data-item high-light-block" v-high-light="keywordList" v-show="item.show" v-for="(item, index) in relationshipDataOne" :key="index">
            {{item.value}}
          </div>
          <div v-if="relationshipDataOne.length===0 && !loadingRelationshipOne">-</div>

          <div v-if="relationshipShowOne">
            <div class="data-item show-more-related" id="related-app-more" @click.stop="showMoreApp" style="position: relative">...</div>
            <div v-if="isShowMoreApp" class="app-popover_block" id="showRelatedApp">
              <div class="popover-content" v-for="(item, index) in relationshipDataOne" :key="index">
                <span v-if="!item.show" class="high-light-block" v-high-light="keywordList">{{item.value}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="overview__row overview__row-related">
        <div class="row__label row__label--width130">{{$t('entities.tab.relatedIp')}}</div>
        <div class="row__content">
          <div v-if="loadingRelationshipTwo" style="position: relative;width: 450px;">
            <loading :loading="loadingRelationshipTwo" size="small" style="left: 1rem;"></loading>
          </div>
          <div class="data-item high-light-block" v-high-light="keywordList" v-show="item.show" v-for="(item, index) in relationshipDataTwo" :key="index">
            {{item.value}}
          </div>
          <div v-if="relationshipDataTwo.length===0 && !loadingRelationshipTwo">-</div>

          <div v-if="relationshipShowTwo">
            <div class="data-item show-more-related" id="related-domain-more" @click.stop="showMoreDomain" style="position: relative">...</div>
            <div v-if="isShowMoreDomain" class="domain-popover_block" id="showRelatedDomain">
              <div v-for="(item, index) in relationshipDataTwo" :key="index">
                <span v-if="!item.show" class="high-light-block" v-high-light="keywordList">{{item.value}}</span>
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

      <div class="overview__row overview__row--small-font" v-for="(security, i) in entityData.securityList" :key="i">
        <div class="row__label row__label--width130">{{dateFormatByAppearance(getMillisecond(security.startTime)) || '-'}}</div>
        <div class="row__content row__content--width90">
          <div class="alert-level-tag alert-level-tag--high" :class="iconClass(security)">{{security.eventSeverity}}</div>
        </div>
        <div class="cn-detection__header">
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
  <div class="overview-map">
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
import { api } from '@/utils/api'
import entityDetailMixin from './entityDetailMixin'
import { unitTypes } from '@/utils/constants'
import { valueToRangeValue } from '@/utils/unit-convert'
import Chart from '@/views/charts/Chart'
import _ from 'lodash'
import axios from 'axios'
import relatedServer from '@/mixins/relatedServer'
import { dateFormatByAppearance, getMillisecond, getSecond } from '@/utils/date-util'
import Loading from '@/components/common/Loading'
import { ref } from 'vue'

export default {
  name: 'Domain',
  components: {
    Loading,
    Chart
  },
  props: {
    keywordList: Array
  },
  mixins: [entityDetailMixin, relatedServer],
  data () {
    return {
      // entityData: {},
      entityType: 'domain',
      // trafficUrl: api.entityDomainDetailTraffic,
      trafficUrl: api.entity.entityList.domainThroughput,
      relationUrl: api.entityDomainDetailRelation,
      networkQuantityUrl: api.entity.entityList.domainPerformance,
      // networkQuantityUrl: api.entityDomainDetailNetworkQuantity,
      linkInUrl: api.entityDomainDetailLinkIn,
      linkOutUrl: api.entityDomainDetailLinkOut,
      // performanceUrl: api.entityDomainDetailPerformance,
      performanceUrl: api.entity.entityList.domainEventPerformance,
      // securityUrl: api.entityDomainDetailSecurity,
      securityUrl: api.entity.entityList.domainSecurity,
      // trafficUrlMap: api.entityDomainDetailTrafficMap,
      trafficUrlMap: api.entity.entityList.domainTrafficMap,
      relatedServerIpUrl: api.entity.entityList.domainRelatedIp,
      relatedServerAppUrl: api.entity.entityList.domainRelatedApp,
      basicProperties: api.entityDomainDetailBasic,
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
        chartDatas: [null, null, null, null, null]
      },
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
  methods: {
    getMillisecond,
    dateFormatByAppearance,
    getQueryParams () {
      return {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        resource: this.entity.entityValue
      }
    },
    getPerformanceQueryParams () {
      return {
        domain: this.entity.entityValue
      }
    },
    handleRelationData (result) {
      this.entityData.appCount = result.appCount
      this.entityData.ipCount = result.ipCount
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
    getBasicProperties () {
      axios.get(this.basicProperties, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          this.entityData = {
            ...this.entityData,
            domainCategory: response.data.data.result.domainCategory,
            domainCategoryGroup: response.data.data.result.domainCategoryGroup,
            domainDescription: response.data.data.result.domainDescription,
            domainReputationScore: response.data.data.result.domainReputationScore,
            domainWhoisAddress: response.data.data.result.domainWhoisAddress,
            domainWhoisOrg: response.data.data.result.domainWhoisOrg,
            domainIcpCompanyName: response.data.data.result.domainIcpCompanyName,
            domainIcpSiteLicense: response.data.data.result.domainIcpSiteLicense
          }
        }
      })
    },
    queryRelated () {
      this.getRelatedServerDataOne(this.relatedServerAppUrl)
      this.getRelatedServerDataTwo(this.relatedServerIpUrl)
    }
  },
  mounted () {
    this.queryParams = this.getQueryParams()
    this.$nextTick(() => {
      setTimeout(() => {
        this.chartGetMap()
        // this.getBasicProperties()
        this.queryRelated()
      }, 250)
    })
  },
  setup (props) {
    const entityData = ref({ ...props.entity })
    const entityCopy = {
      ..._.cloneDeep(props.entity),
      domain: props.entity.entityValue
    }
    return {
      chart: {
        params: {
          url: `${api.entity.entityList.domainTrafficMap}?resource={{resource}}&country={{country}}`,
          unitType: 'number',
          valueColumn: 'sessions'
        },
        type: 2
      },
      entityCopy,
      unitTypes,
      valueToRangeValue,
      entityData
    }
  }
}
</script>
