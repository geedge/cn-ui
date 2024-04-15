<template>
  <el-table
          id="tagTable"
          ref="dataTable"
          :header-cell-class-name="headerCellClass"
          :data="tableData"
          :expand-row-keys="expandedIds"
          empty-text=" "
          tooltip-effect="light"
          :row-key="(row) => { return row.id }"
          :reserve-selection="true"
          @header-dragend="dragend"
          @sort-change="tableDataSort"
          @expand-change="dropExpandChange"
          @selection-change="selectionChange"
  >
    <el-table-column type="expand" width="30">
      <template #default="props">
        <div class="down">
          <div class="block drop-down-time">
            <el-popover placement="bottom-start"
                        :ref="`tagPopover${props.row.id}`"
                        :key="`tagPopover${props.row.id}`"
                        :show-arrow="false"
                        :append-to-body="true"
                        :hide-after="0"
                        :show-after="0"
                        popper-class="tag__popper"
                        trigger="click">
              <template #reference>
                <div class="tag-dropdown" :id="`tagDropdown${props.row.id}`">
                  <span>{{ curExpendDataType }}</span><i class="cn-icon-down cn-icon"></i>
                </div>
              </template>
              <el-row type="flex" justify="center" style="width: fit-content;flex-direction: column;">
                <ul class="select-dropdown" :id="`tagSelectDropdown${props.row.id}`" >
                  <li key="uniqueEntityObserved" :id="`uniqueEntityObserved${props.row.id}`" class="select-dropdown__item" @click="uniqueEntityObserved(props.row)" >
                    <span>{{ $t('tag.uniqueEntityObserved') }}</span>
                  </li>
                  <li key="totalIndicators" :id="`totalIndicators${props.row.id}`" class="select-dropdown__item" @click="totalIndicators(props.row)">
                    <span>{{ $t('tag.totalIndicators') }}</span>
                  </li>
                </ul>
              </el-row>
            </el-popover>
            <span class="expand-observed-entities" :class="{'expand-observed-entities--disabled': disableToEntity}" @click="toEntityList(props.row)">{{countDesc}}&nbsp;<el-icon v-if="!disableToEntity"><Right /></el-icon></span>
            <date-time-range
                class="date-time-range"
                :start-time="timeFilter.startTime"
                :end-time="timeFilter.endTime"
                :date-range="timeFilter.dateRangeValue"
                ref="dateTimeRange"
                @change="reload"
            />
          </div>
          <div class="expand">
            <loading :loading="loadingDown"></loading>
            <chart-no-data v-if="isNoData && !loadingDown"></chart-no-data>
            <div class="expand-cell" >
              <div class="expand-left">
                <div class="chart-drawing" :id="`chart${props.row.id}`"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            :selectable="(row) => { return row.isBuiltIn !== 1 }"
            width="30">
    </el-table-column>
    <el-table-column
            v-for="item in customTableTitles"
            :key="item.prop"
            :fixed="item.fixed"
            :label="item.label"
            :min-width="`${item.minWidth}`"
            :prop="item.prop"
            :resizable="true"
            :show-overflow-tooltip="item.prop === 'timePlan'"
            :sort-orders="['ascending', 'descending']"
            :sortable="item.sortable"
            :width="`${item.width}`"
    >
      <template #header>
        <span class="data-column__span">{{ item.label }}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
          <span v-if="item.prop === 'isBuiltIn'">
            <span>{{ getIsBuiltIn(scope.row.isBuiltIn) }}</span>
          </span>
        <span v-else-if="item.prop === 'intent'" class="type-tag" :class="colorIntent(scope.row[item.prop])">{{intentText(scope.row[item.prop])}}</span>
        <span v-else>{{ scope.row[item.prop] || '-' }}</span>
      </template>
    </el-table-column>
    <template v-slot:empty >
      <div class="table-no-data" v-if="isNoData">
        <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
      </div>
    </template>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import Loading from '@/components/common/Loading'
