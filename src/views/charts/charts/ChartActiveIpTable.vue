<template>
  <div class="cn-chart__table active-ip">
    <div class="cn-chart__body">
      <el-table
          style="width: 100%;height: 100%"
          tooltip-effect="light"
          :data="activeIpTable.tableData"
          :show-header="false"
          :cell-style="{padding:'7px 0'}"
      >
        <el-table-column>
          <template #default="{ row }">
            <div class="active-ip__icon"><i class="cn-icon cn-icon-ip ip-green"></i></div>
            <div class="active-ip__content" >
              {{row['name']}}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center">
          <template #default="{ row }">
            <span>
                {{row['num']}}
            </span>
          </template>
        </el-table-column>

        <el-table-column
            v-for="c in table.tableColumns"
            show-overflow-tooltip
            :key="c"
            :label="c"
            :prop="c"
        >
          <template #default="{ row }">
            <span v-if="c === 'bytes'">
                {{unitConvert(row[c], unitTypes.byte).join(' ')}}
            </span>
            <span v-else-if="c === 'packets' || c === 'sessions'">
                {{unitConvert(row[c], unitTypes.number).join(' ')}}
            </span>
            <span v-else>
                {{row[c]}}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
export default {
  name: 'ChartActiveIpTable',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object,
    table: Object
  },
  data () {
    return {
      unitConvert,
      unitTypes,
      activeIpTable: {
        orderBy: 'machine',
        tableData: [
          {
            name: '192.168.20.21',
            num: 111

          }, {
            name: '192.168.20.22',
            num: 345
          }, {
            name: '192.168.20.23',
            num: 111

          }, {
            name: '192.168.20.24',
            num: 345
          }, {
            name: '192.168.20.25',
            num: 111

          }, {
            name: '192.168.20.26',
            num: 345
          }
        ] // table的所有数据
      }
    }
  },
  mounted () {
  }
}
</script>
