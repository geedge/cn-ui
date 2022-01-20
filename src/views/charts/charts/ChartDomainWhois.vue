<template>

  <div class="cn-chart__whois" :style="computePosition">
    <div class="cn-chart__body">
      <div class="domain-detail-list">
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.sponsor')}}</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "registrar") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.org')}}</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "org") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">Email</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "email") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('overall.country')}}</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "country") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.creationDate')}}</div>
          <div class="domain-detail-list__content">{{ parseMsDate($_.get(chartData, "createTime")) || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.expirationDate')}}</div>
          <div class="domain-detail-list__content">{{ parseMsDate($_.get(chartData, "expirationTime")) || '-'}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChartDomainWhois",
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object
  },
  computed: {
    computePosition() {
      const gridColumn = `${this.chartInfo.x} / ${this.chartInfo.x + this.chartInfo.w}`
      const gridRow = `${this.chartInfo.y} / ${this.chartInfo.y + this.chartInfo.h}`
      return {
        gridColumn,
        gridRow
      }
    }
  }
}
</script>
