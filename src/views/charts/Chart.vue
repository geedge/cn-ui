<template>
  <div class="cn-chart">
    <loading :loading="loading && !isTabs && !isBlock && !isGroup"></loading>
    <chart-no-data v-if="isNoData"></chart-no-data>
    <template v-else>
      <chart-tabs
        v-if="isTabs"
        :chart-info="chartInfo"
        :query-params="queryParams"
        :entity="entity"
      ></chart-tabs>

      <chart-map
        v-else-if="isMap && !isIpBasicInfo"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
        :entity="entity"
        @getChartData="getChartData"
        @showLoading="showLoading"
      ></chart-map>

      <chart-single-value
        v-else-if="isSingleValue"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
        @showLoading="showLoading"
      ></chart-single-value>

      <chart-block
        v-else-if="isBlock"
        ref="chart"
        :timeFilter="queryParams"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :entity="entity"
      ></chart-block>

      <chart-group
        v-else-if="isGroup"
        :timeFilter="queryParams"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :entity="entity"
      ></chart-group>

      <ip-basic-info
        v-else-if="isIpBasicInfo"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :entity="entity"
      ></ip-basic-info>

      <chart-time-bar
        v-else-if="isEchartsTimeBar"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :result-type="resultType"
        :query-params="queryParams"
        @showLoading="showLoading"
      ></chart-time-bar>

      <chart-category-bar
        v-else-if="isEchartsCategoryBar"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :result-type="resultType"
        :query-params="queryParams"
        @showLoading="showLoading"
      ></chart-category-bar>

      <chart-ip-open-port-bar
        v-else-if="isIpOpenPortBar"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :result-type="resultType"
        :query-params="queryParams"
        @showLoading="showLoading"
      ></chart-ip-open-port-bar>

      <chart-table
        v-else-if="isTable && isBasicTable"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :table="table"
        :query-params="queryParams"
        @showLoading="showLoading"
      ></chart-table>

      <chart-active-ip-table
        v-else-if="isActiveIpTable"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :table="table"
        :query-params="queryParams"
      ></chart-active-ip-table>

      <chart-app-basic-info
        v-else-if="isAppBasicInfo"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
      ></chart-app-basic-info>

      <chart-domain-whois
        v-else-if="isDomainWhois"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
      ></chart-domain-whois>

      <chart-domain-dns-record
        v-else-if="isDomainDnsRecord"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
      ></chart-domain-dns-record>

      <chart-cryptocurrency-event-list
        v-else-if="isCryptocurrencyEventList"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
      ></chart-cryptocurrency-event-list>

      <chart-relation-ship
        v-else-if="isRelationShip"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
      ></chart-relation-ship>

      <chart-san-key
        v-else-if="isSankey"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
        :entity="entity"
      ></chart-san-key>

      <chart-echart
        v-else-if="isEchartsLine || isEchartsPie"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :result-type="resultType"
        @showLoading="showLoading"
      ></chart-echart>

      <chart-echart-with-statistics
        v-else-if="isEchartsWithStatistics"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :result-type="resultType"
        @showLoading="showLoading"
      ></chart-echart-with-statistics>

      <chart-echart-with-table
        v-else-if="isEchartsWithTable"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
        :result-type="resultType"
        :order-pie-table="orderPieTable"
        @showLoading="showLoading"
      ></chart-echart-with-table>

      <chart-echart-ip-hosted-domain
        v-else-if="isIpHostedDomain"
        :chart-info="chartInfo"
        :chart-data="chartData"
        @showLoading="showLoading"
        :entity="entity"
      ></chart-echart-ip-hosted-domain>

      <chart-echart-app-relate-domain
        v-else-if="isAppRelatedDomain"
        :chart-info="chartInfo"
        :chart-data="chartData"
        @showLoading="showLoading"
        :entity="entity"
      ></chart-echart-app-relate-domain>

      <chart-one-Situation-Statistics
        v-else-if="isSingleSupportStatistics"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
        @showLoading="showLoading"
        :entity="entity"
      ></chart-one-Situation-Statistics>

      <chart-two-Situation-Statistics
        v-else-if="isTwoSupportStatistics"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
        @showLoading="showLoading"
        :entity="entity"
      ></chart-two-Situation-Statistics>

      <chart-alarm-info
        v-else-if="isAlarmInfo"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :query-params="queryParams"
        @showLoading="showLoading"
        :tabHandleClickType="tabHandleClickType"
        @getAlarmInfo="getAlarmInfo"
        :entity="entity"
      >
      </chart-alarm-info>
    </template>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import ChartTabs from '@/views/charts/charts/ChartTabs'
