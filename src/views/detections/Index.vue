<template>
  <div class="entity-explorer entity-explorer--show-list detections">
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools explorer-detection-top-tools">
      <div class="explorer-top-tools-title">{{$t('overall.detections')}}</div>
      <div style="display: flex">
        <div class="explorer-top-tools-block" @click="jumpNewDetetion" v-if="hasPermission('detectionPolicy')">
          <i class="cn-icon cn-icon-configure-policies detection-icon-setting"></i>
          <span>{{$t('config.detections.configurePolicies')}}</span>
        </div>
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
    <div style="width: 100%; padding-bottom: 50px;">
      <chart-tabs :data="tabsData" router></chart-tabs>
    </div>

    <!-- 搜索组件 -->
    <detection-search
        ref="search"
        :page-type="pageType"
        @search="search"
    ></detection-search>
    <!-- 内容区 -->
    <div class="detections__container">
      <loading :loading="loading"></loading>
      <template v-if="isEventSeverityNoData">
         <div class="no-data detection__event-severity-bar" >{{ $t('npm.noData') }}</div>
      </template>
      <template v-if="!isEventSeverityNoData">
        <div class="detection__event-severity-bar detection-border"  :id="`eventSeverityTrendBar${pageType}`">
        </div>
      </template>
      <div style="display: flex; flex-grow: 1; height: 100%;">
        <detection-filter
            class="detection-border"
            :filter-data="filterData[pageType]"
            :q="q"
            :time-filter="timeFilter"
            @filter="getFilter"
        ></detection-filter>

        <div class="detection__list">
          <div class="detection__list-statistics detection-border">
            <div class="statistics__severity">
              <div class="chart-header">
                <div class="chart-header__title">{{$t('detections.severity')}}</div>
              </div>
              <template v-if="isStatisticsSeverityNoData">
                <div class="no-data chart-content" >{{ $t('npm.noData') }}</div>
              </template>
              <template v-else>
                <div class="chart-content" :id="`eventSeverityPie${pageType}`"></div>
              </template>

            </div>
            <div class="statistics__category">
              <div class="chart-header">
                <div class="chart-header__title">{{$t('detections.eventType')}}</div>
              </div>
              <template v-if="isStatisticsCategoryNoData">
                <div class="no-data chart-content" >{{ $t('npm.noData') }}</div>
              </template>
              <template v-else>
                <div class="chart-content" :id="`detectionCategoryPer${pageType}`"></div>
              </template>
            </div>
            <div class="statistics__active-attack">
              <div class="chart-header">
                <div class="chart-header__title">{{pageType === detectionPageType.securityEvent ? $t('detection.activeOffender') : $t('detections.activeEntity')}}</div>
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
import { defaultPageSize, detectionPageType } from '@/utils/constants'
import { getNowTime, getSecond, getMillisecond } from '@/utils/date-util'
import { ref, shallowRef } from 'vue'
import * as echarts from 'echarts'
import {
  activeAttackBar,
  getAttackColor,
  getSeverityColor,
  multipleBarOption,
  pieForSeverity
} from '@/views/detections/options/detectionOptions'
import { api } from '@/utils/api'
import axios from 'axios'
import { urlParamsHandler, overwriteUrl, extensionEchartY, reverseSortBy, changeI18nOfSeverity } from '@/utils/tools'
import { useRoute } from 'vue-router'
import Loading from '@/components/common/Loading'
import ChartTabs from '@/components/common/ChartTabs'
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
    Pagination,
    ChartTabs
  },
  data () {
    return {
      tabsData: [
        {
          i18n: 'entities.securityEvents',
          path: '/detection/securityEvent',
          icon: 'cn-icon cn-icon-a-SecurityEvent'
        }
        // {
        //   i18n: 'entities.regulatoryRiskEvents',
        //   path: '/detection/securityEvent',
        //   icon: 'cn-icon cn-icon-a-RegulatoryRiskEvent',
        //   disable: true
        // },
        // {
        //   i18n: 'overall.performanceEvents',
        //   path: '/detection/performanceEvent',
        //   icon: 'cn-icon cn-icon-a-PerformanceEvent'
        // }
      ],
      chartInit: [],
      // pageObj: {
      //   pageNo: 1,
      //   pageSize: defaultPageSize,
      //   total: 0,
      //   resetPageNo: true
      // },
      q: '',
      detectionPageType,
      filterData: {
        securityEvent: [
          {
            title: this.$t('overall.status'),
            column: 'status',
            topColumn: 'status',
            collapse: false,
            value: [], // value之间是or的关系
            showMore: false,
            data: [] // 从接口动态获取，本项在获得数据后需要特殊处理左边框颜色
          },
          {
            title: this.$t('detections.severity'),
            column: 'severity',
            topColumn: 'severity',
            collapse: false,
            value: [], // value之间是or的关系
            showMore: false,
            data: [] // 从接口动态获取，本项在获得数据后需要特殊处理左边框颜色
          },
          {
            title: this.$t('detections.eventType'),
            column: 'eventType',
            topColumn: 'event_type',
            collapse: false,
            value: [],
            showMore: true,
            showDisabled: true,
            showIndex: 5, // index作为showMore分割，从1开始而非0
            data: [] // 从接口动态获取
          },
          {
            title: this.$t('detections.victimIp'),
            column: 'victimIP',
            topColumn: 'victim_ip',
            collapse: false,
            value: [],
            showMore: true,
            showDisabled: true,
            showIndex: 5,
            data: [] // 从接口动态获取
          },
          {
            title: this.$t('detections.offenderIp'),
            column: 'offenderIP',
            topColumn: 'offender_ip',
            collapse: false,
            value: [],
            showMore: true,
            showDisabled: true,
            showIndex: 5,
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
            title: this.$t('detections.eventType'),
            column: 'eventType',
            collapse: false,
            value: [],
            data: [] // 从接口动态获取
          }
        ]
      },
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
      detectionChart: shallowRef(null)
    }
  },
  methods: {
    initStatusData (params) {
      axios.get(api.detection[this.pageType].statusStatistics, { params }).then(res => {
        if (res.status === 200) {
          const data = res.data.data.result
          if (data && data.length > 0) {
            data.sort((a, b) => {
              return Number(b.count) - Number(a.count)
            })
          }
          this.filterData[this.pageType][0].data = data.map(r => {
            let label = ''
            if (r.status === '0') {
              label = this.$t('detections.active')
            } else if (r.status === '1') {
              label = this.$t('detections.ended')
            }
            return { label, value: r.status, count: r.count }
          })
          this.isCheckFilterByQ(params, 0)
        }
      }).catch(e => {
        console.error(e)
        this.filterData[this.pageType][0].data = []
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    /** 初始化顶部大柱状图 */
    initEventSeverityTrendData (params) {
      this.loading = true
      axios.get(api.detection[this.pageType].timeDistribution, { params }).then(res => {
        const data = res.data.data.result
        this.eventSeverityData = data
        if (!this.$_.isEmpty(data)) {
          const dataMap = new Map()
          data.forEach(item => {
            if (changeI18nOfSeverity(item.severity)) {
              if (!dataMap.has(changeI18nOfSeverity(item.severity))) {
                const count = [[getMillisecond(parseFloat(item.statTime)), item.count]]
                dataMap.set(changeI18nOfSeverity(item.severity), count)
              } else {
                dataMap.get(changeI18nOfSeverity(item.severity)).push([getMillisecond(parseFloat(item.statTime)), item.count])
              }
            }
          })

          const chartDom = document.getElementById(`eventSeverityTrendBar${this.pageType}`)
          const eventSeverityTrendOption = this.$_.cloneDeep(multipleBarOption)

          const xData = []
          dataMap.forEach(function (value) {
            // eventSeverityTrendOption.series[Number(getSeriesIndex(key))].data = value.map(v => Number(v[1]))
            value.forEach(item => {
              if (xData.indexOf(item[0]) < 0) {
                xData.push(item[0])
              }
            })
          })

          eventSeverityTrendOption.series.forEach(serie => {
            serie.name = changeI18nOfSeverity(serie.name)
            const seriesData = []
            xData.forEach(item => {
              if (dataMap.has(serie.name)) {
                // eslint-disable-next-line array-callback-return
                const hasX = dataMap.get(serie.name).some(function (v) {
                  if (item === v[0]) {
                    seriesData.push([item, Number(v[1])])
                    return true
                  }
                })
                if (!hasX) {
                  seriesData.push([item, 0])
                }
              } else {
                seriesData.push([item, 0])
              }
            })
            serie.data = seriesData
          })

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
    initEventSeverityData (params) {
      axios.get(api.detection[this.pageType].severityStatistics, { params }).then(res => {
        const data = res.data.data.result
        if (data && data.length > 0) {
          data.sort((a, b) => {
            return Number(b.count) - Number(a.count)
          })
        }
        this.statisticsSeverityData = data
        if (!this.$_.isEmpty(data)) {
          this.filterData[this.pageType][1].data = data.map(r => ({ label: changeI18nOfSeverity(r.severity), value: r.severity, count: r.count }))
          this.isCheckFilterByQ(params, 1)
          const eventSeverityOption = this.$_.cloneDeep(pieForSeverity)
          eventSeverityOption.series[0].data = data.map(d => {
            return { value: d.count, name: changeI18nOfSeverity(d.severity), itemStyle: { color: getSeverityColor(d.severity) } }
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
            if (this.pageType === 'performanceEvent') {
              vm.filterData.performanceEvent[0].value = vm.triggerFilterDataValue(vm.filterData.performanceEvent[0].value, e.data.name)
            } else if (this.pageType === 'securityEvent') {
              this.getFilter(e.data.name, vm.filterData.securityEvent[1].column)
              vm.filterData.securityEvent[1].value = vm.triggerFilterDataValue(vm.filterData.securityEvent[1].value, e.data.name)
            }
          })
        }
      }).catch(e => {
        console.error(e)
        this.filterData[this.pageType][1].data = []
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    initEventTypeData (params) {
      axios.get(api.detection[this.pageType].eventType, { params }).then(res => {
        const data = res.data.data.result
        this.statisticsCategoryData = data
        if (!this.$_.isEmpty(data)) {
          this.filterData[this.pageType][2].data = data.map(r => ({
            label: r.eventType,
            value: r.eventType,
            count: r.count
          }))
          const { showMore, showIndex, showDisabled } = this.computeFilterPage(this.filterData[this.pageType][2].data)
          this.filterData[this.pageType][2].showMore = showMore
          this.filterData[this.pageType][2].showIndex = showIndex
          this.filterData[this.pageType][2].showDisabled = showDisabled

          const chartDom = document.getElementById(`detectionCategoryPer${this.pageType}`)
          let detectionChart = echarts.getInstanceByDom(chartDom)
          if (detectionChart) {
            echarts.dispose(detectionChart)
          }
          detectionChart = echarts.init(chartDom)
          this.chartInit.push(shallowRef(detectionChart))
          const securityTypeOption = this.$_.cloneDeep(pieForSeverity)
          securityTypeOption.series[0].data = data.map(d => {
            return { value: d.count, name: d.eventType }
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
          detectionChart.setOption(securityTypeOption)

          const vm = this
          detectionChart.off('click')
          detectionChart.on('click', e => {
            vm.filterData.performanceEvent[1].value = vm.triggerFilterDataValue(vm.filterData.performanceEvent[1].value, e.data.name)
          })
        }
      }).catch(e => {
        console.error(e)
        this.filterData[this.pageType][2].data = []
        this.filterData[this.pageType][2].showMore = false
        this.filterData[this.pageType][2].showIndex = 5
        this.filterData[this.pageType][2].showDisabled = true
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    /** 第二个饼图和左侧filter的eventType */
    initSecurityTypeData (params) {
      axios.get(api.detection[this.pageType].eventTypeStatistics, { params }).then(res => {
        const data = res.data.data.result
        this.statisticsCategoryData = data
        if (!this.$_.isEmpty(data)) {
          this.filterData[this.pageType][2].data = data.map(r => ({
            label: r.eventType,
            value: r.eventType,
            count: r.count
          }))
          this.isCheckFilterByQ(params, 2)
          const { showMore, showIndex, showDisabled } = this.computeFilterPage(this.filterData[this.pageType][2].data)
          this.filterData[this.pageType][2].showMore = showMore
          this.filterData[this.pageType][2].showIndex = showIndex
          this.filterData[this.pageType][2].showDisabled = showDisabled
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
            this.getFilter(e.data.name, vm.filterData.securityEvent[2].column)
            vm.filterData.securityEvent[2].value = vm.triggerFilterDataValue(vm.filterData.securityEvent[2].value, e.data.name)
          })
        }
      }).catch(e => {
        console.error(e)
        this.filterData[this.pageType][2].data = []
        this.filterData[this.pageType][2].showMore = false
        this.filterData[this.pageType][2].showIndex = 5
        this.filterData[this.pageType][2].showDisabled = true
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    /** 横向柱状图和左侧filter的offenderIp */
    initOffenderIpData (params) {
      axios.get(api.detection[this.pageType].offenderIpStatistics, { params }).then(res => {
        let data = res.data.data.result
        this.statisticsActiveAttackData = data
        if (!this.$_.isEmpty(data)) {
          this.filterData[this.pageType][4].data = data.map(r => ({
            label: r.offenderIp,
            value: r.offenderIp,
            count: r.count
          }))
          this.isCheckFilterByQ(params, 4)
          const { showMore, showIndex, showDisabled } = this.computeFilterPage(this.filterData[this.pageType][4].data)
          this.filterData[this.pageType][4].showMore = showMore
          this.filterData[this.pageType][4].showIndex = showIndex
          this.filterData[this.pageType][4].showDisabled = showDisabled

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
            return [d.count, d.offenderIp]
          }).reverse()
          detectionChart.setOption(offenderIpOption)

          const vm = this
          detectionChart.off('click')
          detectionChart.on('click', e => {
            if (e.data) {
              vm.getFilter(e.data[1], vm.filterData.securityEvent[4].column)
              vm.filterData.securityEvent[4].value = vm.triggerFilterDataValue(vm.filterData.securityEvent[4].value, e.data[1])
            }
          })
        }
      }).catch(e => {
        console.error(e)
        this.filterData[this.pageType][4].data = []
        this.filterData[this.pageType][4].showMore = false
        this.filterData[this.pageType][4].showIndex = 5
        this.filterData[this.pageType][4].showDisabled = true
        this.$message.error(this.errorMsgHandler(e))
      })
    },

    initVictimIpData (params) {
      axios.get(api.detection[this.pageType].victimIpStatistics, { params }).then(res => {
        const data = res.data.data.result
        this.filterData[this.pageType][3].data = data.map(r => ({ label: r.victimIp, value: r.victimIp, count: r.count }))
        this.isCheckFilterByQ(params, 3)
        const { showMore, showIndex, showDisabled } = this.computeFilterPage(this.filterData[this.pageType][3].data)
        this.filterData[this.pageType][3].showMore = showMore
        this.filterData[this.pageType][3].showIndex = showIndex
        this.filterData[this.pageType][3].showDisabled = showDisabled
      }).catch(e => {
        console.error(e)
        this.filterData[this.pageType][3].data = []
        this.filterData[this.pageType][3].showMore = false
        this.filterData[this.pageType][3].showIndex = 5
        this.filterData[this.pageType][3].showDisabled = true
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    initActiveEntity (params) {
      axios.get(api.detection[this.pageType].activeEntity, { params }).then(res => {
        let data = res.data.data.result
        this.statisticsActiveAttackData = data
        if (!this.$_.isEmpty(data)) {
          const chartDom = document.getElementById(`detectionActiveAttacker${this.pageType}`)
          let detectionChart = echarts.getInstanceByDom(chartDom)
          if (detectionChart) {
            echarts.dispose(detectionChart)
          }
          detectionChart = echarts.init(chartDom)
          this.chartInit.push(shallowRef(detectionChart))
          const option = this.$_.cloneDeep(activeAttackBar)
          data.sort(reverseSortBy('count'))
          data = data.slice(0, 5)
          option.series[0].data = data.map(d => {
            return [d.count, d.name, d.entityType]
          }).reverse()
          detectionChart.setOption(option)
          extensionEchartY(detectionChart)// y轴标签过长时，鼠标悬浮，显示所有内容

          const vm = this
          detectionChart.off('click')
          detectionChart.on('click', e => {
            const entityType = e.data[2]
            let column = ''
            if (entityType) {
              switch (entityType) {
                case 'app': {
                  column = 'app_name'
                  break
                }
                case 'domain': {
                  column = 'domain'
                  break
                }
                case 'ip': {
                  column = 'server_ip'
                  break
                }
                default: {
                  break
                }
              }
              if (column) {
                // 点击的name和上次的name一致，则清空该项条件
                if (vm.oldActiveEntitySearchValue === e.data[1]) {
                  vm.$refs.search.changeParams({ column: column, oldValue: [vm.oldActiveEntitySearchValue], newValue: [] })
                  vm.$nextTick(() => {
                    vm.oldActiveEntitySearchValue = ''
                  })
                } else {
                  vm.$refs.search.changeParams({ column: column, oldValue: vm.oldActiveEntitySearchValue ? [vm.oldActiveEntitySearchValue] : [], newValue: [e.data[1]] })
                  vm.$nextTick(() => {
                    vm.oldActiveEntitySearchValue = e.data[1]
                  })
                }
              }
            }
          })
        }
      }).catch(error => {
        console.error(error)
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
        pageNo: this.pageObj.pageNo
      }
      axios.get(api.detection[this.pageType].securityList, { params }).then(response => {
        if (response.status === 200) {
          const data = response.data.data.result
          if (data.length > 0) {
            data.forEach(item => {
              item.eventInfoObj = JSON.parse(item.eventInfo)
              item.startTime = parseFloat(item.startTime)
            })
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
      axios.get(api.detection[this.pageType].securityCount, { params }).then(res => {
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
      this.filterData.securityEvent.forEach(d => {
        d.data = []
      })
      this.filterData.performanceEvent.forEach(d => {
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
      this.initStatusData(params)
      this.initEventSeverityTrendData(params)
      this.initEventSeverityData(params)
      if (this.pageType === detectionPageType.securityEvent) {
        this.initOffenderIpData(params)
        this.initVictimIpData(params)
        this.initSecurityTypeData(params)
      } else if (this.pageType === detectionPageType.performanceEvent) {
        this.initActiveEntity(params)
        this.initEventTypeData(params)
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
          obj = this.filterData[this.pageType][index].data.find(d => params.resource.indexOf(d.value) > -1 && params.resource.indexOf('status') > -1)
        } else {
          obj = this.filterData[this.pageType][index].data.find(d => params.resource.indexOf(d.value) > -1)
        }
        if (obj) {
          this.filterData[this.pageType][index].value = [obj.value]
          this.filterData[this.pageType][index].flag = true
        } else {
          this.filterData[this.pageType][index].value = []
          this.filterData[this.pageType][index].flag = true
        }
      } else {
        this.filterData[this.pageType][index].value = []
        this.filterData[this.pageType][index].flag = true
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
      timeFilter.value.endTime = getSecond(endTime)
      // 如果没有时间参数，就将参数写入url
      const newUrl = urlParamsHandler(window.location.href, useRoute().query, { startTime: timeFilter.value.startTime, endTime: timeFilter.value.endTime, range: dateRangeValue })
      overwriteUrl(newUrl)
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
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
      pageObj
    }
  }
}
</script>
