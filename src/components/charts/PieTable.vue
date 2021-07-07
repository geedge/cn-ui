<template>
    <el-table
            v-loading="loading"
            ref="table"
            class="pie-table"
            :data="pieTableData"
            style="width: 100%;border: 1px solid #E7EAED"
            @expand-change="expandChange"
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
                            v-for="(item, index) in tableTitlesOther"
                            :key="index"
                            :min-width="item.width"
                            :label="item.label"
                            :prop="item.prop"
                            #default="{row}">
            <span v-if="item.prop === 'nameColumn'">
                {{nameColumn === 'fqdnCategoryName' ? row['fqdnCategoryName'] : row['reputationLevel'] }}
            </span>
                        <span v-else-if="item.prop === 'bytes' || item.prop === 'packets' || item.prop === 'sessions'" >
                {{shortFormatter(row[item.prop])}}
            </span>
                        <span v-else>
                {{row[item.prop]}}
            </span>
                    </el-table-column>
                </el-table>
            </template>
        </el-table-column>
        <el-table-column
                v-for="(item, index) in tableTitles"
                :key="index"
                :min-width="item.width"
                :label="item.label"
                :prop="item.prop"
                #default="{row}">
            <span v-if="item.prop === 'nameColumn'">
                {{nameColumn === 'fqdnCategoryName' ? row['categoryName'] : row['reputationLevel'] }}
            </span>
            <span v-else-if="item.prop === 'bytes' || item.prop === 'packets' || item.prop === 'sessions'" >
                {{shortFormatter(row[item.prop])}}
            </span>
            <span v-else>
                {{row[item.prop]}}
            </span>
        </el-table-column>
    </el-table>
</template>

<script>
import { shortFormatter } from '@/components/charts/chartFormatter'
import { get } from '@/utils/http'
import { replaceUrlPlaceholder } from '@/utils/tools'
export default {
  name: 'PieTable',
  props: {
    tableData: Array,
    chartInfo: Object,
    order: String,
    startTime: {
      type: Number
    },
    endTime: {
      type: Number
    }
  },
  watch: {
    tableData: {
      deep: true,
      immediate: true,
      handler (n) {
        this.pieTableData = JSON.parse((JSON.stringify(n)))
        this.pieTableData.forEach(item => {
          item.children = []
        })
      }
    },
    pieTableData: {
      handler (n) {
      }
    },
    chartInfo: {
      deep: true,
      immediate: true,
      handler (n) {
        if (n && n.params) {
          this.nameColumn = JSON.parse(n.params).nameColumn
        }
      }
    }
  },
  data () {
    return {
      loading: false,
      nameColumn: '',
      pieTableData: [],
      tableTitles: [
        {
          label: this.$t('chart.pieTable.domain'),
          prop: 'domain',
          width: '20%'
        },
        {
          label: this.$t('chart.pieTable.nameColumn'),
          prop: 'nameColumn',
          width: '22%'
        },
        {
          label: this.$t('chart.pieTable.sessions'),
          prop: 'sessions',
          width: '18%'
        },
        {
          label: this.$t('chart.pieTable.packets'),
          prop: 'packets',
          width: '18%'
        },
        {
          label: this.$t('chart.pieTable.bytes'),
          prop: 'bytes',
          width: '18%'
        }
      ],
      tableTitlesOther: [
        {
          label: this.$t('chart.pieTable.serverIp'),
          prop: 'serverIp',
          width: '20%'
        },
        {
          label: this.$t('chart.pieTable.nameColumn'),
          prop: 'nameColumn',
          width: '22%'
        },
        {
          label: this.$t('chart.pieTable.sessions'),
          prop: 'sessions',
          width: '18%'
        },
        {
          label: this.$t('chart.pieTable.packets'),
          prop: 'packets',
          width: '18%'
        },
        {
          label: this.$t('chart.pieTable.bytes'),
          prop: 'bytes',
          width: '18%'
        }
      ]
    }
  },
  methods: {
    shortFormatter: shortFormatter,
    // rowChange (echartParams) {
    //   const nameColumnKey = this.nameColumn === 'fqdnCategoryName' ? 'categoryName' : 'reputationLevel'
    //   const row = this.pieTableData.find(item => echartParams.name === item[nameColumnKey])
    //   this.toggleRowExpansion(row)
    // },
    // toggleRowExpansion (row) {
    //   this.$refs.table.toggleRowExpansion(row)
    // },
    expandChange (row) {
      const nameColumnKey = this.nameColumn === 'fqdnCategoryName' ? 'categoryName' : 'reputationLevel'
      const url = JSON.parse(this.chartInfo.params).urlChildrenTable
      const queryParams = { startTime: parseInt(this.startTime / 1000), endTime: parseInt(this.endTime / 1000), order: this.order, domain: row.domain }
      get(replaceUrlPlaceholder(url, queryParams)).then(response2 => {
        if (response2.code === 200) {
          row.children = response2.data.result
        }
      })
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
