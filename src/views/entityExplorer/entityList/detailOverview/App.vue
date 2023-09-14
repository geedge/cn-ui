<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">APP ID</div>
        <div class="row__content">{{$_.get(entity, 'category.appId', '-') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.category')}}</div>
        <div class="row__content">{{$_.get(entity, 'category.appCategory', '-') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.subcategory')}}</div>
        <div class="row__content">{{$_.get(entity, 'category.appSubcategory', '-') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.riskLevel')}}</div>
        <div class="row__content">{{$_.get(entity, 'category.appRisk') ? appRisk(parseInt(entity.category.appRisk)) : '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.remark')}}</div>
        <div class="row__content">{{$_.get(entity, 'category.appDescription', '-') || '-'}}</div>
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
               <div class="row__charts" :id="`entityDetailSend${entity.entityValue}`" ></div>
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
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.tab.relatedDomain')}}</div>
        <div class="row__content overview__row-related">
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
        <div class="row__label row__label--width130">{{$t('entities.tab.relatedIp')}}</div>

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
  <div class="overview-map overview-map--app">
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
  name: 'App',
  mixins: [entityDetailMixin, relatedServer],
  components: {
    Chart,
    Loading
  },
  data () {
    return {
      // entityData: {}
      entityType: 'app',
      // trafficUrl: api.entityAppDetailTraffic,
      trafficUrl: api.entity.entityList.appThroughput,
      relationUrl: api.entityAppDetailRelation,
      // networkQuantityUrl: api.entityAppDetailNetworkQuantity,
      networkQuantityUrl: api.entity.entityList.appPerformance,
      linkInUrl: api.entityAppDetailLinkIn,
      linkOutUrl: api.entityAppDetailLinkOut,
      // performanceUrl: api.entityAppDetailPerformance,
      performanceUrl: api.entity.entityList.appEventPerformance,
      securityUrl: api.entity.entityList.appSecurity,
      // securityUrl: api.entityAppDetailSecurity,
      // trafficUrlMap: api.entityAppDetailTrafficMap,
      trafficUrlMap: api.entity.entityList.appTrafficMap,
      relatedServerDomainUrl: api.entity.entityList.appRelatedDomain,
      relatedServerIpUrl: api.entity.entityList.appRelatedIp,
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
        resource: this.entity.entityValue,
        appName: this.entity.entityValue
      }
    },
    getPerformanceQueryParams () {
      return {
        appName: this.entity.entityValue
      }
    },
    handleRelationData (result) {
      this.entityData.domainCount = result.domainCount
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
    const entityData = ref({ ...props.entity })
    return {
      chart: {
        params: {
          url: `${api.entity.entityList.appTrafficMap}?resource={{resource}}&country={{country}}`,
          unitType: 'number',
          valueColumn: 'sessions'
        },
        type: 2
      },
      unitTypes,
      entityCopy: {
        ..._.cloneDeep(props.entity)
      },
      valueToRangeValue,
      entityData
    }
  }
}
</script>
