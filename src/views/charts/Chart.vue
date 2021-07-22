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
        <chart v-if="activeTab == tab.id" :key="chart.id" :chart="chart" :time-filter="timeFilter" :ref="`chart-${chart.id}`"></chart>
      </template>
    </el-tab-pane>
  </el-tabs>
  <!-- 地图 -->
  <chart-map
      v-else-if="isMap"
      :style="computePosition"
  >
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations>
<!--      <i class="cn-icon cn-icon-more-light"></i>-->
<!--      <i class="cn-icon cn-icon-refresh" @click="loadMap"></i>-->
    </template>
    <template #default>
      <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
  </chart-map>
  <!-- echarts类的图，如饼图、柱状图、折线图等 -->
  <echarts-frame
      v-else-if="isEcharts"
      :layout="layout"
      :style="computePosition"
      :chartInfo="chartInfo"
  >
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
<!--      <i class="cn-icon cn-icon-more-light margin-l-10"></i>-->
    </template>
    <template #default>
      <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
    <template #footer v-if="layout.indexOf(layoutConstant.FOOTER) > -1">
      <!-- 带Table的饼图，展示Table -->
      <template v-if="isEchartsWithTable">
        <pie-table :tableData="pieTableData" ref="pieTable" :chartInfo="chartInfo" :time-filter="timeFilter" :order="orderPieTable"/>
      </template>
      <template v-else-if="isEchartsWithStatistics">
        <statistics-legend :data="statisticsData" :chart-info="chartInfo"></statistics-legend>
      </template>
    </template>
  </echarts-frame>
  <!-- 单值图 -->
  <single-value
      v-else-if="isSingleValue"
      :type="chartInfo.type"
      :style="computePosition"
      :icon="singleValue.icon"
  >
    <template #title><span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span></template>
    <template #data>
      <span>{{handleSingleValue[0]}}</span>
      <span class="single-value__unit">{{handleSingleValue[1]}}</span>
    </template>
  </single-value>
  <!-- 表格 -->
  <chart-table
      v-else-if="isTable"
      :table-columns="table.tableColumns"
      :table-data="table.currentPageData"
      :style="computePosition"
  >
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations>
<!--      <div class="header__operation header__operation&#45;&#45;table">
        <span class="option__button"><i class="cn-icon cn-icon-download"></i></span>
      </div>-->
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
            :placeholder="$t('common.field')"
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
          :total="table.tableData.length"
          @pageJump="pageJump"
      ></chart-table-pagination>
    </template>
  </chart-table>
</template>

<script>
import * as echarts from 'echarts'
import * as am4Core from '@amcharts/amcharts4/core'
import * as am4Maps from '@amcharts/amcharts4/maps'
import { shallowRef } from 'vue'
import { allTableTitle, legendMapping } from '@/components/charts/chart-table-title'
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
  isTabs,
  getChartColor
} from '@/components/charts/chart-options'
import EchartsFrame from '@/components/charts/EchartsFrame'
import SingleValue from '@/components/charts/ChartSingleValue'
import ChartTable from '@/components/charts/ChartTable'
import ChartMap from '@/components/charts/ChartMap'
import PieTable from '@/components/charts/PieTable'
import StatisticsLegend from '@/components/charts/StatisticsLegend'
import ChartTablePagination from '@/components/charts/ChartTablePagination'
import unitConvert, { getUnitType } from '@/utils/unit-convert'
import { chartTableDefaultPageSize, chartTableTopOptions, storageKey, chartPieTableTopOptions, unitTypes } from '@/utils/constants'
import { get } from '@/utils/http'
import { replaceUrlPlaceholder, getCapitalGeo, getGeoData, lineToSpace } from '@/utils/tools'

