<template>
  <!-- echarts类的图标，如饼图、柱状图、折线图等 -->
  <echarts-frame
      v-if="isEcharts"
      :layout="layout"
      :style="computePosition"
  >
    <template #title v-if="layout.indexOf(layoutConstant.HEADER) > -1">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations v-if="layout.indexOf(layoutConstant.HEADER) > -1">
      <i class="cn-icon cn-icon-more-light"></i>
    </template>
    <template #default>
      <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
    <template #footer v-if="layout.indexOf(layoutConstant.FOOTER) > -1">
      <!-- 带Table的饼图，展示Table -->
      <template v-if="isEchartsWithTable">
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
import { isEcharts, isSingleValue, isTable, getOption, getTypeCategory, getLayout, layoutConstant, heightUnit, isEchartsWithTable } from '@/components/charts/chart-options'
import EchartsFrame from '@/components/charts/EchartsFrame'
import SingleValue from '@/components/charts/ChartSingleValue'
import Table from '@/components/charts/ChartTable'
import ChartTablePagination from '@/components/charts/ChartTablePagination'
import { chartTableDefaultPageSize, chartTableTopOptions } from '@/utils/constants'
import { get } from '@/utils/http'

let myChart // echarts实例

export default {
  name: 'Chart',
  props: {
    chart: Object // 图表对象，包括id、name、type等数据
  },
  components: {
    EchartsFrame,
    SingleValue,
    ChartTablePagination,
    'chart-table': Table
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
      }
    }
  },
  methods: {
    initChart () {
      const now = new Date().getTime()
      const params = this.chartInfo.params ? JSON.parse(this.chartInfo.params) : null
      if (this.isEcharts) {
        myChart = echarts.init(document.getElementById(`chart${this.chartInfo.id}`))
        myChart.setOption(this.chartOption)
        this.$nextTick(() => {
          myChart.resize()
        })
      } else if (this.isTable) {
        if (params) {
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
          /* get(params.url, { startTime: now - 3600000, endTime: now, order: params.order ? params.order : null, limit: params.limit ? params.limit : null }).then(response => {
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
      layout: getLayout(props.chart.type)
    }
  }
}

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
