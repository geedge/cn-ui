<template>
  <div class="cn-chart" style="height: 100%; width: 100%;">
    <loading :loading="loading && !disableLoading"></loading>
    <network-overview-line
        v-if="chart.type === typeMapping.networkOverview.line"
        :chart="chart"
        :metric="metric"
        :time-filter="timeFilter"
        ref="networkLine"
        @toggleLoading="toggleLoading"
    ></network-overview-line>
    <network-overview-ddos-detection
        v-else-if="chart.type === typeMapping.networkOverview.ddosDetection"
        :chart="chart"
        :time-filter="timeFilter"
        @toggleLoading="toggleLoading"
    ></network-overview-ddos-detection>
    <network-overview-performance-event
        v-else-if="chart.type === typeMapping.networkOverview.performanceEvent"
        :chart="chart"
        :time-filter="timeFilter"
        @toggleLoading="toggleLoading"
    ></network-overview-performance-event>
    <network-overview-tabs
         v-else-if="chart.type === typeMapping.networkOverview.table"
         :time-filter="timeFilter"
         :metric="metric"
         :chart="chart"
         :ref="`tab${chart.id}`"
         @toggleLoading="toggleLoading"
    ></network-overview-tabs>
    <npm-app-event-table
         v-else-if="chart.type === typeMapping.npm.appEventTable"
         :time-filter="timeFilter"
         :chart="chart"
         :chartData="chartData"
         :ref="`tab${chart.id}`"
         @toggleLoading="toggleLoading"
    ></npm-app-event-table>
    <network-overview-apps
        v-else-if="chart.type === typeMapping.networkOverview.appList"
        :chart="chart"
        :metric="metric"
        :time-filter="timeFilter"
        @toggleLoading="toggleLoading"
    >
    </network-overview-apps>
    <npm-tabs
        v-else-if="chart.type === typeMapping.npm.npmTabs"
        :time-filter="timeFilter"
        :chart="chart"
        @tabChange="npmTabChange"
        @toggleLoading="toggleLoading"
    ></npm-tabs>
    <npm-network-quantity
        v-else-if="chart.type === typeMapping.npm.npmNetworkQuantity"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-network-quantity>
    <npm-app-category-score
        v-else-if="chart.type === typeMapping.npm.npmAppCategoryScore"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-app-category-score>
    <npm-map
        v-else-if="chart.type === typeMapping.npm.npmMap"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-map>
    <npm-line
        v-else-if="chart.type === typeMapping.npm.npmLine"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-line>
    <npm-events-header
        v-else-if="chart.type === typeMapping.npm.npmEventsHeader"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-events-header>
    <npm-events-by-type
        v-else-if="chart.type === typeMapping.npm.npmEventsByType"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-events-by-type>
    <npm-recent-events
        v-else-if="chart.type === typeMapping.npm.npmRecentEvents"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-recent-events>
    <related-sessions
        v-else-if="chart.type === typeMapping.npm.relatedSessions"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></related-sessions>
    <npm-ip-map
        v-else-if="chart.type === typeMapping.npm.npmIpMap"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-ip-map>
    <npm-traffic-line
        v-else-if="chart.type === typeMapping.npm.npmTrafficLine"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></npm-traffic-line>
    <link-block
        v-else-if="chart.type === typeMapping.linkMonitor.linkBlock"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></link-block>
    <link-traffic-sankey
        v-else-if="chart.type === typeMapping.linkMonitor.linkTrafficSankey"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></link-traffic-sankey>
    <link-traffic-line
        v-else-if="chart.type === typeMapping.linkMonitor.linkTrafficLine"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></link-traffic-line>
    <link-direction-grid
        v-else-if="chart.type === typeMapping.linkMonitor.linkDirectionGrid"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></link-direction-grid>
    <dns-traffic-line
        v-else-if="chart.type === typeMapping.dnsInsight.dnsTrafficLine"
        :time-filter="timeFilter"
        :chart="chart"
        @toggleLoading="toggleLoading"
    ></dns-traffic-line>
    <entity-detail-basic-info
        v-else-if="chart.type === typeMapping.entityDetail.basicInfo"
        :chart="chart"
        :entity="entity"
        @toggleLoading="toggleLoading"
    ></entity-detail-basic-info>
    <entity-detail-subscriber-kpi
        v-else-if="chart.type === typeMapping.entityDetail.subscriberKpi"
        :chart="chart"
        :entity="entity"
        @toggleLoading="toggleLoading"
    ></entity-detail-subscriber-kpi>
    <entity-detail-subscriber-top-app
            v-else-if="chart.type === typeMapping.entityDetail.subscriberTopApp"
            :chart="chart"
            :entity="entity"
            @toggleLoading="toggleLoading"
    ></entity-detail-subscriber-top-app>
    <entity-detail-line
            v-else-if="chart.type === typeMapping.entityDetail.line"
            :chart="chart"
            :entity="entity"
            @toggleLoading="toggleLoading"
    ></entity-detail-line>
    <entity-detail-subscriber-line
            v-else-if="chart.type === typeMapping.entityDetail.subscriberLine"
            :chart="chart"
            :entity="entity"
            @toggleLoading="toggleLoading"
    ></entity-detail-subscriber-line>
    <entity-detail-tabs-chart
        v-else-if="chart.type === typeMapping.entityDetail.tabsChart"
        :chart="chart"
        :entity="entity"
        @toggleLoading="toggleLoading"
    ></entity-detail-tabs-chart>
    <entity-detail-map
        v-else-if="chart.type === typeMapping.entityDetail.map"
        :chart="chart"
        :entity="entity"
        @toggleLoading="toggleLoading"
    ></entity-detail-map>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import { typeMapping } from '@/views/charts2/chart-tools'
