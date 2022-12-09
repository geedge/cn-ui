<template>
 <div class="npm-header">
  <div class="npm-header-body" v-for="(item, index) in chartData" :key=index>
    <div class="npm-header-body-severity">
      <div class="npm-header-body-severity-icon" :class="item.eventSeverity"></div>
      <div class="npm-header-body-severity-value">{{item.eventSeverity}}</div>
    </div>
    <chart-error v-if="showError" tooltip :content="errorMsg" />
    <div v-else class="npm-header-body-total">{{item.count}}</div>
  </div>
 </div>
</template>

<script>
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
export default {
  name: 'NpmEventsHeader',
  components: { ChartError },
  mixins: [chartMixin],
  data () {
    return {
      chartData: [
        {
          eventSeverity: 'critical',
          count: '-',
          index: 0
        },
        {
          eventSeverity: 'high',
          count: '-',
          index: 1
        },
        {
          eventSeverity: 'medium',
          count: '-',
          index: 2
        },
        {
          eventSeverity: 'low',
          count: '-',
          index: 3
        },
        {
          eventSeverity: 'info',
          count: '-',
          index: 4
        }
      ],
      type: 'severity',
      showError: false,
      errorMsg: ''
    }
  },
  watch: {
    timeFilter: {
      handler () {
        this.recentEventsListData()
      }
    }
  },
  methods: {
    recentEventsListData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        type: this.type
      }
      this.toggleLoading(true)
      get(api.npm.events.list, params).then(res => {
        if (res.code === 200) {
          this.showError = false
          if (res.data.result.length === 0) {
            this.chartData.forEach(d => { d.count = '-' })
          }
          res.data.result.forEach(t => {
            this.chartData.forEach(d => {
              if (d.eventSeverity === t.eventSeverity) {
                d.count = t.count.toLocaleString()
              }
            })
          })
        } else {
          this.showError = true
          this.errorMsg = res.message
        }
      }).catch(error => {
        this.showError = true
        this.errorMsg = error.message
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.recentEventsListData()
  }
}
</script>
