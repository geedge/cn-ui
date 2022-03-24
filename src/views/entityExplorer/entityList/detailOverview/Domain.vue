<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.category')}}</div>
        <div class="row__content">{{entityData.domainCategory || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.domainDetail.categoryGroup')}}</div>
        <div class="row__content">{{entityData.domainCategoryGroup || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.reputationLevel')}}</div>
        <div class="row__content">{{entityData.domainReputationScore || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.registration')}}</div>
        <div class="row__content">{{entityData.domainWhoisAddress || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.org')}}</div>
        <div class="row__content">{{entityData.domainWhoisOrg || '-'}}</div>
      </div>
<!--      <div class="overview__row">
        <div class="row__label row__label&#45;&#45;width130">{{$t('overall.remark')}}</div>
        <div class="row__content">{{entityData.domainDescription || '-'}}</div>
      </div>-->
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
            <div class="row__charts" :id="`entityDetailSend${entityData.domainName}`" ></div>
          </div>
          <div class="row__content">
            <div class="row__charts-msg">{{$t('overall.received')}}：{{unitConvert(entityData.bytesReceivedRate, unitTypes.byte).join(' ')}}ps</div>
            <!-- 曲线-->
            <div class="row__charts" :id="`entityDetailReceived${entityData.domainName}`" ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.relationship')}}</div>
    <div class="overview__content domain__content">
      <div class="overview__tags domain__tags" ref="relationship">
        <div class="overview__domain-tabs">
          <div class="overview__domain-tab">
            <div class="overview__tag domain__tag">
              <span class="tag__value">{{relationshipDataOne.length}}</span>
              <span class="tag__desc">{{$t('entities.relatedApp')}}</span>
            </div>
            <div class="overview__tag domain__tag-list" v-show="item.show" v-for="(item, index) in relationshipDataOne" :key="index">
              <span class="tag__desc">{{item.appName}}</span>
            </div>
          </div>
          <div class="overview__domain-btn">
            <div class="overview__domain-more" @click="more(relationshipDataOne, 1)" v-if="relationshipShowOne">...</div>
            <div class="overview__domain-more-tabs show-more-list" v-if="relationshipShowMoreOne" v-ele-click-outside="mouseout">
              <div class="domain-more-tab" v-for="item in relationshipMoreDataOne" :key="item">
                <span v-if="item.appName" :title="item.appName">{{item.appName}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="overview__domain-tabs">
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
    <div class="overview__content">
      <div class="overview__row">
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
        <div class="overview__tag">
          <span class="tag__desc">{{$t('entities.outLinkTrafficPercentage')}}</span>
          <span class="tag__value">{{entityData.linkOutId ? entityData.linkOutId : '-'}},</span>
          <span class="tag__desc">{{$t('entities.percentage')}}</span>
          <span class="tag__value">{{entityData.linkOutPercent ? unitConvert(entityData.linkOutPercent, unitTypes.percent).join(' ') + '%' : '-'}}</span>
        </div>
        <div class="overview__tag">
          <span class="tag__desc">{{$t('entities.inLinkTrafficPercentage')}}</span>
          <span class="tag__value">{{entityData.linkInId ? entityData.linkInId : '-'}},</span>
          <span class="tag__desc">{{$t('entities.percentage')}}</span>
          <span class="tag__value">{{entityData.linkInPercent ? unitConvert(entityData.linkInPercent, unitTypes.percent).join(' ') + '%' : '-'}}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.alert')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label">{{$t('entities.recentAlert')}}</div>
        <div class="row__content">{{entityData.performanceNum}}</div>
      </div>
      <div class="overview__row overview__row--small-font" v-for="(performance, index) in entityData.performanceList" :key="index">
        <div class="row__label row__label--width160">{{dayJs.tz(getMillisecond(performance.startTime)).format('YYYY-MM-DD HH:mm:ss') || '-'}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high">{{performance.eventSeverity}}</div>
          <div>{{performance.eventType}}</div>
        </div>
        <div class="row__desc"></div>
      </div>
      <div class="overview__row overview__row--small-font" v-if="entityData.performanceList && entityData.performanceList.length > 3">
        <div class="show-more">{{$t('overall.showMore')}}>></div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('entities.securityEvents')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label">{{$t('entities.recentSecurity')}}</div>
        <div class="row__content">{{entityData.securityNum}}</div>
      </div>
      <div class="overview__row overview__row--small-font" v-for="(security, i) in entityData.securityList" :key="i">
        <div class="row__label row__label--width160">{{dayJs.tz(getMillisecond(security.startTime)).format('YYYY-MM-DD HH:mm:ss') || '-'}}</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high">{{security.eventSeverity}}</div>
          <div>{{security.securityType}}</div>
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
import ChartSingleValue from '@/views/charts/charts/ChartSingleValue'
import { api } from '@/utils/api'
import entityDetailMixin from './entityDetailMixin'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import Chart from '@/views/charts/Chart'
import _ from 'lodash'
import { get } from '@/utils/http'
import relatedServer from '@/mixins/relatedServer'
import { getSecond, getMillisecond } from '@/utils/date-util'

export default {
  name: 'Domain',
  components: {
    ChartSingleValue,
    Chart
  },
  mixins: [entityDetailMixin, relatedServer],
  data () {
    return {
      // entityData: {},
      entityType: 'domain',
      trafficUrl: api.entityDomainDetailTraffic,
      relationUrl: api.entityDomainDetailRelation,
      networkQuantityUrl: api.entityDomainDetailNetworkQuantity,
      linkInUrl: api.entityDomainDetailLinkIn,
      linkOutUrl: api.entityDomainDetailLinkOut,
      performanceUrl: api.entityDomainDetailPerformance,
      securityUrl: api.entityDomainDetailSecurity,
      trafficUrlMap: api.entityDomainDetailTrafficMap,
      relatedServerIpUrl: api.entityDomainRelatedServerIp,
      relatedServerAppUrl: api.entityDomainRelatedServerApp,
      basicProperties: api.entityDomainDetailBasic,
      chartData: null,
      listMode: 'list',
      singleValues: {
        chartInfos: [
          {
            params: {
              icon: 'cn-icon cn-icon-time',
              unitType: unitTypes.time
            },
            type: 51,
            i18n: 'entities.avgRoundTripTime'
          },
          {
            params: {
              icon: 'cn-icon cn-icon-http',
              unitType: unitTypes.time
            },
            type: 51,
            i18n: 'entities.httpResponseLatency'
          },
          {
            params: {
              icon: 'cn-icon cn-icon-ssl',
              unitType: unitTypes.time
            },
            type: 51,
            i18n: 'entities.sslConLatency'
          },
          {
            params: {
              icon: 'cn-icon cn-icon-package-loss',
              unitType: unitTypes.percent
            },
            type: 51,
            i18n: 'entities.sequenceGapLossPercent'
          },
          {
            params: {
              icon: 'cn-icon cn-icon-upload',
              unitType: unitTypes.percent
            },
            type: 51,
            i18n: 'entities.pktRetransPercent'
          }
        ],
        chartDatas: [null, null, null, null, null]
      }
    }
  },
  methods: {
    getMillisecond,
    getQueryParams () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        domain: this.entity.domainName
      }
      return queryParams
    },
    handleRelationData (result) {
      this.entityData.appCount = result.appCount
      this.entityData.ipCount = result.ipCount
    },
    chartGetMap () {
      get(this.trafficUrlMap, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.chartData = response.data.result
        }
      })
    },
    getBasicProperties () {
      get(this.basicProperties, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.entityData = {
            ...this.entityData,
            domainCategory: response.data.result.domainCategory,
            domainCategoryGroup: response.data.result.domainCategoryGroup,
            domainDescription: response.data.result.domainDescription,
            domainReputationScore: response.data.result.domainReputationScore,
            domainWhoisAddress: response.data.result.domainWhoisAddress,
            domainWhoisOrg: response.data.result.domainWhoisOrg
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
        this.getBasicProperties()
      }, 250)
    })
  },
  setup (props) {
    const entityCopy = {
      ..._.cloneDeep(props.entity),
      domain: props.entity.domainName
    }
    return {
      chart: {
        params: {
          url: '/interface/entity/detail/domain/trafficMap?startTime={{startTime}}&endTime={{endTime}}&country={{country}}&domain={{domain}}',
          unitType: 'number',
          valueColumn: 'sessions'
        },
        type: 2
      },
      entityCopy,
      unitTypes,
      unitConvert
    }
  }
}
</script>
