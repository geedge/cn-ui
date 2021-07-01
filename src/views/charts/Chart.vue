<template>
  <!-- 标题 -->
  <div
      v-if="isTitle"
      class="cn-chart cn-chart__title"
      :style="computePosition">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</div>
  <!-- Tabs -->
  <chart-tabs
      v-else-if="isTabs"
      class="cn-chart cn-chart__tabs"
  ></chart-tabs>
  <!-- 地图 -->
  <chart-map
      v-else-if="isMap"
      :style="computePosition"
  >
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations>
      <i class="cn-icon cn-icon-more-light"></i>
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
    <template #title v-if="layout.indexOf(layoutConstant.HEADER) > -1">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations v-if="layout.indexOf(layoutConstant.HEADER) > -1">
      <i class="cn-icon cn-icon-more-light"></i>
    </template>
    <template #default>
      <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
    <template #footer v-if="layout.indexOf(layoutConstant.FOOTER) > -1" :class="{}">
      <!-- 带Table的饼图，展示Table -->
      <template v-if="isEchartsWithTable">
        <PieTable :tableData="pieTableData" ref="pieTable"/>
      </template>
    </template>
  </echarts-frame>
  <!-- 单值图 -->
  <single-value
      v-else-if="isSingleValue"
      :type="chartInfo.type"
      :style="computePosition"
  >
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #data>{{singleValue}}</template>
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
            placeholder=""
            popper-class="option-popper"
        >
          <el-option v-for="item in table.tableColumns" :key="item" :value="item">{{item}}</el-option>
        </el-select>
      </div>
<!--      <div class="header__operation header__operation&#45;&#45;table">
        <span class="option__button"><i class="cn-icon cn-icon-style"></i></span>
        <div class="icon-group-divide"></div>
        <span class="option__button"><i class="cn-icon cn-icon-dropdown"></i></span>
      </div>-->
      <div class="header__operation header__operation--table">
        <span class="option__button"><i class="cn-icon cn-icon-full-screen"></i></span>
      </div>
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
import am4GeoDataWorldLow from '@amcharts/amcharts4-geodata/worldChinaLow'

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
  isMapLine,
  isTabs
} from '@/components/charts/chart-options'
import EchartsFrame from '@/components/charts/EchartsFrame'
import SingleValue from '@/components/charts/ChartSingleValue'
import ChartTable from '@/components/charts/ChartTable'
import ChartMap from '@/components/charts/ChartMap'
import PieTable from '@/components/charts/PieTable'
import ChartTabs from '@/components/charts/ChartTabs'
import ChartTablePagination from '@/components/charts/ChartTablePagination'
import { chartTableDefaultPageSize, chartTableTopOptions } from '@/utils/constants'
import { get } from '@/utils/http'
import { replaceUrlPlaceholder, getCapitalGeo } from '@/utils/tools'

