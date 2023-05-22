<template>
  <div>
    <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
    <chart-no-data v-if="isNoData && !showError"></chart-no-data>

    <div v-if="!showError && !isNoData && !loading" class="type-data__column">
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark" ></span>{{ $t('entities.tab.currentDevelopmentPortsAndServices') }}&nbsp;&nbsp;(5)</div>
        <div class="type-content">
          <div v-for="openPort in openPortList" class="data-item">{{openPort}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getNowTime, getSecond } from '@/utils/date-util'
import axios from 'axios'
import { api } from '@/utils/api'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'OpenPort',
  mixins: [chartMixin],
  props: {
  },
  data () {
    return {
      openPortList: [],
      showError: false,
      errorMsg: '',
      loading: true
    }
  },
  mounted () {
    this.initData()
  },
  setup () {
    const { query } = useRoute()
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime
    // 若url携带了，使用携带的值，否则使用默认值。
    const dateRangeValue = rangeParam ? parseInt(query.range) : 60
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const {
        startTime,
        endTime
      } = getNowTime(60)
      timeFilter.value.startTime = startTime
      timeFilter.value.endTime = endTime
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }
    return {
      timeFilter
    }
  },
  methods: {
    initData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)
      this.loading = true
      axios.get(api.entity.openPort, { params: params }).then(response => {
        const res = response.data
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.showError = false
          if (!this.isNoData) {
            this.openPortList = res.data.result
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        // console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
        this.loading = false
      })
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
      this.openPortList = ['11/rpcbind', '22/rpcbind', '231/zmpt', '22/rpcbind', '231/zmpt']
    }
  }
}
</script>
