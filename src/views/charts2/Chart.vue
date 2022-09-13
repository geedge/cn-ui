<template>
  <div class="cn-chart" style="height: 100%; width: 100%;">
    <loading :loading="loading && !disableLoading"></loading>
    <network-overview-line
        v-if="chart.type === typeMapping.networkOverview.line"
        :chart="chart"
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
    <network-overview-tabs @getChartData="getChartData"
         v-else-if="chart.type === typeMapping.networkOverview.table"
         :time-filter="timeFilter"
         :chart="chart"
         :chartData="chartData"
         :ref="`tab${chart.id}`"
         @toggleLoading="toggleLoading"
    ></network-overview-tabs>
    <npm-app-event-table @getChartData="getChartData"
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
import { get } from '@/utils/http'
import { getNowTime, getSecond } from '@/utils/date-util'
import { ref } from 'vue'
export default {
  name: 'Chart',
  components: {
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
    LinkTrafficLine
  },
  props: {
    chart: Object,
    timeFilter: Object,
    extraParams: Object
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
      const disableChartTypes = [typeMapping.npm.npmTabs]
      return disableChartTypes.indexOf(this.chart.type) > -1
    }
  },
  mounted () {
    this.getChartData()
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
    reload () {
      this.getChartData()
    },
    /* 参数 extraParams 额外请求参数 */
    getChartData (url, extraParams = {}, chartTimeFilter) {
      try {
        if (chartTimeFilter) {
          // 图表自带timeFilter刷新时
          this.queryTimeRange = {
            startTime: getSecond(chartTimeFilter.startTime),
            endTime: getSecond(chartTimeFilter.endTime)
          }
        } else if (this.timeFilter) {
          this.queryTimeRange = {
            startTime: getSecond(this.timeFilter.startTime),
            endTime: getSecond(this.timeFilter.endTime)
          }
        } else {
          this.queryTimeRange = {
            startTime: getSecond(this.chartTimeFilter.startTime),
            endTime: getSecond(this.chartTimeFilter.endTime)
          }
        }
        const chartParams = this.chart.params
        // 接口查询参数
        this.queryParams = {
          ...this.queryTimeRange,
          ...extraParams
        }
        let requestUrl = url || chartParams.url

        if (this.chart.type === typeMapping.networkOverview.table) {
          const chartObj = this.$refs['tab' + this.chart.id]
          requestUrl = url || chartObj.getCurUrl()
          this.queryParams = {
            ...chartObj.handleQueryParams(extraParams),
            ...this.queryTimeRange
          }
        }
        if (requestUrl) {
          get(requestUrl, this.queryParams).then(response => {
            if (response.code === 200) {
              this.chartData = response.data.result
            }
          })
        }
      } catch (e) {
        console.error(e)
      }
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
