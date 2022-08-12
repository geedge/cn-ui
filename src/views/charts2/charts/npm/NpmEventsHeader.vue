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
    timeFilter: Object,
    // type: String
  },
  data () {
    return {
      chartData: [],
      type: 'severity'
    }
  },
  methods: {
    recentEventsListData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        type: this.type
      }
      get(api.npm.events.list, params).then(res => {
        if (res.code === 200) {
          res.data.result.forEach(t => {
            if (t.eventSeverity === 'critical') {
              t.index = 0
            } else if (t.eventSeverity === 'high') {
              t.index = 1
            } else if (t.eventSeverity === 'info') {
              t.index = 4
            } else if (t.eventSeverity === 'low') {
              t.index = 3
            } else if (t.eventSeverity === 'medium') {
              t.index = 2
            }
          })
          this.chartData = res.data.result.sort((a, b) => { return a.index - b.index })
        }
      })
    }
  },
  mounted () {
    this.recentEventsListData()
  }
}
</script>
