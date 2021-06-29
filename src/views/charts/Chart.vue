<template>
  <div
      v-if="isTitle"
      class="cn-chart cn-chart__title"
      :style="computePosition">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</div>
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
        <div style="height: 100%">
          <PieTable :tableData="pieTableData" ref="pieTable"/>
        </div>
      </template>
    </template>
  </echarts-frame>
  <!-- 单值图 -->
  <single-value
      v-else-if="isSingleValue"
      :type="chartInfo.type"
      :style="computePosition"
  >
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
import countries2 from '@amcharts/amcharts4-geodata/data/countries2'

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
  isMapLine
} from '@/components/charts/chart-options'
import EchartsFrame from '@/components/charts/EchartsFrame'
import SingleValue from '@/components/charts/ChartSingleValue'
import ChartTable from '@/components/charts/ChartTable'
import ChartMap from '@/components/charts/ChartMap'
import PieTable from '@/components/charts/PieTable'
import ChartTablePagination from '@/components/charts/ChartTablePagination'
import { chartTableDefaultPageSize, chartTableTopOptions } from '@/utils/constants'
import { get } from '@/utils/http'
import { replaceUrlPlaceholder, lineToHump } from '@/utils/tools'

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
    ChartMap
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
      myChart: null
    }
  },
  methods: {
    initChart () {
      const chartParams = this.chartInfo.params ? JSON.parse(this.chartInfo.params) : null // 图表参数
      if (this.isMap) {
        this.myChart = this.initMap(`chart${this.chartInfo.id}`)
        /*const queryParams = { startTime: 1593070343, endTime: this.endTime } // 统计数据的查询参数
        if (chartParams) {
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(mapResponse => {
            if (mapResponse.data.length > 100) {
              mapResponse.data = mapResponse.data.slice(0, 100)
            }
            if (this.isMapLine) {
              const lineSeries = this.myChart.series.push(new am4Maps.MapLineSeries())
              lineSeries.mapLines.template.stroke = am4Core.color('#A258EC')
              lineSeries.mapLines.template.line.nonScalingStroke = true
              lineSeries.mapLines.template.line.strokeDasharray = '4 3'
              lineSeries.data = [
                {
                  multiGeoLine: mapResponse.data.map(d => {
                    return [{ latitude: parseFloat(d.server_latitude), longitude: parseFloat(d.server_longitude) }, { latitude: parseFloat(d.client_latitude), longitude: parseFloat(d.client_longitude) }]
                  })
                }
              ]

              const imageSeries = this.myChart.series.push(new am4Maps.MapImageSeries())
              const imageSeriesTemplate = imageSeries.mapImages.template
              const circle = imageSeriesTemplate.createChild(am4Core.Circle)

              const gradient = new am4Core.RadialGradient()
              gradient.addColor(am4Core.color('#A258EC'))
              gradient.addColor(am4Core.color('#A258EC'))
              gradient.addColor(am4Core.color('#A258EC'))
              gradient.addColor(am4Core.color('#FFFFFF'))
              gradient.addColor(am4Core.color('#FFFFFF'))

              circle.radius = 4
              circle.fill = gradient
              circle.stroke = am4Core.color('#A258EC')
              circle.strokeWidth = 1
              circle.nonScaling = true
              circle.tooltipText = '{title}'

              imageSeriesTemplate.propertyFields.latitude = 'latitude'
              imageSeriesTemplate.propertyFields.longitude = 'longitude'

              const pointData = []
              mapResponse.data.forEach(d => {
                pointData.push({ latitude: parseFloat(d.server_latitude), longitude: parseFloat(d.server_longitude), title: d.server_region })
                pointData.push({ latitude: parseFloat(d.client_latitude), longitude: parseFloat(d.client_longitude), title: d.client_region })
              })
              imageSeries.data = pointData
            }
          })
        }*/
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
                this.pieTableData = response2.data
              })
            })

            this.myChart.on('click', function (echartParams) {
              get(replaceUrlPlaceholder(chartParams.urlTable, tableQueryParams)).then(response => {
                this.pieTableData = response.data
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
            })
            this.myChart.setOption(this.chartOption)
          }
        }
      } else if (this.isTable) {
        if (chartParams) {
          const tableColumns = new Set()
          tableResponse.data.forEach(d => {
            Object.keys(d).forEach(k => {
              tableColumns.add(k)
            })
          })
          this.table.tableColumns = Array.from(tableColumns)
          this.table.orderBy = this.table.tableColumns[0]
          this.table.tableData = tableResponse.data
          this.table.currentPageData = this.getTargetPageData(1, this.table.pageSize, this.table.tableData)
          /* get(chartParams.url, { startTime: now - 3600000, endTime: now, order: chartParams.order ? chartParams.order : null, limit: chartParams.limit ? chartParams.limit : null }).then(response => {
            if (response.code === 200) {
              const tableColumns = new Set()
              response.data.forEach(d => {
                Object.keys(d).forEach(k => {
                  tableColumns.add(k)
                })
              })
              this.table.tableColumns = tableColumns
              this.table.tableData = response.data
            }
          }) */
        }
      }
    },
    initMap (id) {
      const chart = am4Core.create(id, am4Maps.MapChart)
      chart.geodata = am4GeoDataWorldLow
      chart.projection = new am4Maps.projections.Miller()
      const polygonSeries = chart.series.push(new am4Maps.MapPolygonSeries())
      polygonSeries.useGeodata = true
      polygonSeries.exclude = ['AQ'] // 排除南极洲
      // 鼠标悬停提示
      const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.tooltipText = '{name}:{value}'
      const hs = polygonTemplate.states.create('hover')
      hs.properties.fill = am4Core.color('#91cc75')

      // 热力图规则
      polygonSeries.heatRules.push({
        property: 'fill',
        target: polygonSeries.mapPolygons.template,
        min: am4Core.color('#ffffff'),
        max: am4Core.color(this.theme.themeColor)
      })

// Add expectancy data
      polygonSeries.data = [
        { id: "AF", value: 60.524 },
        { id: "AL", value: 77.185 },
        { id: "DZ", value: 70.874 },
        { id: "AO", value: 51.498 },
        { id: "AR", value: 76.128 },
        { id: "AM", value: 74.469 },
        { id: "AU", value: 82.364 },
        { id: "AT", value: 80.965 },
        { id: "AZ", value: 70.686 },
        { id: "BH", value: 76.474 },
        { id: "BD", value: 70.258 },
        { id: "BY", value: 69.829 },
        { id: "BE", value: 80.373 },
        { id: "BJ", value: 59.165 },
        { id: "BT", value: 67.888 },
        { id: "BO", value: 66.969 },
        { id: "BA", value: 76.211 },
        { id: "BW", value: 47.152 },
        { id: "BR", value: 73.667 },
        { id: "BN", value: 78.35 },
        { id: "BG", value: 73.448 },
        { id: "BF", value: 55.932 },
        { id: "BI", value: 53.637 },
        { id: "KH", value: 71.577 },
        { id: "CM", value: 54.61 },
        { id: "CA", value: 81.323 },
        { id: "CV", value: 74.771 },
        { id: "CF", value: 49.517 },
        { id: "TD", value: 50.724 },
        { id: "CL", value: 79.691 },
        { id: "CN", value: 75.178 },
        { id: "CO", value: 73.835 },
        { id: "KM", value: 60.661 },
        { id: "CD", value: 49.643 },
        { id: "CG", value: 58.32 },
        { id: "CR", value: 79.712 },
        { id: "CI", value: 50.367 },
        { id: "HR", value: 76.881 },
        { id: "CU", value: 79.088 },
        { id: "CY", value: 79.674 },
        { id: "CZ", value: 77.552 },
        { id: "DK", value: 79.251 },
        { id: "GL", value: 79.251 },
        { id: "DJ", value: 61.319 },
        { id: "DO", value: 73.181 },
        { id: "EC", value: 76.195 },
        { id: "EG", value: 70.933 },
        { id: "SV", value: 72.361 },
        { id: "GQ", value: 52.562 },
        { id: "ER", value: 62.329 },
        { id: "EE", value: 74.335 },
        { id: "ET", value: 62.983 },
        { id: "FJ", value: 69.626 },
        { id: "FI", value: 80.362 },
        { id: "FR", value: 81.663 },
        { id: "GA", value: 63.115 },
        { id: "GF", value: 79.9 },
        { id: "GM", value: 58.59 },
        { id: "GE", value: 74.162 },
        { id: "DE", value: 80.578 },
        { id: "GH", value: 60.979 },
        { id: "GR", value: 80.593 },
        { id: "GT", value: 71.77 },
        { id: "GN", value: 55.865 },
        { id: "GW", value: 54.054 },
        { id: "GY", value: 66.134 },
        { id: "HT", value: 62.746 },
        { id: "HN", value: 73.503 },
        { id: "HK", value: 83.199 },
        { id: "HU", value: 74.491 },
        { id: "IS", value: 81.96 },
        { id: "IN", value: 66.168 },
        { id: "ID", value: 70.624 },
        { id: "IR", value: 73.736 },
        { id: "IQ", value: 69.181 },
        { id: "IE", value: 80.531 },
        { id: "IL", value: 81.641 },
        { id: "IT", value: 82.235 },
        { id: "JM", value: 73.338 },
        { id: "JP", value: 83.418 },
        { id: "JO", value: 73.7 },
        { id: "KZ", value: 66.394 },
        { id: "KE", value: 61.115 },
        { id: "KP", value: 69.701 },
        { id: "KR", value: 81.294 },
        { id: "KW", value: 74.186 },
        { id: "KG", value: 67.37 },
        { id: "LA", value: 67.865 },
        { id: "LV", value: 72.045 },
        { id: "LB", value: 79.716 },
        { id: "LS", value: 48.947 },
        { id: "LR", value: 60.23 },
        { id: "LY", value: 75.13 },
        { id: "LT", value: 71.942 },
        { id: "LU", value: 80.371 },
        { id: "MK", value: 75.041 },
        { id: "MG", value: 64.28 },
        { id: "MW", value: 54.798 },
        { id: "MY", value: 74.836 },
        { id: "ML", value: 54.622 },
        { id: "MR", value: 61.39 },
        { id: "MU", value: 73.453 },
        { id: "MX", value: 77.281 },
        { id: "MD", value: 68.779 },
        { id: "MN", value: 67.286 },
        { id: "ME", value: 74.715 },
        { id: "MA", value: 70.714 },
        { id: "EH", value: 70.714 },
        { id: "MZ", value: 49.91 },
        { id: "MM", value: 65.009 },
        { id: "NA", value: 64.014 },
        { id: "NP", value: 67.989 },
        { id: "NL", value: 80.906 },
        { id: "NZ", value: 80.982 },
        { id: "NI", value: 74.515 },
        { id: "NE", value: 57.934 },
        { id: "NG", value: 52.116 },
        { id: "NO", value: 81.367 },
        { id: "SJ", value: 81.367 },
        { id: "OM", value: 76.287 },
        { id: "PK", value: 66.42 },
        { id: "PA", value: 77.342 },
        { id: "PG", value: 62.288 },
        { id: "PY", value: 72.181 },
        { id: "PE", value: 74.525 },
        { id: "PH", value: 68.538 },
        { id: "PL", value: 76.239 },
        { id: "PT", value: 79.732 },
        { id: "QA", value: 78.231 },
        { id: "RO", value: 73.718 },
        { id: "RU", value: 67.874 },
        { id: "RW", value: 63.563 },
        { id: "SA", value: 75.264 },
        { id: "SN", value: 63.3 },
        { id: "RS", value: 73.934 },
        { id: "SL", value: 45.338 },
        { id: "SG", value: 82.155 },
        { id: "SK", value: 75.272 },
        { id: "SI", value: 79.444 },
        { id: "SB", value: 67.465 },
        { id: "SO", value: 54 },
        { id: "ZA", value: 56.271 },
        { id: "SS", value: 54.666 },
        { id: "ES", value: 81.958 },
        { id: "LK", value: 74.116 },
        { id: "SD", value: 61.875 },
        { id: "SR", value: 70.794 },
        { id: "SZ", value: 48.91 },
        { id: "SE", value: 81.69 },
        { id: "CH", value: 82.471 },
        { id: "SY", value: 71 },
        { id: "TW", value: 79.45 },
        { id: "TJ", value: 67.118 },
        { id: "TZ", value: 60.885 },
        { id: "TH", value: 74.225 },
        { id: "TL", value: 67.033 },
        { id: "TG", value: 56.198 },
        { id: "TT", value: 69.761 },
        { id: "TN", value: 75.632 },
        { id: "TR", value: 74.938 },
        { id: "TM", value: 65.299 },
        { id: "UG", value: 58.668 },
        { id: "UA", value: 68.414 },
        { id: "AE", value: 76.671 },
        { id: "GB", value: 80.396 },
        { id: "US", value: 78.797 },
        { id: "UY", value: 77.084 },
        { id: "UZ", value: 68.117 },
        { id: "VE", value: 74.477 },
        { id: "PS", value: 73.018 },
        { id: "VN", value: 75.793 },
        { id: "YE", value: 62.923 },
        { id: "ZM", value: 57.037 },
        { id: "ZW", value: 58.142 }
      ];

      const lineSeries = chart.series.push(new am4Maps.MapLineSeries())
      lineSeries.mapLines.template.stroke = am4Core.color('#A258EC')
      lineSeries.mapLines.template.line.nonScalingStroke = true
      lineSeries.mapLines.template.line.strokeDasharray = '4 3'
      lineSeries.data = [
        {
          multiGeoLine: mapResponse3.data.map(d => {
            return [{ id: d.server_id }, { id: d.client_id }]
          })
          /*multiGeoLine: mapResponse.data.map(d => {
            return [{ latitude: parseFloat(d.server_latitude), longitude: parseFloat(d.server_longitude) }, { latitude: parseFloat(d.client_latitude), longitude: parseFloat(d.client_longitude) }]
          })*/
        }
      ]
      /*const myChart = am4Core.create(id, am4Maps.MapChart)
      myChart.geodata = am4GeoDataWorldLow
      myChart.projection = new am4Maps.projections.Miller()
      const polygonSeries = myChart.series.push(new am4Maps.MapPolygonSeries())
      polygonSeries.useGeodata = true
      polygonSeries.exclude = ['AQ'] // 移除南极洲
      const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.tooltipText = '{name}'
      polygonTemplate.fill = am4Core.color('#E7EDF6')
      const hs = polygonTemplate.states.create('hover') // 添加hover事件
      hs.properties.fill = am4Core.color('#B7BDC6')
      return myChart*/
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
      layout: getLayout(props.chart.type)
    }
  }
}
const mapResponse3 = JSON.parse(`{
  "code": "200666",
  "data": [{
            "level": 0,
            "server_id": "US",
            "server_longitude": "110.290534",
            "server_latitude": "30.816222",
            "server_country": "America",
            "server_region": "Washington",
            "client_id": "CN",
            "client_longitude": "116.352963",
            "client_latitude": "40.409079",
            "client_country": "China",
            "client_region": "Beijing",
            "bytes": 27010,
            "sessions": 40
        }, {
            "level": 0,
            "server_id": "RU",
            "server_longitude": "2.352222",
            "server_latitude": "48.856614",
            "server_country": "America",
            "server_region": "Washington",
            "client_id": "CN",
            "client_longitude": "-74.005973",
            "client_latitude": "40.712775",
            "client_country": "China",
            "client_region": "Beijing",
            "bytes": 67010,
            "sessions": 30
        }],
  "status": 200,
  "statistics": {
    "result_rows": 0,
    "elapsed": 0,
    "rows_read": 0,
    "result_size": 0
  }
}`)
const mapResponse = JSON.parse(`{
  "code": "200666",
  "data": [{
            "server_longitude": "110.290534",
            "server_latitude": "30.816222",
            "server_country": "America",
            "server_region": "Washington",
            "client_longitude": "116.352963",
            "client_latitude": "40.409079",
            "client_country": "China",
            "client_region": "Beijing",
            "bytes": 27010,
            "sessions": 40
        }, {
            "server_longitude": "2.352222",
            "server_latitude": "48.856614",
            "server_country": "America",
            "server_region": "Washington",
            "client_longitude": "-74.005973",
            "client_latitude": "40.712775",
            "client_country": "China",
            "client_region": "Beijing",
            "bytes": 67010,
            "sessions": 30
        }],
  "status": 200,
  "statistics": {
    "result_rows": 0,
    "elapsed": 0,
    "rows_read": 0,
    "result_size": 0
  }
}`)/*
const mapResponse2 = JSON.parse(`{
  "code": "200666",
  "data": [{
  "id": "US",
  "name": "United States",
  "value": 100,
  "fill": am4core.color("#F05C5C")
}, {
  "id": "FR",
  "name": "France",
  "value": 50,
  "fill": am4core.color("#5C5CFF")
}],
  "status": 200,
  "statistics": {
    "result_rows": 0,
    "elapsed": 0,
    "rows_read": 0,
    "result_size": 0
  }
}`)*/
const tableResponse = JSON.parse(`{
  "status": 200,
  "success": true,
  "message": "OK",
  "statistics": {
    "elapsed": 2111,
    "rows_read": 1750155,
    "result_size": 872,
    "result_rows": 10
  },
  "data": [{
    "ip": "192.168.32.107",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.108",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.109",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.110",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.111",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.112",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.113",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.114",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.115",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.116",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.117",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.118",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  },{
    "ip": "192.168.32.119",
    "sessions": "229112",
    "packets": "245823",
    "bytes": "17974141"
  }
  ]
}`)
</script>

<style>

</style>
