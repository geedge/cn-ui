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
        <div style="display: flex; height: 100%;">
        <detection-filter
            :filter-data="filterData"
            :q="q"
            :time-filter="timeFilter"
            @filter="filter"
        ></detection-filter>

        <div class="detection__list">
          <div class="detection__list-statistics">
            <div class="statistics__severity" >
              <div class="chart-header" >
                <div class="chart-header__title">{{$t('detection.severity')}}</div>
              </div>
              <div class="chart-content" id="detectionSeverityPer">
              </div>
            </div>
            <div class="statistics__category" >
              <div class="chart-header" >
                <div class="chart-header__title">{{$t('detection.categoryProportion')}}</div>
              </div>
              <div class="chart-content" id="detectionCategoryPer">
              </div>
            </div>
            <div class="statistics__active-attack" >
              <div class="chart-header" >
                <div class="chart-header__title">{{$t('detection.activeAttacker')}}</div>
              </div>
              <div class="chart-content" id="detectionActiveAttacker">
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
      <div class="entity__pagination" style="position: absolute; bottom: 0; width: 100%;">
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
import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'
import * as echarts from 'echarts'
import { multipleBarOption,pieForSeverity,activeAttackBar,getAttackColor,getSeverityColor } from '@/views/detections/options/detectionOptions'
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
          data: [
            {
              label: 'Critical',
              value: 'critical',
              count: 50
            },
            {
              label: 'High',
              value: 'high',
              count: 50
            },
            {
              label: 'Medium',
              value: 'medium',
              count: 50
            },
            {
              label: 'Low',
              value: 'low',
              count: 50
            },
            {
              label: 'Info',
              value: 'info',
              count: 50
            }
          ] // 从接口动态获取，本项在获得数据后需要特殊处理左边框颜色
        },
        {
          title: this.$t('detections.securityType'),
          collapse: false,
          value: [],
          data: [
            {
              label: 'Command and control',
              value: 'command and control',
              count: 50
            }
          ] // 从接口动态获取
        },
        {
          title: this.$t('detections.victimIp'),
          collapse: false,
          value: [],
          data: [
            {
              label: '1.2.6.8',
              value: '1.2.6.8',
              count: 50
            }
          ] // 从接口动态获取
        },
        {
          title: this.$t('detections.victimLocation'),
          collapse: false,
          value: [],
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
          collapse: false,
          value: [],
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
          collapse: false,
          value: [],
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
      eventSeverityData:[],
      severityPerOption: null,
      severityPerData:[],
      categoryPerOption: null,
      categoryPerData:[],
      activeAttackOption: null,
      activeAttackData:[],
    }
  },
  methods: {
    initEventSeverityData(){
      const chartDom = document.getElementById('detectionEventSeverityBar');
      const detectionChart = echarts.init(chartDom);
      this.eventSeverityOption = this.$_.cloneDeep(multipleBarOption)

      const queryParams = {
        ...this.timeFilter,
        q:this.q,
      }
      get(api.detectionEventSeverity, queryParams).then(response => {
        response = {
          "code": 200,
          "success": true,
          "msg": "OK",
          "data": {
            "resultType": "table",
            "result": [
              {
                "eventSeverity": "Critical",
                "count": 1048
              },{
                "eventSeverity": "High",
                "count": 735
              },{
                "eventSeverity": "Medium",
                "count": 580
              },{
                "eventSeverity": "Low",
                "count": 484
              },{
                "eventSeverity": "Info",
                "count": 300
              }
            ]
          }
        }
        if (response.code === 200) {
          this.eventSeverityData = [
            ['time', '2021/11/12 12:00', '2021/11/13 12:00', '2021/11/14 12:00', '2021/11/15 12:00','2021/11/16 12:00','2021/11/17 12:00','2021/11/18 12:00','2021/11/19 12:00','2021/11/20 12:00','2021/11/21 12:00'],
            ['Critical', 5, 0, 2, 0,0,3,3,0,4,2],
            ['High', 5, 7, 3,0, 0,3,3,20,2,2],
            ['Medium', 10, 8, 20, 8,0,5,5,5,5,20],
            ['Low', 18, 6, 5, 0,0,2,20,2,2,2],
            ['Info', 16, 10, 4, 0,7,0,8,5,15,1]
          ]
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.eventSeverityOption.dataset.source = this.eventSeverityData
          this.eventSeverityOption && detectionChart.setOption(this.eventSeverityOption);
        })
      })
    },
    initSeverityPerData(){
      const chartDom = document.getElementById('detectionSeverityPer');
      const detectionChart = echarts.init(chartDom);
      this.severityPerOption = this.$_.cloneDeep(pieForSeverity)

      const queryParams = {
        ...this.timeFilter,
        q:this.q,
      }
      get(api.detectionSeverity, queryParams).then(response => {
        response = {
          "code": 200,
          "success": true,
          "msg": "OK",
          "data": {
            "resultType": "table",
            "result": [
              {
                "eventSeverity": "Critical",
                "count": 1048
              },{
                "eventSeverity": "High",
                "count": 735
              },{
                "eventSeverity": "Medium",
                "count": 580
              },{
                "eventSeverity": "Low",
                "count": 484
              },{
                "eventSeverity": "Info",
                "count": 300
              }
            ]
          }
        }
        if (response.code === 200) {
          this.severityPerData = response.data.result.map(d => {
            return { value: d.count, name: d.eventSeverity,itemStyle:{color:getSeverityColor(d.eventSeverity)}}
          })
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.severityPerOption.series[0].data = this.severityPerData
          this.severityPerOption && detectionChart.setOption(this.severityPerOption);
        })
      })
    },
    initCategoryPerData(){
      const chartDom = document.getElementById('detectionCategoryPer');
      const detectionChart = echarts.init(chartDom);
      this.categoryPerOption = this.$_.cloneDeep(pieForSeverity)

      const queryParams = {
        ...this.timeFilter,
        q:this.q,
      }
      get(api.detectionAttackType, queryParams).then(response => {
        response = {
          "code": 200,
          "success": true,
          "msg": "OK",
          "data": {
            "resultType": "table",
            "result": [
              {
                "attackType": "Command and control",
                "count": 1048
              },{
                "attackType": "Payload_delivery",
                "count": 735
              },{
                "attackType": "Cryptomining",
                "count": 580
              },{
                "attackType": "phishing",
                "count": 484
              },{
                "attackType": "dga",
                "count": 300
              },{
                "attackType": "ddos",
                "count": 50
              },
            ]
          }
        }
        if (response.code === 200) {
          this.categoryPerData = response.data.result.map(d => {
            return { value: d.count, name: d.attackType,itemStyle:{color:getAttackColor(d.attackType)}}
          })
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.categoryPerOption.series[0].data = this.categoryPerData
          this.categoryPerOption && detectionChart.setOption(this.categoryPerOption);
        })
      })

    },
    initActiveAttackData(){
      const chartDom = document.getElementById('detectionActiveAttacker');
      const detectionChart = echarts.init(chartDom);
      this.activeAttackOption = this.$_.cloneDeep(activeAttackBar)

      const queryParams = {
        ...this.timeFilter,
        q:this.q,
      }
      get(api.detectionOffenderIp, queryParams).then(response => {
        response = {
          "code": 200,
          "success": true,
          "msg": "OK",
          "data": {
            "resultType": "table",
            "result": [
              {
                "offenderIp": "192.168.12.21",
                "count": 99999
              },{
                "offenderIp": "192.168.22.21",
                "count": 88888
              },{
                "offenderIp": "192.168.32.21",
                "count": 77777
              },{
                "offenderIp": "192.168.42.21",
                "count": 66666
              },{
                "offenderIp": "192.168.52.21",
                "count": 55555
              }
            ]
          }
        }
        if (response.code === 200) {
          this.activeAttackData = response.data.result.map(d => {
            return [d.count,d.offenderIp]
          })
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.activeAttackOption.series[0].data = this.activeAttackData.reverse()
          this.activeAttackOption && detectionChart.setOption(this.activeAttackOption);
        })
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
    search () {

    },
    filter () {

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
    this.initEventSeverityData()
    this.initSeverityPerData()
    this.initCategoryPerData()
    this.initActiveAttackData()
  },
  watch: {
    timeFilter (n) {
      this.search(this.metaList, this.q)
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
