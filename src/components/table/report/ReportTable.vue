<template>
  <div>
    <el-table
        id="reportTable"
        ref="dataTable"
        :data="tableData"
        :height="height"
        :expand-row-keys="expandedIds"
        border
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
              <el-date-picker
                  v-model="timeRange"
                  size="small"
                  :format="format"
                  :clearable="false"
                  type="datetimerange"
                  range-separator="To"
                  :start-placeholder="$t('detections.startTime')"
                  :end-placeholder="$t('detections.endTime')"
                  @change="datePickerChange(props.row)"
              />
            </div>
            <div class="expand">
              <loading :loading="loadingDown"></loading>
              <chart-no-data v-if="downDataList.length === 0 && !loadingDown"></chart-no-data>
              <div class="expand-cell" v-for="(item, index) in downDataList" :key="index">
                <div class="expand-right">
                  <div class="demo-progress">
                    <el-progress :stroke-width="10" type="circle" :percentage="computePercent(item)"
                                 :color="computePercent(item) === 'Failed' ? '#D8A6A6' : (computePercent(item) === 100 ? '#21bf9a' : '#50b3ef')">
                      <template #default="{ percentage }">
                        <span style="font-size: 0.875rem;" v-if="percentage !== 'Failed'">{{ percentage + '%' }}</span>
                        <span style="font-size: 0.875rem;color: #C14843" v-else>{{ percentage }}</span>
                      </template>
                    </el-progress>
                  </div>
                </div>
                <div class="expand-left">
                  <div class="expand-name"><i class="cn-icon cn-icon-user"></i>{{ username }}</div>
                  <div class="expand-time">
                    <div>{{ $t('report.creationTime') }}</div>
                    <div>{{ dateFormatByAppearance(item.ctime) }}</div>
                  </div>
                  <div class="expand-icon">
                    <div class="table-operation-item--no-border"
                         :class="{'table-operation-item--disabled': computePercent(item) === 'Failed' || computePercent(item) < 100}"
                         @click="reportOperation(['download', item])">
                      <loading :loading="loadingTableId === item.id" size="small"></loading>
                      <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingTableId}">
                        <use xlink:href="#cn-icon-download2"></use>
                      </svg>
                    </div>
                    <div class="table-operation-item--no-border"
                         :class="{'table-operation-item--disabled': computePercent(item) === 'Failed' || computePercent(item) < 100}"
                         @click="reportOperation(['preview', item])">
                      <loading :loading="loadingPreviewId === item.id" size="small"></loading>
                      <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                        <use xlink:href="#cn-icon-preview"></use>
                      </svg>
                    </div>
                    <div class="table-operation-item--no-border" @click="downDeleteQueryChange(item, props)">
                      <svg class="icon" aria-hidden="true">
                        <use xlink:href="#cn-icon-shanchu"></use>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="cn-detection__footer">
              <chart-detection-pagination
                  ref="pagination"
                  :page-obj="pageObj"
                  @pageJump="pageJump"
              ></chart-detection-pagination>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
          :resizable="false"
          align="center"
          type="selection"
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
          <span v-if="item.prop === 'timeLimit'">
            {{ handleTimeRange(scope.row) }}
          </span>
          <span v-else-if="item.prop === 'categoryId'">
            <span v-for="(item, i) in categoryList" :key="i">
              <span v-if="scope.row.categoryId === item.id">{{ item.name }}</span>
            </span>
          </span>
          <span v-else-if="item.prop === 'timePlan'">
            <template v-if="scope.row.config && scope.row.config.isScheduler === 0">
              {{ $t('report.always') }}
            </template>
            <template v-else-if="scope.row.config && scope.row.config.isScheduler === 1">
              <el-popover
                  placement="right-start"
                  :width="270"
                  trigger="hover"
                  class="my-table"
                  @show="handleConfig(scope.row)"
              >
                <template #reference>
                  <span>
                    <template v-if="scope.row.config && scope.row.config.schedulerConfig">
                      <template v-if="scope.row.config.schedulerConfig.type === 'day'">
                      {{ $t('report.daily') }}
                      </template>
                      <template v-else-if="scope.row.config.schedulerConfig.type === 'week'">
                        {{ $t('report.weekly') }}
                      </template>
                      <template v-else-if="scope.row.config.schedulerConfig.type === 'month'">
                        {{ $t('report.monthly') }}
                      </template>
                      <template v-else-if="scope.row.config.schedulerConfig.type === ''">
                        {{ $t('report.oneTime') }}
                      </template>
                      <template v-else>
                        -
                      </template>
                    </template>
                  </span>
                </template>
                <el-row class="margin-l-10 margin-t-20">
                  <el-col :span="8" class="tooltip-column-name">{{ $t('report.period') }}</el-col>
                  <el-col :span="16">{{ configPeriod }}</el-col>
                </el-row>
                <el-row class="margin-l-10">
                  <el-col :span="8" class="tooltip-column-name">{{ $t('report.custom') }}</el-col>
                  <el-col :span="16">{{ configCustom }}</el-col>
                </el-row>
                <el-row class="margin-l-10">
                  <el-col :span="8" class="tooltip-column-name">{{ $t('report.startTime') }}</el-col>
                  <el-col :span="16">{{ dateFormatByAppearance(scope.row.schedulerStart) || '-' }}</el-col>
                </el-row>
                <el-row class="margin-l-10">
                  <el-col :span="8" class="tooltip-column-name">{{ $t('report.endTime') }}</el-col>
                  <el-col :span="16">{{ dateFormatByAppearance(scope.row.schedulerEnd) || '-' }}</el-col>
                </el-row>
              </el-popover>
            </template>
            <template v-else>
              -
            </template>
          </span>
          <span v-else-if="item.prop === 'userName'">
            {{ (scope.row.sysUser && scope.row.sysUser.name) || '-' }}
          </span>
          <span v-else-if="item.prop === 'lastTime'">
            {{ scope.row.lastTime ? dateFormatByAppearance(scope.row.lastTime) : '-' }}
          </span>
          <span v-else-if="item.prop === 'total'">
            {{ scope.row[item.prop] || 0 }}
          </span>
          <span v-else>{{ scope.row[item.prop] || '-' }}</span>
        </template>
      </el-table-column>
      <template v-slot:empty >
        <div class="table-no-data" v-if="isNoData">
          <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
        </div>
      </template>
    </el-table>
