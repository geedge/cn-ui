<template>
  <el-table
      id="reportTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      :expand-row-keys="expandedIds"
      row-key="id"
      border
      tooltip-effect="light"
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @expand-change="dropExpandChange"
      @selection-change="selectionChange"
  >
    <el-table-column type="expand" width="30">
      <template #default="props">
        <div class="down">
          <loading :loading="loadingDown"></loading>
          <div class="block drop-down-time">
            <el-date-picker
                v-model="timeRange"
                size="small"
                :format="format"
                type="datetimerange"
                range-separator="To"
                :start-placeholder="$t('detections.startTime')"
                :end-placeholder="$t('detections.endTime')"
                @change="datePickerChange(props.row)"
            />
          </div>
          <div class="expand">
            <chart-no-data v-if="downDataList.length === 0 && !loadingDown"></chart-no-data>
            <div class="expand-cell" v-for="(item, index) in downDataList" :key="index">
              <div class="expand-right">
                <div class="demo-progress">
                  <el-progress type="circle" :percentage="computePercent(item)" :color="computePercent(item) === 100 ? '#21bf9a' : '#50b3ef'">
                    <template #default="{ percentage }">
                      <span style="font-size: 0.875rem;">{{ percentage }}%</span>
                    </template>
                  </el-progress>
                </div>
              </div>
              <div class="expand-left">
                <div class="expand-name"><i class="cn-icon cn-icon-user"></i>{{ username }}</div>
                <div class="expand-time">
                  <div>{{ $t('report.creationTime') }}</div>
                  <div>{{dateFormatByAppearance(item.ctime)}}</div>
                </div>
                <div class="expand-icon">
                  <div class="table-operation-item--no-border" :class="{'table-operation-item--disabled': computePercent(item) < 100}" @click="reportOperation(['download', item])">
                    <loading :loading="loadingTableId === item.id"></loading>
                    <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingTableId}">
                      <use xlink:href="#cn-icon-download2"></use>
                    </svg>
                  </div>
                  <div class="table-operation-item--no-border" :class="{'table-operation-item--disabled': computePercent(item) < 100}" @click="reportOperation(['preview', item])">
                    <loading :loading="loadingPreviewId === item.id"></loading>
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
        v-for="(item, index) in customTableTitles"
        :key="`col-${index}`"
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
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
        <span v-if="item.prop === 'timeLimit'">
          {{handleTimeRange(scope.row)}}
        </span>
        <span v-else-if="item.prop === 'timePlan'">
          {{(scope.row.config && scope.row.config.schedulerConfig) || '-'}}
        </span>
        <span v-else-if="item.prop === 'userName'">
          {{(scope.row.sysUser && scope.row.sysUser.name) || '-'}}
        </span>
        <span v-else-if="item.prop === 'lastExecutionTime'">
          {{scope.row.lastTime ? dateFormatByAppearance(scope.row.lastTime) : '-'}}
        </span>
        <span v-else-if="item.prop === 'total'">
          {{scope.row[item.prop] || 0}}
        </span>
        <span v-else>{{scope.row[item.prop] || '-'}}</span>
      </template>
    </el-table-column>
    <el-table-column
        :resizable="false"
        :width="operationWidth"
        fixed="right">
      <template #header>
        <div class="table-operation-title">{{$t('overall.option')}}</div>
      </template>
      <template #default="scope">
        <div class="table-operation-items">
          <button class="table-operation-item" @click="tableOperation(['edit', scope.row])"><i class="cn-icon cn-icon-bianji"></i></button>
          <button class="table-operation-item" @click="tableOperation(['delete', scope.row])"><i class="cn-icon cn-icon-shanchu"></i></button>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <div class="table-operation-all">
    <el-checkbox v-model="checkboxAll" @change="selectAll(tableData)"></el-checkbox>
    <div class="table-operation-all-span">
      <span>{{ $t('overall.all') }}</span>
      <div class="table-operation-back-down" :class="{'table-operation-all-checkbox': batchDow, 'table-operation-all-loading': loading}" @click="tableOperation(['delete', this.checkboxIds])">
        <loading :loading="loading"></loading>
        <span>{{$t('report.batchDeletion')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import table from '@/mixins/table'
import Loading from '@/components/common/Loading'
import { del, get } from '@/utils/http'
import { api } from '@/utils/api'
import { storageKey } from '@/utils/constants'
import { ref } from 'vue'
import { dateFormatToUTC, getNowTime } from '@/utils/date-util'
import chartDetectionPagination from '@/views/charts/charts/chartDetectionPagination'
import ChartNoData from '@/views/charts/charts/ChartNoData'
export default {
  name: 'builtinReportTable',
  mixins: [table],
  components: {
    ChartNoData,
    Loading,
    chartDetectionPagination
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
          width: 40
        }, {
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
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
      checkboxIds: '',
      batchDow: false,
      builtinId: '',
      indeterminate: false,
      loading: false,
      loadingDown: false,
      loadingTableId: '',
      loadingPreviewId: '',
      downDataList: [],
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total: 0,
        resetPageNo: true
      },
      expandedIds: []
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
        if (item.percent === 1) {
          if (item.state === 1) {
            return 100
          } else {
            return 99.99
          }
        } else {
          return parseFloat(item.percent * 100).toFixed(2)
        }
      }
    }
  },
  methods: {
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
    selectionChange (objs) {
      this.$emit('selectionChange', objs)
      this.checkboxIds = objs.map(item => { return item.id }).join(',')
      this.checkboxAll = objs.length > 0 || objs.length === this.tableData.length
      this.batchDow = objs.length > 0
    },
    selectAll (objs) {
      if (objs) {
        objs.forEach(item => {
          this.$refs.dataTable.toggleAllSelection(item)
        })
      } else {
        this.$refs.dataTable.clearSelection()
      }
    },
    dropExpandChange (row, expandedRows) {
      this.expandedIds = []
      if (expandedRows.length > 0 && row) {
        this.expandedIds.push(row.id)
        this.datePickerChange(row)
      }
    },
    datePickerChange (row) {
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
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.dropDownQueryChange({ tempId: props.row.id })
            this.$emit('reload')
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    pageJump (val) {
      this.pageObj.pageNo = val
      if (this.expandedIds.length > 0) {
        this.datePickerChange({ id: this.expandedIds[0] })
      }
    }
  },
  setup () {
    const { startTime, endTime } = getNowTime(60 * 24 * 30)
    const timeRange = ref([startTime, endTime])
    return {
      timeRange
    }
  }
}
</script>
