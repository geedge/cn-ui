<template>
  <div class="cn-chart__table">
    <div class="cn-chart__body">
      <el-table
          style="width: 100%"
          tooltip-effect="light"
          :data="table.currentPageData"
      >
        <el-table-column :width="60" v-if="table.currentPageData.length" type="index" label="#">
        </el-table-column>
        <el-table-column
            v-for="c in table.tableColumns.common"
            show-overflow-tooltip
            :key="c"
            :label="$t(chartTableColumnMapping[c] || c)"
            :prop="c"
        >
        </el-table-column>
        <el-table-column
            v-for="c in table.tableColumns.order"
            show-overflow-tooltip
            :key="c"
            :label="$t(chartTableColumnMapping[c] || c)"
            :prop="c"
        >
          <template #header>{{$t(chartTableColumnMapping[c] || c)}}</template>
          <template #default="{ row }">
            <span v-if="c === 'bytes'">
                {{unitConvert(row[c], unitTypes.byte).join(' ')}}
            </span>
            <span v-else-if="c === 'packets' || c === 'sessions'">
                {{unitConvert(row[c], unitTypes.number).join(' ')}}
            </span>
            <span v-else-if="c === 'responseFailRate'">
                {{unitConvert(row[c], unitTypes.percent).join(' ')}}
            </span>
            <span v-else-if="c === 'dnsLatency'">
                {{unitConvert(row[c], unitTypes.time).join(' ')}}
            </span>
            <span v-else>
                {{row[c]}}
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
import { unitTypes, chartTableColumnMapping } from '@/utils/constants'
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
      chartTableColumnMapping,
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
    }
  },
  mounted () {
  }
}
</script>