export default {
  name: 'Chart',
  props: {
    chart: Object, // 图表对象，包括id、name、type等数据
    startTime: {
      type: Number
    },
    endTime: {
      type: Number
    }
  },
  components: {
    EchartsFrame,
    SingleValue,
    ChartTablePagination,
    ChartTable,
    PieTable,
    ChartMap,
    ChartTabs
  },
  data () {
    return {
      table: {
        pageSize: chartTableDefaultPageSize,
        limit: chartTableTopOptions[0], // top-n
        orderBy: '',
        tableColumns: [], // table字段
        tableData: [], // table的所有数据
        currentPageData: [] // table当前页的数据
      },
      pieTableData: [],
      singleValue: '-',
      myChart: null
    }
  },
  methods: {
    initChart () {
      const chartParams = this.chartInfo.params ? JSON.parse(this.chartInfo.params) : null // 图表参数
      if (this.isMap) {
        this.myChart = this.initMap(`chart${this.chartInfo.id}`)
        const queryParams = { startTime: 1593070343, endTime: this.endTime, country: '', region: '' } // 统计数据的查询参数
        if (chartParams) {
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
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
              lineSeries.mapLines.template.stroke = am4Core.color('#A258EC')
              lineSeries.mapLines.template.line.nonScalingStroke = true
              lineSeries.mapLines.template.line.strokeDasharray = '4 3'
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
              const imageSeriesTemplate = imageSeries.mapImages.template
              const circle = imageSeriesTemplate.createChild(am4Core.Circle)

              circle.radius = 6
              circle.fill = am4Core.color('#A258EC')
              circle.strokeWidth = 1
              circle.nonScaling = true
              circle.tooltipText = '{title}'

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
            }
            /* if (mapResponse.data.length > 100) {
              mapResponse.data = mapResponse.data.slice(0, 100)
            } */
          })
        }
      } else if (this.isEcharts) {
        const dom = document.getElementById(`chart${this.chartInfo.id}`)
        this.myChart = echarts.init(dom)
        if (chartParams) {
          if (this.isEchartsWithTable) {
            const queryParams = { startTime: 1593070343, endTime: this.endTime, limit: 10 } // 统计数据的查询参数
            const tableQueryParams = { startTime: 1593070343, endTime: this.endTime, limit: 10 } // 统计数据的查询参数
            get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
              const data = response.data.result
              this.chartOption.legend.formatter = (name) => { // 根据图表宽 显示legend的字数
                let str = name
                const length = Math.floor(dom.offsetWidth / 75)
                if (name.length > length) {
                  str = name.substring(0, length - 3) + '...'
                }
                return str
              }
              this.chartOption.series[0].data = data.map(d => {
                return {
                  data: d,
                  name: d[chartParams.nameColumn],
                  value: parseInt(d[chartParams.valueColumn])
                }
              })
              if (this.chartOption.series[0].data && this.chartOption.series[0].data.length > 10) { // pieWithTable 图例超过10个改为滚动显示
                this.chartOption.legend.type = 'scroll'
              }
              this.myChart.setOption(this.chartOption)
              tableQueryParams[chartParams.nameColumn] = data[0][chartParams.nameColumn]
              get(replaceUrlPlaceholder(chartParams.urlTable, tableQueryParams)).then(response2 => {
                this.pieTableData = response2.data.result
              })
            })

            this.myChart.on('click', function (echartParams) {
              get(replaceUrlPlaceholder(chartParams.urlTable, tableQueryParams)).then(response => {
                this.pieTableData = response.data.result
              })
            })
          } else {
            const queryParams = { startTime: 1593070343, endTime: this.endTime }
            get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
              if (response.code === 200) {
                const seriesTemplate = this.chartOption.series[0]
                this.chartOption.series = response.data.result.map(r => {
                  return {
                    ...seriesTemplate,
                    name: r.legend,
                    data: r.values
                  }
                })
              }
              this.myChart.setOption(this.chartOption)
            })
          }
        }
      } else if (this.isTable) {
        if (chartParams) {
          const queryParams = { startTime: 1593070343, endTime: this.endTime, limit: 100, order: 'sessions' }
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
            if (response.code === 200) {
              const tableColumns = new Set()
              response.data.result.forEach(d => {
                Object.keys(d).forEach(k => {
                  tableColumns.add(k)
                })
              })
              this.table.tableColumns = tableColumns
              this.table.tableData = response.data.result
              this.table.orderBy = this.table.tableColumns[0]
              this.table.currentPageData = this.getTargetPageData(1, this.table.pageSize, this.table.tableData)
            }
          })
        }
      } else if (this.isSingleValue) {
        if (chartParams) {
          const queryParams = { startTime: 1593070343, endTime: this.endTime }
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
            if (response.code === 200) {
              this.singleValue = response.data.result
            }
          })
        }
      }
    },
    getTitle (data) {
      return `Server: ${data.serverRegion ? data.serverRegion : data.serverCountry}
          Client: ${data.clientRegion ? data.clientRegion : data.clientCountry}
          Sessions: ${data.sessions}
          Bytes: ${data.bytes}`
    },
    initMap (id) {
      const chart = am4Core.create(id, am4Maps.MapChart)
      chart.geodata = am4GeoDataWorldLow
      chart.projection = new am4Maps.projections.Miller()
      const polygonSeries = chart.series.push(new am4Maps.MapPolygonSeries())
      polygonSeries.useGeodata = true
      polygonSeries.exclude = ['AQ'] // 排除南极洲
      // 鼠标悬停提示
      /*const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.tooltipText = '{name}'
      polygonTemplate.fontSize = '12px'
      const hs = polygonTemplate.states.create('hover')
      hs.properties.fill = am4Core.color('#ccc')*/

      // 热力图规则
      polygonSeries.heatRules.push({
        property: 'fill',
        target: polygonSeries.mapPolygons.template,
        min: am4Core.color('#ffffff'),
        max: am4Core.color(this.theme.themeColor)
      })
      return chart
    },
    pageJump (val) {
      this.table.currentPageData = this.getTargetPageData(val, this.table.pageSize, this.table.tableData)
    },
    getTargetPageData (pageNum, pageSize, tableData) {
      return this.$_.slice(tableData, (pageNum - 1) * pageSize, pageNum * pageSize)
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
    }
  },
  mounted () {
    this.initChart()
  },
  setup (props) {
    const chartInfo = JSON.parse(JSON.stringify(props.chart))
    chartInfo.category = getTypeCategory(props.chart.type)
    return {
      chartInfo,
      layoutConstant,
      chartTableTopOptions,
      chartOption: getOption(props.chart.type),
      isEcharts: isEcharts(props.chart.type),
      isEchartsWithTable: isEchartsWithTable(props.chart.type),
      isSingleValue: isSingleValue(props.chart.type),
      isTable: isTable(props.chart.type),
      isMap: isMap(props.chart.type),
      isTitle: isTitle(props.chart.type),
      isMapLine: isMapLine(props.chart.type),
      isTabs: isTabs(props.chart.type),
      layout: getLayout(props.chart.type)
    }
  }
}
</script>

<style>

</style>
