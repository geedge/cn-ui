<template>
  <el-table
      id="userTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
  >
    <el-table-column type="expand">
      <template #default="props">
        <div class="expand">
          <dov class="expand-cell">
            <div class="expand-right">
              <div class="demo-progress">
                <el-progress type="circle" :percentage="percentage" :color="percentage === 100 ? '#5cb87a' : '#1989fa'" />
              </div>
            </div>
            <div class="expand-left">
              <div class="expand-name"><i class="cn-icon"></i>admin</div>
              <div class="expand-time">
                <div>{{ $t('report.creationTime') }}</div>
                <div>{{props.row.startTime}}</div>
              </div>
              <div class="expand-icon">
                <div class="table-operation-item--no-border" @click="tableOperation(['download', props.row, 1])">
                  <loading :loading="loadingTableId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingTableId}">
                    <use xlink:href="#cn-icon-download2"></use>
                  </svg>
                </div>
                <div class="table-operation-item--no-border" @click="tableOperation(['preview', props.row])">
                  <loading :loading="loadingPreviewId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                    <use xlink:href="#cn-icon-preview"></use>
                  </svg>
                </div>
                <div class="table-operation-item--no-border" @click="tableOperation(['delete', props.row])">
                  <loading :loading="loadingPreviewId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                    <use xlink:href="#cn-icon-shanchu"></use>
                  </svg>
                </div>
              </div>
            </div>
          </dov>
          <dov class="expand-cell">
            <div class="expand-right">
              <div class="demo-progress">
                <el-progress type="circle" :percentage="percentage" :color="percentage === 100 ? '#5cb87a' : '#1989fa'" />
              </div>
            </div>
            <div class="expand-left">
              <div class="expand-name"><i class="cn-icon"></i>admin</div>
              <div class="expand-time">
                <div>{{ $t('report.creationTime') }}</div>
                <div>{{props.row.startTime}}</div>
              </div>
              <div class="expand-icon">
                <div class="table-operation-item--no-border" @click="tableOperation(['download', props.row, 1])">
                  <loading :loading="loadingTableId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingTableId}">
                    <use xlink:href="#cn-icon-download2"></use>
                  </svg>
                </div>
                <div class="table-operation-item--no-border" @click="tableOperation(['preview', props.row])">
                  <loading :loading="loadingPreviewId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                    <use xlink:href="#cn-icon-preview"></use>
                  </svg>
                </div>
                <div class="table-operation-item--no-border" @click="tableOperation(['delete', props.row])">
                  <loading :loading="loadingPreviewId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                    <use xlink:href="#cn-icon-shanchu"></use>
                  </svg>
                </div>
              </div>
            </div>
          </dov>
          <dov class="expand-cell">
            <div class="expand-right">
              <div class="demo-progress">
                <el-progress type="circle" :percentage="percentage" :color="percentage === 100 ? '#5cb87a' : '#1989fa'" />
              </div>
            </div>
            <div class="expand-left">
              <div class="expand-name"><i class="cn-icon"></i>admin</div>
              <div class="expand-time">
                <div>{{ $t('report.creationTime') }}</div>
                <div>{{props.row.startTime}}</div>
              </div>
              <div class="expand-icon">
                <div class="table-operation-item--no-border" @click="tableOperation(['download', props.row, 1])">
                  <loading :loading="loadingTableId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingTableId}">
                    <use xlink:href="#cn-icon-download2"></use>
                  </svg>
                </div>
                <div class="table-operation-item--no-border" @click="tableOperation(['preview', props.row])">
                  <loading :loading="loadingPreviewId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                    <use xlink:href="#cn-icon-preview"></use>
                  </svg>
                </div>
                <div class="table-operation-item--no-border" @click="tableOperation(['delete', props.row])">
                  <loading :loading="loadingPreviewId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                    <use xlink:href="#cn-icon-shanchu"></use>
                  </svg>
                </div>
              </div>
            </div>
          </dov>
          <dov class="expand-cell">
            <div class="expand-right">
              <div class="demo-progress">
                <el-progress type="circle" :percentage="percentage" :color="percentage === 100 ? '#5cb87a' : '#1989fa'" />
              </div>
            </div>
            <div class="expand-left">
              <div class="expand-name"><i class="cn-icon"></i>admin</div>
              <div class="expand-time">
                <div>{{ $t('report.creationTime') }}</div>
                <div>{{props.row.startTime}}</div>
              </div>
              <div class="expand-icon">
                <div class="table-operation-item--no-border" @click="tableOperation(['download', props.row, 1])">
                  <loading :loading="loadingTableId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingTableId}">
                    <use xlink:href="#cn-icon-download2"></use>
                  </svg>
                </div>
                <div class="table-operation-item--no-border" @click="tableOperation(['preview', props.row])">
                  <loading :loading="loadingPreviewId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                    <use xlink:href="#cn-icon-preview"></use>
                  </svg>
                </div>
                <div class="table-operation-item--no-border" @click="tableOperation(['delete', props.row])">
                  <loading :loading="loadingPreviewId === props.row.id"></loading>
                  <svg class="icon" aria-hidden="true" :class="{'table-operation-all-loading': loadingPreviewId}">
                    <use xlink:href="#cn-icon-shanchu"></use>
                  </svg>
                </div>
              </div>
            </div>
          </dov>
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
        <span v-if="item.prop === 'dataRange'">
          <template v-if="scope.row.startTime && scope.row.endTime">
            {{dateFormatByAppearance(scope.row.startTime)}}<span style="padding: 0 5px">-</span>{{dateFormatByAppearance(scope.row.endTime)}}
          </template>
        </span>
        <span v-else-if="item.prop === 'type'">
            {{scope.row.reportTemp.name}}
        </span>
        <span v-else-if="item.prop === 'state'">
            {{getJobStatus(scope.row)}}
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
        <div class="table-operation-items" v-if="scope.row.state === 1">
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
export default {
  name: 'builtinReportTable',
  mixins: [table],
  components: {
    Loading
  },
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true
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
          prop: 'timePlan',
          show: true,
          minWidth: 110
        }, {
          label: this.$t('report.operationUserName'),
          prop: 'operationUserName',
          show: true
        }, {
          label: this.$t('report.resultCount'),
          prop: 'resultCount',
          show: true,
          width: 130
        }, {
          label: this.$t('report.lastModified'),
          prop: 'LastModified',
          show: true,
          width: 130,
          sortable: 'custom'
        }, {
          label: this.$t('report.lastExecutionTime'),
          prop: 'lastExecutionTime',
          show: true,
          width: 130,
          sortable: 'custom'
        }
      ],
      checkboxAll: false,
      checkboxIds: '',
      batchDow: false,
      builtinId: '',
      indeterminate: false,
      loading: false,
      loadingTableId: '',
      loadingPreviewId: '',
      percentage: 80
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
    }
  }
}
</script>