import ChartMap from '@/views/charts/charts/ChartMap'
import ChartSingleValue from '@/views/charts/charts/ChartSingleValue'
import ChartBlock from '@/views/charts/charts/ChartBlock'
import ChartGroup from '@/views/charts/charts/ChartGroup'
import IpBasicInfo from '@/views/charts/charts/IpBasicInfo'
import ChartEchart from '@/views/charts/charts/ChartEchart'
import ChartEchartWithStatistics from '@/views/charts/charts/ChartEchartWithStatistics'
import ChartEchartWithTable from '@/views/charts/charts/ChartEchartWithTable'
import ChartEchartIpHostedDomain from '@/views/charts/charts/ChartEchartIpHostedDomain'
import ChartEchartAppRelateDomain from '@/views/charts/charts/ChartEchartAppRelateDomain'
import ChartActiveIpTable from '@/views/charts/charts/ChartActiveIpTable'
import ChartTimeBar from './charts/ChartTimeBar'
import ChartCategoryBar from './charts/ChartCategoryBar'
import ChartIpOpenPortBar from './charts/ChartIpOpenPortBar'
import ChartTable from './charts/ChartTable'
import ChartAppBasicInfo from '@/views/charts/charts/ChartAppBasicInfo'
import ChartDomainWhois from '@/views/charts/charts/ChartDomainWhois'
import ChartDomainDnsRecord from '@/views/charts/charts/ChartDomainDnsRecord'
import ChartCryptocurrencyEventList from '@/views/charts/charts/ChartCryptocurrencyEventList'
import ChartRelationShip from '@/views/charts/charts/ChartRelationShip'
import ChartSanKey from '@/views/charts/charts/ChartSanKey'
import ChartOneSituationStatistics from '@/views/charts/charts/ChartOneSituationStatistics'
import ChartTwoSituationStatistics from '@/views/charts/charts/ChartTwoSituationStatistics'
import ChartAlarmInfo from '@/views/charts/charts/ChartAlarmInfo'
import {
  isEcharts,
  isEchartsLine,
  isSingleValue,
  isTable,
  isBasicTable,
  isActiveIpTable,
  isTitle,
  isMap,
  getOption,
  isEchartsPie,
  isEchartsWithTable,
  isEchartsWithStatistics,
  isEchartsTimeBar,
  isEchartsCategoryBar,
  isIpOpenPortBar,
  isMapLine,
  isMapBlock,
  isSingleValueWithEcharts,
  isSingleValueWithEchartsTemp,
  isRelationShip,
  isTabs,
  isGroup,
  isSankey,
  isIpBasicInfo,
  isIpOpenPort,
  isIpHostedDomain,
  isDomainWhois,
  isDomainDnsRecord,
  isCryptocurrencyEventList,
  isAppBasicInfo,
  isAppRelatedDomain,
  isBlock,
  isSingleSupportStatistics,
  isTwoSupportStatistics,
  isAlarmInfo,
} from './charts/tools'
import _ from 'lodash'

