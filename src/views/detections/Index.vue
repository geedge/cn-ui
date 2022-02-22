<template>
  <div
      class="entity-explorer entity-explorer--show-list"
  >
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools">
      <DateTimeRange class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" ref="dateTimeRange" @change="reload"/>
      <TimeRefresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
    </div>
    <!-- 搜索组件 -->
    <detection-search
        ref="search"
        @search="search"
    ></detection-search>
    <!-- 内容区 -->
    <div class="explorer-container" style="height: calc(100% - 20px); flex-direction: column">
      <div class="detection__event-severity-bar" id="detectionEventSeverityBar"></div>
      <div style="display: flex;">
        <detection-filter
            :filter-data="filterData"
            :q="q"
            :time-filter="timeFilter"
            @filter="filter"
        ></detection-filter>

        <div class="detection__list">
          <div class="detection__list-statistics">
            <div class="statistics__severity">
              <div class="chart-header">
                <div class="chart-header__title">{{$t('detection.severity')}}</div>
              </div>
              <div class="chart-content" id="detectionSeverityPer">
              </div>
            </div>
            <div class="statistics__category">
              <div class="chart-header">
                <div class="chart-header__title">{{$t('detection.categoryProportion')}}</div>
              </div>
              <div class="chart-content" id="detectionCategoryPer">
              </div>
            </div>
            <div class="statistics__active-attack">
              <div class="chart-header">
                <div class="chart-header__title">{{$t('detection.activeAttacker')}}</div>
              </div>
              <div class="chart-content" style="" id="detectionActiveAttacker">
              </div>
            </div>
          </div>
          <detection-list
              :list-data="listData"
              :pageObj="pageObj"
              :time-filter="timeFilter"
              @pageSize="pageSize"
              @pageNo="pageNo"
              :loading="listLoading"
          ></detection-list>
        </div>
      </div>
      <div class="entity__pagination">
        <Pagination
            ref="pagination"
            :page-obj="pageObj"
            @pageNo='pageNo'
            @pageSize='pageSize'
            @size-change="pageSize"
            @prev-click="prev"
            @next-click="next"
        >
        </Pagination>
      </div>
    </div>
  </div>
</template>

<script>
import DetectionSearch from '@/views/detections/DetectionSearch'
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'
import TimeRefresh from '@/components/common/TimeRange/TimeRefresh'
import DetectionFilter from '@/views/detections/DetectionFilter'
import DetectionList from '@/views/detections/DetectionList'
import Pagination from '@/components/common/Pagination'
import { defaultPageSize } from '@/utils/constants'
import { getNowTime, getSecond } from '@/utils/date-util'
import { ref } from 'vue'
import * as echarts from 'echarts'
import { multipleBarOption, pieForSeverity, activeAttackBar, getAttackColor, getSeverityColor,getSeriesIndex } from '@/views/detections/options/detectionOptions'
import ChartEchart from '@/views/charts/charts/ChartEchart'
import { api } from '@/utils/api'
import { get } from '@/utils/http'

