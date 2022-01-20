<template>
  <div class="cn-chart__dns-record">
    <div class="cn-chart__body">
      <div class="entity-detail__dns-record">
        <div class="dns-record__table">
          <div style="height: 100%; overflow: hidden auto;">
            <div class="dns-record__table-row dns-record__table-row--header">
              <div class="dns-record__table-cell" style="min-width: 200px;">{{ $t('overall.type') }}</div>
              <div class="dns-record__table-cell" style="min-width: 200px;">{{ $t('overall.value') }}</div>
              <div class="dns-record__table-cell" style="width: 100%;">{{ $t('overall.country') }}</div>
            </div>
            <div class="dns-record__table-row" v-for="(data, index) in chartDate" :key="index">
              <div class="dns-record__table-cell">{{$_.get(data, "type") || '-'}}</div>
              <div class="dns-record__table-cell">{{$_.get(data, "value") || '-'}}</div>
              <div class="dns-record__table-cell">{{$_.get(data, "country") || '-'}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChartDomainDnsRecord",
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object
  },
  data () {
    return {
      chartDate: [
        {type: '1', value: '2', country: 'z'},
        {type: '1', value: '2', country: 'm'},
        {type: '1', value: '2', country: 'h'}
      ]
    }
  }
}
</script>
