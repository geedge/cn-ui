<template>
    <el-table
            v-loading="loading"
            class="pie-table"
            :data="tableData"
            style="width: 100%;border: 1px solid #E7EAED"
            :size="'mini'"
            :height="'100%'">
        <el-table-column type="expand" :min-width="'5%'">
            <template #default="props">
                <el-table
                        class="expand-table"
                        :data=" props.row.children"
                        style="width: 100%;"
                        :show-header="false"
                        :size="'mini'"
                        :height="'100%'">
                    <el-table-column
                            min-width="5%">
                    </el-table-column>
                    <el-table-column
                            v-for="(item, index) in tableTitles"
                            :key="index"
                            :min-width="item.width"
                            :label="item.label"
                            :prop="item.prop">
                    </el-table-column>
                </el-table>
            </template>
        </el-table-column>
        <el-table-column
                v-for="(item, index) in tableTitles"
                :key="index"
                :min-width="item.width"
                :label="item.label"
                :prop="item.prop">
        </el-table-column>
    </el-table>
</template>

<script>
export default {
  name: 'PieTable',
  props: {
    tableData: Array
  },
  watch: {
    tableData: {
      deep: true,
      immediate: true,
      handler (n) {
        console.log(n)
      }
    }
  },
  data () {
    return {
      loading: false,
      tableTitles: [
        {
          label: this.$t('chart.pieTable.domain'),
          prop: 'domain',
          width: '20%'
        },
        {
          label: this.$t('chart.pieTable.sessions'),
          prop: 'sessions',
          width: '25%'
        },
        {
          label: this.$t('chart.pieTable.packets'),
          prop: 'packets',
          width: '25%'
        },
        {
          label: this.$t('chart.pieTable.bytes'),
          prop: 'bytes',
          width: '25%'
        }
      ]
    }
  }
}
</script>

<style scoped>
/deep/ .el-table__expanded-cell[class*=cell]{
    padding: 0;
}
    .expand-table /deep/ .el-table__body .el-table__row:last-of-type td{
        border: none;
    }
    .pie-table{
        font-family: Roboto-Medium;
        font-size: 14px;
        color: #333333;
        font-weight: 500;
    }
    .expand-table{
        font-weight: 400;
        color: #606266;
    }
</style>
