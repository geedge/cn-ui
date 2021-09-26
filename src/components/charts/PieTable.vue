<template>
  <el-table
      ref="table"
      class="pie-table"
      :data="pieTableData"
      style="width: 100%;border: 1px solid #E7EAED"
      :row-key="getRowKey"
      @expand-change="currentChange"
      current-row-key="domain"
      tooltip-effect="light"
      :expand-row-keys="expandRowKeys"
      :size="'mini'"
      :height="'100%'">
    <el-table-column type="expand" :min-width="'5%'">
      <template #default="props">
        <div style="position: relative">
          <div class="chart__loading" style="top: 0; height: 100%; z-index: 1;" v-show="loading">
            <i class="el-icon-loading"></i>
          </div>
          <el-table
              tooltip-effect="light"
              class="expand-table"
              :data="childrenTableData"
              style="width: 100%;"
              :show-header="false"
              :size="'mini'"
              :height="'100%'">
            <el-table-column
                width="48">
            </el-table-column>
            <el-table-column
                v-for="(item, index) in tableTitlesOther"
                :key="index"
                show-overflow-tooltip
                :min-width="item.width"
                :label="item.label"
                :prop="item.prop"
                #default="{row}">
            <span v-if="item.prop === 'nameColumn'">
                {{ nameColumn === 'fqdnCategoryName' ? row['fqdnCategoryName'] : row['reputationLevel'] }}
            </span>
              <span v-else-if="item.prop === 'bytes'">
                {{unitConvert(row[item.prop], unitTypes.byte).join(' ')}}
            </span>
              <span v-else-if="item.prop === 'packets' || item.prop === 'sessions'">
                {{unitConvert(row[item.prop], unitTypes.number).join(' ')}}
            </span>
              <span v-else>
                {{ row[item.prop] }}
            </span>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </el-table-column>
    <el-table-column
        v-for="(item, index) in tableTitles"
        :key="index"
        show-overflow-tooltip
        :min-width="item.width"
        :label="item.label"
        :prop="item.prop"
        #default="{row}">
      <span v-if="item.prop === 'nameColumn'">
        {{ nameColumn === 'fqdnCategoryName' ? row['categoryName'] : row['reputationLevel'] }}
      </span>
      <span v-else-if="item.prop === 'bytes'">
          {{unitConvert(row[item.prop], unitTypes.byte).join(' ')}}
      </span>
      <span v-else-if="item.prop === 'packets' || item.prop === 'sessions'">
          {{unitConvert(row[item.prop], unitTypes.number).join(' ')}}
      </span>
      <span v-else>
          {{ row[item.prop] }}
      </span>
    </el-table-column>
  </el-table>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { get } from '@/utils/http'
import { replaceUrlPlaceholder } from '@/utils/tools'
import { unitTypes } from '@/utils/constants'

export default {
  name: 'PieTable',
  props: {
    tableData: Array,
    chartInfo: Object,
    order: String,
    timeFilter: Object
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
    chartInfo: {
      deep: true,
      immediate: true,
      handler (n) {
        if (n && n.params) {
          this.nameColumn = n.params.nameColumn
        }
      }
    }
  },
  data () {
    return {
      nameColumn: '',
      pieTableData: [],
      childrenTableData: [],
      expandRowKeys: [],
      tableTitles: [
        {
          label: this.$t('overall.domain'),
          prop: 'domain',
          width: '20%'
        },
        {
          label: this.$t('entities.category'),
          prop: 'nameColumn',
          width: '22%'
        },
        {
          label: this.$t('overall.sessions'),
          prop: 'sessions',
          width: '18%'
        },
        {
          label: this.$t('overall.packets'),
          prop: 'packets',
          width: '18%'
        },
        {
          label: this.$t('overall.bytes'),
          prop: 'bytes',
          width: '18%'
        }
      ],
      tableTitlesOther: [
        {
          label: this.$t('overall.serverIp'),
          prop: 'serverIp',
          width: '20%'
        },
        {
          label: this.$t('overall.reputation'),
          prop: 'nameColumn',
          width: '22%'
        },
        {
          label: this.$t('overall.sessions'),
          prop: 'sessions',
          width: '18%'
        },
        {
          label: this.$t('overall.packets'),
          prop: 'packets',
          width: '18%'
        },
        {
          label: this.$t('overall.bytes'),
          prop: 'bytes',
          width: '18%'
        }
      ],
      loading: true
    }
  },
  methods: {
    currentChange (row, expandedRows) {
      this.loading = true
      this.childrenTableData = []
      if (this.expandRowKeys[0] && (row.domain === this.expandRowKeys[0])) {
        this.expandRowKeys = []
      } else {
        this.expandRowKeys = [row.domain]
      }
      const url = this.chartInfo.params.urlChildrenTable
      const queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        order: this.order,
        domain: row.domain,
        limit: 10
      }
      setTimeout(() => {
        get(replaceUrlPlaceholder(url, queryParams)).then(response2 => {
          if (response2.code === 200) {
            this.childrenTableData = response2.data.result
          }
        }).finally(() => {
          this.loading = false
        })
      }, 500)
    },
    getRowKey (row) {
      return row.domain
    }
  },
  setup () {
    return {
      unitTypes,
      unitConvert
    }
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-table__expanded-cell[class*=cell] {
  padding: 0;
}

.expand-table /deep/ .el-table__body .el-table__row:last-of-type td {
  border: none;
}

.pie-table {
  font-size: 14px;
  color: #333333;
  font-weight: 500;

  /deep/ .el-table__header-wrapper {
    .cell {
      color: #333;
    }
  }
}

.expand-table {
  font-weight: 400;
  color: #606266;

  /deep/ .el-table__body-wrapper {
    height: auto !important;
  }
}
</style>
