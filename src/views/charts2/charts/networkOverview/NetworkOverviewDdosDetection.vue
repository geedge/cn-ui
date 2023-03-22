<template>
 <div class="ddos-detection">
   <chart-no-data v-if="isNoData" test-id="noData"></chart-no-data>
   <chart-error info v-if="showError" :content="errorMsg" />

   <div class="ddos-detection-title">
     <i class="cn-icon cn-icon-a-DDosDetection"></i>
     {{$t('network.ddosDetection')}}
   </div>
   <div class="ddos-detection-value" v-if="!isNoData && !showError">
     <div class="ddos-detection-type">
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.numberOfAttacks')}}</div>
         <div class="ddos-detection-type-value-number" test-id="attackerCount">{{unitConvert($_.get(ddosData, 'attackerCount'), unitTypes.number).join(' ')}}</div>
       </div>
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.number0fVictims')}}</div>
         <div class="ddos-detection-type-value-number" test-id="victimCount">{{unitConvert($_.get(ddosData, 'victimCount'), unitTypes.number).join(' ')}}</div>
       </div>
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.number0fDetectedAttackEvents')}}</div>
         <div class="ddos-detection-type-value-number ddos-event" test-id="attackEventCount">{{unitConvert($_.get(ddosData, 'attackEventCount'), unitTypes.number).join(' ')}}</div>
       </div>
     </div>
     <el-button size="small">{{$t('network.ddosDetection')}}<i class="cn-icon cn-icon-arrow-right"></i></el-button>
   </div>
 </div>
</template>

<script>
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import axios from 'axios'
export default {
  name: 'NetworkOverviewDdosDetection',
  components: {
    ChartError,
    ChartNoData
  },
  mixins: [chartMixin],
  data () {
    return {
      ddosData: {},
      unitConvert,
      unitTypes,
      isNoData: false,
      showError: false,
      errorMsg: ''
    }
  },
  watch: {
    timeFilter: {
      handler () {
        this.ddosDetectDataRequests()
      }
    }
  },
  methods: {
    ddosDetectDataRequests () {
      const params = {
        startTime: this.timeFilter && this.timeFilter.startTime ? getSecond(this.timeFilter.startTime) : '',
        endTime: this.timeFilter && this.timeFilter.endTime ? getSecond(this.timeFilter.endTime) : ''
      }
      this.toggleLoading(true)
      axios.get(api.netWorkOverview.ddosEventAnalysis, { params: params }).then(res => {
        res = res.data
        if (res.code === 200) {
          this.showError = false
          this.isNoData = res.data.result.length === 0
          this.ddosData = res.data.result[0]
        } else {
          this.isNoData = false
          this.showError = true
          this.errorMsg = this.errorMsgHandler(res)
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = false
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.ddosDetectDataRequests()
    })
  },
  beforeUnmount () {
    this.unitConvert = null
  }
}
</script>
