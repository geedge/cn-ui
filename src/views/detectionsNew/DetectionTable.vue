<template>
  <el-table
      id="detectionTable"
      class="detection-table"
      ref="dataTable"
      :data="tableData"
      height="100%"
      border
      empty-text=" "
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @row-dblclick="rowDoubleClick"
  >
    <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        :selectable="selectable"
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
        class="data-column"
    >
      <template #header>
        <span class="data-column__span">{{ item.label }}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
        <template v-if="item.prop === 'name'">
          <template v-if="scope.row.i18n">
            <span :title="scope.row[item.prop]">{{ $t(scope.row.i18n) }}</span>
          </template>
          <template v-else-if="scope.row.name">
            <span :title="scope.row[item.prop]">{{ scope.row.name }}</span>
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'status'">
          <div :class="`detection-tag-status${scope.row[item.prop]}`">
            {{ $t(switchStatus(scope.row[item.prop])) }}
          </div>
        </template>
        <template v-else-if="item.prop === 'description'">
          <div style="padding-right: 20px">{{ scope.row[item.prop] }}</div>
        </template>
        <template v-else-if="item.prop === 'dimensions' && scope.row[item.prop]">
          <span class="detection-tag-blue">{{ scope.row[item.prop] }}</span>
        </template>
        <template v-else-if="item.prop === 'library' && scope.row[item.prop]">
          <span class="detection-table-library">{{ scope.row[item.prop] }}</span>
        </template>
        <span v-else>{{ scope.row[item.prop] || '-' }}</span>
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
import { switchStatus } from '@/utils/tools'

export default {
  name: 'DetectionTable',
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  mixins: [table],
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('knowledge.status'),
          prop: 'status',
          show: true,
          minWidth: 70
        },
        {
          label: 'ID',
          prop: 'ruleId',
          show: true,
          minWidth: 65
        },
        {
          label: this.$t('config.roles.name'),
          prop: 'name',
          minWidth: 90,
          show: true
        },
        {
          label: this.$t('overall.category'),
          prop: 'category',
          minWidth: 140,
          show: true
        },
        {
          label: this.$t('overall.type'),
          prop: 'eventType',
          minWidth: 145,
          show: true
        },
        {
          label: this.$t('overall.remark'),
          prop: 'description',
          minWidth: 205,
          show: true
        },
        {
          // label: this.$t('config.user.createTime'),
          label: 'Dimensions',
          prop: 'dimensions',
          minWidth: 204,
          show: true
        },
        {
          // label: this.$t('config.user.createTime'),
          label: 'Library',
          prop: 'library',
          minWidth: 204,
          show: true
        }
      ]
    }
  },
  watch: {
    tableData: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          n.forEach(t => {
            if (t.ruleType === 'indicator_match') {
              t.library = t.ruleConfigObj.knowledgeBase.name
            } else if (t.ruleType === 'threshold') {
              t.dimensions = t.ruleConfigObj.dimensions
            }
          })
        }
      }
    }
  },
  methods: {
    dateFormatByAppearance,
    switchStatus,
    rowDoubleClick (data) {
      this.$emit('rowDoubleClick', data)
    }
  }
}
</script>

<style lang="scss">

</style>