export default {
  name: 'chart',
  components: {
    ChartSanKey,
    ChartCryptocurrencyEventList,
    ChartDomainDnsRecord,
    ChartDomainWhois,
    ChartAppBasicInfo,
    ChartActiveIpTable,
    ChartTable,
    IpBasicInfo,
    ChartSingleValue,
    Loading,
    ChartNoData,
    ChartTabs,
    ChartMap,
    ChartBlock,
    ChartTimeBar,
    ChartCategoryBar,
    ChartIpOpenPortBar,
    ChartRelationShip,
    ChartGroup,
    ChartEchartWithStatistics,
    ChartEchart,
    ChartEchartWithTable,
    ChartEchartIpHostedDomain,
    ChartEchartAppRelateDomain,
    ChartOneSituationStatistics,
    ChartTwoSituationStatistics,
    ChartAlarmInfo,
  },
  data() {
    return {
      tabHandleClickType: '',
    }
  },
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String], // 数据在父组件查询后传入，本组件内不查询，只根据接传递的数据来渲染
    resultType: Object, // 返回数据的类型
    queryParams: Object, // 接口请求参数
    customChartOption: Object, // 需要自定义echarts的option时传入，非必须；传入该值时仍需传对应格式的chartData
    isFullscreen: Boolean,
    loading: Boolean,
    panelLock: Boolean,
    entity: Object,
    isError: Boolean,
    table: Object,
    orderPieTable: Object,
    tabHandleClickType: String,
  },
  computed: {
    isNoData() {
      return (
        !this.loading &&
        (_.isEmpty(this.chartData) || this.isError) &&
        !this.isSingleValue &&
        !this.isTabs &&
        !this.isDomainDnsRecord &&
        !this.isCryptocurrencyEventList &&
        !this.isActiveIpTable &&
        !this.isMap &&
        !this.isSingleSupportStatistics &&
        !this.isTwoSupportStatistics &&
        !this.isAlarmInfo
      )
    },
    chartOption() {
      if (this.customChartOption) {
        return _.cloneDeep(this.customChartOption)
      } else {
        return getOption(this.chartInfo.type)
      }
    },
  },
  methods: {
    resize() {
      this.$refs['chart' + this.chartInfo.id] &&
        this.$refs['chart' + this.chartInfo.id].resize()
    },
    showLoading(show) {
      this.$emit('showLoading', show)
    },
    getAlarmInfo(url, extraParams, isRefresh, timeFilter) {
      this.$emit('getChartData', url, extraParams, isRefresh, timeFilter)
    },
    getChartData(url, extraParams) {
      this.$emit('getChartData', url, extraParams)
    },
    initEchartsWithTable() {
      this.$refs['chart' + this.chartInfo.id] &&
        this.$refs['chart' + this.chartInfo.id].initEchartsWithTable(
          `chart${this.chartInfo.id}`,
        )
    },
    query(params) {
      this.$emit('query', params)
    },
  },
  watch: {
    chartData: {
      deep: true,
      handler(n) {},
    },
    tabHandleClickType: {
      deep: true,
      handler(n) {
        this.tabHandleClickType = n
      },
    },
    queryParams: {
      deep: true,
    },
  },
  setup(props) {
    return {
      isEcharts: isEcharts(props.chartInfo.type),
      isEchartsLine: isEchartsLine(props.chartInfo.type),
      isEchartsTimeBar: isEchartsTimeBar(props.chartInfo.type),
      isEchartsCategoryBar: isEchartsCategoryBar(props.chartInfo.type),
      isIpOpenPortBar: isIpOpenPortBar(props.chartInfo.type),
      isEchartsPie: isEchartsPie(props.chartInfo.type),
      isEchartsWithTable: isEchartsWithTable(props.chartInfo.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chartInfo.type),
      isSingleValue: isSingleValue(props.chartInfo.type),
      isSingleValueWithEcharts: isSingleValueWithEcharts(props.chartInfo.type),
      isSingleValueWithEchartsTemp: isSingleValueWithEchartsTemp(
        props.chartInfo.type,
      ),
      isRelationShip: isRelationShip(props.chartInfo.type),
      isTable: isTable(props.chartInfo.type),
      isBasicTable: isBasicTable(props.chartInfo.type),
      isActiveIpTable: isActiveIpTable(props.chartInfo.type),
      isMap: isMap(props.chartInfo.type),
      isTitle: isTitle(props.chartInfo.type),
      isMapLine: isMapLine(props.chartInfo.type),
      isMapBlock: isMapBlock(props.chartInfo.type),
      isTabs: isTabs(props.chartInfo.type),
      isGroup: isGroup(props.chartInfo.type),
      isBlock: isBlock(props.chartInfo.type),
      isSankey: isSankey(props.chartInfo.type),
      isIpBasicInfo: isIpBasicInfo(props.chartInfo.type),
      isIpHostedDomain: isIpHostedDomain(props.chartInfo.type),
      isIpOpenPort: isIpOpenPort(props.chartInfo.type),
      isDomainWhois: isDomainWhois(props.chartInfo.type),
      isDomainDnsRecord: isDomainDnsRecord(props.chartInfo.type),
      isCryptocurrencyEventList: isCryptocurrencyEventList(
        props.chartInfo.type,
      ),
      isAppBasicInfo: isAppBasicInfo(props.chartInfo.type),
      isAppRelatedDomain: isAppRelatedDomain(props.chartInfo.type),
      isSingleSupportStatistics: isSingleSupportStatistics(
        props.chartInfo.type,
      ),
      isTwoSupportStatistics: isTwoSupportStatistics(props.chartInfo.type),
      isAlarmInfo: isAlarmInfo(props.chartInfo.type),
      
    }
  },
}
</script>