export default {
  name: 'Chart',
  props: {
    chart: Object, // 图表对象，包括id、name、type等数据
    timeFilter: Object
  },
  components: {
    EchartsFrame,
    SingleValue,
    ChartTablePagination,
    ChartTable,
    PieTable,
    StatisticsLegend,
    ChartMap
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
      statisticsData: [],
      orderPieTable: chartPieTableTopOptions[0].value,
      selectPieChartName: '',
      chartOption: null
    }
  },
  methods: {
    initChart () {
      const chartParams = this.chartInfo.params
      if (this.isMap) {
        const { chart, polygonSeries } = this.initMap(`chart${this.chartInfo.id}`)
        !this.myChart && (this.myChart = chart)
        if (chartParams) {
          this.loadMap(polygonSeries)
        }
      } else if (this.isEcharts) {
        const dom = document.getElementById(`chart${this.chartInfo.id}`)
        !this.myChart && (this.myChart = echarts.init(dom))
        this.chartOption = JSON.parse(JSON.stringify(getOption(this.chart.type)))
        if (chartParams) {
          if (this.isEchartsWithTable) {
            this.initEchartsWithPieTable(chartParams)
          } else if (this.isEchartsWithStatistics) {
            this.initEchartsWithStatistics(chartParams)
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
          const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000) }
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
            if (response.code === 200) {
              this.singleValue.value = response.data.result
            }
          })
        }
      } else if (this.isTabs) {
        if (!this.$_.isEmpty(this.chartInfo.children)) {
          this.activeTab = `${this.chartInfo.children[0].id}`
        }
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
        title = `${title}: ${unitConvert(r.establishLatency || r.httpResponseLatency || r.sslConLatency, unitTypes.time).join(' ')}`
      }
      if (r.sequenceGapLossPercent || r.pktRetransPercent) {
        title = `${title}: ${unitConvert(r.sequenceGapLossPercent || r.pktRetransPercent, unitTypes.number).join(' ')} %`
      }
      if (r.sessions) {
        title = `${title}\nSessions: ${unitConvert(r.sessions, unitTypes.number).join(' ')}`
      }
      if (r.bytes) {
        title = `${title}\nBytes: ${unitConvert(r.bytes, unitTypes.byte).join(' ')}`
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
      // 鼠标悬停提示
      /* const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.tooltipText = '{name}'
      polygonTemplate.fontSize = '12px'
      const hs = polygonTemplate.states.create('hover')
      hs.properties.fill = am4Core.color('#ccc') */
      return {
        chart,
        polygonSeries
      }
    },
    loadMap (polygonSeries) {
      const chartParams = this.chartInfo.params
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), country: '', region: '' } // 统计数据的查询参数
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          const data = response.data.result
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
            polygonSeries.heatRules.push({
              property: 'fill',
              target: polygonSeries.mapPolygons.template,
              min: am4Core.color('#FFFF00'),
              max: am4Core.color('#E66767')
            })
            polygonSeries.data = response.data.result.map(r => {
              return {
                id: r.serverId,
                title: this.getTitle(r),
                value: r.establishLatency || r.httpResponseLatency || r.sslConLatency || r.sequenceGapLossPercent || r.pktRetransPercent || r.sessions
              }
            })
            const polygonTemplate = polygonSeries.mapPolygons.template
            polygonTemplate.tooltipText = '{name}{title}'
            // polygonTemplate.numberFormatter = new am4Core.NumberFormatter().bigNumberPrefixes
            polygonTemplate.nonScalingStroke = true
            polygonTemplate.strokeWidth = 0.5
          }
        }
      })
    },
    pageJump (val) {
      this.table.currentPageData = this.getTargetPageData(val, this.table.pageSize, this.table.tableData)
    },
    getTargetPageData (pageNum, pageSize, tableData) {
      return this.$_.slice(tableData, (pageNum - 1) * pageSize, pageNum * pageSize)
    },
    orderPieTableChange () {
      if (this.chart.type === 31) {
        const chartParams = this.chartInfo.params || null // 图表参数
        this.myChart.off('click')
        this.initEchartsWithPieTable(chartParams)
      }
    },
    initECharts (chartParams) {
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000) }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          const seriesTemplate = this.chartOption.series[0]
          this.chartOption.series = response.data.result.map(r => {
            return {
              ...seriesTemplate,
              name: legendMapping[r.legend] ? legendMapping[r.legend] : lineToSpace(r.legend),
              data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType])
            }
          })
          if (chartParams.unitType === unitTypes.byte) {
            this.chartOption.yAxis.axisLabel.formatter = function (value, index, a, b) {
              return unitConvert(value, unitTypes.byte).join(' ')
            }
            this.chartOption.grid.left = 75
          }
        }
        this.myChart.setOption(this.chartOption)
        this.$nextTick(() => {
          this.myChart.resize()
        })
      })
    },
    initEchartsWithStatistics (chartParams) {
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000) }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          this.statisticsData = response.data.result
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
        }
        this.myChart.setOption(this.chartOption)
        this.$nextTick(() => {
          this.myChart.resize()
        })
      })
    },
    initEchartsWithPieTable (chartParams) {
      const self = this
      chartParams.valueColumn = this.orderPieTable
      const unitType = getUnitType(chartParams.valueColumn)
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), limit: 10, order: this.orderPieTable } // 统计数据的查询参数
      const tableQueryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), limit: 10, order: this.orderPieTable } // 统计数据的查询参数
      tableQueryParams[chartParams.nameColumn] = [] // 处理两个图表不一样的地方
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          const data = response.data.result.map(d => {
            tableQueryParams[chartParams.nameColumn].push(d[chartParams.nameColumn])
            return {
              data: d,
              name: d[chartParams.nameColumn],
              value: parseInt(d[chartParams.valueColumn]),
              unitType: unitType
            }
          })
          this.chartOption.series[0].data = data
          if (this.chartOption.series[0].data && this.chartOption.series[0].data.length > 10) { // pieWithTable 图例超过10个改为滚动显示
            this.chartOption.legend.type = 'scroll'
          }
          this.myChart.setOption(this.chartOption)
          this.$nextTick(() => {
            this.myChart.resize()
          })
          get(replaceUrlPlaceholder(chartParams.urlTable, tableQueryParams)).then(response2 => {
            if (response2.code === 200) {
              this.pieTableData = response2.data.result
            }
          })
        }
      })
      // legend点击事件
      this.myChart.on('legendselectchanged', function (params) {
        self.myChart.setOption({
          legend: { selected: { [params.name]: true } }
        })
        self.chartOption.series[0].data.forEach((d, i) => {
          // 遍历到当前点击的legend时
          if (d.name === params.name) {
            // 如果这个legend是已激活状态，则取消激活，并且查询全部
            if (self.selectPieChartName === d.name) {
              self.myChart.dispatchAction({
                type: 'unselect',
                seriesIndex: 0,
                dataIndex: i
              })
              self.selectPieChartName = ''
              self.loadPieTableData()
            } else { // 否则激活，并且查询当前name的数据
              self.selectPieChartName = d.name
              self.myChart.dispatchAction({
                type: 'select',
                seriesIndex: 0,
                dataIndex: i
              })
              self.loadPieTableData(params.name)
            }
          } else {
            self.myChart.dispatchAction({
              type: 'unselect',
              seriesIndex: 0,
              dataIndex: i
            })
          }
        })
      })
      // 饼图色块点击事件
      this.myChart.on('click', function (echartParams) {
        // 若是已选，则点击后取消选择，并查询全部数据
        if (echartParams.name === self.selectPieChartName) {
          self.selectPieChartName = ''
          self.loadPieTableData()
        } else { // 否则查询当前name数据
          self.selectPieChartName = echartParams.name
          self.loadPieTableData(echartParams.name)
        }
      })
    },
    loadPieTableData (name = '') {
      const childrenParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), limit: 10, order: this.orderPieTable }
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
      const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), limit: this.table.limit, order: this.table.orderBy }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          this.table.tableColumns = allTableTitle['tableTitles' + this.chart.id]
          this.table.tableData = response.data.result
          this.table.currentPageData = this.getTargetPageData(1, this.table.pageSize, this.table.tableData)
        }
      })
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
    handleSingleValue () {
      const value = this.singleValue.value
      const unitType = this.chartInfo.params.unitType
      const result = unitConvert(value, unitType)
      switch (unitType) {
        case unitTypes.number: {
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
        if (n) {
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
    chartInfo.params = chartInfo.params ? JSON.parse(chartInfo.params) : null
    return {
      chartInfo,
      layoutConstant,
      chartTableTopOptions,
      chartPieTableTopOptions,
      isEcharts: isEcharts(props.chart.type),
      isEchartsWithTable: isEchartsWithTable(props.chart.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chart.type),
      isSingleValue: isSingleValue(props.chart.type),
      isTable: isTable(props.chart.type),
      isMap: isMap(props.chart.type),
      isTitle: isTitle(props.chart.type),
      isMapLine: isMapLine(props.chart.type),
      isMapBlock: isMapBlock(props.chart.type),
      isTabs: isTabs(props.chart.type),
      layout: getLayout(props.chart.type),
      myChart: shallowRef(null)
    }
  }
}
</script>
