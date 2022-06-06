<template>
  <el-table
      id="userTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @expand-change="dropExpandChange"
      @selection-change="selectionChange"
  >
    <el-table-column type="expand">
      <template #default="props">
        <div class="down">
          <loading :loading="loadingDown"></loading>
          <div class="block drop-down-time">
            <el-date-picker
                v-model="value"
                size="small"
                :format="format"
                type="datetimerange"
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"
                @change="datePickerChange(props)"
            />
          </div>
          <div class="expand">
            <div class="expand-cell" v-for="(item, index) in downDataList" :key="index">
              <div class="expand-right">
                <div class="demo-progress">
                  <el-progress type="circle" :percentage="item.percent" :color="item.percent === 100 ? '#5cb87a' : '#1989fa'" />
                </div>
              </div>
              <div class="expand-left">
                <div class="expand-name"><i class="cn-icon cn-icon-user"></i>{{ username }}</div>
                <div class="expand-time">
                  <div>{{ $t('report.creationTime') }}</div>
                  <div>{{dateFormatByAppearance(item.ctime)}}</div>
                </div>
                <div class="expand-icon">
                  <div class="table-operation-item--no-border" @click="tableOperation(['download', item])">
                    <loading :loading="loadingTableId === item.id"></loading>
                    <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingTableId}">
                      <use xlink:href="#cn-icon-download2"></use>
                    </svg>
                  </div>
                  <div class="table-operation-item--no-border" @click="tableOperation(['preview', item])">
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
                :pageSizeForAlarm="pageObj.pageSize"
            ></chart-detection-pagination>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        width="55">
    </el-table-column>
    <el-table-column
        v-for="(item, index) in customTableTitles"
        :key="`col-${index}`"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
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
          {{scope.row.config.timeConfig.type}}
        </span>
        <span v-else-if="item.prop === 'utime'">
          {{dateFormatByAppearance(scope.row.utime)}}
        </span>
        <span v-else>{{scope.row[item.prop]}}</span>
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
          <!--          <div class="table-operation-item&#45;&#45;no-border" @click="tableOperation(['rerun', scope.row])">
                      <loading :loading="loadingPreviewId === scope.row.id"></loading>
                      <svg class="icon2" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                        <use xlink:href="#cn-icon-refresh"></use>
                      </svg>
                    </div>-->
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
import { getSecond } from '@/utils/date-util'
import chartDetectionPagination from '@/views/charts/charts/chartDetectionPagination'
export default {
  name: 'builtinReportTable',
  mixins: [table],
  components: {
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
          minWidth: 80
        }, {
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('report.timeLimit'),
          prop: 'timeLimit',
          show: true
        }, {
          label: this.$t('report.timePlan'),
          prop: 'type',
          show: true,
          minWidth: 110
        }, {
          label: this.$t('report.operationUserName'),
          prop: 'userName',
          show: true,
          minWidth: 170
        }, {
          label: this.$t('report.resultCount'),
          prop: 'resultCount',
          show: true,
          minWidth: 130
        }, {
          label: this.$t('report.lastModified'),
          prop: 'utime',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: this.$t('report.lastExecutionTime'),
          prop: 'lastExecutionTime',
          show: true,
          minWidth: 200,
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
        pageSize: 30,
        total: 0,
        resetPageNo: true
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
    dropExpandChange (row, rows) {
      const isExpand = rows.some(t => t.id === row.id)
      if (isExpand) {
        this.dropDownQueryChange({ tempId: row.id })
      }
    },
    datePickerChange (props) {
      const row = {
        tempId: props.row.id,
        startTime: getSecond(new Date(this.value[0]).getTime()),
        endTime: getSecond(new Date(this.value[1]).getTime())
      }
      this.dropDownQueryChange(row)
    },
    dropDownQueryChange (row) {
      this.loadingDown = true
      get(api.reportJob, row).then(res => {
        if (res.code === 200) {
          this.downDataList = res.data.list
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
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    pageJump (val) {

    }
  },
  setup () {
    const value = ref('')
    return {
      value
    }
  }
}
</script>
