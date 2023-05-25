<template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
  >
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      width="55">
    </el-table-column>
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
  </el-table>
</template>

<script>
import table from '@/mixins/table'
export default {
  name: 'roleTable',
  mixins: [table],
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
      ],
      isRefresh: true
    }
  },
  watch: {
    customTableTitles (n) {
      // 数据变化，界面未渲染，vue3.2弃用$set,使用reactive绑定数组，界面也未响应，该方法不优美，后续有更佳替代方案时替换
      if (n && n.length > 0) {
        if (n[0].flag === 'drag') {
          // 重新渲染，会导致界面偶现闪的情况，点击checkbox时界面闪会比较丑，故不处理点击的情况
          this.isRefresh = false
          this.$nextTick(() => {
            this.isRefresh = true
          })
        }
      }
    }
  }
}
</script>
