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
      <div class="detection__event-severity-bar" :id="`eventSeverityTrendBar${pageType}`"></div>
      <div style="display: flex;">
        <detection-filter
            :filter-data="filterData[pageType]"
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
              <div class="chart-content" :id="`eventSeverityPie${pageType}`">
              </div>
            </div>
            <div class="statistics__category">
              <div class="chart-header">
                <div class="chart-header__title">{{$t('detection.categoryProportion')}}</div>
              </div>
              <div class="chart-content" :id="`detectionCategoryPer${pageType}`">
              </div>
            </div>
            <div class="statistics__active-attack">
              <div class="chart-header">
                <div class="chart-header__title">{{pageType === detectionPageType.securityEvent ? $t('detection.activeAttacker') : $t('detections.activeEntity')}}</div>
              </div>
              <div class="chart-content" style="" :id="`detectionActiveAttacker${pageType}`">
              </div>
            </div>
          </div>
          <detection-list
              :list-data="listData"
              :pageObj="pageObj"
              :time-filter="timeFilter"
              :page-type="pageType"
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
import { defaultPageSize, detectionPageType } from '@/utils/constants'
import { getNowTime, getSecond } from '@/utils/date-util'
import { ref } from 'vue'
import * as echarts from 'echarts'
import { multipleBarOption, pieForSeverity, activeAttackBar, getAttackColor, getSeverityColor, getSeriesIndex } from '@/views/detections/options/detectionOptions'
import { api, getData } from '@/utils/api'
import { useRoute } from 'vue-router'

