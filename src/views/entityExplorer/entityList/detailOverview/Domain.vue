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
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.remark')}}</div>
        <div class="row__content">{{entityData.domainDescription || '-'}}</div>
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
    <div class="overview__content">
      <div class="overview__tags">
        <div class="overview__tag">
          <span class="tag__value">{{entityData.appCount}}</span>
          <span class="tag__desc">{{$t('entities.relatedApp')}}</span>
        </div>
        <div class="overview__tag">
          <span class="tag__value">{{entityData.ipCount}}</span>
          <span class="tag__desc">{{$t('entities.relatedServerIp')}}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.networkQuality')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <single-value
            :type="51"
            icon="cn-icon cn-icon-time"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.avgRoundTripTime')}}</span>
          </template>
          <template #data>
            <span>{{entityData.establishLatency ? unitConvert(entityData.establishLatency, unitTypes.time).join(' ') : '-'}}</span>
          </template>
        </single-value>
        <single-value
            :type="51"
            icon="cn-icon cn-icon-http"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.httpResponseLatency')}}</span>
          </template>
          <template #data>
            <span>{{entityData.httpResponseLatency ? unitConvert(entityData.httpResponseLatency, unitTypes.time).join(' ') : '-'}}</span>
          </template>
        </single-value>
        <single-value
            :type="51"
            icon="cn-icon cn-icon-ssl"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.sslConLatency')}}</span>
          </template>
          <template #data>
            <span>{{entityData.sslConLatency ? unitConvert(entityData.sslConLatency, unitTypes.time).join(' ') : '-'}}</span>
          </template>
        </single-value>
        <single-value
            :type="51"
            icon="cn-icon cn-icon-package-loss"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.sequenceGapLossPercent')}}</span>
          </template>
          <template #data>
            <span>{{entityData.sequenceGapLossPercent ? unitConvert(entityData.sequenceGapLossPercent, unitTypes.percent).join(' ') : '-'}}</span>
          </template>
        </single-value>
        <single-value
            :type="51"
            icon="cn-icon cn-icon-upload"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.pktRetransPercent')}}</span>
          </template>
          <template #data>
            <span>{{entityData.pktRetransPercent ? unitConvert(entityData.pktRetransPercent, unitTypes.percent).join(' ') : '-'}}</span>
          </template>
        </single-value>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('entities.accessLink')}}</div>
    <div class="overview__content">
      <div class="overview__tags">
        <div class="overview__tag">
          <span class="tag__desc">{{$t('entities.outLinkTrafficPercentage')}}</span>
          <span class="tag__value">{{entityData.linkOutPercent ? unitConvert(entityData.linkOutPercent, unitTypes.percent).join(' ') + '%' : '-'}}</span>
        </div>
        <div class="overview__tag">
          <span class="tag__desc">{{$t('entities.inLinkTrafficPercentage')}}</span>
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
    <chart
        :chart="chart"
        :entity="entityCopy"
        :hide-header="true"
        @getCurrentTimeRange="getCurrentTimeRange"
    ></chart>
  </div>
</template>

<script>
import SingleValue from '@/components/charts/ChartSingleValue'
import { api } from '@/utils/api'
import entityDetailMixin from './entityDetailMixin'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import Chart from '@/views/charts/Chart'
import _ from 'lodash'
export default {
  name: 'Domain',
  components: {
    SingleValue,
    Chart
  },
  mixins: [entityDetailMixin],
  data () {
    return {
      entityData: {},
      entityType: 'domain',
      trafficUrl: api.entityDomainDetailTraffic,
      relationUrl: api.entityDomainDetailRelation,
      networkQuantityUrl: api.entityDomainDetailNetworkQuantity,
      linkInUrl: api.entityDomainDetailLinkIn,
      linkOutUrl: api.entityDomainDetailLinkOut,
      alertUrl: api.entityDomainDetailAlert,
      securityUrl: api.entityDomainDetailSecurity,
      listMode: 'list'
    }
  },
  methods: {
    getQueryParams () {
      const queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        domain: this.entityData.domainName
      }
      return queryParams
    },
    handleRelationData (result) {
      this.entityData.appCount = result.appCount
      this.entityData.ipCount = result.ipCount
    }
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
