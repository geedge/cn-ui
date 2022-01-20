<template>
  <div class="cn-chart__dns-record" :style="computePosition">
    <div class="cn-chart__body">
      <div class="entity-detail__dns-record">
        <div class="dns-record__table">
          <div style="height: 100%; overflow: hidden auto;">
            <div class="dns-record__table-row dns-record__table-row--header">
              <div class="dns-record__table-cell" style="min-width: 200px;">Type</div>
              <div class="dns-record__table-cell" style="width: 100%;">Value</div>
              <div class="dns-record__table-cell" style="width: 100%;">Country</div>
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