import axios from 'axios'
import { api } from '@/utils/api'
import { storageKey, tagIntent, chartColor3 } from '@/utils/constants'
import { urlParamsHandler, overwriteUrl, headerCellClass } from '@/utils/tools'
import { ref, shallowRef } from 'vue'
import { dateFormatToUTC, getNowTime, getSecond } from '@/utils/date-util'
import chartDetectionPagination from '@/views/charts/charts/chartDetectionPagination'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { useRoute } from 'vue-router'
import { parseInt } from 'lodash'
import unitConvert from '@/utils/unit-convert'
import * as echarts from 'echarts'
import { tagLineChartOption } from '@/views/charts2/charts/options/echartOption'

export default {
  name: 'tagTable',
  mixins: [table],
  components: {
    ChartNoData,
    Loading,
    chartDetectionPagination
  },
  props: {
    toolsLoading: Boolean,
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  inject: ['reload'],
  data () {
    return {
      format: localStorage.getItem(storageKey.dateFormat),
      username: localStorage.getItem(storageKey.username),
      curExpendDataType: this.$t('tag.uniqueEntityObserved'),
      curExpendDataTypeVal: 'uniqueEntityObserved',
      tableTitle: [ // 原始table列
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          width: 300,
          sortable: 'custom'
        }, {
          label: this.$t('tag.category'),
          prop: 'category',
          show: true,
          width: 100
        }, {
          label: this.$t('tag.entityType'),
          prop: 'indicatorType',
          show: true,
          width: 120
        }, {
          label: this.$t('tag.intention'),
          prop: 'intent',
          show: true,
          width: 100
        }, {
          label: this.$t('tag.source'),
          prop: 'isBuiltIn',
          show: true,
          width: 120
        }, {
          label: this.$t('overall.remark'),
          prop: 'description',
          show: true
        }
      ],
      checkboxAll: false,
      isIndeterminate: false,
      checkboxIds: {},
      batchDow: false,
      builtinId: '',
      indeterminate: false,
      loading: false,
      loadingDown: false,
      loadingTableId: '',
      loadingPreviewId: '',
      downDataList: [],
      disableEdit: false, // 编辑按钮是否不可用，当选择多条记录的时候你，编辑按钮不可用
      interval: null,
      configPeriod: '',
      configCustom: '',
      selectIds: [], // 单行选中的id列表
      initExpandFlag: false, // 初始化时单行展开标志，false是未展开，true展开,
      myChartArray: [],
      observedIpCount: 0,
      observedDomainCount: 0,
      countDesc: '', // tag下拉中实体数量描述信息
      disableToEntity: false,
      tagIntent
    }
  },
  /**
     * 添加vue3的setup，目的是添加/获取地址栏的参数
     */
  setup () {
    const { query } = useRoute()
    /*// 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime

    const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.tag.activeEntity || 60)
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
    }*/

    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.tag.activeEntity || 60
    const timeFilter = ref({ dateRangeValue })
    const { startTime, endTime } = getNowTime(dateRangeValue)
    timeFilter.value.startTime = getSecond(startTime)
    timeFilter.value.endTime = getSecond(endTime)

    // 展开行的id列表，只展开一行
    const expandedId = []
    if (query.expandId) {
      expandedId.push(parseInt(query.expandId))
    }
    const expandedIds = ref(expandedId || [])
    // 展开行的分页信息
    const tempPageObj = {
      pageNo: 1,
      pageSize: 20,
      total: 0,
      resetPageNo: true
    }

    let pageNo = query.expandPage
    if (pageNo !== undefined) {
      pageNo = parseInt(pageNo)
      if (pageNo > 1) {
        tempPageObj.pageNo = pageNo
      }
    } else {
      pageNo = 1
    }
    const pageObj = ref(tempPageObj)
    const myChart = shallowRef(null)
    return {
      timeFilter,
      expandedIds,
      pageObj,
      myChart
    }
  },
  watch: {
    tableData (newVal, oldVal) {
      if (newVal) {
        this.showSelectedRow()
      }
    },
    expandedIds (newVal, oldVal) {
      if (newVal !== undefined && newVal.length > 0) {
        const expandIdParam = {
          expandId: newVal[0]
        }
        this.reloadUrl(expandIdParam)

        if (this.initExpandFlag) {
          const expandPage = {
            expandPage: 1
          }
          this.reloadUrl(expandPage)
        }
      } else {
        // 删除地址栏参数，然后删除缓存
        const newQuery = this.$route.query // 深拷贝路由数据
        delete newQuery.expandId
        delete newQuery.expandPage
        delete newQuery.startTime
        delete newQuery.endTime
        this.reloadUrl(newQuery, 'cleanOldParams')
      }
    },
    timeFilter (n) {
      const id = this.expandedIds[0] || null
      if (id) {
        const item = this.tableData.find(item => item.id === id)
        if (this.disableToEntity) {
          this.init(item, api.tagIndicatorTrend, api.tagIndicatorStatistics)
        } else {
          this.init(item, api.tagTrafficEntityTrend, api.tagTrafficEntityStatistics)
        }
      }
    }
  },
  computed: {
    intentText () {
      const vm = this
      return function (intent) {
        const t = vm.tagIntent.find(t => t.value === intent)
        return this.$t(t.label)
      }
    },
    colorIntent () {
      const vm = this
      return function (intent) {
        const t = vm.tagIntent.find(t => t.value === intent)
        return t ? t.name + '-list' : vm.tagIntent[0].name + '-list'
      }
    },
    observedCount () {
      return this.observedIpCount + this.observedDomainCount
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.expandTable()
    })
    window.addEventListener('resize', this.resize)
  },
  methods: {
    headerCellClass,
    toEntityList (tag) {
      if (!this.disableToEntity) {
        this.$router.push({
          path: '/entity',
          query: {
            listMode: 'list',
            q: 'has(tag,\'' + tag.name + '\')',
            mode: 'text',
            // range: this.timeFilter.dateRangeValue,
            // pageNo: this.pageObj.pageNo,
            // pageSize: this.pageObj.pageSize,
            showList: true
          }
        })
      }
    },
    echartsInit (data, item, type) {
      const dom = document.getElementById(`chart${item.id}`)
      if (dom) {
        // if (!this.myChart) {
        this.myChart = echarts.init(dom)
        // }
        this.chartOption = tagLineChartOption
        const series = []
        if (item.indicatorType && item.indicatorType.indexOf('IP') > -1) {
          series.push({
            type: 'line',
            symbol: 'circle',
            smooth: true,
            showSymbol: false,
            emphasis: {
              itemStyle: {
                borderWidth: 2
              }
            },
            name: 'IP',
            stack: 'Total',
            lineStyle: {
              color: '#35ADDA',
              width: 1
            },
            areaStyle: {
              // opacity: 0.1,
              color: '#eef8fc'
            },
            itemStyle: {
              color: '#35ADDA'
            },
            data: data.map(t => { return [Number(t.statTime) * 1000, Number(t.ipIndicatorCount)] })
          })
        }
        if (item.indicatorType && item.indicatorType.indexOf('Domain') > -1) {
          series.push({
            type: 'line',
            symbol: 'circle',
            smooth: true,
            showSymbol: false,
            emphasis: {
              itemStyle: {
                borderWidth: 2
              }
            },
            name: this.$t('overall.domain'),
            stack: 'Total',
            lineStyle: {
              color: '#E48F3E',
              width: 1
            },
            areaStyle: {
              color: '#fdf6f0'
              // opacity: 0.1
            },
            itemStyle: {
              color: '#E48F3E'
            },
            data: data.map(t => { return [Number(t.statTime) * 1000, Number(t.domainIndicatorCount)] })
          })
        }
        this.chartOption.series = series

        this.chartOption.yAxis[0].axisLabel.formatter = (value) => {
          return unitConvert(value, 'number').join('')
        }
        this.myChartArray.push(this.myChart)
        this.myChart.setOption(this.chartOption)
        this.$nextTick(() => {
          this.myChart.resize()
        })
      }
    },
    resize () {
      this.myChartArray.forEach(t => {
        t.resize()
      })
    },
    handleCountDesc () {
      let desc = this.observedCount
      // 全部实体
      if (this.disableToEntity) {
        if (this.observedCount < 2) {
          desc += ` ${this.$t('tag.activeEntity2')}`
        } else {
          desc += ` ${this.$t('tag.activeEntities2')}`
        }
      } else { // 活跃实体
        if (this.observedCount < 2) {
          desc += ` ${this.$t('overall.entity2')}`
        } else {
          desc += ` ${this.$t('overall.entities2')}`
        }
      }
      if (this.observedCount > 0) {
        desc += `, IP ${this.observedIpCount}, ${this.$t('overall.domain')} ${this.observedDomainCount}`
      }
      return desc
    },
    uniqueEntityObserved (item) {
      this.curExpendDataType = this.$t('tag.uniqueEntityObserved')
      this.curExpendDataTypeVal = 'uniqueEntityObserved'
      this.disableToEntity = false
      this.$nextTick(() => {
        const totalIndicatorsDom = document.getElementById('totalIndicators' + item.id)
        const uniqueEntityObservedDom = document.getElementById('uniqueEntityObserved' + item.id)
        uniqueEntityObservedDom.style.cssText = 'color:var(--el-color-primary);font-weight: bold;'
        totalIndicatorsDom.style.cssText = ''
        document.getElementById('tagDropdown' + item.id).click()
      })
      // 重置时间条件
      this.$refs.dateTimeRange.quickChange(DEFAULT_TIME_FILTER_RANGE.tag.activeEntity || 60)

      // this.init(item, api.tagTrafficEntityTrend, api.tagTrafficEntityStatistics)
    },
    totalIndicators (item) {
      this.curExpendDataType = this.$t('tag.totalIndicators')
      this.curExpendDataTypeVal = 'totalIndicators'
      this.disableToEntity = true
      this.$nextTick(() => {
        const totalIndicatorsDom = document.getElementById('totalIndicators' + item.id)
        const uniqueEntityObservedDom = document.getElementById('uniqueEntityObserved' + item.id)
        uniqueEntityObservedDom.style.cssText = ''
        totalIndicatorsDom.style.cssText = 'color:var(--el-color-primary);font-weight: bold;'
        document.getElementById('tagDropdown' + item.id).click()
      })
      // 重置时间条件
      const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.tag.totalEntity || 7 * 24 * 60
      const { startTime, endTime } = getNowTime(dateRangeValue)
      this.$refs.dateTimeRange.timeArrChange([startTime, endTime])

      // this.init(item, api.tagIndicatorTrend, api.tagIndicatorStatistics)
    },
    /**
       * 进入页面判断是否需要展开表格
       * 即展开表格后刷新界面，保持展开效果
       */
    expandTable () {
      const expandInfo = this.expandedIds

      if (expandInfo !== undefined && expandInfo.length > 0) {
        const obj = {
          id: expandInfo[0]
        }
        this.dropExpandChange(obj, expandInfo, 'init')

        setTimeout(() => {
          this.initExpandFlag = true
        }, 1500)
      }
    },
    /**
       * 显示选中的行，即分页后依旧显示
       */
    showSelectedRow () {
      const selectIds = this.selectIds

      this.$nextTick(() => {
        if (selectIds.length > 0) {
          this.tableData.forEach(item => {
            if (selectIds.includes(item.id)) {
              this.$refs.dataTable.toggleRowSelection(item)
            }
          })
        }
      })
    },
    getJobStatus (tag) {
      if (tag.state === 1 && tag.upload === 1) {
        return this.$t('overall.completed')
      } else {
        return this.$t('overall.inProgress')
      }
    },
    /**
       * 单行选中
       */
    selectionChange (objs) {
      this.$emit('selectionChange', objs)
      this.checkboxIds.id = objs.map(item => {
        return item.id
      }).join(',')

      this.batchDow = objs.length > 0

      this.checkboxAll = objs.length === this.tableData.length
      this.isIndeterminate = objs.length > 0 && objs.length < this.tableData.length

      // 选中状态回显
      const selectIds = []
      if (objs.length > 0) {
        objs.forEach(item => {
          selectIds.push(item.id)
        })
        // this.selectIds = selectIds
      }
      this.batchDeleteObjs = objs
      if (objs.length > 1) {
        this.disableEdit = true
      } else {
        this.disableEdit = false
      }
    },
    /**
       * 全选按钮
       */
    selectAll (objs) {
      const selectIds = []
      this.isIndeterminate = false

      if (objs) {
        objs.forEach(item => {
          this.$refs.dataTable.toggleAllSelection(item)
          // this.checkboxAll = true;
          selectIds.push(item.id)
        })
      } else {
        this.$refs.dataTable.clearSelection()
      }

      this.batchDeleteObjs = objs
      if (objs.length > 1) {
        this.disableEdit = true
      } else {
        this.disableEdit = false
      }

      // this.selectIds = selectIds
    },
    /**
       * 向地址栏添加/删除参数
       */
    reloadUrl (newParam, clean) {
      const { query } = this.$route
      let newUrl = urlParamsHandler(window.location.href, query, newParam)
      if (clean) {
        newUrl = urlParamsHandler(window.location.href, query, newParam, clean)
      }
      overwriteUrl(newUrl)
    },
    reload (startTime, endTime, dateRangeValue) {
      this.timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime), dateRangeValue: dateRangeValue }
      const { query } = this.$route
      this.$store.commit('setTimeRangeArray', [this.timeFilter.startTime, this.timeFilter.endTime])
      this.$store.commit('setTimeRangeFlag', dateRangeValue.value)

      const newUrl = urlParamsHandler(window.location.href, query, {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        range: dateRangeValue.value
      })
      overwriteUrl(newUrl)
    },
    initLine (item, lineUrl) {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      lineUrl = lineUrl || api.tagTrafficEntityTrend
      lineUrl = lineUrl.replace('{{name}}', item.name)
      this.loadingDown = true
      axios.get(lineUrl, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          this.showError = false
          this.isNoData = res.data.result.length === 0
          this.echartsInit(res.data.result, item, '')
        } else {
          this.isNoData = false
          this.showError = true
          this.errorMsg = this.errorMsgHandler(res)
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = false
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
        this.loadingDown = false
      })
    },
    initStatistics (item, statisticsUrl) {
      statisticsUrl = statisticsUrl || api.tagTrafficEntityStatistics
      statisticsUrl = statisticsUrl.replace('{{name}}', item.name)
      axios.get(statisticsUrl, { params: { startTime: 1, endTime: 9999999999 } }).then(response => { // TODO 计数统计暂时不限制时间
        const res = response.data
        if (response.status === 200) {
          const ipFind = res.data.result.find(item => item.type === 'IP')
          this.observedIpCount = ipFind ? ipFind.count : 0
          const domainFind = res.data.result.find(item => item.type === 'Domain')
          this.observedDomainCount = domainFind ? domainFind.count : 0
          this.countDesc = this.handleCountDesc()
        } else {
          this.errorMsg = this.errorMsgHandler(res)
        }
      }).catch(e => {
        console.error(e)
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
      })
    },
    init (item, lineUrl, statisticsUrl) {
      this.initLine(item, lineUrl)
      this.initStatistics(item, statisticsUrl)
    },
    /**
       * 表格左侧点击展开收起
       */
    dropExpandChange (row, expandedRows, flag) {
      this.curExpendDataType = this.$t('tag.uniqueEntityObserved')
      this.curExpendDataTypeVal = 'uniqueEntityObserved'
      this.expandedIds = []
      clearInterval(this.interval)
      if (expandedRows.length > 0 && row) {
        this.expandedIds.push(row.id)
        this.init(row)
        this.$nextTick(() => {
          const uniqueEntityObservedDom = document.getElementById('uniqueEntityObserved' + row.id)
          if (uniqueEntityObservedDom) {
            uniqueEntityObservedDom.style.cssText = 'color:var(--el-color-primary);font-weight: bold;'
          }
        })
      }
    },
    getIsBuiltIn (isBuiltIn) {
      if (isBuiltIn === 1) {
        return this.$t('tag.builtInTag')
      } else {
        return this.$t('tag.userDefined')
      }
    }
  },
  beforeUnmount () {
    clearInterval(this.interval)
    window.removeEventListener('resize', this.resize)
    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
    this.chartOption = null
  }
}
</script>
