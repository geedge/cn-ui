<template>
  <div class="cn-chart__whois">
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
          <div class="domain-detail-list__label">注册机构邮箱</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "email") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">注册机构电话</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "domain_whois_phone") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">注册国家</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "country") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">注册地邮编</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "domain_whois_postcode") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.creationDate')}}</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "createTime") ? dateFormatByAppearance($_.get(chartData, "createTime") * 1) : '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">过期时间</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "expirationTime") ? dateFormatByAppearance($_.get(chartData, "expirationTime") * 1) : '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">主办单位名称</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "domain_icp_company_name") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">主办单位性质</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "domain_icp_company_type") || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">网站备案号</div>
          <div class="domain-detail-list__content">{{ $_.get(chartData, "domain_icp_site_license") || '-'}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartDomainWhois',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object
  }
}
</script>
