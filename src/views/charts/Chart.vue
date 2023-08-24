<template>
  <div class="cn-chart">
    <loading :loading="loading && !isTabs && !isBlock && !isGroup"></loading>
    <chart-no-data v-if="isNoData" :active-tab="activeTab"></chart-no-data>
    <template v-else>
      <chart-map
        v-if="isMap && !isIpBasicInfo"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :time-filter="timeFilter"
        :query-params="queryParams"
        :entity="entity"
        @getChartData="getChartData"
        @showLoading="showLoading"
      ></chart-map>
    </template>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import ChartMap from '@/views/charts/charts/ChartMap'
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
  isSingleValueWithPercent,
  isRelationShip,
  isTabs,
  isGroup,
  isSankey,
  isIpBasicInfo,
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
  isDomainRecursiveResolve,
  isDetectionSecurity,
  isDetectionService,
  isDetectionsProtocol
} from './charts/tools'
import _ from 'lodash'

export default {
  name: 'chart',
  components: {
    Loading,
    ChartNoData,
    ChartMap
  },
  data () {
    return {
      activeTab: ''
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
    timeFilter: Object,
    orderPieTable: String,
    tabHandleClickType: String,
    needTimeout: Boolean
  },
  computed: {
    isNoData () {
      return (
        !this.loading &&
        (!this.chartData || _.isEmpty(this.chartData) || this.isError) &&
        !this.isSingleValue &&
        !this.isTabs &&
        !this.isBlock &&
        !this.isGroup &&
        !this.isDomainDnsRecord &&
        !this.isCryptocurrencyEventList &&
        !this.isActiveIpTable &&
        !this.isMap &&
        !this.isSingleSupportStatistics &&
        !this.isTwoSupportStatistics &&
        !this.isAlarmInfo
      )
    },
    chartOption () {
      if (this.customChartOption) {
        return _.cloneDeep(this.customChartOption)
      } else {
        return getOption(this.chartInfo.type)
      }
    }
  },
  methods: {
    resize () {
      this.$refs['chart' + this.chartInfo.id] &&
        this.$refs['chart' + this.chartInfo.id].resize()
    },
    showLoading (show) {
      this.$emit('showLoading', show)
    },
    getAlarmInfo (url, extraParams, isRefresh, timeFilter) {
      this.$emit('getChartData', url, extraParams, timeFilter, isRefresh)
    },
    getChartData (url, extraParams) {
      this.$emit('getChartData', url, extraParams)
    },
    getDetectionData (url, extraParams, isRefresh, timeFilter) {
      this.$emit('getChartData', url, extraParams, timeFilter, isRefresh)
    },
    initEchartsWithTable () {
      this.$refs['chart' + this.chartInfo.id] &&
        this.$refs['chart' + this.chartInfo.id].initEchartsWithTable(
          `chart${this.chartInfo.id}`
        )
    },
    query (params) {
      this.$emit('query', params)
    },
    chartDetection (type) {
      this.activeTab = type
    }
  },
  setup (props) {
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
      isSingleValueWithPercent: isSingleValueWithPercent(props.chartInfo.type),
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
      isDomainWhois: isDomainWhois(props.chartInfo.type),
      isDomainDnsRecord: isDomainDnsRecord(props.chartInfo.type),
      isCryptocurrencyEventList: isCryptocurrencyEventList(
        props.chartInfo.type
      ),
      isAppBasicInfo: isAppBasicInfo(props.chartInfo.type),
      isAppRelatedDomain: isAppRelatedDomain(props.chartInfo.type),
      isSingleSupportStatistics: isSingleSupportStatistics(
        props.chartInfo.type
      ),
      isTwoSupportStatistics: isTwoSupportStatistics(props.chartInfo.type),
      isAlarmInfo: isAlarmInfo(props.chartInfo.type),
      isDomainRecursiveResolve: isDomainRecursiveResolve(props.chartInfo.type),
      isDetectionSecurity: isDetectionSecurity(props.chartInfo.type),
      isDetectionService: isDetectionService(props.chartInfo.type),
      isDetectionsProtocol: isDetectionsProtocol(props.chartInfo.type)
    }
  }
}
</script>
