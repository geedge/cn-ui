<template>
  <!-- chart外层箱子 -->
  <div
      :class="{'panel-chart--fullscreen': isFullscreen, 'panel-chart--title-chart': isTitle, 'panel-chart-group': isGroup,'panel-chart-table': isTable}"
      class="panel-chart"
      :id="isFullscreen ? ('chart-screen-' + chartInfo.id ) : ('chart-local-' + chartInfo.id)"
  >
    <!-- title和工具栏，支持浮动 -->
    <chart-header
        v-if="!isFullscreen && showHeader && !isSingleValue && !isTabs && !isDetectionSecurity && !isDetectionService"
        :is-error="isError"
        :error-info="errorInfo"
        :chart-data="chartData"
        :chart-info="chartInfo"
        :table="table"
        :order-pie-table="orderPieTable"
        @loadMore="loadMore"
        @refresh="refresh"
        @tabHandleClick="tabHandleClick"
        @groupShow="groupShow"
        @showFullscreen="showFullscreen"
        @tableChange="tableChange"
        @orderPieTableChange="orderPieTableChange"
    ></chart-header>
    <!-- chart -->
    <!-- 数据查询后传入chart组件，chart组件内不查询，只根据接传递的数据来渲染 -->
    <chart
        ref="chart"
        v-if="(!isGroup || !(chartInfo.params && chartInfo.params.collapse)) && !isTitle "
        :chart-data="chartData"
        :result-type="resultType"
        :chart-info="chartInfo"
        :query-params="queryParams"
        :panel-lock="panelLock"
        :is-error="isError"
        :loading="loading"
        :entity="entity"
        :table="table"
        :is-fullscreen="isFullscreen"
        :order-pie-table="orderPieTable"
        :time-filter="timeFilter"
        @getChartData="getChartData"
        @showLoading="showLoading"
        :tabHandleClickType="tabHandleClickType"
    ></chart>
  </div>
</template>

<script>
import ChartHeader from './ChartHeader'
import Chart from '@/views/charts/Chart'
import { dnsServerRole, chartPieTableTopOptions, chartTableDefaultPageSize, chartTableTopOptions } from '@/utils/constants'
import {
  isEcharts,
  isSingleValue,
  isTable,
  isBasicTable,
  isActiveIpTable,
  isTitle,
  isMap,
  isEchartsWithTable,
  isEchartsWithStatistics,
  isEchartsTimeBar,
  isEchartsCategoryBar,
  isMapLine,
  isMapBlock,
  isSingleValueWithEcharts,
  isSingleValueWithPercent,
  isRelationShip,
  isTabs,
  isGroup,
  isSankey,
  isIpBasicInfo,
  isIpOpenPortBar,
  isIpHostedDomain,
  isDomainWhois,
  isDomainDnsRecord,
  isCryptocurrencyEventList,
  isAppBasicInfo,
  isAppRelatedDomain,
  isBlock,
  isAlarmInfo,
  isDetectionSecurity,
  isDetectionService
} from './charts/tools'
import { tableTitleMapping, legendMapping } from '@/views/charts/charts/chart-table-title'
import { replaceUrlPlaceholder } from '@/utils/tools'
import { getNowTime, getSecond } from '@/utils/date-util'

import { get } from '@/utils/http'
import { ref } from 'vue'
import _ from 'lodash'

