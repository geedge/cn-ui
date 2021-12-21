<template>
  <el-table
      ref="table"
      class="pie-table"
      :data="pieTableData"
      style="width: 100%;border: 1px solid #E7EAED"
      :row-key="getRowKey"
      @expand-change="currentChange"
      :current-row-key="tableNameColumn"
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
                {{ nameColumn === 'fqdnCategoryName' ? row['fqdnCategoryName'] :(nameColumn === 'fqdnReputationLevel'? row['fqdnReputationLevel']:(nameColumn==='appCategory'?row['appCategory']:row['appRisk']))}}
            </span>
              <span v-else-if="item.prop === 'tableNameColumn'">
                {{ tableNameColumn === 'appName' ? row['appName'] : row['domain']}}
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
        :label="(tableNameColumn === 'appName'&& item.prop === 'tableNameColumn')? $t('overall.appName'):item.label"
        :prop="item.prop"
        #default="{row}">
      <span v-if="item.prop === 'nameColumn'">
          {{ nameColumn === 'fqdnCategoryName' ? row['categoryName'] :(nameColumn === 'fqdnReputationLevel'? row['reputationLevel']:(nameColumn==='appCategory'?row['appCategory']:row['appRisk']))}}
      </span>
      <span v-else-if="item.prop === 'tableNameColumn'">
          {{ tableNameColumn === 'appName' ? row['appName'] : row['domain']}}
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
          this.tableNameColumn = n.params.tableNameColumn
        }
      }
    }
  },
  data () {
    return {
      nameColumn: '',
      tableNameColumn: '',
      pieTableData: [],
      childrenTableData: [],
      expandRowKeys: [],
      tableTitles: [
        {
          label: this.$t('overall.domain'),
          prop: 'tableNameColumn', // 'domain'
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

      if (this.tableNameColumn === 'appName') {
        if (this.expandRowKeys[0] && (row.appName === this.expandRowKeys[0])) {
          this.expandRowKeys = []
        } else {
          this.expandRowKeys = [row.appName]
        }
      } else {
        if (this.expandRowKeys[0] && (row.domain === this.expandRowKeys[0])) {
          this.expandRowKeys = []
        } else {
          this.expandRowKeys = [row.domain]
        }
      }

      const url = this.chartInfo.params.urlChildrenTable
      let queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        order: this.order,
        domain: row.domain,
        limit: 10
      }
      if (this.tableNameColumn === 'appName') {
        queryParams = {
          startTime: parseInt(this.timeFilter.startTime / 1000),
          endTime: parseInt(this.timeFilter.endTime / 1000),
          order: this.order,
          appName: row.appName,
          limit: 10
        }
      }
      setTimeout(() => {
        get(replaceUrlPlaceholder(url, queryParams)).then(response2 => {
          // app：测试数据生成，如接口可正常返回数据后，删除即可
          response2 = this.initTestDataForAppSecondTable(url, row)

          if (response2.code === 200) {
            this.childrenTableData = response2.data.result
          }
        }).finally(() => {
          this.loading = false
        })
      }, 500)
    },
    initTestDataForAppSecondTable (url, row) {
      let rlt = ''

      if (url.indexOf('app') > -1) {
        rlt = {
          code: 200,
          msg: '',
          data: {
            resultType: 'table',
            result: [{
              sessions: '0',
              packets: '134',
              bytes: '33202',
              appCategory: row.appCategory,
              serverIp: '51.104.167.186',
              appRisk: row.appRisk
            }, {
              sessions: '0',
              packets: '134',
              bytes: '33202',
              appCategory: row.appCategory,
              serverIp: '23.164.67.16',
              appRisk: row.appRisk
            }
            ]
          },
          success: true
        }
      }
      return rlt
    },
    getRowKey (row) {
      if (this.tableNameColumn === 'appName') {
        return row.appName
      } else {
        return row.domain
      }
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
