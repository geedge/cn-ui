<template>
  <div class="cn-chart">
    <loading :loading="loading"></loading>
    <chart-no-data v-if="!loading && (isNoData || isError)"></chart-no-data>
    <template v-else>

      <chart-tabs
          v-if="isTabs"
          :chart-info="chartInfo"
          :query-params="queryParams"
      ></chart-tabs>

      <chart-map
          v-else-if="isMap"
          :chart-info="chartInfo"
          :chart-data="chartData"
          :query-params="queryParams"
          @showLoading="showLoading"
      ></chart-map>

    </template>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from './charts/ChartNoData'
import ChartTabs from './charts/ChartTabs'
import ChartMap from './charts/ChartMap'
import {
  isEcharts,
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
    Loading,
    ChartNoData,
    ChartTabs,
    ChartMap
  },
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String], // 数据在父组件查询后传入，本组件内不查询，只根据接传递的数据来渲染
    queryParams: Object, // 接口请求参数
    customChartOption: Object, // 需要自定义echarts的option时传入，非必须；传入该值时仍需传对应格式的chartData
    isFullscreen: Boolean,
    loading: Boolean,
    panelLock: Boolean,
    isError: Boolean
  },
  computed: {
    isNoData () {
      return _.isEmpty(this.chartData)
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
