<template>
  <div class="cn-chart" style="height: 100%; width: 100%;">
    <loading :loading="loading"></loading>
    <chart-no-data v-if="isNoData"></chart-no-data>
    <network-overview-line
        v-if="chart.type === typeMapping.networkOverview.line"
        :chart="chart"
        :time-filter="timeFilter"
        ref="networkLine"
    ></network-overview-line>
    <network-overview-ddos-detection
        v-else-if="chart.type === typeMapping.networkOverview.ddosDetection"
        :chart="chart"
        :time-filter="timeFilter"
    ></network-overview-ddos-detection>
    <network-overview-performance-event
        v-else-if="chart.type === typeMapping.networkOverview.performanceEvent"
        :chart="chart"
        :time-filter="timeFilter"
    ></network-overview-performance-event>
    <network-overview-tabs @getChartData="getChartData"
         v-else-if="chart.type === typeMapping.networkOverview.table"
         :time-filter="timeFilter"
         :chart="chart"
         :chartData="chartData"
         :ref="`tab${chart.id}`"
    ></network-overview-tabs>
    <npm-app-event-table @getChartData="getChartData"
         v-else-if="chart.type === typeMapping.npm.appEventTable"
         :time-filter="timeFilter"
         :chart="chart"
         :chartData="chartData"
         :ref="`tab${chart.id}`"
    ></npm-app-event-table>
    <network-overview-apps
        v-else-if="chart.type === typeMapping.networkOverview.appList"
        :chart="chart"
        :time-filter="timeFilter"
    >
    </network-overview-apps>
    <npm-tabs
        v-else-if="chart.type === typeMapping.npm.npmTabs"
        :time-filter="timeFilter"
        :chart="chart"
        @tabChange="npmTabChange"
    ></npm-tabs>
    <npm-network-quantity
        v-else-if="chart.type === typeMapping.npm.npmNetworkQuantity"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-network-quantity>
    <npm-app-category-score
        v-else-if="chart.type === typeMapping.npm.npmAppCategoryScore"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-app-category-score>
    <npm-map
        v-else-if="chart.type === typeMapping.npm.npmMap"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-map>
    <npm-line
        v-else-if="chart.type === typeMapping.npm.npmLine"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-line>
    <npm-events-header
        v-else-if="chart.type === typeMapping.npm.npmEventsHeader"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-events-header>
    <npm-events-by-type
        v-else-if="chart.type === typeMapping.npm.npmEventsByType"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-events-by-type>
    <npm-recent-events
        v-else-if="chart.type === typeMapping.npm.npmRecentEvents"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-recent-events>
    <related-sessions
        v-else-if="chart.type === typeMapping.npm.relatedSessions"
        :time-filter="timeFilter"
        :chart="chart"
    ></related-sessions>
    <npm-ip-map
        v-else-if="chart.type === typeMapping.npm.npmIpMap"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-ip-map>
    <npm-traffic-line
        v-else-if="chart.type === typeMapping.npm.npmTrafficLine"
        :time-filter="timeFilter"
        :chart="chart"
    ></npm-traffic-line>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
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
    ChartNoData,
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
    NpmTrafficLine
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
      isNoData: false,
      chartData: null,
      queryParams: {}
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
        let requestUrl = url

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
            } else {
              if (this.chart.type === 601) {
                this.$refs['tab' + this.chart.id].loading = false
              }
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
    }
  }
}
</script>
