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
    <network-overview-apps
        v-else-if="chart.type === typeMapping.networkOverview.appList"
        :chart="chart"
    >
    </network-overview-apps>
    <npm-tabs
        v-else-if="chart.type === typeMapping.npm.npmTabs"
        @tabChange="npmTabChange"
    ></npm-tabs>
    <npm-network-quantity
        v-else-if="chart.type === typeMapping.npm.npmNetworkQuantity"
        :chart="chart"
    ></npm-network-quantity>
    <npm-app-category-score
        v-else-if="chart.type === typeMapping.npm.npmAppCategoryScore"
        :chart="chart"
    ></npm-app-category-score>
    <npm-map
        v-else-if="chart.type === typeMapping.npm.npmMap"
        :chart="chart"
    ></npm-map>
    <npm-line
        v-else-if="chart.type === typeMapping.npm.npmLine"
        :chart="chart"
    ></npm-line>
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
import NetworkOverviewApps from '@/views/charts2/charts/NetworkOverviewApps'
import NpmTabs from '@/views/charts2/charts/NpmTabs'
import NpmNetworkQuantity from '@/views/charts2/charts/NpmNetworkQuantity'
import NpmAppCategoryScore from '@/views/charts2/charts/NpmAppCategoryScore'
import NpmMap from '@/views/charts2/charts/NpmMap'
import NpmLine from '@/views/charts2/charts/NpmLine'
export default {
  name: 'Chart',
  components: {
    NpmLine,
    NpmMap,
    NpmAppCategoryScore,
    Loading,
    ChartNoData,
    NetworkOverviewLine,
    NetworkOverviewDdosDetection,
    NetworkOverviewPerformanceEvent,
    NetworkOverviewTabs,
    NetworkOverviewApps,
    NpmTabs,
    NpmNetworkQuantity
  },
  props: {
    chart: Object,
    timeFilter: Object,
    extraParams: Object
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
