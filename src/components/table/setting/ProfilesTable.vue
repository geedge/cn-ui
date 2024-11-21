<template>
  <el-table
      id="userTable"
      ref="dataTable"
      :data="tableData"
      tooltip-effect="light"
      empty-text=" "
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      :row-class-name="tableRowClassName"
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
    >
      <template #header>
        <span class="data-column__span">{{ item.label }}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
        <template v-if="item.prop === 'ctime' || item.prop === 'utime'">
          <template v-if="scope.row[item.prop]">
            {{ dateFormatByAppearance(scope.row[item.prop]) || '-' }}
          </template>
          <template v-else><span>-</span></template>
        </template>
        <template v-if="item.prop === 'entitySource'">
          {{ scope.row[item.prop]?.name || '-' }}
        </template>
        <template v-if="item.prop === 'entities' || item.prop === 'relations'">
          {{ handleListTypes(scope.row[item.prop]) }}
        </template>
      </template>
    </el-table-column>
    <template v-slot:empty>
      <div class="table-no-data" v-if="isNoData">
        <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
      </div>
    </template>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { dateFormatByAppearance } from '@/utils/date-util'

export default {
  name: 'SourcesTable',
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          minWidth: 50,
          sortable: 'custom'
        },
        {
          label: this.$t('setting.source'),
          prop: 'entitySource',
          show: true,
          sortable: 'custom',
          minWidth: 100
        },
        {
          label: this.$t('setting.entityTypes'),
          prop: 'entities',
          show: true,
          minWidth: 150
        },
        {
          label: this.$t('setting.relationTypes'),
          prop: 'relations',
          show: true,
          minWidth: 200
        },
        {
          label: this.$t('config.user.createTime'),
          prop: 'ctime',
          show: true,
          minWidth: 150
        },
        {
          label: this.$t('overall.updateTime'),
          prop: 'utime',
          show: true,
          minWidth: 150
        }
      ]
    }
  },
  methods: {
    dateFormatByAppearance,
    // 禁止勾选buildIn为1的项，即禁止修改、删除admin的账号
    checkSelectable (row) {
      return row.isBuiltIn !== 1
    },
    handleListTypes (data) {
      let str = ''
      if (data && typeof data === 'string') {
        data = JSON.parse(data)
        data.forEach(item => {
          if (!str) {
            str = item.type + ','
          } else if (str.indexOf(item.type) < 0) {
            str += item.type + ','
          }
        })
        str = str.slice(0, -1) || '-'
      } else {
        str = '-'
      }
      return str
    },
    tableRowClassName (row) {
      if (row.row.isBuiltIn === 1) {
        return 'table-disabled-row'
      }
    }
  }
}
</script>
