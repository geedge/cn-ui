<template>
 <div class="npm-header">
  <div class="npm-header-body" v-for="(item, index) in chartData" :key=index>
    <div class="npm-header-body-severity">
      <div class="npm-header-body-severity-icon" :class="item.eventSeverity" :test-id="`icon${index}`"></div>
      <div class="npm-header-body-severity-value" :test-id="`severity${index}`">{{ $t(item.eventSeverity) }}</div>
    </div>
    <chart-error v-if="showError" tooltip :content="errorMsg" />
    <div v-else class="npm-header-body-total" :test-id="`total${index}`">{{item.count}}</div>
  </div>
 </div>
</template>

<script>
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import axios from 'axios'
import { dataForNpmEventsHeader } from '@/utils/static-data'

export default {
  name: 'NpmEventsHeader',
  components: { ChartError },
  mixins: [chartMixin],
  data () {
    return {
      chartData: dataForNpmEventsHeader.chartData,
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
        startTime: this.timeFilter && this.timeFilter.startTime ? getSecond(this.timeFilter.startTime) : '',
        endTime: this.timeFilter && this.timeFilter.endTime ? getSecond(this.timeFilter.endTime) : '',
        type: this.type
      }
      /* this.toggleLoading(true)
      axios.get(api.npm.events.list, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
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
          this.errorMsg = this.errorMsgHandler(res)
        }
      }).catch(e => {
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
        this.toggleLoading(false)
      }) */
      this.toggleLoading(false)
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.recentEventsListData()
    })
  }
}
</script>
