<template>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.basicInfo')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.category')}}</div>
        <div class="row__content">XXX</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.domainDetail.categoryGroup')}}</div>
        <div class="row__content">XXX</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.reputationLevel')}}</div>
        <div class="row__content">XXX</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.registration')}}</div>
        <div class="row__content">China, Beijing</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('entities.org')}}</div>
        <div class="row__content">XXX</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.remark')}}</div>
        <div class="row__content">XXX</div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.traffic')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.peak')}}</div>
        <div class="row__content">XXX</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.mean')}}</div>
        <div class="row__content">XXX</div>
      </div>
      <div class="overview__row">
        <div class="row__label row__label--width130">{{$t('overall.throughput')}}</div>
        <div class="row__contents">
          <div class="row__content">XXX</div>
          <div class="row__content">XXX</div>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.relationship')}}</div>
    <div class="overview__content">
      <div class="overview__tags">
        <div class="overview__tag">
          <span class="tag__value">5</span>
          <span class="tag__desc">{{$t('entities.relatedApp')}}</span>
        </div>
        <div class="overview__tag">
          <span class="tag__value">8</span>
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
            icon="cn-icon cn-icon-sub-category"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.avgRoundTripTime')}}</span>
          </template>
          <template #data>
            <span>12ms</span>
          </template>
        </single-value>
        <single-value
            :type="51"
            icon="cn-icon cn-icon-sub-category"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.avgRoundTripTime')}}</span>
          </template>
          <template #data>
            <span>12ms</span>
          </template>
        </single-value>
        <single-value
            :type="51"
            icon="cn-icon cn-icon-sub-category"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.avgRoundTripTime')}}</span>
          </template>
          <template #data>
            <span>12ms</span>
          </template>
        </single-value>
        <single-value
            :type="51"
            icon="cn-icon cn-icon-sub-category"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.avgRoundTripTime')}}</span>
          </template>
          <template #data>
            <span>12ms</span>
          </template>
        </single-value>
        <single-value
            :type="51"
            icon="cn-icon cn-icon-sub-category"
            class="cn-chart__single-value--detail-overview"
            :loading="false"
            style="width: 180px;"
        >
          <template #title>
            <span>{{$t('entities.avgRoundTripTime')}}</span>
          </template>
          <template #data>
            <span>12ms</span>
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
          <span class="tag__value">50%</span>
          <span class="tag__desc">{{$t('entities.outLinkTrafficPercentage')}}</span>
        </div>
        <div class="overview__tag">
          <span class="tag__value">80%</span>
          <span class="tag__desc">{{$t('entities.inLinkTrafficPercentage')}}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('overall.alert')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label">{{$t('entities.recentAlert')}}</div>
        <div class="row__content">30</div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="row__label row__label--width160">2011-11-15 12:23:34</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high">High</div>
          <div>High RTT Times</div>
        </div>
        <div class="row__desc">中位数超出阈值</div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="row__label row__label--width160">2011-11-15 12:23:34</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--middle">Middle</div>
          <div>High RTT Times</div>
        </div>
        <div class="row__desc">中位数超出阈值</div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="row__label row__label--width160">2011-11-15 12:23:34</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--low">Low</div>
          <div>High RTT Times</div>
        </div>
        <div class="row__desc">中位数超出阈值</div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="show-more">{{$t('overall.showMore')}}>></div>
      </div>
    </div>
  </div>
  <div class="overview-item">
    <div class="overview__title">{{$t('entities.securityEvents')}}</div>
    <div class="overview__content">
      <div class="overview__row">
        <div class="row__label">{{$t('entities.recentSecurity')}}</div>
        <div class="row__content">20</div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="row__label row__label--width160">2011-11-15 12:23:34</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--high">High</div>
          <div>High RTT Times</div>
        </div>
        <div class="row__desc">中位数超出阈值</div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="row__label row__label--width160">2011-11-15 12:23:34</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--middle">Middle</div>
          <div>High RTT Times</div>
        </div>
        <div class="row__desc">中位数超出阈值</div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="row__label row__label--width160">2011-11-15 12:23:34</div>
        <div class="row__content row__content--width200">
          <div class="alert-level-tag alert-level-tag--low">Low</div>
          <div>High RTT Times</div>
        </div>
        <div class="row__desc">中位数超出阈值</div>
      </div>
      <div class="overview__row overview__row--small-font">
        <div class="show-more">{{$t('overall.showMore')}}>></div>
      </div>
    </div>
  </div>
</template>

<script>
import SingleValue from '@/components/charts/ChartSingleValue'
export default {
  name: 'Domain',
  components: {
    SingleValue
  }
}
</script>
