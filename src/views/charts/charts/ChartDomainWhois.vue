<template>

  <div class="cn-chart__whois" :style="computePosition">
    <div class="cn-chart__body">
      <div class="domain-detail-list">
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.sponsor')}}</div>
          <div class="domain-detail-list__content">{{ chartData && chartData.registrar ? chartData.registrar : '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.org')}}</div>
          <div class="domain-detail-list__content">{{chartData && chartData.org ? chartData.org : '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">Email</div>
          <div class="domain-detail-list__content">{{chartData && chartData.postcode ? chartData.postcode : '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('overall.country')}}</div>
          <div class="domain-detail-list__content">{{chartData && chartData.country ? chartData.country : '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.creationDate')}}</div>
          <div class="domain-detail-list__content">{{chartData ? parseMsDate(chartData.createTime) : '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.expirationDate')}}</div>
          <div class="domain-detail-list__content">{{chartData ? parseMsDate(chartData.expirationTime) : '-'}}</div>
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
