<template>
 <div class="ddos-detection">
   <div class="ddos-detection-title"><i class="cn-icon cn-icon-a-DDosDetection"></i>{{$t('network.ddosDetection')}}</div>
   <div class="ddos-detection-value">
     <div class="ddos-detection-type">
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.numberOfAttacks')}}</div>
         <div class="ddos-detection-type-value-number">365</div>
       </div>
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.number0fVictims')}}</div>
         <div class="ddos-detection-type-value-number">65</div>
       </div>
       <div class="ddos-detection-type-value">
         <div class="ddos-detection-type-value-name">{{$t('network.number0fDetectedAttackEvents')}}</div>
         <div class="ddos-detection-type-value-number">25</div>
       </div>
     </div>
     <el-button size="small">{{$t('network.ddosDetection')}}<i class="cn-icon cn-icon-arrow-right"></i></el-button>
   </div>
 </div>
</template>

<script>
export default {
  name: 'NetworkOverviewDdosDetection'
}
</script>
