<template>
 <div class="npm-header">
  <div class="npm-header-body" v-for="(item, index) in chartData" :key="index">
    <div class="npm-header-body-severity">
      <div class="npm-header-body-severity-icon" :class="item.eventSeverity"></div>
      <div class="npm-header-body-severity-value">{{item.eventSeverity}}</div>
    </div>
    <div class="npm-header-body-total">{{item.count}}</div>
  </div>
 </div>
</template>

<script>
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import { api } from '@/utils/api'

export default {
  name: 'NpmEventsHeader',
  props: {
    chart: Object,
    timeFilter: Object
  },
  data () {
    return {
      chartData: []
    }
  },
  methods: {
    recentEventsListData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        type: 'severity'
      }
      get(api.npm.events.list, params).then(res => {
        if (res.code === 200) {
          this.chartData = res.data.result
        }
      })
    }
  },
  mounted () {
    this.recentEventsListData()
  }
}
</script>
