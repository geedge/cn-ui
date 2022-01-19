<template>
  <div class="cn-chart">
    <loading :loading="loading && !isTabs && !isBlock"></loading>
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
          :chart-info="chartInfo"
          :chart-data="chartData"
          :entity="entity"
      ></chart-block>

      <ip-basic-info
          v-else-if="isIpBasicInfo"
          :chart-info="chartInfo"
          :chart-data="chartData"
          :entity="entity"
      ></ip-basic-info>

      <chart-echart-line
          v-else-if="isEchartsLine"
          :chart-info="chartInfo"
          :chart-data="chartData"
          :result-type="resultType"
          :query-params="queryParams"
          @showLoading="showLoading"
      ></chart-echart-line>

      <chart-table
        v-else-if="isTable"
        :chart-info="chartInfo"
        :chart-data="chartData"
        :table="table"
        :query-params="queryParams"
        @showLoading="showLoading"
      ></chart-table>

    </template>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from './charts/ChartNoData'
import ChartTabs from './charts/ChartTabs'
import ChartMap from './charts/ChartMap'
import ChartSingleValue from './charts/ChartSingleValue'
import ChartBlock from './charts/ChartBlock'
import IpBasicInfo from '@/views/charts/charts/IpBasicInfo'
import ChartEchartLine from './charts/ChartEchartLine'
import ChartTable from "./charts/ChartTable";
import {
  isEcharts,
  isEchartsLine,
  isSingleValue,
  isTable,
  isActiveIpTable,
  isTitle,
  isMap,
  getOption,
  isEchartsWithTable,
  isEchartsWithStatistics,
  isEchartsTimeBar,
  isEchartsCategoryBar,
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
  isBlock
} from './charts/tools'
import _ from 'lodash'

export default {
  name: 'chart',
  components: {
    ChartTable,
    IpBasicInfo,
    ChartSingleValue,
    Loading,
    ChartNoData,
    ChartTabs,
    ChartMap,
    ChartEchartLine,
    ChartBlock
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
    table: Object
  },
  computed: {
    isNoData () {
      return !this.loading && (_.isEmpty(this.chartData) || this.isError) && !this.isSingleValue && !this.isTabs
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
      this.$refs['chart' + this.chartInfo.id] && this.$refs['chart' + this.chartInfo.id].resize()
    },
    showLoading (show) {
      this.$emit('showLoading', show)
    }
  },
  setup (props) {
    return {
      isEcharts: isEcharts(props.chartInfo.type),
      isEchartsLine: isEchartsLine(props.chartInfo.type),
      isEchartsTimeBar: isEchartsTimeBar(props.chartInfo.type),
      isEchartsCategoryBar: isEchartsCategoryBar(props.chartInfo.type),
      isEchartsWithTable: isEchartsWithTable(props.chartInfo.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chartInfo.type),
      isSingleValue: isSingleValue(props.chartInfo.type),
      isSingleValueWithEcharts: isSingleValueWithEcharts(props.chartInfo.type),
      isSingleValueWithEchartsTemp: isSingleValueWithEchartsTemp(props.chartInfo.type),
      isRelationShip: isRelationShip(props.chartInfo.type),
      isTable: isTable(props.chartInfo.type),
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
      isCryptocurrencyEventList: isCryptocurrencyEventList(props.chartInfo.type),
      isAppBasicInfo: isAppBasicInfo(props.chartInfo.type),
      isAppRelatedDomain: isAppRelatedDomain(props.chartInfo.type)
    }
  }
}
</script>
