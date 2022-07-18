<template>
  <div class="cn-chart" style="height: 100%; width: 100%;">
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
    <network-overview-tabs
         v-else-if="chart.type === typeMapping.networkOverview.table"
    ></network-overview-tabs>
    <npm-tabs
        v-else-if="chart.type === typeMapping.npm.npmTabs"
        @tabChange="npmTabChange"
    ></npm-tabs>
    <npm-network-quantity
        v-else-if="chart.type === typeMapping.npm.npmNetworkQuantity"
        :chart="chart"
    ></npm-network-quantity>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { typeMapping } from '@/views/charts2/chart-tools'
import NetworkOverviewLine from '@/views/charts2/charts/NetworkOverviewLine'
import NetworkOverviewDdosDetection from '@/views/charts2/charts/NetworkOverviewDdosDetection'
import NetworkOverviewPerformanceEvent from '@/views/charts2/charts/NetworkOverviewPerformanceEvent'
import NetworkOverviewTabs from '@/views/charts2/charts/NetworkOverviewTabs'
import NpmTabs from '@/views/charts2/charts/NpmTabs'
import NpmNetworkQuantity from '@/views/charts2/charts/NpmNetworkQuantity'
export default {
  name: 'Chart',
  components: {
    Loading,
    ChartNoData,
    NetworkOverviewLine,
    NetworkOverviewDdosDetection,
    NetworkOverviewPerformanceEvent,
    NetworkOverviewTabs,
    NpmTabs,
    NpmNetworkQuantity
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
  },
  methods: {
    npmTabChange (index) {
      this.$emit('npmTabChange', index)
    }
  }
}
</script>