<!--    <div class="table-operation-all">
      <el-checkbox v-model="checkboxAll" :indeterminate="isIndeterminate" @change="selectAll(tableData)"></el-checkbox>
      <div class="table-operation-all-span">
        <span>{{ $t('overall.all') }}</span>
        <div class="table-operation-back-down"
             :class="{'table-operation-all-checkbox': batchDow, 'table-operation-all-loading': loading}"
             @click="checkboxIds.id ? tableOperation(['delete', checkboxIds]) : ''">
          <loading :loading="loading"></loading>
          <span>{{ $t('report.batchDeletion') }}</span>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script>
import table from '@/mixins/table'
import Loading from '@/components/common/Loading'
import { del, get } from '@/utils/http'
import { api } from '@/utils/api'
import { storageKey, report } from '@/utils/constants'
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import { ref } from 'vue'
import { dateFormatToUTC, getNowTime } from '@/utils/date-util'
import chartDetectionPagination from '@/views/charts/charts/chartDetectionPagination'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { useRoute } from 'vue-router'
import { parseInt } from 'lodash'

export default {
  name: 'builtinReportTable',
  mixins: [table],
  components: {
    ChartNoData,
    Loading,
    chartDetectionPagination
  },
  props: {
    categoryList: Array,
    toolsLoading: Boolean,
    categoryId: Number,
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
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 50
        }, {
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('report.categoryType'),
          prop: 'categoryId',
          show: true,
          minWidth: 180
        }, {
          label: this.$t('report.timeLimit'),
          prop: 'timeLimit',
          show: true,
          minWidth: 110
        }, {
          label: this.$t('report.timePlan'),
          prop: 'timePlan',
          show: true,
          minWidth: 110
        }, {
          label: this.$t('report.operationUserName'),
          prop: 'userName',
          show: true,
          minWidth: 70
        }, {
          label: this.$t('report.resultCount'),
          prop: 'total',
          show: true,
          minWidth: 50
        }, {
          label: this.$t('report.lastExecutionTime'),
          prop: 'lastTime',
          show: true,
          width: 170,
          sortable: 'custom'
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
      // pageObj: {
      //   pageNo: 1,
      //   pageSize: 20,
      //   total: 0,
      //   resetPageNo: true
      // },
      // expandedIds: [],
      interval: null,
      typeMappings: [
        {
          key: 'day',
          value: this.$t('report.daily')
        },
        {
          key: 'week',
          value: this.$t('report.weekly')
        },
        {
          key: 'month',
          value: this.$t('report.monthly')
        },
        {
          key: '',
          value: this.$t('report.oneTime')
        }
      ],
      typeUnitMappings: [
        {
          key: 'day',
          value: this.$t('report.days')
        },
        {
          key: 'week',
          value: this.$t('report.week')
        },
        {
          key: 'month',
          value: this.$t('report.months')
        }
      ],
      scheduleTypeList: report.scheduleTypeList,
      weekdayList: report.weekdayList,
      monthList: report.monthList,
      weekOptions: report.weekOptions,
      configPeriod: '',
      configCustom: '',
      selectIds: [], // 单行选中的id列表
      initExpandFlag: false // 初始化时单行展开标志，false是未展开，true展开
    }
  },
  /**
   * 添加vue3的setup，目的是添加/获取地址栏的参数
   */
  setup () {
    const { startTime, endTime } = getNowTime(60 * 24 * 30)
    const timeRange = ref([startTime, endTime])

    const { query } = useRoute()

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

    return {
      timeRange,
      expandedIds,
      pageObj
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

        const dateParam = {
          startTime: dateFormatToUTC(this.timeRange[0]),
          endTime: dateFormatToUTC(this.timeRange[1])
        }
        this.reloadUrl(dateParam)
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
    timeRange (newVal, oldVal) {
      if (newVal) {
        const dateParam = {
          startTime: dateFormatToUTC(newVal[0]),
          endTime: dateFormatToUTC(newVal[1])
        }
        this.reloadUrl(dateParam)
      }
    }
  },
  computed: {
    handleTimeRange () {
      return function (row) {
        let str = ''
        if (row.config && row.config.timeConfig && row.config.timeConfig.type) {
          str += row.config.timeConfig.type
          if (['today', 'yesterday', 'this', 'customize'].indexOf(row.config.timeConfig.type) === -1 && row.config.timeConfig.offset) {
            str += ` ${row.config.timeConfig.offset} ${row.config.timeConfig.unit}`
          }
        }
        return str
      }
    },
    computePercent () {
      return function (item) {
        if (item.state === 2) {
          return 'Failed'
        }
        if (item.percent === 1) {
          if (localStorage.getItem(storageKey.s3Enable) == 1) {
            if (item.state === 1 && item.upload === 1) {
              return 100
            } else {
              return 99.99
            }
          } else {
            if (item.state === 1) {
              return 100
            } else {
              return 99.99
            }
          }
        } else {
          return parseFloat(item.percent * 100).toFixed(2)
        }
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.expandTable()
    })
  },
  methods: {
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
    getJobStatus (report) {
      if (report.state === 1 && report.upload === 1) {
        return this.$t('overall.completed')
      } else {
        return this.$t('overall.inProgress')
      }
    },
    reportOperation (arr) {
      if (arr[1].percent === 1) {
        this.tableOperation(arr)
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
    /**
     * 表格左侧点击展开收起
     */
    dropExpandChange (row, expandedRows, flag) {
      this.expandedIds = []
      clearInterval(this.interval)
      if (expandedRows.length > 0 && row) {
        this.expandedIds.push(row.id)
        if (flag === undefined) {
          this.pageObj.pageNo = 1
        }

        this.datePickerChange(row)
      }
    },
    datePickerChange (row, show) {
      if (!show) {
        if (this.pageObj.pageNo <= 1) {
          this.pageObj.pageNo = 1
        }
      }
      const param = {
        tempId: row.id,
        startTime: dateFormatToUTC(this.timeRange[0]),
        endTime: dateFormatToUTC(this.timeRange[1]),
        ...this.pageObj
      }
      this.dropDownQueryChange(param)
    },
    dropDownQueryChange (param) {
      this.loadingDown = true
      this.downDataList = []
      get(api.reportJob, param).then(res => {
        if (res.code === 200) {
          this.downDataList = res.data.list
          this.pageObj.total = res.data.total
          this.$nextTick(() => {
            this.$refs.dataTable.doLayout()
          })
        }
        this.loadingDown = false
        const showInterval = this.downDataList.find(item => item.percent !== 1 && item.state !== 2)
        if (this.downDataList && showInterval) {
          this.intervalChange(param)
        }
      })
    },
    dataConversionProcessing (param) {
      get(api.reportJob, param).then(res => {
        if (res.code === 200) {
          this.downDataList = res.data.list
          this.pageObj.total = res.data.total
        }
      })
    },
    downDeleteQueryChange (row, props) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        del(api.reportJob + '?ids=' + row.id).then(response => {
          if (response.code === 200) {
            this.delFlag = true
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t('tip.deleteSuccess')
            })
            this.dropDownQueryChange({ tempId: props.row.id })
            this.$emit('reload')
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {})
    },
    pageJump (val) {
      this.pageObj.pageNo = val
      if (this.expandedIds.length > 0) {
        this.datePickerChange({ id: this.expandedIds[0] }, true)
      }
    },
    intervalChange (param) {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
        // 通过深拷贝，触发watch监听到timeRange，也可使用$set进行触发
        this.timeRange = JSON.parse(JSON.stringify(this.timeRange))
        this.timeRange[1] = this.timeRange[1] + 30000
        param.endTime = dateFormatToUTC(this.timeRange[1])
        this.dataConversionProcessing(param)
      }, 30000)
    },
    handleConfigArray (array, list) {
      const group = []
      array.forEach(item => {
        const matchItem = list.find(m => m.value === item)
        if (matchItem) {
          group.push(this.$t(matchItem.name))
        }
      })
      return group.toString()
    },
    handleConfig (row) {
      this.handleConfigPeriod(row)
      this.handleConfigCustom(row)
    },
    handleConfigPeriod (row) {
      let str = ''
      if (row.config && row.config.schedulerConfig) {
        const type = row.config.schedulerConfig.type
        if (type === '') {
          str = this.$t('report.oneTime')
        } else { // isRepeat=1 每天，每周，每月
          const period = this.typeMappings.find(m => m.key === type)
          const interval = row.config.schedulerConfig.interval
          const months = row.config.schedulerConfig.months
          if (interval > 1) {
            const unit = this.typeUnitMappings.find(m => m.key === type)
            if (unit) {
              str = this.$t('report.every') + '   ' + interval + '   ' + unit.value
            } else {
              str = '-'
            }
          } else if (interval === 1) {
            if (type === this.scheduleTypeList[2].value) { // 月
              if (this.$_.isEmpty(months)) { // 空代表循环
                str = period.value
              } else { // 非空代表不循环
                str = this.handleConfigArray(months, this.monthList)// X月，Y月
              }
            } else if (period) {
              str = period.value
            } else {
              str = '-'
            }
          }
        }
      }
      this.configPeriod = str
    },
    handleConfigCustom (row) {
      let str = ''
      if (row.config && row.config.schedulerConfig) {
        const type = row.config.schedulerConfig.type
        if (type === '') { // 单次
          str = '-'
        } else { // 每日，每周，每月
          const period = this.typeMappings.find(m => m.key === type)
          if (type === this.scheduleTypeList[0].value) { // 日
            str = '-'
          } else if (type === this.scheduleTypeList[1].value) { // 周
            const weekDates = row.config.schedulerConfig.weekDates
            str = this.handleConfigArray(weekDates, this.weekdayList)
          } else if (type === this.scheduleTypeList[2].value) { // 月
            const monthDates = row.config.schedulerConfig.monthDates// 日期
            const monthWeekDates = row.config.schedulerConfig.monthWeekDates// 哪几周
            const weekDates = row.config.schedulerConfig.weekDates// 周几
            if (!this.$_.isEmpty(monthDates)) {
              str = this.$t('report.date') + '-' + monthDates
            } else {
              if (!this.$_.isEmpty(monthWeekDates)) {
                str += this.$t('report.week') + '-' + this.handleConfigArray(monthWeekDates, this.weekOptions)
              }
              if (!this.$_.isEmpty(weekDates)) {
                str += '    ' + this.handleConfigArray(weekDates, this.weekdayList)
              }
            }
          } else {
            str = '-'
          }
        }
      }
      this.configCustom = str
    }
  },
  beforeUnmount () {
    clearInterval(this.interval)
  }
}
</script>