export default {
  name: 'Index',
  components: {
    DetectionSearch,
    DateTimeRange,
    TimeRefresh,
    DetectionFilter,
    DetectionList,
    Pagination,
    ChartEchart
  },
  data () {
    return {
      pageObj: {
        pageNo: 1,
        pageSize: defaultPageSize,
        total: 0
      },
      q: '',
      filterData: [
        {
          title: this.$t('detections.eventSeverity'),
          column: 'eventSeverity',
          collapse: false,
          value: [], // value之间是or的关系
          data: [] // 从接口动态获取，本项在获得数据后需要特殊处理左边框颜色
        },
        {
          title: this.$t('detections.securityType'),
          column: 'securityType',
          collapse: false,
          value: [],
          data: [] // 从接口动态获取
        },
        {
          title: this.$t('detections.victimIp'),
          column: 'victimIp',
          collapse: false,
          value: [],
          showMore: true,
          showIndex: 9,
          data: [] // 从接口动态获取
        },
        {
          title: this.$t('detections.victimLocation'),
          column: 'victimLocationCountry',
          collapse: false,
          value: [],
          showMore: false,
          showIndex: 9,
          data: [
            {
              label: 'China',
              value: 'china',
              count: 50
            }
          ] // 从接口动态获取
        },
        {
          title: this.$t('detections.offenderIp'),
          column: 'offenderIp',
          collapse: false,
          value: [],
          showMore: false,
          showIndex: 9,
          data: [
            {
              label: '1.2.6.8',
              value: '1.2.6.8',
              count: 50
            }
          ] // 从接口动态获取
        },
        {
          title: this.$t('detections.offenderLocation'),
          column: 'offenderLocationCountry',
          collapse: false,
          value: [],
          showMore: false,
          showIndex: 9,
          data: [
            {
              label: 'China',
              value: 'china',
              count: 50
            }
          ] // 从接口动态获取
        }
      ],
      listData: [],
      listLoading: false,
      eventSeverityOption: null,
      eventSeverityData: [],
      severityPerOption: null,
      severityPerData: [],
      categoryPerOption: null,
      categoryPerData: [],
      activeAttackOption: null,
      activeAttackData: []
    }
  },
  methods: {
    initEventSeverityTrendData () {
      const chartDom = document.getElementById('detectionEventSeverityBar')
      const detectionChart = echarts.init(chartDom)
      this.eventSeverityOption = this.$_.cloneDeep(multipleBarOption)

      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      get(api.detectionSeverityTrend, queryParams).then(response => {
        response = {
          code: 200,
          success: true,
          msg: 'OK',
          data: {
            resultType: 'matrix',
            result: [
              {
                legend: "critical",
                values: [[1435781430781, "5"], [1435781431781, "3"],[1435781432781, "5"], [1435781433781, "3"]]
              },
              {
                legend: "high",
                values: [[1435781430781, "2"], [1435781431781, "3"],[1435781432781, "6"], [1435781433781, "4"]]
              }, {
                legend: "medium",
                values: [[1435781430781, "4"], [1435781431781, "1"],[1435781432781, "5"], [1435781433781, "3"]]
              }, {
                legend: "low",
                values: [[1435781430781, "1"], [1435781431781, "4"],[1435781432781, "1"], [1435781433781, "3"]]
              }, {
                legend: "info",
                values: [[1435781430781, "5"], [1435781431781, "7"],[1435781432781, "5"], [1435781433781, "8"]]
              }
            ]
          }
        }
        if (response.code === 200) {
          response.data.result.forEach(item => {
            this.eventSeverityOption.series[Number(getSeriesIndex(item.legend))].data = item.values.map(v => Number(v[1]))
          })

          this.eventSeverityOption.xAxis.data = response.data.result[0].values.map(v => [window.$dayJs.tz(Number(v[0])).format('YYYY-MM-DD HH:mm:ss')])

        }
      }).finally(() => {
        this.$nextTick(() => {
          this.eventSeverityOption && detectionChart.setOption(this.eventSeverityOption)
        })
      })
    },
    initSeverityPerData () {
      const chartDom = document.getElementById('detectionSeverityPer')
      const detectionChart = echarts.init(chartDom)
      this.severityPerOption = this.$_.cloneDeep(pieForSeverity)

      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      get(api.detectionEventSeverity, queryParams).then(response => {
        response = {
          code: 200,
          success: true,
          msg: 'OK',
          data: {
            resultType: 'table',
            result: [
              {
                eventSeverity: 'critical',
                count: 1048
              }, {
                eventSeverity: 'high',
                count: 735
              }, {
                eventSeverity: 'medium',
                count: 580
              }, {
                eventSeverity: 'low',
                count: 484
              }, {
                eventSeverity: 'info',
                count: 300
              }
            ]
          }
        }
        if (response.code === 200) {
          this.filterData[0].data = response.data.result.map(r => ({ label: r.eventSeverity, value: r.eventSeverity, count: r.count }))
          this.severityPerData = response.data.result.map(d => {
            return { value: d.count, name: d.eventSeverity, itemStyle: { color: getSeverityColor(d.eventSeverity) } }
          })
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.severityPerOption.series[0].data = this.severityPerData
          this.severityPerOption && detectionChart.setOption(this.severityPerOption)
        })
      })
    },
    initCategoryPerData () {
      const chartDom = document.getElementById('detectionCategoryPer')
      const detectionChart = echarts.init(chartDom)
      this.categoryPerOption = this.$_.cloneDeep(pieForSeverity)

      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      get(api.detectionAttackType, queryParams).then(response => {
        response = {
          code: 200,
          success: true,
          msg: 'OK',
          data: {
            resultType: 'table',
            result: [
              {
                attackType: 'command and control',
                count: 1048
              }, {
                attackType: 'payload delivery',
                count: 735
              }, {
                attackType: 'cryptomining',
                count: 580
              }, {
                attackType: 'phishing',
                count: 484
              }, {
                attackType: 'dga',
                count: 300
              }, {
                attackType: 'ddos',
                count: 50
              }
            ]
          }
        }
        if (response.code === 200) {
          this.filterData[1].data = response.data.result.map(r => ({ label: r.attackType, value: r.attackType, count: r.count }))
          this.categoryPerData = response.data.result.map(d => {
            return { value: d.count, name: d.attackType, itemStyle: { color: getAttackColor(d.attackType) } }
          })
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.categoryPerOption.series[0].data = this.categoryPerData
          this.categoryPerOption && detectionChart.setOption(this.categoryPerOption)
        })
      })
    },
    initActiveAttackData () {
      const chartDom = document.getElementById('detectionActiveAttacker')
      const detectionChart = echarts.init(chartDom)
      this.activeAttackOption = this.$_.cloneDeep(activeAttackBar)

      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      get(api.detectionOffenderIp, queryParams).then(response => {
        response = {
          code: 200,
          success: true,
          msg: 'OK',
          data: {
            resultType: 'table',
            result: [
              {
                offenderIp: '192.168.12.21',
                count: 99999
              }, {
                offenderIp: '192.168.22.21',
                count: 88888
              }, {
                offenderIp: '192.168.32.21',
                count: 77777
              }, {
                offenderIp: '192.168.42.21',
                count: 66666
              }, {
                offenderIp: '192.168.52.21',
                count: 55555
              }
            ]
          }
        }
        if (response.code === 200) {
          this.filterData[4].data = response.data.result.map(r => ({ label: r.offenderIp, value: r.offenderIp, count: r.count }))
          const { showMore, showIndex } = this.computeFilterPage(this.filterData[4].data)
          this.filterData[4].showMore = showMore
          this.filterData[4].showIndex = showIndex
          this.activeAttackData = response.data.result.map(d => {
            return [d.count, d.offenderIp]
          })
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.activeAttackOption.series[0].data = this.activeAttackData.reverse()
          this.activeAttackOption && detectionChart.setOption(this.activeAttackOption)
        })
      })
    },
    initVictimIp () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      get(api.detectionVictimIp, queryParams).then(response => {
        response = {
          code: 200,
          success: true,
          msg: 'OK',
          data: {
            resultType: 'table',
            result: [
              {
                victimIp: '1.2.6.8',
                count: 50
              },
              {
                victimIp: '1.2.6.9',
                count: 50
              },
              {
                victimIp: '1.2.6.0',
                count: 50
              },
              {
                victimIp: '1.2.6.1',
                count: 50
              },
              {
                victimIp: '1.2.6.2',
                count: 50
              },
              {
                victimIp: '1.2.6.3',
                count: 50
              },
              {
                victimIp: '1.2.6.4',
                count: 50
              },
              {
                victimIp: '1.2.6.5',
                count: 50
              },
              {
                victimIp: '1.2.6.6',
                count: 50
              },
              {
                victimIp: '1.2.6.7',
                count: 50
              },
              {
                victimIp: '1.2.7.8',
                count: 50
              },
              {
                victimIp: '1.2.8.8',
                count: 50
              },
              {
                victimIp: '1.2.9.8',
                count: 50
              },
              {
                victimIp: '1.2.6.18',
                count: 50
              },
              {
                victimIp: '1.2.6.28',
                count: 50
              },
              {
                victimIp: '1.2.6.38',
                count: 50
              },
              {
                victimIp: '1.2.6.48',
                count: 50
              },
              {
                victimIp: '1.2.6.58',
                count: 50
              },
              {
                victimIp: '1.2.6.68',
                count: 50
              },
              {
                victimIp: '1.2.6.78',
                count: 50
              },
              {
                victimIp: '1.2.6.88',
                count: 50
              }
            ]
          }
        }
        if (response.data && response.data.result) {
          this.filterData[2].data = response.data.result.map(r => ({ label: r.victimIp, value: r.victimIp, count: r.count }))
          const { showMore, showIndex } = this.computeFilterPage(this.filterData[2].data)
          this.filterData[2].showMore = showMore
          this.filterData[2].showIndex = showIndex
        }
      })
    },
    initVictimLocation () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      get(api.detectionVictimLocation, queryParams).then(response => {
        response = {
          code: 200,
          success: true,
          msg: 'OK',
          data: {
            resultType: 'table',
            result: [
              {
                victimLocationCountry: 'china',
                count: 50
              }
            ]
          }
        }
        if (response.data && response.data.result) {
          this.filterData[3].data = response.data.result.map(r => ({ label: r.victimLocationCountry, value: r.victimLocationCountry, count: r.count }))
          const { showMore, showIndex } = this.computeFilterPage(this.filterData[3].data)
          this.filterData[3].showMore = showMore
          this.filterData[3].showIndex = showIndex
        }
      })
    },
    initOffenderLocation () {
      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      get(api.detectionOffenderLocation, queryParams).then(response => {
        response = {
          code: 200,
          success: true,
          msg: 'OK',
          data: {
            resultType: 'table',
            result: [
              {
                offenderLocationCountry: 'china',
                count: 50
              }
            ]
          }
        }
        if (response.data && response.data.result) {
          this.filterData[5].data = response.data.result.map(r => ({ label: r.offenderLocationCountry, value: r.offenderLocationCountry, count: r.count }))
          const { showMore, showIndex } = this.computeFilterPage(this.filterData[5].data)
          this.filterData[5].showMore = showMore
          this.filterData[5].showIndex = showIndex
        }
      })
    },
    computeFilterPage (data) {
      return {
        showMore: data.length > 10,
        showIndex: 9
      }
    },
    queryList () {
      const queryParams = {
        ...this.timeFilter,
        q: this.q
      }
      get(api.detectionListBasic, queryParams).then(response => {
        response = {
          code: 200,
          success: true,
          msg: 'OK',
          data: {
            resultType: 'table',
            result: [
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'critical',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 978456923589
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'high',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'low',
                malwareName: 'the great wall',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'medium',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              },
              {
                eventId: 1212,
                securityType: 'ddos',
                offenderIp: '1.1.1.1',
                victimIp: '2.2.2.2',
                eventSecurity: 'info',
                malwareName: 'the great wall',
                cryptominingPool: 'a',
                startTime: 1111111111
              }
            ]
          }
        }

        if (response.code === 200) {
          this.listData = response.data.result
        }
      })
    },
    timeRefreshChange () {
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      }
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
    },
    // methods
    dateTimeRangeChange (s, e, v) {
      this.timeFilter = { startTime: s, endTime: e, dateRangeValue: v }
    },
    search (metaList, formatSql) {
      if (formatSql) {
        this.q = formatSql
        this.metaList = metaList
      } else {
        this.q = ''
        this.metaList = []
      }
      this.queryFilter()
      this.queryList()
      this.queryListTotal()
    },
    queryFilter () {
      this.initEventSeverityTrendData()
      this.initSeverityPerData()
      this.initCategoryPerData()
      this.initActiveAttackData()
      this.initOffenderLocation()
      this.initVictimIp()
      this.initVictimLocation()
    },
    queryListTotal () {

    },
    filter (filterColumn) {
      const params = {}
      params[filterColumn] = this.filterData.find(f => {
        return f.column === filterColumn
      }).value
      this.$refs.search.changeParams(params)
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.search(this.metaList, this.q)
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.search(this.metaList, this.q)
    },
    // 点击上一页箭头
    prev () {
      this.scrollbarToTop()
    },
    // 点击下一页箭头
    next () {
      this.scrollbarToTop()
    },
    // currentPage 改变时会触发
    current (val) {
      this.$emit('pageNo', val)
      this.scrollbarToTop()
    },
    scrollbarToTop () {
      this.$nextTick(() => {
        const wraps = document.querySelector('#detectionList')
        wraps.scrollTop = 0
      })
    }
  },
  mounted () {
    this.queryFilter()
    this.queryList()
  },
  watch: {
    timeFilter (n) {
      this.search(this.metaList, this.q)
    },
    'filterData.0.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData[0].column, oldValue: o, newValue: n })
      }
    },
    'filterData.1.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData[1].column, oldValue: o, newValue: n })
      }
    },
    'filterData.2.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData[2].column, oldValue: o, newValue: n })
      }
    },
    'filterData.3.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData[3].column, oldValue: o, newValue: n })
      }
    },
    'filterData.4.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData[4].column, oldValue: o, newValue: n })
      }
    },
    'filterData.5.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData[5].column, oldValue: o, newValue: n })
      }
    }
  },
  setup () {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      timeFilter,
      severityPerChart: {
        params: {
          url: '/interface/entity/detail/ip/trafficMap?startTime={{startTime}}&endTime={{endTime}}&country={{country}}&ip={{ip}}',
          unitType: 'number'
        },
        id: 'detectionSeverityPer',
        type: 32
      },
      categoryPerChart: {
        params: {
          url: '/interface/entity/detail/ip/trafficMap?startTime={{startTime}}&endTime={{endTime}}&country={{country}}&ip={{ip}}',
          unitType: 'number'
        },
        id: 'detectionCategoryPer',
        type: 32
      }
    }
  }
}
</script>
