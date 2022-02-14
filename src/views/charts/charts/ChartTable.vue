<template>
  <div class="cn-chart__table">
    <div class="cn-chart__body">
      <el-table
          style="width: 100%"
          tooltip-effect="light"
          :data="table.currentPageData"
      >
        <el-table-column v-if="table.currentPageData.length" type="index" label="#">
        </el-table-column>
        <el-table-column
            v-for="(c, i) in table.tableColumns"
            show-overflow-tooltip
            :key="i"
            :label="c.label"
            :prop="c.prop"
        >
          <template #header>{{$t(c.label)}}</template>
          <template #default="{ row }">
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
    <div class="cn-chart__footer" v-if="table.tableData.length > 10">
      <chart-table-pagination
          ref="tablePagination"
          :total="table.tableData.length"
          @pageJump="pageJump"
      ></chart-table-pagination>
    </div>
  </div>
</template>

<script>
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import ChartTablePagination from '@/views/charts/charts/ChartTablePagination'
export default {
  name: 'ChartTable',
  components: {
    ChartTablePagination
  },
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object,
    table: Object
  },
  data () {
    return {
      unitConvert,
      unitTypes
    }
  },
  methods: {
    pageJump (val) {
      this.table.currentPageData = this.getTargetPageData(val, this.table.pageSize, this.table.tableData)
    },
    getTargetPageData (pageNum, pageSize, tableData) {
      return this.$_.slice(tableData, (pageNum - 1) * pageSize, pageNum * pageSize)
    },
  },
  mounted() {
  }
}
</script>

