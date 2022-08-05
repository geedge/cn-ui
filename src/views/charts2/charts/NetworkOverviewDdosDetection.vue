<template>
 <div class="ddos-detection">
   <div class="ddos-detection-title"><i class="cn-icon cn-icon-a-DDosDetection"></i>{{$t('network.ddosDetection')}}</div>
   <div class="ddos-detection-value">
     <div class="ddos-detection-type">
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
export default {
  name: 'NetworkOverviewDdosDetection',
  props: {
    timeFilter: Object
  },
  data () {
    return {
      ddosData: {}
    }
  },
  methods: {
    ddosDetectDataRequests () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      get(api.netWorkOverview.ddosEventAnalysis, params).then(res => {
        if (res.code === 200) {
          this.ddosData = res.data.result[0]
        }
      })
    }
  },
  mounted () {
    this.ddosDetectDataRequests()
  }
}
</script>
