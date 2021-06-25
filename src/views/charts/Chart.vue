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
  heightUnit,
  isEchartsWithTable,
  pieTableDatas,
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
        const queryParams = { startTime: 1593070343, endTime: this.endTime } // 统计数据的查询参数
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
        }
      } else if (this.isEcharts) {
        const dom = document.getElementById(`chart${this.chartInfo.id}`)
        this.myChart = echarts.init(dom)
        if (chartParams) {
          if (this.isEchartsWithTable) {
            const queryParams = { startTime: 1593070343, endTime: this.endTime } // 统计数据的查询参数
            const tableQueryParams = { startTime: 1593070343, endTime: this.endTime } // 统计数据的查询参数
            get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
              const data = response.data.map(d => {
                const trans = {}
                Object.keys(d).forEach(k => {
                  trans[lineToHump(k)] = d[k]
                })
                return trans
              })
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
      const myChart = am4Core.create(id, am4Maps.MapChart)
      myChart.geodata = am4GeoDataWorldLow
      myChart.projection = new am4Maps.projections.Miller()
      const polygonSeries = myChart.series.push(new am4Maps.MapPolygonSeries())
      polygonSeries.useGeodata = true
      polygonSeries.exclude = ['AQ'] // 移除南极洲
      const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.tooltipText = '{name}'
      polygonTemplate.fill = am4Core.color('#E7EDF6')
      /* const hs = polygonTemplate.states.create('hover') // 添加hover事件
      hs.properties.fill = am4Core.color('#B7BDC6') */
      return myChart
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
}`)
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
