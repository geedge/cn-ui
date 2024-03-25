<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{ $t('entity.subscriberId') }}</div>
        <div class="row__content">{{$_.get(entity, 'entityValue', '-') || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.location')}}</div>
        <div class="row__content" v-high-light="keywordList">{{$_.get(entity, 'subscriber_longitude', '-') || '-'}},&nbsp;{{$_.get(entity, 'subscriber_latitude', '-') || '-'}}</div>
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
        <div class="row__contents row__contents-subscriber">
          <div class="row__content row__content-sent">
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
    </div>
  </div>

  <div class="overview-map overview-map--app">
<!--    <chart-->
<!--        :chart-info="chart"-->
<!--        :chart-data="chartData"-->
<!--        :entity="entityCopy"-->
<!--        :query-params="queryParams"-->
<!--        :hide-header="true"-->
<!--        :loading="loadingMap"-->
<!--        @getCurrentTimeRange="getCurrentTimeRange"-->
<!--    ></chart>-->
    <subscriber-map :entity="entity"></subscriber-map>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import entityDetailMixin from './entityDetailMixin'
import { unitTypes } from '@/utils/constants'
import { valueToRangeValue } from '@/utils/unit-convert'
import _ from 'lodash'
import axios from 'axios'
import relatedServer from '@/mixins/relatedServer'
import { dateFormatByAppearance, getMillisecond, getSecond, getNowTime } from '@/utils/date-util'
import Loading from '@/components/common/Loading'
import { ref } from 'vue'
import SubscriberMap from '@/views/entityExplorer/entityList/detailOverview/SubscriberMap'

export default {
  name: 'Subscriber',
  mixins: [entityDetailMixin, relatedServer],
  components: {
    Loading,
    SubscriberMap
  },
  props: {
    keywordList: Array
  },
  data () {
    return {
      // entityData: {}
      entityType: 'subscriber',
      // trafficUrl: api.entityAppDetailTraffic,
      trafficUrl: api.entity.entityList.subscriberThroughput,
      // relationUrl: api.entityAppDetailRelation,
      // networkQuantityUrl: api.entityAppDetailNetworkQuantity,
      networkQuantityUrl: api.entity.entityList.subscriberPerformance,
      // linkInUrl: api.entityAppDetailLinkIn,
      // linkOutUrl: api.entityAppDetailLinkOut,
      // performanceUrl: api.entityAppDetailPerformance,
      // securityUrl: api.entityAppDetailSecurity,
      // trafficUrlMap: api.entityAppDetailTrafficMap,
      // trafficUrlMap: api.entity.entityList.appTrafficMap,
      // relatedServerDomainUrl: api.entity.entityList.appRelatedDomain,
      relatedServerAppUrl: api.entity.entityList.subscriberRelatedApp,
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
    getQueryParams (dateRangeValue) {
      if (dateRangeValue && (!this.timeFilter.startTime || !this.timeFilter.endTime)) {
        // range取 config.js 中配置的值
        const { startTime, endTime } = getNowTime(dateRangeValue)
        return {
          startTime: getSecond(startTime),
          endTime: getSecond(endTime),
          resource: this.entity.entityValue
        }
      } else {
        return {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          resource: this.entity.entityValue
        }
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
    queryRelated () {
      this.getRelatedServerDataOne(this.relatedServerAppUrl)
    }
  },
  mounted () {
    this.queryParams = this.getQueryParams()
    this.$nextTick(() => {
      setTimeout(() => {
        this.queryRelated()
      }, 250)
    })
  },
  setup (props) {
    const entityData = ref({ ...props.entity })
    return {
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
