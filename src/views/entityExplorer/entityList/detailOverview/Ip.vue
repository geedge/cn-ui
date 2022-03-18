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
    <div class="overview__content domain__content">
      <div class="overview__tags domain__tags" ref="relationship">
        <div class="overview__domain-tabs">
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
        <div class="overview__domain-tabs">
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
          <span class="tag__value">{{entityData.linkOutId ? entityData.linkOutId : '-'}},&nbsp;</span>
          <span class="tag__desc">{{$t('entities.percentage')}}</span>
          <span class="tag__value">{{entityData.linkOutPercent ? unitConvert(entityData.linkOutPercent, unitTypes.percent).join(' ') + '%' : '-'}}</span>
        </div>
        <div class="overview__tag">
          <span class="tag__desc">{{$t('entities.inLinkTrafficPercentage')}}</span>
          <span class="tag__value">{{entityData.linkInId ? entityData.linkInId : '-'}},&nbsp;</span>
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
        <div class="row__content">{{entityData.alertNum || '-'}}</div>
      </div>
      <div class="overview__row overview__row--small-font" v-for="(alert, index) in entityData.alertList" :key="index">
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
      <div class="overview__row overview__row--small-font" v-for="(security, index) in entityData.securityList" :key="index">
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
  <div class="overview-map overview-map--ip">
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
import entityDetailMixin from './entityDetailMixin'
import ChartSingleValue from '@/views/charts/charts/ChartSingleValue'
import { api } from '@/utils/api'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import Chart from '@/views/charts/Chart'
import _ from 'lodash'
import { get } from '@/utils/http'
import relatedServer from '@/mixins/relatedServer'
import { getSecond } from '@/utils/date-util'

export default {
  name: 'Ip',
  mixins: [entityDetailMixin, relatedServer],
  components: {
    Chart,
    ChartSingleValue
  },
  data () {
    return {
      // entityData: {}
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
      listMode: 'list',
      chartData: null,
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
      },
      timer: null
    }
  },
  computed: {
    ipLocationRegion () {
      return function (entityData) {
        const hasProvinceAndCity = entityData.ipLocationProvince && entityData.ipLocationCity &&
            entityData.ipLocationProvince !== 'null' && entityData.ipLocationCity !== 'null'
        const hasProvince = entityData.ipLocationProvince && entityData.ipLocationProvince !== 'null'
        const hasCity = entityData.ipLocationCity && entityData.ipLocationCity !== 'null'
        if (hasProvinceAndCity) {
          return `${entityData.ipLocationProvince}, ${entityData.ipLocationCity}`
        } else if (hasProvince) {
          return entityData.ipLocationProvince
        } else if (hasCity) {
          return entityData.ipLocationCity
        } else {
          return '-'
        }
      }
    }
  },
  methods: {
    getQueryParams () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        ip: this.entity.ipAddr
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
        }
      })
    },
    queryRelated () {
      this.getRelatedServerDataOne(this.relatedServerDomainUrl)
      this.getRelatedServerDataTwo(this.relatedServerAppUrl)
    }
  },
  mounted () {
    this.queryParams = this.getQueryParams()
    this.$nextTick(() => {
      setTimeout(() => {
        this.chartGetMap()
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
