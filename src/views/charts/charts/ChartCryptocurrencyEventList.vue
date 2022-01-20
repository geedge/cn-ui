<template>
  <div class="cn-chart__table eventList" :style="computePosition">
    <div class="cn-chart__body">
      <div class="crypto-eventList__record">
        <div class="record__table">
          <div style="height: 100%; overflow: hidden auto;">
            <div class="record__table-row" v-for="(data, index) in chartDate" :key="index">
              <div class="record__table-cell">
                <div class="circle1" style=""></div>
              </div>
              <div class="record__table-cell">
                {{$_.get(data, "message") || '-'}}：{{$_.get(data, "serverIP") || '-'}}<br/>
                <span class="record_second" > {{$_.get(data, "time") || '-'}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $_.get(data, "clientIP") || '-'}}&nbsp;&nbsp;&nbsp; </span>
                <div class="record_second arrow arrow-hor right"> </div>
                <span class="record_second">&nbsp;&nbsp;&nbsp; {{$_.get(data, "serverIP") || '-'}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChartCryptocurrencyEventList",
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object
  },
  data () {
    return {
      chartDate: [
        {message: 'Traffic', serverIP: '1.3.2.2', clientIP: '1.3.2.2', time: '2022-01-19 20:06:25'},
        {message: 'Traffic ', serverIP: '1.3.2.2', clientIP: '1.3.2.2', time: '2022-01-19 20:06:25'},
        {message: 'Traffic', serverIP: '1.3.2.2', clientIP: '1.3.2.2', time: '2022-01-19 20:06:25'},
        {message: 'Traffic', serverIP: '1.3.2.2', clientIP: '1.3.2.2', time: '2022-01-19 20:06:25'},
        {message: 'Traffic', serverIP: '1.3.2.2', clientIP: '1.3.2.2', time: '2022-01-19 20:06:25'},
        {message: 'Traffic', serverIP: '1.3.2.2', clientIP: '1.3.2.2', time: '2022-01-19 20:06:25'}
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