export default {
  name: 'Index',
  components: {
    DetectionSearch,
    DateTimeRange,
    TimeRefresh,
    DetectionFilter,
    DetectionList,
    Pagination
  },
  data () {
    return {
      pageObj: {
        pageNo: 1,
        pageSize: defaultPageSize,
        total: 0
      },
      q: '',
      detectionPageType,
      filterData: {
        securityEvent: [
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
            data: [] // 从接口动态获取
          },
          {
            title: this.$t('detections.offenderLocation'),
            column: 'offenderLocationCountry',
            collapse: false,
            value: [],
            showMore: false,
            showIndex: 9,
            data: [] // 从接口动态获取
          }
        ],
        performanceEvent: [
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
          }
        ]
      },
      listData: [],
      listLoading: false,
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
    // 初始化顶部大柱状图
    initEventSeverityTrendData (params) {
      getData(api.detection[this.pageType].eventSeverityTrend, params).then(data => {
        /*data = [
          {
            legend: 'critical',
            values: [[1435781430781, '5'], [1435781431781, '3'], [1435781432781, '5'], [1435781433781, '3']]
          },
          {
            legend: 'high',
            values: [[1435781430781, '2'], [1435781431781, '3'], [1435781432781, '6'], [1435781433781, '4']]
          }, {
            legend: 'medium',
            values: [[1435781430781, '4'], [1435781431781, '1'], [1435781432781, '5'], [1435781433781, '3']]
          }, {
            legend: 'low',
            values: [[1435781430781, '1'], [1435781431781, '4'], [1435781432781, '1'], [1435781433781, '3']]
          }, {
            legend: 'info',
            values: [[1435781430781, '5'], [1435781431781, '7'], [1435781432781, '5'], [1435781433781, '8']]
          }
        ]*/
        const chartDom = document.getElementById(`eventSeverityTrendBar${this.pageType}`)
        const detectionChart = echarts.init(chartDom)
        const eventSeverityTrendOption = this.$_.cloneDeep(multipleBarOption)
        data.forEach(item => {
          eventSeverityTrendOption.series[Number(getSeriesIndex(item.legend))].data = item.values.map(v => Number(v[1]))
        })
        eventSeverityTrendOption.xAxis.data = data[0].values.map(v => [window.$dayJs.tz(Number(v[0])).format('YYYY-MM-DD HH:mm:ss')])
        this.$nextTick(() => {
          detectionChart.setOption(eventSeverityTrendOption)
        })
      }).catch(error => {

      })
    },
    // 初始化左侧事件严重等级和小饼图
    initEventSeverityData (params) {
      getData(api.detection[this.pageType].eventSeverity, params).then(data => {
        /*data = [
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
        ]*/
        this.filterData[this.pageType][0].data = data.map(r => ({ label: r.eventSeverity, value: r.eventSeverity, count: r.count }))
        const eventSeverityOption = this.$_.cloneDeep(pieForSeverity)
        eventSeverityOption.series[0].data = data.map(d => {
          return { value: d.count, name: d.eventSeverity, itemStyle: { color: getSeverityColor(d.eventSeverity) } }
        })
        const chartDom = document.getElementById(`eventSeverityPie${this.pageType}`)
        const detectionChart = echarts.init(chartDom)
        detectionChart.setOption(eventSeverityOption)
      }).catch(error => {

      })
    },
    initSecurityTypeData (params) {
      getData(api.detection[this.pageType].securityType, params).then(data => {
        /*data = [
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
        ]*/
        this.filterData[this.pageType][1].data = data.map(r => ({ label: r.attackType, value: r.attackType, count: r.count }))
        const chartDom = document.getElementById(`detectionCategoryPer${this.pageType}`)
        const detectionChart = echarts.init(chartDom)
        const securityTypeOption = this.$_.cloneDeep(pieForSeverity)
        securityTypeOption.series[0].data = data.map(d => {
          return { value: d.count, name: d.attackType, itemStyle: { color: getAttackColor(d.attackType) } }
        })
        detectionChart.setOption(securityTypeOption)
      }).catch(error => {

      })
    },
    initOffenderIpData (params) {
      getData(api.detection[this.pageType].offenderIp, params).then(data => {
        /*data = [
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
        ]*/
        this.filterData[this.pageType][4].data = data.map(r => ({ label: r.offenderIp, value: r.offenderIp, count: r.count }))
        const { showMore, showIndex } = this.computeFilterPage(this.filterData[this.pageType][4].data)
        this.filterData[this.pageType][4].showMore = showMore
        this.filterData[this.pageType][4].showIndex = showIndex

        const chartDom = document.getElementById(`detectionActiveAttacker${this.pageType}`)
        const detectionChart = echarts.init(chartDom)
        const offenderIpOption = this.$_.cloneDeep(activeAttackBar)
        offenderIpOption.series[0].data = data.map(d => {
          return [d.count, d.offenderIp]
        }).reverse()
        detectionChart.setOption(offenderIpOption)
      }).catch(error => {

      })
    },
    initVictimIpData (params) {
      getData(api.detection[this.pageType].victimIp, params).then(data => {
        /*data = [
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
        ]*/
        this.filterData[this.pageType][2].data = data.map(r => ({ label: r.victimIp, value: r.victimIp, count: r.count }))
        const { showMore, showIndex } = this.computeFilterPage(this.filterData[this.pageType][2].data)
        this.filterData[this.pageType][2].showMore = showMore
        this.filterData[this.pageType][2].showIndex = showIndex
      }).catch(error => {

      })
    },
    initVictimLocationData (params) {
      getData(api.detection[this.pageType].victimLocation, params).then(data => {
        /*data = [
          {
            victimLocationCountry: 'china',
            count: 50
          }
        ]*/
        this.filterData[this.pageType][3].data = data.map(r => ({ label: r.victimLocationCountry, value: r.victimLocationCountry, count: r.count }))
        const { showMore, showIndex } = this.computeFilterPage(this.filterData[this.pageType][3].data)
        this.filterData[this.pageType][3].showMore = showMore
        this.filterData[this.pageType][3].showIndex = showIndex
      }).catch(error => {

      })
    },
    initOffenderLocationData (params) {
      getData(api.detection[this.pageType].offenderLocation, params).then(data => {
        /*data = [
          {
            offenderLocationCountry: 'china',
            count: 50
          }
        ]*/
        this.filterData[this.pageType][5].data = data.map(r => ({ label: r.offenderLocationCountry, value: r.offenderLocationCountry, count: r.count }))
        const { showMore, showIndex } = this.computeFilterPage(this.filterData[this.pageType][5].data)
        this.filterData[this.pageType][5].showMore = showMore
        this.filterData[this.pageType][5].showIndex = showIndex
      }).catch(error => {

      })
    },
    initActiveEntity (params) {
      getData(api.detection[this.pageType].activeEntity, params).then(data => {
        /*data = [
          {
            name: 'csdn.net',
            count: 250
          },
          {
            name: 'duokan',
            count: 150
          },
          {
            name: '2.3.2.2',
            count: 50
          }
        ]*/
        const chartDom = document.getElementById(`detectionActiveAttacker${this.pageType}`)
        const detectionChart = echarts.init(chartDom)
        const option = this.$_.cloneDeep(activeAttackBar)
        option.series[0].data = data.map(d => {
          return [d.count, d.name]
        }).reverse()
        detectionChart.setOption(option)
      }).catch(error => {

      })
    },
    computeFilterPage (data) {
      return {
        showMore: data.length > 10,
        showIndex: 9
      }
    },
    queryList () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      getData(api.detection[this.pageType].listBasic, params).then(data => {
        if (this.pageType === detectionPageType.securityEvent) {
          /*data = [
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'critical',
              malwareName: 'the great wall',
              durationMs: 60000,
              startTime: 978456923589
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'high',
              cryptominingPool: 'a',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'low',
              malwareName: 'the great wall',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'medium',
              malwareName: 'the great wall',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              cryptominingPool: 'a',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              malwareName: 'the great wall',
              durationMs: 600000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              cryptominingPool: 'a',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              cryptominingPool: 'a',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              cryptominingPool: 'a',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              malwareName: 'the great wall',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              malwareName: 'the great wall',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              malwareName: 'the great wall',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              malwareName: 'the great wall',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              malwareName: 'the great wall',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              cryptominingPool: 'a',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              eventId: 1212,
              securityType: 'ddos',
              offenderIp: '1.1.1.1',
              victimIp: '2.2.2.2',
              eventSecurity: 'info',
              cryptominingPool: 'a',
              durationMs: 60000,
              startTime: 1111111111
            }
          ]*/
        } else if (this.pageType === detectionPageType.performanceEvent) {
          /*data = [
            {
              entityType: 'ip',
              eventType: 'Dns error',
              serverIp: '2.2.2.2',
              eventSecurity: 'critical',
              durationMs: 60000,
              startTime: 978456923589
            },
            {
              entityType: 'ip',
              eventType: 'ddos',
              serverIp: '2.2.2.2',
              eventSecurity: 'high',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'ip',
              eventType: 'ddos',
              serverIp: '2.2.2.2',
              eventSecurity: 'low',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'domain',
              eventType: 'ddos',
              domain: 'csdn.net',
              eventSecurity: 'medium',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'domain',
              eventType: 'ddos',
              domain: 'amazon.com',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'domain',
              eventType: 'ddos',
              domain: 'qiniu.com',
              eventSecurity: 'info',
              durationMs: 600000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            },
            {
              entityType: 'app',
              eventType: 'ddos',
              appName: 'Samsung',
              eventSecurity: 'info',
              durationMs: 60000,
              startTime: 1111111111
            }
          ]*/
        }

        this.listData = data
      }).catch(error => {

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
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: this.q
      }
      this.initEventSeverityTrendData(params)
      this.initEventSeverityData(params)
      this.initSecurityTypeData(params)
      if (this.pageType === detectionPageType.securityEvent) {
        this.initOffenderIpData(params)
        this.initOffenderLocationData(params)
        this.initVictimIpData(params)
        this.initVictimLocationData(params)
      } else if (this.pageType === detectionPageType.performanceEvent) {
        this.initActiveEntity(params)
      }
    },
    queryListTotal () {

    },
    filter (filterColumn) {
      const params = {}
      params[filterColumn] = this.filterData[this.pageType].find(f => {
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
    'filterData.securityEvent.0.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData.securityEvent[0].column, oldValue: o, newValue: n })
      }
    },
    'filterData.securityEvent.1.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData.securityEvent[1].column, oldValue: o, newValue: n })
      }
    },
    'filterData.securityEvent.2.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData.securityEvent[2].column, oldValue: o, newValue: n })
      }
    },
    'filterData.securityEvent.3.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData.securityEvent[3].column, oldValue: o, newValue: n })
      }
    },
    'filterData.securityEvent.4.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData.securityEvent[4].column, oldValue: o, newValue: n })
      }
    },
    'filterData.securityEvent.5.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData.securityEvent[5].column, oldValue: o, newValue: n })
      }
    },
    'filterData.performanceEvent.0.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData.performanceEvent[0].column, oldValue: o, newValue: n })
      }
    },
    'filterData.performanceEvent.1.value': {
      deep: true,
      handler (n, o) {
        this.$refs.search.changeParams({ column: this.filterData.performanceEvent[1].column, oldValue: o, newValue: n })
      }
    }
  },
  setup () {
    const { params } = useRoute()
    const pageType = params.typeName

    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })

    return {
      timeFilter,
      pageType
    }
  }
}
</script>
