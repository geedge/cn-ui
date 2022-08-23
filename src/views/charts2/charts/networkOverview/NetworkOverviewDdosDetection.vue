<template>
 <div class="ddos-detection">
   <div class="ddos-detection-title"><i class="cn-icon cn-icon-a-DDosDetection"></i>{{$t('network.ddosDetection')}}</div>
   <div class="ddos-detection-value">
     <chart-no-data v-if="isNoData"></chart-no-data>
     <div class="ddos-detection-type" v-else>
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.numberOfAttacks')}}</div>
         <div class="ddos-detection-type-value-number">{{$_.get(ddosData, 'attackerCount') || 0}}</div>
       </div>
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.number0fVictims')}}</div>
         <div class="ddos-detection-type-value-number">{{$_.get(ddosData, 'victimCount') || 0}}</div>
       </div>
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.number0fDetectedAttackEvents')}}</div>
         <div class="ddos-detection-type-value-number">{{$_.get(ddosData, 'attackEventCount') || 0}}</div>
       </div>
     </div>
     <el-button size="small">{{$t('network.ddosDetection')}}<i class="cn-icon cn-icon-arrow-right"></i></el-button>
   </div>
 </div>
</template>

<script>
import { api } from '@/utils/api'
import { get } from '@/utils/http'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
export default {
  name: 'NetworkOverviewDdosDetection',
  components: {
    ChartNoData
  },
  mixins: [chartMixin],
  data () {
    return {
      ddosData: {},
      isNoData: false
    }
  },
  watch: {
    timeFilter: {
      deep: true,
      handler (n) {
        this.ddosDetectDataRequests()
      }
    }
  },
  methods: {
    ddosDetectDataRequests () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      this.toggleLoading(true)
      get(api.netWorkOverview.ddosEventAnalysis, params).then(res => {
        if (res.code === 200) {
          if (res.data.result.length === 0) {
            this.isNoData = true
            return
          } else {
            this.isNoData = false
          }
          this.ddosData = res.data.result[0]
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.ddosDetectDataRequests()
  }
}
</script>
