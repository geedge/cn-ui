<template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    empty-text=" "
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
  >
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      :selectable="checkSelectable"
      width="55">
    </el-table-column>
    <!--key只使用item.prop的话，拖拽后，界面无响应，添加index后问题解决-->
    <el-table-column
      v-for="(item, index) in customTableTitles"
      :key="item.prop+index"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sort-orders="['ascending', 'descending']"
      :sortable="item.sortable"
      :width="`${item.width}`"
      class="data-column"
    >
      <template #header>
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template  #default="scope" :column="item">
        <template v-if="item.prop === 'name'">
          <template v-if="scope.row.i18n">
            <span>{{$t(scope.row.i18n)}}</span>
          </template>
          <template v-else-if="scope.row.name">
            <span>{{scope.row.name}}</span>
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <span v-else>{{scope.row[item.prop]}}</span>
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
export default {
  name: 'roleTable',
  mixins: [table],
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tableTitle: [ // 原table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 100,
          sortable: 'custom'
        }, {
          label: this.$t('config.roles.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true
        }
      ]
    }
  },
  methods: {
    // 禁止勾选buildIn为1的项，即禁止修改admin的权限
    checkSelectable (row) {
      return row.buildIn !== 1
    }
  }
}
</script>
