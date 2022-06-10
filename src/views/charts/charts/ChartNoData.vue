<template>
  <div v-if="activeTab !== 709 && activeTab !== 710" class="panel-chart__no-data">No data</div>
  <div v-else class="panel-chart__no-data all-clear">
    <div class="no-recent-alerts">
      <i class="el-icon-circle-check"></i>
      <span>{{$t('detection.allClear')}}</span>
    </div>
    <div class="no-detection">{{$t('detection.noDetection')}}</div>
  </div>
</template>

<script>
export default {
  name: 'ChartNoData',
  props: {
    activeTab: Number
  }
}
</script>