export default {
  name: 'PanelChart',
  components: {
    ChartHeader,
    Chart
  },
  props: {
    chartInfo: Object, // 其中的param json串已转化为对象
    timeFilter: Object, // 时间范围
    isFullscreen: Boolean,
    panelLock: Boolean,
    entity: Object
  },
  data () {
    return {
      chartData: null, // 图表要渲染的数据，请求接口得到，传入chart组件，chart组件内除特别情况(多级)外不做查询
      resultType: null, // 返回数据的类型
      loading: false,
      isError: false, // 接口响应是否报错
      errorInfo: '', // 接口具体错误信息
      queryTimeRange: { // 实际查询接口时使用的时间
        startTime: '',
        endTime: ''
      },
      queryParams: {},
      standaloneTimeRange: { // 单个图表刷新时，重新获取时间范围，且不影响到其他图表
        use: false,
        startTime: '',
        endTime: ''
      },
      orderPieTable: chartPieTableTopOptions[0].value,
      // 挖矿右下角图
      activeIpTable: {
        orderBy: 'machine',
        tableData: [
          {
            name: '192.168.20.21',
            num: 111

          }, {
            name: '192.168.20.22',
            num: 345
          }, {
            name: '192.168.20.23',
            num: 111

          }, {
            name: '192.168.20.24',
            num: 345
          }, {
            name: '192.168.20.25',
            num: 111

          }, {
            name: '192.168.20.26',
            num: 345
          }
        ] // table的所有数据
      },
      tabHandleClickType: ''
    }
  },
  computed: {
    headerH () {
      return this.$store.getters.getHeaderH
    },
    headerHPadding () {
      return this.$store.getters.getHeaderHPadding
    },
    showHeader () {
      return this.chartInfo.params && this.chartInfo.params.showHeader
    }
  },
  methods: {
    /* 参数 extraParams 额外请求参数 */
    getChartData (url, extraParams = {}, chartTimeFilter, num) {
      const vm = this
      this.loading = true
      try {
        if (chartTimeFilter) {
          // 图表自带timeFilter刷新时
          this.queryTimeRange = { startTime: getSecond(chartTimeFilter.startTime), endTime: getSecond(chartTimeFilter.endTime), dateRangeValue: chartTimeFilter.dateRangeValue }
        } else if (this.standaloneTimeRange.use) {
          // 单个图表刷新时，使用单独的时间
          this.queryTimeRange = { startTime: getSecond(this.standaloneTimeRange.startTime), endTime: getSecond(this.standaloneTimeRange.endTime), dateRangeValue: this.timeFilter.dateRangeValue }
        } else if (this.timeFilter) {
          this.queryTimeRange = { startTime: getSecond(this.timeFilter.startTime), endTime: getSecond(this.timeFilter.endTime), dateRangeValue: this.timeFilter.dateRangeValue }
        } else {
          this.queryTimeRange = { startTime: getSecond(this.chartTimeFilter.startTime), endTime: getSecond(this.chartTimeFilter.endTime), dateRangeValue: this.chartTimeFilter.dateRangeValue }
        }
        const chartParams = this.chartInfo.params
        if (this.isAlarmInfo && JSON.stringify(extraParams) === '{}') {
          extraParams = {
            pageNo: 1,
            pageSize: 9
          }
        }
        if (this.isDetectionService || this.isDetectionSecurity) {
          extraParams = {
            pageNo: 1,
            pageSize: 6
          }
        }
        // 接口查询参数
        this.queryParams = {
          ...this.handleQueryParams(),
          ...this.queryTimeRange,
          ...this.entity,
          ...extraParams
        }
        const requestUrl = url || (chartParams && chartParams.url)
        // 默认参数特殊处理
        if (requestUrl && requestUrl.indexOf('dnsServerRole') > -1) {
          this.queryParams.dnsServerRole = extraParams.dnsServerRole || dnsServerRole.RTDNS
        }

        if (requestUrl) {
          get(replaceUrlPlaceholder(requestUrl, this.queryParams)).then(response => {
            if (response.code === 200) {
              if (Array.isArray(response.data.result)) {
                response.data.result.forEach(item => {
                  if (item.legend && legendMapping[`${this.entity && this.entity.ip ? 'ip_' : ''}${item.legend}`]) {
                    item.legend = vm.$t(legendMapping[`${this.entity && this.entity.ip ? 'ip_' : ''}${item.legend}`])
                  }
                })
              }
              this.chartData = response.data.result
              this.resultType = response.data.resultType
              if (isEchartsWithStatistics(this.chartInfo.type)) {
                const newArr = []
                _.forEach(this.chartData, function (value, key) {
                  _.forEach(value.values, function (value, key) {
                    newArr.push(value[0])
                  })
                })
                const Arr = newArr.sort()
                _.forEach(this.chartData, function (value, key) {
                  if (_.head(value.values[0]) !== _.head(Arr)) {
                    value.values.unshift([_.head(Arr), 0])
                  }
                  if ((_.last(value.values[0]) !== _.last(Arr))) {
                    value.values.push([_.last(Arr), 0])
                  }
                })
              }
              if (this.isTable) {
                this.table.tableData = response.data.result
                this.table.tableColumns = chartParams.columns
                // this.table.tableColumns = this.getTableTitle(response.data.result)
                this.table.currentPageData = this.getTargetPageData(1, this.table.pageSize, this.table.tableData)
              } else if (this.isSingleValue) {
                if (chartParams && chartParams.dataKey) {
                  if (response.data.result && (response.data.result[chartParams.dataKey] || response.data.result[chartParams.dataKey] === 0)) {
                    this.chartData = response.data.result[chartParams.dataKey]
                  } else if (response.data.result && (response.data.result[chartParams.dataKey + 'Value'] || response.data.result[chartParams.dataKey + 'Value'] === 0)) {
                    this.chartData = {
                      value: response.data.result[chartParams.dataKey + 'Value'],
                      p50: response.data.result[chartParams.dataKey + 'P50'],
                      p90: response.data.result[chartParams.dataKey + 'P90']
                    }
                  } else {
                    this.chartData = null
                  }
                }
              }
              this.isError = false
            } else {
              this.isError = true
              this.noData = true
              this.errorInfo = response.msg || response.message || 'Unknown'
            }
          }).finally(() => {
            this.loading = false
          })
        } else if (this.isGroup || this.isTabs) {
          this.$refs.chart.$refs.chart.reload()
        } else if (this.isBlock) {
          if (!this.chartInfo.firstShow) {
            this.chartInfo.firstShow = true
          } else {
            this.$refs.chart.$refs.chart.reload()
          }
        }
      } catch (e) {
        console.error(e)
        setTimeout(() => {
          this.loading = false
        }, 200)
      }
    },
    handleQueryParams () {
      const params = {}
      if (this.isEchartsWithTable) {
        params.limit = 10
        params.order = this.orderPieTable
      } else if (this.isRelationShip) {
        params.limit = 5
      } else if (this.isActiveIpTable) {
        params.order = this.activeIpTable.orderBy
      } else if (this.isTable) {
        params.limit = this.table.limit
        params.order = this.table.orderBy
      }
      return params
    },
    resize () {
      this.$refs.chart.resize()
    },
    refresh (chartTimeFilter) {
      if (chartTimeFilter) {
        this.timeFilter.startTime = chartTimeFilter.startTime
        this.timeFilter.endTime = chartTimeFilter.endTime
        this.timeFilter.dateRangeValue = chartTimeFilter.dateRangeValue
        this.getChartData(null, {}, chartTimeFilter)
      } else {
        if (this.timeFilter.dateRangeValue && this.timeFilter.dateRangeValue > 0) {
          const myEndTime = window.$dayJs.tz().valueOf()
          const myStartTime = myEndTime - this.timeFilter.dateRangeValue * 60 * 1000
          this.standaloneTimeRange.use = true
          this.standaloneTimeRange.startTime = myStartTime
          this.standaloneTimeRange.endTime = myEndTime
        } else {
          this.standaloneTimeRange.use = false
        }
        this.emitter.emit('chart-pageNo')
        this.getChartData(null, {})
      }
    },
    tabHandleClick (value) {
      this.tabHandleClickType = value
    },
    showFullscreen (show) {
      this.$emit('showFullscreen', show, this.chartInfo)
    },
    loadMore () {
      this.$nextTick(() => {
        this.$refs.chart && this.$refs.chart.$refs['chart' + this.chartInfo.id].initChart()
      })
    },
    getDataKey (r) {
      let key = ''
      let labelText = ''
      if (r.establishLatency || r.establishLatency === 0) {
        key = 'establishLatency'
        labelText = this.$t('networkAppPerformance.tripTime')
      } else if (r.httpResponseLatency || r.httpResponseLatency === 0) {
        key = 'httpResponseLatency'
        labelText = this.$t('networkAppPerformance.httpResponse')
      } else if (r.sslConLatency || r.sslConLatency === 0) {
        key = 'sslConLatency'
        labelText = this.$t('networkAppPerformance.sslResponse')
      } else if (r.sequenceGapLossPercent || r.sequenceGapLossPercent === 0) {
        key = 'sequenceGapLossPercent'
        labelText = this.$t('networkAppPerformance.packetLossRate')
      } else if (r.pktRetransPercent || r.pktRetransPercent === 0) {
        key = 'pktRetransPercent'
        labelText = this.$t('networkAppPerformance.retransmissionRate')
      } else if (r.sessions || r.sessions === 0) {
        key = 'sessions'
        labelText = this.$t('overall.sessions')
      }
      return { key, labelText }
    },
    getTableTitle (data) {
      if (data.length > 0) {
        const dataColumns = Object.keys(data[0]) // 返回数据的字段
        const columns = dataColumns.map(c => tableTitleMapping[c]) // 展示字段
        const keys = ['clientIp', 'serverIp', 'ip', 'appId', 'app', 'appName', 'domain']
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
    showLoading (show) {
      this.loading = show
    },
    tableChange () {
      this.emitter.emit('chart-pageNo')
      this.getChartData()
    },
    getTargetPageData (pageNum, pageSize, tableData) {
      return this.$_.slice(tableData, (pageNum - 1) * pageSize, pageNum * pageSize)
    },
    groupShow (chartInfo) {
      this.$emit('groupShow', chartInfo)
    },
    orderPieTableChange (orderPieTable) {
      this.orderPieTable = orderPieTable
      this.getChartData()
      this.$refs.chart.initEchartsWithTable()
    }
  },
  mounted () {
    this.showLoading(true)
    this.getChartData()
    this.$store.commit('cleanChartList')
  },
  setup (props) {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const chartTimeFilter = ref({ startTime, endTime, dateRangeValue })
    const table = ref('')
    if (isBasicTable(props.chartInfo.type)) {
      table.value = {
        pageSize: chartTableDefaultPageSize,
        limit: chartTableTopOptions[0], // top-n
        orderBy: props.chartInfo.params.columns.order[0],
        tableColumns: props.chartInfo.params.columns, // table字段
        tableData: [], // table的所有数据
        currentPageData: [] // table当前页的数据
      }
    }
    return {
      table,
      chartTimeFilter,
      isEcharts: isEcharts(props.chartInfo.type),
      isEchartsTimeBar: isEchartsTimeBar(props.chartInfo.type),
      isEchartsCategoryBar: isEchartsCategoryBar(props.chartInfo.type),
      isEchartsWithTable: isEchartsWithTable(props.chartInfo.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chartInfo.type),
      isSingleValue: isSingleValue(props.chartInfo.type),
      isSingleValueWithEcharts: isSingleValueWithEcharts(props.chartInfo.type),
      isSingleValueWithPercent: isSingleValueWithPercent(props.chartInfo.type),
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
      isIpOpenPortBar: isIpOpenPortBar(props.chartInfo.type),
      isDomainWhois: isDomainWhois(props.chartInfo.type),
      isDomainDnsRecord: isDomainDnsRecord(props.chartInfo.type),
      isCryptocurrencyEventList: isCryptocurrencyEventList(props.chartInfo.type),
      isAppBasicInfo: isAppBasicInfo(props.chartInfo.type),
      isAppRelatedDomain: isAppRelatedDomain(props.chartInfo.type),
      isAlarmInfo: isAlarmInfo(props.chartInfo.type),
      isDetectionService: isDetectionService(props.chartInfo.type),
      isDetectionSecurity: isDetectionSecurity(props.chartInfo.type)
    }
  }
}
</script>
