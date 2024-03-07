<template>
  <el-table
      id="i18nTable"
      ref="dataTable"
      :data="tableData"
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
        width="55">
    </el-table-column>
    <el-table-column
        v-for="item in customTableTitles"
        :key="item.prop"
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
        <span>{{scope.row[item.prop] || '-'}}</span>
      </template>
    </el-table-column><template v-slot:empty >
    <div class="table-no-data" v-if="isNoData">
      <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
    </div>
  </template>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { api } from '@/utils/api'

export default {
  name: 'I18nTable',
  mixins: [table],
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      url: api.i18nLang,
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 100,
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
