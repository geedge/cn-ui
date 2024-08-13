<template>
  <div class="entity-explorer entity-explorer--show-list detections">
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools explorer-detection-top-tools">
      <div class="explorer-top-tools-title">{{$t('overall.detections')}}</div>
      <div style="display: flex">
        <DateTimeRange
            class="date-time-range"
            :start-time="timeFilter.startTime"
            :end-time="timeFilter.endTime"
            :date-range="timeFilter.dateRangeValue"
            ref="dateTimeRange"
            @change="reload"/>
        <TimeRefresh
            class="date-time-range"
            @change="timeRefreshChange"
            :end-time="timeFilter.endTime"/>
      </div>
    </div>

    <!-- 搜索组件 -->
    <div class="detections__search">
      <div class="detections__search__btns">
        <div @click="clickEventFlag(detectionEventType.single)" :class="eventFlag===detectionEventType.single ? 'active__btn' : ''">
          <i class="cn-icon cn-icon-danfenxi"></i>
        </div>
        <div @click="clickEventFlag(detectionEventType.aggregation)" :class="eventFlag===detectionEventType.aggregation ? 'active__btn' : ''">
          <i class="cn-icon cn-icon-fuhe"></i>
        </div>
      </div>
      <detection-search
          style="width: calc(100% - 92px);"
          ref="search"
          :page-type="pageType"
          @search="search"
      ></detection-search>
    </div>

    <!-- 内容区 -->
    <div class="detections__container">
      <loading :loading="loading"></loading>
      <template v-if="isEventSeverityNoData">
         <div class="no-data detection__event-severity-bar" >{{ $t('npm.noData') }}</div>
      </template>
      <template v-if="!isEventSeverityNoData">
        <div class="detection__event-severity-bar detection-border"  :id="`eventSeverityTrendBar${pageType}`"  :ref="`eventSeverityTrendBar${pageType}`">
        </div>
      </template>
      <div style="display: flex; flex-grow: 1; height: 100%;">
        <detection-filter
            class="detection-border"
            :filter-data="filterData"
            :q="q"
            :time-filter="timeFilter"
            @filter="getFilter"
            :event-flag="eventFlag"
        ></detection-filter>

        <div class="detection__list">
          <div class="detection__list-statistics detection-border">
            <div class="statistics__category">
              <div class="chart-header">
                <div class="chart-header__title">{{$t('detection.eventType')}}</div>
              </div>
              <template v-if="isStatisticsCategoryNoData">
                <div class="no-data chart-content" >{{ $t('npm.noData') }}</div>
              </template>
              <template v-else>
                <div class="chart-content" :id="`detectionCategoryPer${pageType}`"></div>
              </template>
            </div>
            <div class="statistics__severity">
              <div class="chart-header">
                <div class="chart-header__title">{{$t('detections.eventName')}}</div>
              </div>
              <template v-if="isStatisticsSeverityNoData">
                <div class="no-data chart-content" >{{ $t('npm.noData') }}</div>
              </template>
              <template v-else>
                <div class="chart-content" :id="`eventSeverityPie${pageType}`"></div>
              </template>

            </div>
            <div class="statistics__active-attack">
              <div class="chart-header">
                <div class="chart-header__title">Key</div>
              </div>
              <template v-if="isStatisticsActiveAttackNoData">
                <div class="no-data chart-content" >{{ $t('npm.noData') }}</div>
              </template>
              <template v-else>
                <div class="chart-content" style="padding-left: 5px;" :id="`detectionActiveAttacker${pageType}`"></div>
              </template>
            </div>
          </div>
          <detection-list
              :list-data="listData"
              :pageObj="pageObj"
              :time-filter="timeFilter"
              :page-type="pageType"
              :event-flag="eventFlag"
              :q="q"
              @pageSize="pageSize"
              @pageNo="pageNo"
              :loading="listLoading"
          ></detection-list>
          <div class="entity__pagination" >
            <Pagination
                ref="pagination"
                :page-obj="pageObj"
                @pageNo='pageNo'
                @pageSize='pageSize'
                @size-change="pageSize"
                @prev-click="prev"
                @next-click="next"
            ></Pagination>
          </div>
        </div>
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
import { defaultPageSize, detectionPageType, detectionEventType } from '@/utils/constants'
import { getNowTime, getSecond, getMillisecond } from '@/utils/date-util'
import { ref, shallowRef } from 'vue'
import * as echarts from 'echarts'
import {
  activeAttackBar,
  getAttackColor,
  getSeverityColor,
  barOption,
  pieForSeverity
} from '@/views/detections/options/detectionOptions'
import { api } from '@/utils/api'
import axios from 'axios'
import { urlParamsHandler, overwriteUrl, reverseSortBy, changeI18nOfSeverity } from '@/utils/tools'
import { useRoute } from 'vue-router'
import Loading from '@/components/common/Loading'
import { useStore } from 'vuex'
import { format } from 'echarts'
import Parser from '@/components/advancedSearch/meta/parser'
import { schemaDetectionSecurity } from '@/utils/static-data'

