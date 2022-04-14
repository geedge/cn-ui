<template>
  <el-table
      id="i18nTable"
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
        <span>{{scope.row[item.prop]}}</span>
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
          <button class="table-operation-item" @click="tableOperation(['edit', scope.row])"><i class="cn-icon cn-icon-edit"></i></button>
          <el-dropdown size="medium" trigger="hover" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more">
              <i class="cn-icon cn-icon-more-arrow-down"></i>
            </div>
            <template #dropdown>
              <el-dropdown-menu >
                <el-dropdown-item :command="['delete', scope.row]" :disabled="scope.row.id === 1"><i class="cn-icon cn-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { api } from '@/utils/api'

export default {
  name: 'I18nTable',
  mixins: [table],
  data () {
    return {
      url: api.i18nLang,
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('config.i18n.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        },
        {
          label: this.$t('config.i18n.code'),
          prop: 'code',
          show: true,
          sortable: 'custom'
        },
        {
          label: this.$t('config.i18n.lang'),
          prop: 'lang',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.i18n.value'),
          prop: 'value',
          show: true,
          width: 150
        }
      ]
    }
  }
}
</script>
