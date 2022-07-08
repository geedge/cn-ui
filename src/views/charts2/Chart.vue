<template>
  <div class="cn-chart" style="background-color: lightgray;height: 100%;">
    <loading :loading="loading"></loading>
    <chart-no-data v-if="isNoData"></chart-no-data>
    <network-overview-line
        v-if="chart.type === typeMapping.networkOverview.line"
        :chart="chart"
    ></network-overview-line>
    <network-overview-ddos-detection
        v-else-if="chart.type === typeMapping.networkOverview.ddosDetection"
        :chart="chart"
    ></network-overview-ddos-detection>
    <network-overview-performance-event
        v-else-if="chart.type === typeMapping.networkOverview.performanceEvent"
        :chart="chart"
    ></network-overview-performance-event>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { typeMapping } from '@/views/charts2/chart-tools'
import NetworkOverviewLine from '@/views/charts2/charts/NetworkOverviewLine'
import NetworkOverviewDdosDetection from '@/views/charts2/charts/NetworkOverviewDdosDetection'
import NetworkOverviewPerformanceEvent from '@/views/charts2/charts/NetworkOverviewPerformanceEvent'
export default {
  name: 'Chart',
  components: {
    Loading,
    ChartNoData,
    NetworkOverviewLine,
    NetworkOverviewDdosDetection,
    NetworkOverviewPerformanceEvent
  },
  props: {
    chart: Object
  },
  data () {
    return {
      typeMapping,
      loading: false,
      isNoData: false
    }
  }
}
</script>