import NetworkOverviewLine from '@/views/charts2/charts/networkOverview/NetworkOverviewLine'
import NetworkOverviewDdosDetection from '@/views/charts2/charts/networkOverview/NetworkOverviewDdosDetection'
import NetworkOverviewPerformanceEvent from '@/views/charts2/charts/networkOverview/NetworkOverviewPerformanceEvent'
import NetworkOverviewTabs from '@/views/charts2/charts/networkOverview/NetworkOverviewTabs'
import NetworkOverviewApps from '@/views/charts2/charts/networkOverview/NetworkOverviewApps'
import NpmTabs from '@/views/charts2/charts/npm/NpmTabs'
import NpmAppEventTable from '@/views/charts2/charts/npm/NpmAppEventTable'
import NpmNetworkQuantity from '@/views/charts2/charts/npm/NpmNetworkQuantity'
import NpmAppCategoryScore from '@/views/charts2/charts/npm/NpmAppCategoryScore'
import NpmMap from '@/views/charts2/charts/npm/NpmMap'
import NpmLine from '@/views/charts2/charts/npm/NpmLine'
import NpmEventsByType from '@/views/charts2/charts/npm/NpmEventsByType'
import NpmRecentEvents from '@/views/charts2/charts/npm/NpmRecentEvents'
import NpmEventsHeader from '@/views/charts2/charts/npm/NpmEventsHeader'
import RelatedSessions from '@/views/charts2/charts/npm/RelatedSessions'
import NpmIpMap from '@/views/charts2/charts/npm/NpmIpMap'
import NpmTrafficLine from '@/views/charts2/charts/npm/NpmTrafficLine'
import LinkBlock from '@/views/charts2/charts/linkMonitor/LinkBlock'
import LinkTrafficSankey from '@/views/charts2/charts/linkMonitor/LinkTrafficSankey'
import LinkTrafficLine from '@/views/charts2/charts/linkMonitor/LinkTrafficLine'
import DnsTrafficLine from '@/views/charts2/charts/dnsInsight/DnsTrafficLine'
import EntityDetailBasicInfo from '@/views/charts2/charts/entityDetail/EntityDetailBasicInfo'
import EntityDetailLine from '@/views/charts2/charts/entityDetail/EntityDetailLine'
import EntityDetailSubscriberLine from '@/views/charts2/charts/entityDetail/EntityDetailSubscriberLine'
import EntityDetailSubscriberKpi from '@/views/charts2/charts/entityDetail/EntityDetailSubscriberKpi'
import EntityDetailSubscriberTopApp from '@/views/charts2/charts/entityDetail/EntityDetailSubscriberTopApp'
import EntityDetailTabsChart from '@/views/charts2/charts/entityDetail/EntityDetailTabs'
import EntityDetailMap from '@/views/charts2/charts/entityDetail/EntityDetailMap'

import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'
import LinkDirectionGrid from '@/views/charts2/charts/linkMonitor/LinkDirectionGrid'
export default {
  name: 'Chart',
  components: {
    LinkDirectionGrid,
    NpmEventsHeader,
    NpmRecentEvents,
    NpmEventsByType,
    NpmLine,
    NpmMap,
    NpmAppCategoryScore,
    Loading,
    NetworkOverviewLine,
    NetworkOverviewDdosDetection,
    NetworkOverviewPerformanceEvent,
    NetworkOverviewTabs,
    NetworkOverviewApps,
    NpmTabs,
    NpmNetworkQuantity,
    NpmAppEventTable,
    RelatedSessions,
    NpmIpMap,
    NpmTrafficLine,
    LinkBlock,
    LinkTrafficSankey,
    LinkTrafficLine,
    DnsTrafficLine,
    EntityDetailBasicInfo,
    EntityDetailSubscriberKpi,
    EntityDetailSubscriberTopApp,
    EntityDetailLine,
    EntityDetailSubscriberLine,
    EntityDetailTabsChart,
    EntityDetailMap
  },
  props: {
    chart: Object,
    metric: String,
    timeFilter: Object,
    extraParams: Object,
    entity: Object
  },
  data () {
    return {
      typeMapping,
      loading: true,
      chartData: null,
      queryParams: {}
    }
  },
  computed: {
    // 排除某些不需要loading的图表，例如npm-tabs
    disableLoading () {
      const disableChartTypes = [typeMapping.npm.npmTabs, typeMapping.linkMonitor.linkTrafficLine]
      return disableChartTypes.indexOf(this.chart.type) > -1
    }
  },
  setup (props) {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const chartTimeFilter = ref({ startTime, endTime, dateRangeValue })
    const table = ref({})
    return {
      table,
      chartTimeFilter
    }
  },
  methods: {
    npmTabChange (index) {
      this.$emit('npmTabChange', index)
    },
    resizeLine () {
      this.$nextTick(function () {
        setTimeout(() => {
          if (this.$refs.networkLine) {
            this.$refs.networkLine.resize()
          }
        }, 250)
      })
    },
    toggleLoading (loading) {
      this.loading = loading
    }
  }
}
</script>
