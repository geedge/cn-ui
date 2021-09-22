<template>
  <!-- 标题 -->
  <div
    v-if="isTitle"
    class="cn-chart cn-chart__title"
    :style="computePosition">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</div>
  <!-- Tabs -->
  <el-tabs
      class="cn-chart cn-chart__tabs"
      v-else-if="isTabs"
      v-model="activeTab"
      @tab-click="changeTab"
      :style="computePosition"
      :ref="`chart-${chart.id}`"
  >
    <el-tab-pane
      v-for="tab in chartInfo.children"
      :label="tab.i18n ? $t(tab.i18n) : tab.name" :name="`${tab.id}`"
      :key="tab.id"
      :ref="`chart-${chart.id}`"
    >
      <template v-for="chart in tab.children">
        <chart v-if="activeTab == tab.id" :key="chart.id" :chart="chart" :time-filter="timeFilter" :ref="`chart-${chart.id}`" :entity="entity"></chart>
      </template>
    </el-tab-pane>
  </el-tabs>
  <!-- 地图 -->
  <chart-map
      v-else-if="isMap"
      :style="computePosition"
      :loading="loading"
  >
    <template #chartErrorInfo>
      <chart-error
        :isError="isError"
        :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations>
      <el-popover trigger="hover" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
        <template #reference>
          <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
        </template>
      </el-popover>
      <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
    </template>
    <template #default>
      <template v-if="isIpBasicInfo">
        <el-descriptions :column="1">
          <el-descriptions-item label="ASN:">{{detailData ? detailData.asn : '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('entities.asSubnet') + ':'">{{detailData.asSubnet || '-'}}</el-descriptions-item>
          <el-descriptions-item label="ISP:">{{detailData.isp || '-'}}</el-descriptions-item>
          <el-descriptions-item label="DNS PTR:">{{detailData.dnsPTR || '-'}}</el-descriptions-item>
        </el-descriptions>
        <div class="chart-location">
          <el-descriptions :column="1">
            <el-descriptions-item :label="$t('overall.location') + ':'">{{location}}</el-descriptions-item>
          </el-descriptions>
          <div class="chart-drawing" style="padding: 0 36px 30px 0;" :id="`chart${chartInfo.id}`"></div>
        </div>
      </template>
      <div v-else class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
  </chart-map>
  <!-- echarts类的图，如饼图、柱状图、折线图等 -->
  <echarts-frame
    v-else-if="isEcharts"
    :layout="layout"
    :style="computePosition"
    :chartInfo="chartInfo"
    :loading="loading"
    :no-data="noData"
  >
    <template #chartErrorInfo>
      <chart-error
        :isError="isError"
        :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title v-if="layout.indexOf(layoutConstant.HEADER) > -1">
      {{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}
    </template>
    <template #operations v-if="layout.indexOf(layoutConstant.HEADER) > -1">
      <div class="header__operation header__operation--echarts" v-if="chart.type === 31">
        <el-select
          size="mini"
          v-model="orderPieTable"
          class="option__select select-column"
          placeholder=""
          popper-class="option-popper"
          @change="orderPieTableChange"
        >
          <el-option v-for="item in chartPieTableTopOptions" :key="item.value" :value="item.value">&nbsp{{item.name}}</el-option>
        </el-select>
      </div>
      <el-popover trigger="hover" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
        <template #reference>
          <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
        </template>
      </el-popover>
      <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
    </template>
    <template #default>
      <!-- IP详情 开放端口 -->
      <template v-if="isIpOpenPort">
        <div class="ip-detail__open-port">
          <div class="open-port__table">
            <div style="height: 100%; overflow: hidden auto;">
              <div class="open-port__table-row open-port__table-row--header">
                <div class="open-port__table-cell" style="min-width: 100px;">Port</div>
                <div class="open-port__table-cell" style="min-width: 130px;">{{$t('overall.protocol')}}</div>
                <div class="open-port__table-cell">Banner</div>
                <div class="open-port__table-cell" style="min-width: 200px;">Update at</div>
              </div>
              <div class="open-port__table-row" v-for="(data, index) in detailData" :key="index">
                <div class="open-port__table-cell">{{data.port || '-'}}</div>
                <div class="open-port__table-cell">{{data.protocol || '-'}}</div>
                <div class="open-port__table-cell">{{data.banner || '-'}}</div>
                <div class="open-port__table-cell">{{data.utime || '-'}}</div>
              </div>
            </div>
          </div>
          <div class="open-port__chart">
            <div class="open-port__chart-title">{{$t('overall.protocolsStatistics')}}</div>
            <div class="open-port__chart-body chart-drawing" :id="`chart${chartInfo.id}`"></div>
          </div>
        </div>
      </template>
      <template v-else-if="isIpHostedDomain">
        <div class="ip-detail__hosted-domain">
          <div class="hosted-domain__list">
            <div class="hosted-domain__list-title">{{$t('overall.domain')}}</div>
            <div class="hosted-domain__list-body">
              <div class="hosted-domain__list-row" v-for="(data, i) in detailData" :key="i">{{data}}</div>
            </div>
          </div>
          <div class="hosted-domain__chart">
            <div>
              <div class="hosted-domain__chart-title">{{$t('entities.byCategory')}}</div>
              <div class="chart-drawing" :id="`chart${chartInfo.id}-0`"></div>
            </div>
            <div>
              <div class="hosted-domain__chart-title">{{$t('entities.byCredit')}}</div>
              <div class="chart-drawing" :id="`chart${chartInfo.id}-1`"></div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
    <template #footer v-if="layout.indexOf(layoutConstant.FOOTER) > -1">
      <!-- 带Table的饼图，展示Table -->
      <template v-if="isEchartsWithTable">
        <pie-table :tableData="pieTableData" ref="pieTable" :chartInfo="chartInfo" :time-filter="timeFilter" :order="orderPieTable"/>
      </template>
      <template v-else-if="isEchartsWithStatistics">
        <statistics-legend :data="statisticsData" :chart-info="chartInfo" @toggleLegend="toggleStatisticsLegend"></statistics-legend>
      </template>
    </template>
  </echarts-frame>
  <!-- 单值图 -->
  <single-value
    v-else-if="isSingleValue"
    :type="chartInfo.type"
    :style="computePosition"
    :icon="singleValue.icon"
    :loading="loading"
  >
    <template #chartErrorInfo>
      <chart-error
        :isError="isError"
        :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title>
      <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      <span
          v-if="chartInfo.params && chartInfo.params.as"
          class="ip-detail-as"
      >
          as&nbsp;<span style="text-transform: capitalize">{{chartInfo.params.as}}</span>
        </span>
    </template>
    <template #data>
      <span>{{handleSingleValue[0] || handleSingleValue[0] === 0 ? handleSingleValue[0] : '-'}}</span>
      <span class="single-value__unit">{{handleSingleValue[1]}}</span>
    </template>
    <template #chart>
      <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
  </single-value>
  <!-- 表格 -->
  <chart-table
    v-else-if="isTable"
    :table-columns="table.tableColumns"
    :table-data="table.currentPageData"
    :style="computePosition"
    :loading="loading"
    :no-data="noData"
  >
    <template #chartErrorInfo>
      <chart-error
        :isError="isError"
        :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations>
      <el-popover trigger="hover" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
        <template #reference>
          <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
        </template>
      </el-popover>
      <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
      <div class="header__operation header__operation--table">
        <el-select
            size="mini"
            v-model="table.limit"
            class="option__select select-topn"
            placeholder=""
            popper-class="option-popper"
            @change="tableLimitChange"
        >
          <el-option v-for="item in chartTableTopOptions" :key="item" :value="item">TOP&nbsp;{{item}}</el-option>
          <template #prefix>TOP&nbsp;</template>
        </el-select>
      </div>
      <div class="header__operation header__operation--table">
        <el-select
            size="mini"
            v-model="table.orderBy"
            class="option__select select-column"
            :placeholder="$t('overall.field')"
            popper-class="option-popper"
            @change="tableLimitChange"
        >
          <template v-for="(item, index) in table.tableColumns" :key="item.prop">
            <el-option v-if="index > 0" :value="item.prop">{{item.prop}}</el-option>
          </template>
        </el-select>
      </div>
<!--      <div class="header__operation header__operation&#45;&#45;table">
        <span class="option__button"><i class="cn-icon cn-icon-style"></i></span>
        <div class="icon-group-divide"></div>
        <span class="option__button"><i class="cn-icon cn-icon-dropdown"></i></span>
      </div>
      <div class="header__operation header__operation--table">
        <span class="option__button"><i class="cn-icon cn-icon-full-screen"></i></span>
      </div>-->
    </template>
    <template #footer>
      <chart-table-pagination
          ref="tablePagination"
          :total="table.tableData.length"
          @pageJump="pageJump"
      ></chart-table-pagination>
    </template>
  </chart-table>
  <!-- group -->
  <div
      v-else-if="isGroup"
      class="cn-chart cn-chart__group"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
        <span
            v-if="chartInfo.params && chartInfo.params.as"
            class="ip-detail-as"
        >
          as&nbsp;<span style="text-transform: capitalize">{{chartInfo.params.as}}</span>
        </span>
      </div>
    </div>
    <div class="cn-chart__body">
      <template v-for="chart in chartInfo.children" :key="chart.id">
        <chart :chart="chart" :time-filter="timeFilter" :ref="`chart-${chart.id}`" :entity="entity" :parent-data="groupData"></chart>
      </template>
    </div>
  </div>
  <!-- Domain详情-whois -->
  <div
      v-else-if="isDomainWhois"
      class="cn-chart cn-chart__whois"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      </div>
    </div>
    <div class="cn-chart__body">
      <div class="domain-detail-list">
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.sponsor')}}</div>
          <div class="domain-detail-list__content">{{detailData.sponsor || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.org')}}</div>
          <div class="domain-detail-list__content">{{detailData.org || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">Email</div>
          <div class="domain-detail-list__content">{{detailData.email || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('overall.country')}}</div>
          <div class="domain-detail-list__content">{{detailData.orgCountry || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.creationDate')}}</div>
          <div class="domain-detail-list__content">{{detailData.creationDate || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.expirationDate')}}</div>
          <div class="domain-detail-list__content">{{detailData.expirationDate || '-'}}</div>
        </div>
      </div>
    </div>
  </div>
  <!-- Domain详情-DNS记录 -->
  <div
      v-else-if="isDomainDnsRecord"
      class="cn-chart cn-chart__dns-record"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      </div>
    </div>
    <div class="cn-chart__body">
      <div class="entity-detail__dns-record">
        <div class="dns-record__table">
          <div style="height: 100%; overflow: hidden auto;">
            <div class="dns-record__table-row dns-record__table-row--header">
              <div class="dns-record__table-cell" style="min-width: 200px;">Type</div>
              <div class="dns-record__table-cell" style="width: 100%;">Value</div>
            </div>
            <div class="dns-record__table-row" v-for="(data, index) in detailData" :key="index">
              <div class="dns-record__table-cell">{{data.type || '-'}}</div>
              <div class="dns-record__table-cell">{{data.value || '-'}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- APP详情-基本信息 -->
  <div
      v-else-if="isAppBasicInfo"
      class="cn-chart cn-chart__app-basic"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      </div>
    </div>
    <div class="cn-chart__body">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <el-descriptions :column="1" style="padding: 20px 30px;">
          <el-descriptions-item :label="$t('overall.appName')">{{detailData ? detailData.name : '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.appFullName') + ':'">{{detailData.fullName || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.technology')">{{detailData.technology || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.remark')">{{detailData.remark || '-'}}</el-descriptions-item>
        </el-descriptions>
        <div style="display: flex;">
          <single-value
              :type="51"
              icon="cn-icon cn-icon-category"
              :loading="false"
              style="width: 250px;"
          >
            <template #title>
              <span>{{$t('entities.category')}}</span>
            </template>
            <template #data>
              <span>test</span>
            </template>
          </single-value>
          <single-value
              :type="51"
              icon="cn-icon cn-icon-sub-category"
              :loading="false"
              style="width: 250px;"
          >
            <template #title>
              <span>{{$t('entities.subcategory')}}</span>
            </template>
            <template #data>
              <span>test2</span>
            </template>
          </single-value>
          <single-value
              :type="51"
              icon="cn-icon cn-icon-credit"
              :loading="false"
              style="width: 250px;"
          >
            <template #title>
              <span>{{$t('entities.reputationLevel')}}</span>
            </template>
            <template #data>
              <span>test3</span>
            </template>
          </single-value>
        </div>
      </div>
    </div>
  </div>
  <!-- APP详情-相关域名 -->
  <div
      v-else-if="isAppRelatedDomain"
      class="cn-chart cn-chart__dns-record"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      </div>
    </div>
    <div class="cn-chart__body">
      <div class="entity-detail__dns-record">
        <div class="dns-record__table">
          <div style="height: 100%; overflow: hidden auto;">
            <div class="dns-record__table-row dns-record__table-row--header">
              <div class="dns-record__table-cell" style="min-width: 200px;">Type</div>
              <div class="dns-record__table-cell" style="width: 100%;">Value</div>
            </div>
            <div class="dns-record__table-row" v-for="(data, index) in detailData" :key="index">
              <div class="dns-record__table-cell">{{data.type || '-'}}</div>
              <div class="dns-record__table-cell">{{data.value || '-'}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import * as am4Core from '@amcharts/amcharts4/core'
import * as am4Maps from '@amcharts/amcharts4/maps'
import { shallowRef } from 'vue'
import { tableTitleMapping, legendMapping } from '@/components/charts/chart-table-title'
import {
  isEcharts,
  isSingleValue,
  isTable,
  isTitle,
  isMap,
  getOption,
  getTypeCategory,
  getLayout,
  layoutConstant,
  isEchartsWithTable,
  isEchartsWithStatistics,
  isMapLine,
  isMapBlock,
  isSingleValueWithEcharts,
  isRelationShip,
  isTabs,
  isGroup,
  isSankey,
  isIpBasicInfo,
  isIpOpenPort,
  isIpHostedDomain,
  isDomainWhois,
  isDomainDnsRecord,
  isAppBasicInfo,
  isAppRelatedDomain,
  getChartColor
} from '@/components/charts/chart-options'
import ChartError from '@/components/charts/ChartError'
import EchartsFrame from '@/components/charts/EchartsFrame'
import SingleValue from '@/components/charts/ChartSingleValue'
import ChartTable from '@/components/charts/ChartTable'
import ChartMap from '@/components/charts/ChartMap'
import PieTable from '@/components/charts/PieTable'
import StatisticsLegend from '@/components/charts/StatisticsLegend'
import ChartTablePagination from '@/components/charts/ChartTablePagination'
import unitConvert, { getUnitType } from '@/utils/unit-convert'
import { chartTableDefaultPageSize, chartTableTopOptions, storageKey, chartPieTableTopOptions, unitTypes } from '@/utils/constants'
import { get, post } from '@/utils/http'
import { replaceUrlPlaceholder, getCapitalGeo, getGeoData, lineToSpace } from '@/utils/tools'
import { HeatLegend } from '@/components/amcharts/heatLegend'

export default {
  name: 'Chart',
  props: {
    chart: Object, // 图表对象，包括id、name、type等数据
    timeFilter: Object,
    parentData: Object,
    entity: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    EchartsFrame,
    SingleValue,
    ChartTablePagination,
    ChartTable,
    PieTable,
    StatisticsLegend,
    ChartMap,
    ChartError
  },
  data () {
    return {
      table: {
        pageSize: chartTableDefaultPageSize,
        limit: chartTableTopOptions[0], // top-n
        orderBy: 'sessions',
        tableColumns: [], // table字段
        tableData: [], // table的所有数据
        currentPageData: [] // table当前页的数据
      },
      pieTableData: [],
      singleValue: {
        value: '-',
        icon: ''
      },
      activeTab: '',
      groupData: '', // group类型的查询数据，用于传递给子chart，子chart通过params.dataKey取值
      detailData: '', // 详情类型图表的数据
      statisticsData: [],
      orderPieTable: chartPieTableTopOptions[0].value,
      selectPieChartName: '',
      allSelectPieChartName: [],
      chartOption: null,
      loading: true,
      noData: false, // 查询结果为空
      throttle: null, // 节流器
      isError: false, // 接口响应是否报错
      errorInfo: '', // 接口具体错误信息
      polygonSeries: null
    }
  },
  methods: {
    initChart () {
      this.loading = true
      try {
        const chartParams = this.chartInfo.params
        if (this.isMap) {
          const { chart, polygonSeries } = this.initMap(`chart${this.chartInfo.id}`)
          this.myChart = chart
          this.polygonSeries = polygonSeries
          if (chartParams) {
            this.loadMap(this.polygonSeries)
          }
          // TODO 优化：缓存地图，重新查询时只更改数据，不再次初始化
        } else if (this.isEcharts) {
          if (this.isIpHostedDomain) {

          } else {
            const dom = document.getElementById(`chart${this.chartInfo.id}`)
            !this.myChart && (this.myChart = echarts.init(dom))
          }
          this.chartOption = this.$_.cloneDeep(getOption(this.chart.type))
          if (chartParams) {
            if (this.isEchartsWithTable) {
              this.initEchartsWithPieTable(chartParams)
            } else if (this.isEchartsWithStatistics) {
              this.initEchartsWithStatistics(chartParams)
            } else if (this.isRelationShip) {
              this.initRelationShip(chartParams)
            } else if (this.isSankey) {
              this.initSankey(chartParams)
            } else if (this.isIpOpenPort) {
              this.initIpOpenPort(chartParams)
            } else if (this.isIpHostedDomain) {
              this.initIpHostedDomain(chartParams)
            } else {
              this.initECharts(chartParams)
            }
          }
        } else if (this.isTable) {
          if (chartParams) {
            this.initChartTable(chartParams)
          }
        } else if (this.isSingleValue) {
          if (chartParams) {
            this.singleValue.icon = chartParams.icon
            const gotData = new Promise(resolve => {
              if (chartParams.dataKey) {
                if (this.parentData && this.parentData[chartParams.dataKey]) {
                  this.singleValue.value = this.parentData[chartParams.dataKey]
                } else {
                  this.noData = true
                }
                resolve()
              } else {
                const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), ...this.entity }
                get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
                  if (response.code === 200) {
                    this.singleValue.value = response.data.result
                  } else {
                    this.isError = true
                    this.noData = true
                    this.errorInfo = response.msg || response.message || 'Unknown'
                  }
                  resolve()
                })
              }
            })
            gotData.then(() => {
              if (this.isSingleValueWithEcharts) { // 带曲线的单值图
                const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), ...this.entity }
                const dom = document.getElementById(`chart${this.chartInfo.id}`)
                !this.myChart && (this.myChart = echarts.init(dom))
                this.chartOption = this.$_.cloneDeep(getOption(this.chart.type))
                const seriesTemplate = this.chartOption.series[0]

                get(replaceUrlPlaceholder(chartParams.urlLine, queryParams)).then(response => {
                  if (response.code === 200) {
                    this.chartOption.series = response.data.result.map((r, i) => {
                      return {
                        ...seriesTemplate,
                        name: r.legend,
                        data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType]),
                        lineStyle: {
                          color: getChartColor[i]
                        }
                      }
                    })
                  } else {
                    this.isError = true
                    this.noData = true
                    this.errorInfo = response.msg || response.message || 'Unknown'
                  }
                  this.myChart.setOption(this.chartOption)
                })
              } else {
                this.loading = false
              }
            }).catch(() => {
              this.singleValue.value = ''
            }).finally(() => {
              setTimeout(() => {
                this.loading = false
                this.$nextTick(() => {
                  this.echartsResize()
                })
              }, 250)
            })
          }
        } else if (this.isTabs) {
          if (!this.$_.isEmpty(this.chartInfo.children)) {
            this.activeTab = `${this.chartInfo.children[0].id}`
          }
        } else if (this.isGroup) {
          const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), ...this.entity }
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
            if (response.code === 200) {
              this.groupData = response.data.result
            } else {
              this.isError = true
              this.noData = true
              this.errorInfo = response.msg || response.message || 'Unknown'
            }
          }).catch(e => {
            this.isError = true
            this.errorInfo = e
          })
        } else if (this.isDomainWhois || this.isDomainDnsRecord) {
          const queryParams = { domain: this.entity.domain }
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
            if (response.code === 200) {
              this.detailData = response.data.result
            } else {
              this.isError = true
              this.noData = true
              this.errorInfo = response.msg || response.message || 'Unknown'
            }
          }).catch(e => {
            this.isError = true
            this.errorInfo = e
          })
        }
      } catch (e) {
        console.error(e)
      }
    },
    reloadChart () {
      this.initChart()
      this.$nextTick(() => {
        if (!this.$_.isEmpty(this.chart.children)) {
          this.chart.children.forEach(chart => {
            this.$refs[`chart-${chart.id}`].reloadChart()
          })
        }
      })
    },
    getTitle (r) {
      let title = ''
      if (r.establishLatency || r.httpResponseLatency || r.sslConLatency) {
        title += `: ${unitConvert(r.establishLatency || r.httpResponseLatency || r.sslConLatency, unitTypes.time).join(' ')}`
      }
      if (r.sequenceGapLossPercent || r.pktRetransPercent) {
        const d = unitConvert(r.sequenceGapLossPercent || r.pktRetransPercent, unitTypes.number)
        title += d[0] === '0.00' ? ': 0' : `: ${d.join(' ')} %`
      }
      if (r.sessions) {
        title += `\nSessions: ${unitConvert(r.sessions, unitTypes.number).join(' ')}`
      }
      if (r.packets) {
        title += `\nPackets: ${unitConvert(r.packets, unitTypes.number).join(' ')}`
      }
      if (r.bytes) {
        title += `\nBytes: ${unitConvert(r.bytes, unitTypes.byte).join(' ')}`
      }
      title = title || ': 0'
      return title
    },
    getTitle2 (item, valueColumn) {
      let title = ''
      switch (valueColumn) {
        case 'sessions': {
          title = `\nSessions: ${unitConvert(item.value, unitTypes.number).join(' ')}`
          break
        }
        case 'packets': {
          title = `\nPackets: ${unitConvert(item.value, unitTypes.number).join(' ')}`
          break
        }
        case 'bytes': {
          title = `\nBytes: ${unitConvert(item.value, unitTypes.byte).join(' ')}`
          break
        }
        case 'establishLatency':
        case 'httpResponseLatency':
        case 'sslConLatency': {
          const result = unitConvert(item.value, unitTypes.time)
          title = `: ${result[0] === 0 ? 0 : result.join(' ')}`
          break
        }
        case 'sequenceGapLossPercent':
        case 'pktRetransPercent': {
          title = `: ${unitConvert(item.value, unitTypes.number).join(' ')}`
          break
        }
        default: break
      }
      return title
    },
    changeTab (tab) {
      this.activeTab = tab.paneName
    },
    initMap (id) {
      const chart = am4Core.create(id, am4Maps.MapChart)
      chart.geodata = getGeoData(storageKey.iso36112WorldLow)
      chart.projection = new am4Maps.projections.Miller()
      const polygonSeries = chart.series.push(new am4Maps.MapPolygonSeries())
      polygonSeries.useGeodata = true
      polygonSeries.exclude = ['AQ'] // 排除南极洲
      return {
        chart,
        polygonSeries
      }
    },
    loadMap (polygonSeries) {
      const chartParams = this.chartInfo.params
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), country: '', region: '', ...this.entity } // 统计数据的查询参数
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200 && !this.$_.isEmpty(response.data.result)) {
          const data = response.data.result
          if (this.isIpBasicInfo) {
            this.detailData = data
          } else {
            data.forEach(r => {
              const serverCountryCapital = r.serverId && getCapitalGeo(r.serverId)
              const clientCountryCapital = r.clientId && getCapitalGeo(r.clientId)
              serverCountryCapital && (r.serverLongitude = serverCountryCapital.capitalLongitude)
              serverCountryCapital && (r.serverLatitude = serverCountryCapital.capitalLatitude)
              clientCountryCapital && (r.clientLongitude = clientCountryCapital.capitalLongitude)
              clientCountryCapital && (r.clientLatitude = clientCountryCapital.capitalLatitude)
            })
            if (this.isMapLine) {
              const lineSeries = this.myChart.series.push(new am4Maps.MapLineSeries())
              const lineTemplate = lineSeries.mapLines.template
              lineTemplate.stroke = am4Core.color('#A258EC')
              lineTemplate.line.nonScalingStroke = true
              lineTemplate.line.strokeDasharray = '4 3'
              lineTemplate.nonScalingStroke = true
              lineTemplate.arrow.nonScaling = true
              lineTemplate.arrow.width = 4
              lineTemplate.arrow.height = 6
              lineSeries.data = [
                {
                  multiGeoLine: data.map(d => {
                    return [
                      {
                        latitude: parseFloat(d.serverLatitude),
                        longitude: parseFloat(d.serverLongitude)
                      },
                      {
                        latitude: parseFloat(d.clientLatitude),
                        longitude: parseFloat(d.clientLongitude)
                      }
                    ]
                  })
                }
              ]
              const imageSeries = this.myChart.series.push(new am4Maps.MapImageSeries())
              imageSeries.dataFields.value = 'sessions'
              const imageSeriesTemplate = imageSeries.mapImages.template
              const circle = imageSeriesTemplate.createChild(am4Core.Circle)

              circle.fillOpacity = 0.7
              circle.nonScaling = true
              circle.tooltipText = '{title}'
              const radiusHeat = imageSeries.heatRules.push({
                target: circle,
                property: 'radius',
                min: 8,
                max: 30
              })
              const colorHeat = imageSeries.heatRules.push({
                target: circle,
                property: 'fill',
                min: am4Core.color('#D2A8FF'),
                max: am4Core.color('#A258EC')
              })
              imageSeriesTemplate.propertyFields.latitude = 'latitude'
              imageSeriesTemplate.propertyFields.longitude = 'longitude'

              const pointData = []
              data.forEach(d => {
                pointData.push({
                  ...d,
                  latitude: parseFloat(d.serverLatitude),
                  longitude: parseFloat(d.serverLongitude),
                  title: this.getTitle(d)
                })
                pointData.push({
                  ...d,
                  latitude: parseFloat(d.clientLatitude),
                  longitude: parseFloat(d.clientLongitude),
                  title: this.getTitle(d)
                })
              })
              imageSeries.data = pointData
            } else if (this.isMapBlock) {
              const sumData = []
              data.forEach(r => {
                const hit = sumData.find(s => s.id === r.serverId)
                if (hit) {
                  hit.value += Number(r.establishLatency || r.httpResponseLatency || r.sslConLatency || r.sequenceGapLossPercent || r.pktRetransPercent || r.sessions) || 0
                } else {
                  sumData.push({
                    id: r.serverId,
                    value: Number(r.establishLatency || r.httpResponseLatency || r.sslConLatency || r.sequenceGapLossPercent || r.pktRetransPercent || r.sessions) || 0
                  })
                }
              })
              const seriesData = sumData.map(r => {
                return {
                  ...r,
                  title: this.getTitle2(r, chartParams.valueColumn)
                }
              })
              polygonSeries.data = [...seriesData]
              const sorted = seriesData.sort((a, b) => b.value - a.value)
              const allZero = this.$_.isEmpty(sorted) || Number(sorted[0].value) === 0 // 数据全为0的情况，legend只显示1个颜色

              polygonSeries.heatRules.push({
                property: 'fill',
                target: polygonSeries.mapPolygons.template,
                min: am4Core.color('#EABA2B'),
                max: allZero ? am4Core.color('#EABA2B') : am4Core.color('#D95D41')
              })

              const heatLegend = this.myChart.createChild(HeatLegend)
              heatLegend.markerContainer.height = 6
              heatLegend.series = polygonSeries
              heatLegend.align = 'left'
              heatLegend.markerCount = allZero ? 1 : 3
              heatLegend.minValue = 0
              heatLegend.fontSize = 12
              heatLegend.maxValue = allZero ? 1 : Number(sorted[0].value)
              heatLegend.width = allZero ? am4Core.percent(10) : am4Core.percent(25)
              heatLegend.marginLeft = 15
              heatLegend.valign = 'bottom'

              const minRange = heatLegend.valueAxis.axisRanges.create()
              minRange.value = heatLegend.minValue
              minRange.label.text = minRange.value === 0 ? 0 : unitConvert(heatLegend.minValue, chartParams.unitType).join(' ')
              const maxRange = heatLegend.valueAxis.axisRanges.create()
              maxRange.value = heatLegend.maxValue
              maxRange.label.text = maxRange.value === 0 ? 0 : unitConvert(heatLegend.maxValue, chartParams.unitType).join(' ')

              heatLegend.valueAxis.renderer.labels.template.adapter.add('text', function (labelText) {
                return ''
              })

              const polygonTemplate = polygonSeries.mapPolygons.template
              polygonTemplate.tooltipText = '{name}{title}'
              polygonTemplate.nonScalingStroke = true
              polygonTemplate.strokeWidth = 0.5
            }
          }
        } else if (response.code !== 200) {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
      }).finally(() => {
        setTimeout(() => { this.loading = false }, 250)
      })
    },
    pageJump (val) {
      this.table.currentPageData = this.getTargetPageData(val, this.table.pageSize, this.table.tableData)
    },
    getTargetPageData (pageNum, pageSize, tableData) {
      return this.$_.slice(tableData, (pageNum - 1) * pageSize, pageNum * pageSize)
    },
    refresh () {
      this.initChart()
    },
    getTableTitle (data) {
      if (data.length > 0) {
        const dataColumns = Object.keys(data[0]) // 返回数据的字段
        const columns = dataColumns.map(c => tableTitleMapping[c]) // 展示字段
        const keys = ['clientIp', 'serverIp', 'appName', 'domain']
        return columns.sort((a, b) => {
          if (keys.indexOf(a.prop) > -1) {
            return -1
          } else if (keys.indexOf(b.prop) > -1) {
            return 1
          } else {
            return 0
          }
        })
      } else {
        return []
      }
    },
    toggleStatisticsLegend (index) {
      this.statisticsData[index].active = !this.statisticsData[index].active
      this.statisticsData.forEach((d, i) => {
        if (d.active) {
          this.myChart.dispatchAction({
            type: 'legendSelect',
            name: d.legend
          })
        } else {
          this.myChart.dispatchAction({
            type: 'legendUnSelect',
            name: d.legend
          })
        }
      })
    },
    orderPieTableChange () {
      if (this.chart.type === 31) {
        const chartParams = this.chartInfo.params || null // 图表参数
        this.initEchartsWithPieTable(chartParams)
      }
    },
    timeLineIsAllZero (data) {
      if (data.resultType === 'matrix') {
        let allZero = true
        try {
          data.result.forEach(d => {
            d.values.forEach(r => {
              if (r[1] && r[1] !== '0') {
                allZero = false
                throw new Error('break')
              }
            })
          })
        } catch (e) {}
        return allZero
      }
    },
    initECharts (chartParams) {
      if (chartParams.showLegend === false) {
        this.chartOption.legend.show = false
      }
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          const seriesTemplate = this.chartOption.series[0]
          const allZero = this.timeLineIsAllZero(response.data)
          if (allZero) {
            this.chartOption.yAxis = {
              ...this.chartOption.yAxis,
              min: 0,
              max: 5,
              interval: 1
            }
          }
          this.chartOption.series = response.data.result.map(r => {
            return {
              ...seriesTemplate,
              name: legendMapping[r.legend] ? legendMapping[r.legend] : lineToSpace(r.legend),
              data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType])
            }
          })
          const rows = (response.data.result.length - 1) / 4 + 1 // 根据legend个数动态预留legend空间
          const gridTop = 10 + 27 * rows
          this.chartOption.grid.top = gridTop
          if (chartParams.unitType === unitTypes.byte) {
            this.chartOption.yAxis.axisLabel.formatter = function (value, index, a, b) {
              return unitConvert(value, unitTypes.byte).join(' ')
            }
            this.chartOption.grid.left = 75
          }
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
        this.myChart.setOption(this.chartOption)
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },
    initRelationShip (chartParams) {
      const queryParams = { ...this.entity, limit: 5 }
      post(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (!response.data.result) {
            this.noData = true
            return
          } else {
            this.noData = false
          }

          const data = []
          const links = []
          handleData(data, links, response.data.result)
          this.chartOption.series[0].data = data
          this.chartOption.series[0].links = links
        }
        this.myChart.setOption(this.chartOption)
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          setTimeout(() => {
            this.myChart.resize()
          })
        }, 250)
      })

      const vm = this
      function handleData (data, links, item) {
        if (!data.some(d => d.name === item.name)) {
          data.push({ name: item.name, ...handleStyle(item) })
        }
        if (!vm.$_.isEmpty(item.from) && !vm.$_.isEmpty(item.to)) {
          links.push({ target: item.to, source: item.from })
        }
        if (!vm.$_.isEmpty(item.leaf)) {
          item.leaf.forEach(i => {
            handleData(data, links, i)
          })
        }
      }

      function handleStyle (item) {
        const style = {}
        switch (item.type) {
          case 'app_id': {
            style.itemStyle = { color: '#73DEB3' }
            style.symbol = 'circle'
            break
          }
          case 'domain': {
            style.itemStyle = { color: '#73A0FA' }
            style.symbol = 'circle'
            break
          }
          case 'client_ip': {
            style.itemStyle = { color: '#E8F6FF', borderColor: '#C9C9C9' }
            style.symbol = 'roundRect'
            style.symbolSize = [80, 25]
            break
          }
          case 'server_ip': {
            style.itemStyle = { color: '#E2FCEF', borderColor: '#C9C9C9' }
            style.symbol = 'roundRect'
            style.symbolSize = [80, 25]
            break
          }
        }
        return style
      }
    },
    initSankey (chartParams) {

    },
    initIpOpenPort (chartParams) {
      get(replaceUrlPlaceholder(chartParams.url, { ip: this.entity.ip })).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
          } else {
            this.noData = false
            // this.detailData = response.data.result
            this.detailData = [
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Http/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: Apache',
                protocol: 'HTTP',
                port: '80'
              },
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Http/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: Apache',
                protocol: 'HTTP',
                port: '81'
              },
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Https/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: Apache',
                protocol: 'HTTPS',
                port: '82'
              },
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Https/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: Apache',
                protocol: 'HTTPS',
                port: '82'
              },
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Https/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: Apache',
                protocol: 'HTTPS',
                port: '82'
              },
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Https/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: Apache',
                protocol: 'HTTPS',
                port: '82'
              },
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Https/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: Apache',
                protocol: 'HTTPS',
                port: '82'
              },
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Https/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: ApacheServer: ApacheServer: ApacheServer: ApacheServer: Apache',
                protocol: 'HTTPS',
                port: '82'
              },
              {
                utime: '2021-9-17 13:53:37',
                banner: 'Https/1.1 200 OK\r\nDate:2021-9-17 13:53:03\r\nServer: Apache',
                protocol: 'HTTPS',
                port: '82'
              }
            ]
            const protocols = []
            this.detailData.forEach((d, i) => {
              const index = protocols.findIndex(p => p.name === d.protocol.toUpperCase())
              if (index === -1) {
                protocols.push({ name: d.protocol.toUpperCase(), value: 1, itemStyle: { color: getChartColor(i) } })
              } else {
                protocols[index].value++
              }
            })
            this.chartOption.series[0].data = protocols
            this.chartOption.xAxis.data = protocols.map(p => p.name)
            this.myChart.setOption(this.chartOption)
          }
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },
    initIpHostedDomain (chartParams) {
      get(replaceUrlPlaceholder(chartParams.url, { ip: this.entity.ip })).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
          } else {
            this.noData = false
            // this.detailData = response.data.result
            this.detailData = ['www.abcdefghijklmnopqrstuvwxyz.com', 'qq.com', 'baidu.com', 'alimama.com', 'google.com']
          }
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
        }, 250)
      })
    },
    initEchartsWithStatistics (chartParams) {
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          const allZero = this.timeLineIsAllZero(response.data)
          if (allZero) {
            this.chartOption.yAxis = {
              ...this.chartOption.yAxis,
              min: 0,
              max: 5,
              interval: 1
            }
          }
          this.statisticsData = response.data.result.map(d => {
            return {
              ...d,
              active: true
            }
          })
          const seriesTemplate = this.chartOption.series[0]
          this.chartOption.series = response.data.result.map((r, i) => {
            return {
              ...seriesTemplate,
              name: r.legend,
              data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType]),
              lineStyle: {
                color: getChartColor[i]
              }
            }
          })
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
        this.myChart.setOption(this.chartOption)
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },
    initEchartsWithPieTable (chartParams) {
      const self = this
      chartParams.valueColumn = this.orderPieTable
      const unitType = getUnitType(chartParams.valueColumn)
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), limit: 10, order: this.orderPieTable, ...this.entity } // 统计数据的查询参数
      const tableQueryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), limit: 10, order: this.orderPieTable, ...this.entity } // 统计数据的查询参数
      tableQueryParams[chartParams.nameColumn] = [] // 处理两个图表不一样的地方
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          const allZero = this.timeLineIsAllZero(response.data)
          if (allZero) {
            this.chartOption.yAxis = {
              ...this.chartOption.yAxis,
              min: 0,
              max: 5,
              interval: 1
            }
          }
          const data = response.data.result.map(d => {
            tableQueryParams[chartParams.nameColumn].push(d[chartParams.nameColumn])
            return {
              data: d,
              name: d[chartParams.nameColumn],
              value: parseInt(d[chartParams.valueColumn]),
              unitType: unitType
            }
          })
          this.allSelectPieChartName = tableQueryParams[chartParams.nameColumn]
          this.chartOption.series[0].data = data
          if (this.chartOption.series[0].data && this.chartOption.series[0].data.length > 10) { // pieWithTable 图例超过10个改为滚动显示
            this.chartOption.legend.type = 'scroll'
          }
          this.myChart.setOption(this.chartOption)
          if (!this.$_.isEmpty(data)) {
            get(replaceUrlPlaceholder(chartParams.urlTable, tableQueryParams)).then(response2 => {
              if (response2.code === 200) {
                this.pieTableData = response2.data.result
              } else {
                this.isError = true
                this.noData = true
                this.errorInfo = response.msg || response.message || 'Unknown'
              }
            })
          }
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
      // legend点击事件
      this.myChart.off('legendselectchanged')
      this.myChart.on('legendselectchanged', function (params) {
        self.myChart.setOption({
          legend: { selected: { [params.name]: true } }
        })
        const index = self.chartOption.series[0].data.findIndex(d => d.name === params.name)
        if (self.selectPieChartName !== params.name) {
          self.myChart.dispatchAction({
            type: 'select',
            seriesIndex: 0,
            dataIndex: index
          })
          self.selectPieChartName = params.name
          self.loadPieTableData(params.name)
        } else {
          self.myChart.dispatchAction({
            type: 'unselect',
            seriesIndex: 0,
            dataIndex: index
          })
          self.selectPieChartName = ''
          self.loadPieTableData(this.allSelectPieChartName)
        }
      })
      // 饼图色块点击事件
      this.myChart.off('click')
      this.myChart.on('click', function (echartParams) {
        // 若是已选，则点击后取消选择，并查询全部数据
        if (echartParams.name === self.selectPieChartName) {
          self.selectPieChartName = ''
          self.loadPieTableData(this.allSelectPieChartName)
        } else { // 否则查询当前name数据
          self.selectPieChartName = echartParams.name
          self.loadPieTableData(echartParams.name)
        }
      })
    },
    loadPieTableData (name = '') {
      const childrenParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), limit: 10, order: this.orderPieTable, ...this.entity }
      childrenParams[this.chartInfo.params.nameColumn] = name
      get(replaceUrlPlaceholder(this.chartInfo.params.urlTable, childrenParams)).then(response => {
        if (response.code === 200) {
          this.pieTableData = response.data.result
        }
      })
    },
    tableLimitChange () {
      const chartParams = this.chartInfo.params || null // 图表参数
      this.initChartTable(chartParams)
    },
    initChartTable (chartParams) {
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), limit: this.table.limit, order: this.table.orderBy, ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          this.table.tableData = response.data.result
          this.table.tableColumns = this.getTableTitle(response.data.result)
          this.table.currentPageData = this.getTargetPageData(1, this.table.pageSize, this.table.tableData)
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || this.$t('tip.unknownError')
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.$refs.tablePagination.resetPageNo()
        })
        setTimeout(() => { this.loading = false }, 250)
      })
    },
    echartsResize () {
      this.myChart && this.myChart.resize()
    }
  },
  computed: {
    computePosition () {
      const gridColumn = `${this.chartInfo.x} / ${this.chartInfo.x + this.chartInfo.w}`
      const gridRow = `${this.chartInfo.y} / ${this.chartInfo.y + this.chartInfo.h}`
      return {
        gridColumn,
        gridRow
      }
    },
    location () {
      let location = ''
      if (this.detailData) {
        if (this.detailData.country) {
          location = this.detailData.country
          if (this.detailData.region) {
            location += ', '
            location += this.detailData.region
          }
        } else if (this.detailData.region) {
          location = this.detailData.region
        }
      }
      return location
    },
    handleSingleValue () {
      const value = this.singleValue.value
      const unitType = this.chartInfo.params.unitType
      const result = unitConvert(value, unitType)
      switch (unitType) {
        case unitTypes.percent: {
          result[0] = result[0] < 0.01 ? '< 0.01' : result[0]
          break
        }
        case unitTypes.time: {
          result[0] = result[0] < 1 ? '< 1' : result[0]
          break
        }
        default: break
      }
      return result
    }
  },
  mounted () {
    this.initChart()
    this.throttle = this.$_.throttle(this.echartsResize, 500)
    window.addEventListener('resize', this.throttle)
  },
  watch: {
    chart: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (o) {
          this.initChart()
        }
      }
    },
    timeFilter: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (n && o) {
          this.$nextTick(() => {
            this.initChart()
          })
        }
      }
    }
  },
  setup (props) {
    const chartInfo = JSON.parse(JSON.stringify(props.chart))
    chartInfo.category = getTypeCategory(props.chart.type)
    return {
      chartInfo,
      layoutConstant,
      chartTableTopOptions,
      chartPieTableTopOptions,
      isEcharts: isEcharts(props.chart.type),
      isEchartsWithTable: isEchartsWithTable(props.chart.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chart.type),
      isSingleValue: isSingleValue(props.chart.type),
      isSingleValueWithEcharts: isSingleValueWithEcharts(props.chart.type),
      isRelationShip: isRelationShip(props.chart.type),
      isTable: isTable(props.chart.type),
      isMap: isMap(props.chart.type),
      isTitle: isTitle(props.chart.type),
      isMapLine: isMapLine(props.chart.type),
      isMapBlock: isMapBlock(props.chart.type),
      isTabs: isTabs(props.chart.type),
      isGroup: isGroup(props.chart.type),
      isSankey: isSankey(props.chart.type),
      isIpBasicInfo: isIpBasicInfo(props.chart.type),
      isIpHostedDomain: isIpHostedDomain(props.chart.type),
      isIpOpenPort: isIpOpenPort(props.chart.type),
      isDomainWhois: isDomainWhois(props.chart.type),
      isDomainDnsRecord: isDomainDnsRecord(props.chart.type),
      isAppBasicInfo: isAppBasicInfo(props.chart.type),
      isAppRelatedDomain: isAppRelatedDomain(props.chart.type),
      layout: getLayout(props.chart.type),
      myChart: shallowRef(null)
    }
  },
  unmounted () {
    window.removeEventListener('resize', this.throttle)
  }
}
</script>
<style lang="scss">
.ip-detail__open-port {
  display: flex;
  height: 100%;
  width: 100%;

  .open-port__table {
    flex: 1;
    display: table;
    height: 100%;
    border-right: 1px solid $--right-box-border-color;

    .open-port__table-row {
      display: table-row;
      font-size: 14px;
      color: #333333;
    }
    .open-port__table-row.open-port__table-row--header {
      padding: 13px 30px 0;
      height: 40px;
      color: #6B717B;
    }
    .open-port__table-cell {
      display: table-cell;
      vertical-align: middle;
      padding: 13px 30px;
    }
  }

  .open-port__chart {
    display: flex;
    flex-direction: column;
    flex: 0 0 30%;
    height: 100%;

    .open-port__chart-title {
      padding-left: 20px;
      line-height: 50px;
      flex: 0 0 50px;
    }
    .open-port__chart-body {
      flex: 1;
    }
  }
}
.ip-detail__hosted-domain {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .hosted-domain__list {
    display: flex;
    flex-direction: column;
    flex: 0 0 25%;
    overflow: auto;
    padding-bottom: 20px;
    border-bottom: 1px solid $--right-box-border-color;

    .hosted-domain__list-title {
      padding: 13px 30px 0;
      height: 40px;
      color: #6B717B;
    }
    .hosted-domain__list-body {
      display: flex;
      flex-direction: column;
      height: calc(100% - 40px);
      overflow: hidden auto;
    }
    .hosted-domain__list-row {
      padding: 5px 30px;
      color: #3976CB;
    }
  }
  .hosted-domain__chart {
    display: flex;
    flex-direction: column;
    flex: 1;

    &>div {
      flex: 0 0 50%;
      display: flex;
      flex-direction: column;
      .hosted-domain__chart-title {
        padding-left: 20px;
        line-height: 50px;
        flex: 0 0 50px;
      }
      .chart-drawing {
        flex: 1;
      }
    }
  }
}
.domain-detail-list {
  display: table;
  width: 100%;

  .domain-detail-list__row {
    display: table-row;

    .domain-detail-list__label {
      display: table-cell;
      padding: 15px 30px;
      border-bottom: 1px solid $--content-right-background-color;
      width: 170px;
      color: #6B717B;
    }
    .domain-detail-list__content {
      display: table-cell;
      padding: 15px 0 ;
      border-bottom: 1px solid $--content-right-background-color;
      color: #3976CB;
    }
  }
}
.entity-detail__dns-record {
  display: flex;
  height: 100%;
  width: 100%;

  .dns-record__table {
    display: table;
    height: 100%;
    width: 100%;

    .dns-record__table-row {
      display: table-row;
      font-size: 14px;
      color: #333333;
    }
    .dns-record__table-row.dns-record__table-row--header {
      padding: 13px 30px 0;
      height: 40px;
      color: #6B717B;
    }
    .dns-record__table-cell {
      display: table-cell;
      border-bottom: 1px solid $--content-right-background-color;
      vertical-align: middle;
      padding: 13px 30px;
    }
    .dns-record__table-row:not(.dns-record__table-row--header) .dns-record__table-cell:last-of-type {
      color: #3976CB;
    }
  }
}
</style>