export default {
  name: 'Index',
  components: {
    Loading,
    DetectionSearch,
    DateTimeRange,
    TimeRefresh,
    DetectionFilter,
    DetectionList,
    Pagination
  },
  data () {
    return {
      tabsData: [
        {
          i18n: 'entities.securityEvents',
          path: '/detection/securityEvent',
          icon: 'cn-icon cn-icon-a-SecurityEvent'
        }
      ],
      chartInit: [],
      q: '',
      detectionPageType,
      filterData: [
        {
          title: this.$t('detection.eventType'),
          column: 'eventType',
          topColumn: 'event_type',
          collapse: false,
          value: [],
          showMore: true,
          showDisabled: true,
          show: true,
          showIndex: 5, // index作为showMore分割，从1开始而非0
          data: []
        },
        {
          title: this.$t('detections.eventName'),
          column: 'eventName',
          topColumn: 'event_name',
          collapse: false,
          value: [],
          showMore: false,
          showDisabled: true,
          show: true,
          data: []
        },
        {
          title: 'Key',
          column: 'keyFields',
          topColumn: 'keyFields,keyValues',
          collapse: false,
          value: [],
          showMore: true,
          showDisabled: true,
          showIndex: 5,
          show: true,
          data: [] // 从接口动态获取
        },
        {
          title: this.$t('overall.status'),
          column: 'status',
          topColumn: 'status',
          collapse: false,
          value: [], // value之间是or的关系
          showMore: false,
          show: true,
          data: [] // 从接口动态获取，本项在获得数据后需要特殊处理左边框颜色
        }
      ],
      listData: [],
      listLoading: false,
      severityPerOption: null,
      severityPerData: [],
      categoryPerOption: null,
      categoryPerData: [],
      activeAttackOption: null,
      activeAttackData: [],
      eventSeverityData: [],
      statisticsSeverityData: [],
      statisticsCategoryData: [],
      statisticsActiveAttackData: [],
      isEventSeverityNoData: false,
      isStatisticsSeverityNoData: false,
      isStatisticsCategoryNoData: false,
      isStatisticsActiveAttackNoData: false,
      loading: false,
      oldActiveEntitySearchValue: '',
      initFlag: true, // 初始化标识，初始化时保证mounted执行
      detectionChart: shallowRef(null),
      detectionEventType
    }
  },
  methods: {
    initStatusData (params) {
      axios.get(api.detection.event.statusStatistics, { params }).then(res => {
        if (res.status === 200) {
          const data = res.data.data.result
          if (data && data.length > 0) {
            data.sort((a, b) => {
              return Number(b.count) - Number(a.count)
            })
          }
          this.filterData[3].data = data.map(r => {
            let label = ''
            if (r.status === '0' || r.status === 0) {
              label = this.$t('detections.active')
            } else if (r.status === '1' || r.status === 1) {
              label = this.$t('detections.ended')
            }
            return { label, value: r.status, count: r.count }
          })
          this.isCheckFilterByQ(params, 3)
        }
      }).catch(e => {
        console.error(e)
        this.filterData[3].data = []
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    /** 初始化顶部大柱状图 */
    initTimeDistribution (params) {
      this.loading = true
      axios.get(api.detection.event.timeDistribution, { params }).then(res => {
        const data = res.data.data.result
        this.eventSeverityData = data
        if (!this.$_.isEmpty(data)) {
          /* 24.08 去掉了严重程度，只剩数量 */
          // const chartDom = document.getElementById(`eventSeverityTrendBar${this.pageType}`)
          const chartDom = this.$refs.eventSeverityTrendBarsecurityEvent
          const eventSeverityTrendOption = this.$_.cloneDeep(barOption)

          // 将时间转为毫秒，并分为100个间隔值，如有100条数据，则不分割，如48不满100，按52分割，保证有数据的时间点不受无数据时间点影响
          const diffTime = ((params.endTime - params.startTime) * 1000) / (data.length > 100 ? 100 : (100 - data.length))
          const timeList = []
          for (let i = (params.startTime * 1000); i < (params.endTime * 1000);) {
            i = i + diffTime
            timeList.push([parseInt(i.toFixed(0)), 0])
          }
          let dataList = data.map(d => [getMillisecond(parseFloat(d.statTime)), d.count])
          // 将100个时间间隔与柱状图数据合并并排序
          dataList = dataList.concat(timeList)
          dataList.sort((a, b) => a[0] - b[0])
          const xData = []
          dataList.forEach(item => {
            if (xData.indexOf(item[0]) < 0) {
              xData.push(item[0])
            }
          })

          eventSeverityTrendOption.series[0].data = dataList

          let detectionChart = echarts.getInstanceByDom(chartDom)
          if (detectionChart) {
            echarts.dispose(detectionChart)
          }
          detectionChart = echarts.init(chartDom)
          this.chartInit.push(shallowRef(detectionChart))
          detectionChart.setOption(eventSeverityTrendOption)
          // this.isEventSeverityNoData = false
        } else {
          // this.isEventSeverityNoData = true
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      }).finally(() => {
        this.$nextTick(() => {
          this.loading = false
        })
      })
    },
    /** 初始化左侧事件严重等级和第一个小饼图 */
    initEventNameData (params) {
      axios.get(api.detection.event.nameStatistics, { params }).then(res => {
        const data = res.data.data.result
        if (data && data.length > 0) {
          data.sort((a, b) => {
            return Number(b.count) - Number(a.count)
          })
        }
        this.statisticsSeverityData = data
        if (!this.$_.isEmpty(data)) {
          this.filterData[1].data = data.map(r => ({ label: changeI18nOfSeverity(r.eventName), value: r.eventName, count: r.count }))
          this.isCheckFilterByQ(params, 1)
          const eventSeverityOption = this.$_.cloneDeep(pieForSeverity)
          eventSeverityOption.series[0].data = data.map(d => {
            return { value: d.count, name: changeI18nOfSeverity(d.eventName), itemStyle: { color: getSeverityColor(d.eventName) } }
          })
          const chartDom = document.getElementById(`eventSeverityPie${this.pageType}`)
          let detectionChart = echarts.getInstanceByDom(chartDom)
          if (detectionChart) {
            echarts.dispose(detectionChart)
          }
          detectionChart = echarts.init(chartDom)
          this.chartInit.push(shallowRef(detectionChart))
          detectionChart.setOption(eventSeverityOption)
          const vm = this
          detectionChart.off('click')
          detectionChart.on('click', e => {
            this.getFilter(e.data.name, vm.filterData[1].column)
            vm.filterData[1].value = vm.triggerFilterDataValue(vm.filterData[1].value, e.data.name)
          })
        }
      }).catch(e => {
        console.error(e)
        this.filterData[1].data = []
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    /** 第二个饼图和左侧filter的eventType */
    initEventTypeData (params) {
      axios.get(api.detection.event.typeStatistics, { params }).then(res => {
        const data = res.data.data.result
        this.statisticsCategoryData = data
        if (!this.$_.isEmpty(data)) {
          this.filterData[0].data = data.map(r => ({
            label: r.eventType,
            value: r.eventType,
            count: r.count
          }))
          this.isCheckFilterByQ(params, 0)
          const { showMore, showIndex, showDisabled } = this.computeFilterPage(this.filterData[0].data)
          this.filterData[0].showMore = showMore
          this.filterData[0].showIndex = showIndex
          this.filterData[0].showDisabled = showDisabled
          const chartDom = document.getElementById(`detectionCategoryPer${this.pageType}`)
          this.detectionChart = echarts.getInstanceByDom(chartDom)
          if (this.detectionChart) {
            echarts.dispose(this.detectionChart)
          }
          this.detectionChart = echarts.init(chartDom)
          // this.chartInit.push(shallowRef(detectionChart))
          const securityTypeOption = this.$_.cloneDeep(pieForSeverity)
          securityTypeOption.series[0].data = data.map(d => {
            return { value: d.count, name: d.eventType, itemStyle: { color: getAttackColor(d.eventType) } }
          })
          if (chartDom) {
            let oneColumnWidth = (chartDom.clientWidth * 0.56) - 30
            if (data.length > 6) {
              oneColumnWidth = (chartDom.clientWidth * 0.56) / 2 - 30
            }
            securityTypeOption.legend.formatter = function (name) {
              return format.truncateText(name, oneColumnWidth, '12px')
            }
          }
          this.detectionChart.setOption(securityTypeOption)

          const vm = this
          this.detectionChart.off('click')
          this.detectionChart.on('click', e => {
            this.getFilter(e.data.name, vm.filterData[0].column)
            vm.filterData[0].value = vm.triggerFilterDataValue(vm.filterData[0].value, e.data.name)
          })
        }
      }).catch(e => {
        console.error(e)
        this.filterData[0].data = []
        this.filterData[0].showMore = false
        this.filterData[0].showIndex = 5
        this.filterData[0].showDisabled = true
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    /** 横向柱状图和左侧filter的key */
    initKeyData (params) {
      axios.get(api.detection.event.keyStatistics, { params }).then(res => {
        let data = res.data.data.result
        this.statisticsActiveAttackData = data
        if (!this.$_.isEmpty(data)) {
          this.filterData[2].data = data.map(r => ({
            label: `${r.keyFields},${r.keyValues}`,
            value: r.keyFields,
            count: r.count
          }))
          this.isCheckFilterByQ(params, 2)
          const { showMore, showIndex, showDisabled } = this.computeFilterPage(this.filterData[2].data)
          this.filterData[2].showMore = showMore
          this.filterData[2].showIndex = showIndex
          this.filterData[2].showDisabled = showDisabled

          const chartDom = document.getElementById(`detectionActiveAttacker${this.pageType}`)
          let detectionChart = echarts.getInstanceByDom(chartDom)
          if (detectionChart) {
            echarts.dispose(detectionChart)
          }
          detectionChart = echarts.init(chartDom)
          this.chartInit.push(shallowRef(detectionChart))
          const offenderIpOption = this.$_.cloneDeep(activeAttackBar)
          data.sort(reverseSortBy('count'))
          data = data.slice(0, 5)
          offenderIpOption.series[0].data = data.map(d => {
            return [d.count, `${d.keyFields},${d.keyValues}`]
          }).reverse()
          detectionChart.setOption(offenderIpOption)

          const vm = this
          detectionChart.off('click')
          detectionChart.on('click', e => {
            if (e.data) {
              vm.getFilter(e.data[1], vm.filterData[2].column)
              vm.filterData[2].value = vm.triggerFilterDataValue(vm.filterData[2].value, e.data[1])
            }
          })
        }
      }).catch(e => {
        console.error(e)
        this.filterData[2].data = []
        this.filterData[2].showMore = false
        this.filterData[2].showIndex = 5
        this.filterData[2].showDisabled = true
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    triggerFilterDataValue (array, value) {
      const r = [...array]
      const index = array.indexOf(value)
      if (index > -1) {
        r.splice(index, 1)
      } else {
        r.push(value)
      }
      return r
    },
    computeFilterPage (data) {
      return {
        showMore: data.length > 0,
        showDisabled: data.length <= 5,
        showIndex: 5
      }
    },
    queryList (q) {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        resource: q,
        pageSize: this.pageObj.pageSize,
        pageNo: this.pageObj.pageNo,
        isGroup: this.eventFlag === detectionEventType.single ? 0 : 1
      }
      axios.get(api.detection.event.list, { params }).then(response => {
        if (response.status === 200) {
          const data = response.data.data.result
          if (data.length > 0) {
            // data.forEach(item => {
            //   item.eventInfoObj = JSON.parse(item.eventInfo)
            //   item.startTime = parseFloat(item.startTime)
            // })
            this.listData = data
          } else {
            this.listData = []
          }
        } else {
          this.listData = []
          console.error(response.data.message)
          this.$message.error(response.data.message)
        }
      })
      delete params.pageSize
      delete params.pageNo
      axios.get(api.detection.event.count, { params }).then(res => {
        this.pageObj.total = parseInt(this.$_.get(res, 'data.data.result', 0))
      }).catch(error => {
        console.error(error)
      })
    },
    timeRefreshChange () {
      // 不是自选时间
      if (this.$refs.dateTimeRange) {
        if (!this.$refs.dateTimeRange.isCustom) {
          const value = this.timeFilter.dateRangeValue
          this.$refs.dateTimeRange.quickChange(value)
        } else {
          this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
        }
      } else {
        this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
      }
    },
    initNoData () {
      this.isEventSeverityNoData = false
      this.isStatisticsSeverityNoData = false
      this.isStatisticsCategoryNoData = false
      this.isStatisticsActiveAttackNoData = false
    },
    reload (startTime, endTime, dateRangeValue) {
      this.initNoData()
      this.dateTimeRangeChange(startTime, endTime, dateRangeValue)
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        range: dateRangeValue.value
      })
      overwriteUrl(newUrl)
    },
    // methods
    dateTimeRangeChange (s, e, v) {
      this.timeFilter = { startTime: s, endTime: e, dateRangeValue: v.value }
    },
    search (param) {
      let q
      let metaList
      if (param) {
        q = param.q
        metaList = param.metaList
      }
      this.initNoData()
      if (q) {
        this.q = q
        this.metaList = metaList
      } else {
        this.q = ''
        this.metaList = []
      }
      if (this.pageObj.resetPageNo && !this.initFlag) {
        this.pageObj.pageNo = 1
      } else {
        this.pageObj.resetPageNo = true
      }
      // 参数q，避免切换页码时，地址栏参数q为空
      let urlQ = ''
      if (param && param.str) {
        urlQ = param.str.indexOf('%') > -1 ? encodeURI(param.str) : param.str
        this.str = param.str
      } else if (this.q) {
        // urlQ = encodeURI(this.q)
        urlQ = this.q.indexOf('%') > -1 ? encodeURI(this.q) : this.q
      }
      const mode = this.$route.query.mode || 'text'
      const newUrl = urlParamsHandler(window.location.href, this.$route.query, {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        range: this.timeFilter.dateRangeValue,
        q: urlQ,
        mode: mode
      })
      overwriteUrl(newUrl)
      this.queryFilter(this.q)
      this.queryList(this.q)
    },
    resetFilterData () {
      this.filterData.forEach(d => {
        d.data = []
      })
    },
    queryFilter (q) {
      this.resetFilterData()
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        resource: q
      }
      this.initTimeDistribution(params) // 顶部柱状图
      this.initEventTypeData(params) // 左侧filter的eventType，右侧的第一个饼图
      this.initEventNameData(params) // 左侧filter的eventName，右侧的第二个饼图
      this.initKeyData(params) // 左侧filter的key，右侧的横向柱状图
      if (this.eventFlag === detectionEventType.single) {
        this.initStatusData(params) // 左侧filter的status，在聚合事件下不显示
      }
    },
    pageSize (val) {
      this.pageObj.pageSize = val || 20
      this.search(this.metaList, this.q)
    },
    pageNo (val) {
      // 初始化时，mounted和pageNo都会调用列表接口，且pageNo先执行，
      // 初始化保证mounted执行，后续pageNo变动则不影响接口调用
      if (!this.initFlag) {
        this.pageObj.pageNo = val || 1
        this.pageObj.resetPageNo = false
        this.search(this.metaList, this.q)
      }
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
    },
    resize () {
      this.chartInit.forEach(e => { e.value.resize() })

      const chartDom = document.getElementById(`detectionCategoryPer${this.pageType}`)
      this.detectionChart = echarts.getInstanceByDom(chartDom)
      if (this.detectionChart) {
        const securityTypeOption = this.$_.cloneDeep(this.detectionChart.getOption())
        echarts.dispose(this.detectionChart)
        if (chartDom) {
          this.detectionChart = echarts.init(chartDom)
          let oneColumnWidth = (chartDom.clientWidth * 0.56) - 30
          if (this.statisticsCategoryData.length > 6) {
            oneColumnWidth = (chartDom.clientWidth * 0.56) / 2 - 30
          }
          securityTypeOption.legend[0].formatter = function (name) {
            return format.truncateText(name, oneColumnWidth, '12px')
          }
          this.detectionChart.setOption(securityTypeOption)
        }
      }
    },
    jumpNewDetetion () {
      this.$router.push({
        path: '/detection/policy',
        query: {
          t: +new Date()
        }
      })
    },
    isCheckFilterByQ (params, index) {
      if (params.resource) {
        let obj
        if (index === 0) {
          obj = this.filterData[index].data.find(d => params.resource.indexOf(d.value) > -1 && params.resource.indexOf('status') > -1)
        } else {
          obj = this.filterData[index].data.find(d => params.resource.indexOf(d.value) > -1)
        }
        if (obj) {
          this.filterData[index].value = [obj.value]
          this.filterData[index].flag = true
        } else {
          this.filterData[index].value = []
          this.filterData[index].flag = true
        }
      } else {
        this.filterData[index].value = []
        this.filterData[index].flag = true
      }
    },
    getFilter (name, topColumn) {
      if (topColumn === 'tag') {
        const params = {
          column: topColumn,
          operator: 'has',
          value: name
        }
        this.$refs.search.changeParams([params])
      } else if (topColumn === 'keyFields') {
        const nameList = name.split(',')

        // 多个keyField、keyValues时进行拆分匹配
        const mid = Math.ceil(nameList.length / 2)
        const fieldsList = nameList.slice(0, mid)
        const valuesList = nameList.slice(mid)

        const columnList = this.filterData[2].topColumn.split(',')
        fieldsList.forEach(item => {
          const params = {
            column: columnList[0],
            operator: '=',
            value: item
          }
          this.$refs.search.changeParams([params])
        })
        valuesList.forEach(item => {
          const params = {
            column: columnList[1],
            operator: '=',
            value: item
          }
          this.$refs.search.changeParams([params])
        })
      } else {
        const params = {
          column: topColumn,
          operator: '=',
          value: name
        }
        this.$refs.search.changeParams([params])
      }
      this.$nextTick(() => {
        this.emitter.emit('advanced-search')
      })
    },
    clickEventFlag (e) {
      this.eventFlag = e
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        eventFlag: e
      })
      overwriteUrl(newUrl)
      this.filterData[3].show = e === detectionEventType.single
      this.queryFilter(this.q)
      this.queryList(this.q)
    }
  },
  mounted () {
    let { q } = this.$route.query

    // 如果地址栏有listMode，即列表页，并非首页，则开始搜索
    if (q) {
      // %位置为0是输入中文时能解码，%20，25%分别是空格和%的情况
      if (q && (q.indexOf('%') === 0 || q.indexOf('%20') > -1 || q.indexOf('%25') > -1)) {
        q = decodeURI(q)
      }
      // %位置不为0，即内容包含非英文时
      const str1 = q.substring(q.indexOf('%'), q.indexOf('%') + 3)
      if (q && q.indexOf('%') > 0 && (str1 === '%20' || str1 === '%25')) {
        q = decodeURI(q)
      }
    }
    const parser = new Parser(schemaDetectionSecurity)
    q = parser.conversionEnum(q)
    this.q = q
    this.queryFilter(q)
    if (this.initFlag) {
      this.timer = setTimeout(() => {
        this.initFlag = false
      }, 1000)
    }
    this.queryList(q)
    this.debounceFunc = this.$_.debounce(this.resize, 300)
    window.addEventListener('resize', this.debounceFunc)
  },
  watch: {
    eventSeverityData: {
      deep: true,
      handler (n) {
        if (!n || n.length === 0) {
          this.timeout = setTimeout(() => {
            this.isEventSeverityNoData = true
            // this.$set(this.isEventSeverityNoData ,true)
            this.loading = false
          }, 500)
        } else {
          clearTimeout(this.timeout)
          // this.$set(this.isEventSeverityNoData ,false)
          this.isEventSeverityNoData = false
          this.loading = false
        }
      }
    },
    statisticsSeverityData: {
      deep: true,
      handler (n) {
        if (!n || n.length === 0) {
          this.timeout = setTimeout(() => {
            // this.$set(this.isStatisticsSeverityNoData ,true)
            this.isStatisticsSeverityNoData = true
          }, 500)
        } else {
          clearTimeout(this.timeout)
          // this.$set(this.isStatisticsSeverityNoData ,false)
          this.isStatisticsSeverityNoData = false
        }
      }
    },
    statisticsCategoryData: {
      deep: true,
      handler (n) {
        if (!n || n.length === 0) {
          this.timeout = setTimeout(() => {
            this.isStatisticsCategoryNoData = true
            // this.$set(this.isStatisticsCategoryNoData ,true)
          }, 500)
        } else {
          clearTimeout(this.timeout)
          // this.$set(this.isStatisticsCategoryNoData ,false)
          this.isStatisticsCategoryNoData = false
        }
      }
    },
    statisticsActiveAttackData: {
      deep: true,
      handler (n) {
        if (!n || n.length === 0) {
          this.timeout = setTimeout(() => {
            this.isStatisticsActiveAttackNoData = true
            // this.$set(this.isStatisticsActiveAttackNoData ,true)
          }, 500)
        } else {
          clearTimeout(this.timeout)
          // this.$set(this.isStatisticsActiveAttackNoData ,false)
          this.isStatisticsActiveAttackNoData = false
        }
      }
    },
    timeFilter () {
      this.search(this.metaList, this.q)
    }
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
  },
  setup () {
    const store = useStore()
    let { query, path } = useRoute()
    // 获取路由跳转过的历史状态，赋值给当前界面，起到保留状态的作用，如浏览器的回退前进等
    const routerObj = store.getters.getRouterHistoryList.find(item => item.t === query.t)
    if (routerObj) {
      query = routerObj.query
      path = routerObj.path

      // 如果当前界面之前载入过，获取状态后更新地址栏，以便后续的赋值操作
      const newUrl = urlParamsHandler(window.location.href, useRoute().query, query)
      overwriteUrl(newUrl)
    }
    const pageType = path.replace('/detection/', '')
    const eventFlag = ref(query.eventFlag || detectionEventType.single)
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime
    // 优先级：url > config.js > 默认值。
    const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.detection || 60)
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(dateRangeValue)
      timeFilter.value.startTime = getSecond(startTime)
      // todo 目前有数据的时间，开发时切换过来
      // timeFilter.value.startTime = 1722928331
      timeFilter.value.endTime = getSecond(endTime)
      // 如果没有时间参数，就将参数写入url
      const newUrl = urlParamsHandler(window.location.href, useRoute().query, { startTime: timeFilter.value.startTime, endTime: timeFilter.value.endTime, range: dateRangeValue })
      overwriteUrl(newUrl)
    } else {
      // timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.startTime = 1722928331
      timeFilter.value.endTime = parseInt(endTimeParam)
    }
    const pageObj = ref({
      pageNo: query.pageNo ? parseInt(query.pageNo) : 1,
      // 是否重置pageNo，在执行新搜索时是true
      resetPageNo: true,
      pageSize: query.pageSize ? parseInt(query.pageSize) : defaultPageSize,
      total: 0
    })
    return {
      timeFilter,
      pageType,
      pageObj,
      eventFlag
    }
  }
}
</script>
