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
          <div class="table-operation-item--down" @click="tableOperation(['download', scope.row])"><i class="cn-icon cn-icon-download2"></i></div>
          <div class="table-operation-item--preview" @click="tableOperation(['preview', scope.row])"><i class="cn-icon cn-icon-preview"></i></div>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <div class="table-operation-all">
    <el-checkbox v-model="checkboxAll" @change="builtinReportCheckbox(tableData)"></el-checkbox>
    <div class="table-operation-all-span">
      <span>{{ $t('overall.all') }}</span>
      <span :class="{'table-operation-all-checkbox': batchDow}" :disabled="checkboxAll" @click="tableOperation(['download', this.checkboxIds, 'builtin'])">{{$t('report.batchDow')}}</span>
    </div>
  </div>
</template>

<script>
import table from '@/mixins/table'
export default {
  name: 'builtinReportTable',
  mixins: [table],
  props: {
    builtinReportLeftMenu: Number
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
          show: true
        }
      ],
      checkboxAll: false,
      checkboxIds: '',
      batchDow: false,
      builtinId: '',
      indeterminate: false
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
