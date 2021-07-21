<template>
  <div class="cn-chart cn-chart__table">
    <div class="cn-chart__header">
      <div class="header__title">
        <slot name="title"></slot>
      </div>
      <div class="header__operations">
        <slot name="operations"></slot>
      </div>
    </div>
    <div class="cn-chart__body">
      <el-table
          style="width: 100%"
          tooltip-effect="light"
          :data="tableData"
      >
        <el-table-column
            type="index"
            label="#"
        >
        </el-table-column>
        <el-table-column
            v-for="(c, i) in tableColumns"
            show-overflow-tooltip
            :key="i"
            :label="c.label"
            :prop="c.prop"
        >
          <template #header>{{c.label}}</template>
          <template #default="{ row }">{{}}
            <span v-if="c.prop === 'bytes'">
                {{unitConvert(row[c.prop], unitTypes.byte).join(' ')}}
            </span>
            <span v-else-if="c.prop === 'packets' || c.prop === 'sessions'">
                {{unitConvert(row[c.prop], unitTypes.number).join(' ')}}
            </span>
            <span v-else>
                {{row[c.prop]}}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="cn-chart__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
export default {
  name: 'ChartTable',
  props: {
    tableColumns: Array,
    tableData: Array
  },
  setup () {
    return {
      unitTypes,
      unitConvert
    }
  }
}
</script>

<style>

</style>
