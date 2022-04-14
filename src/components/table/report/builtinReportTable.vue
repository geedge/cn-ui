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
      @select="select"
  >
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
            {{scope.row.startTime}}-{{scope.row.endTime}}
          </template>
        </span>
        <span v-if="item.prop === 'type'">
            {{scope.row.reportTemp.name}}
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
          <div class="table-operation-item--down" @click="tableOperation(['download', scope.row])">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#cn-icon-download2"></use>
            </svg>
          </div>
          <div class="table-operation-item--preview" @click="tableOperation(['preview', scope.row])">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#cn-icon-preview"></use>
            </svg>
          </div>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <div class="table-operation-all">
    <el-checkbox v-model="checkboxAll" @change="builtinReportCheckbox(tableData)"></el-checkbox>
    <div class="table-operation-all-span">
      <span>{{ $t('overall.all') }}</span>
      <div class="table-operation-back-down" :class="{'table-operation-all-checkbox': batchDow, 'table-operation-all-loading': loading}" @click="tableOperation(['download', this.checkboxIds, 'builtin'])">
        <loading :loading="loading"></loading>
        <span>{{$t('report.batchDow')}}</span>
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
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.chart.remark'),
          prop: 'remark',
          show: true
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('report.dataRange'),
          prop: 'dataRange',
          show: true,
          minWidth: 110
        }
      ],
      checkboxAll: false,
      checkboxIds: '',
      batchDow: false,
      builtinId: '',
      indeterminate: false,
      loading: false
    }
  },
  methods: {
    selectionChange (objs) {
      this.$emit('selectionChange', objs)
      this.checkboxIds = objs.map(item => { return item.id }).join(',')
      this.checkboxAll = objs.length > 0 || objs.length === this.tableData.length
      this.batchDow = objs.length > 0
    },
    builtinReportCheckbox (objs) {
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
