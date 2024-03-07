<template>
  <div class="history-top-key" v-if="myDrawer">
    <el-drawer v-model="myDrawer" :with-header="false">
      <div class="key-header">
        <div>History Top Keys</div>
        <i class="cn-icon cn-icon-close" @click="closeDrawer"></i>
      </div>

      <div class="key-search">
        <el-input v-model="searchKey" @keyup.enter="onSearch" size="small" placeholder="Search for">
          <template #prefix>
            <i class="cn-icon cn-icon-search key-search-icon"></i>
          </template>
        </el-input>

        <i class="cn-icon cn-icon-refresh1 key-refresh" @click="onRefresh"></i>
      </div>

      <div class="key-total">
        Total: <span class="key-total-number">{{ tableTotal }}</span>
      </div>

      <div class="key-table">
        <loading :loading="loading"></loading>

        <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName" @row-click="rowClick">
          <el-table-column
              v-for="(item, index) in tableTitle"
              :key="`col-${index}`"
              :fixed="item.fixed"
              :label="item.label"
              :min-width="`${item.minWidth}`"
              :prop="item.prop"
              :sort-orders="['ascending', 'descending']"
              :width="`${item.width}`"
          >
            <template #header>
              <span>{{ item.label }}</span>
            </template>
            <template #default="scope" :column="item">
              <template v-if="item.prop === 'metric'">
                <span>{{unitConvert(scope.row.metric, unitTypes.byte).join(' ')}}</span>
              </template>
              <template v-else-if="item.prop === 'last'">
                <span>{{dateFormatByAppearance(scope.row[item.prop])}}</span>
              </template>
              <span v-else>{{ scope.row[item.prop] || '-' }}</span>
            </template>
          </el-table-column>

          <template v-slot:empty >
            <chart-error v-if="showError" :content="errorMsg" style="line-height: 0" />
          </template>
        </el-table>
      </div>

    </el-drawer>
  </div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import { dateFormatByAppearance } from '@/utils/date-util'
import axios from 'axios'
import { api } from '@/utils/api'
import Loading from '@/components/common/Loading'
import ChartError from '@/components/common/Error'
export default {
  name: 'HistoryTopKeys',
  props: {
    showDrawer: {
      type: Boolean,
      default: false
    },
    delKeyId: {
      type: String
    }
  },
  components: {
    ChartError,
    Loading
  },
  data () {
    return {
      myDrawer: false,
      searchKey: '',
      unitTypes,
      loading: false,
      tableTotal: 0,
      tableData: [],
      tableTitle: [
        {
          // label: this.$t('knowledge.status'),
          label: 'Keys',
          prop: 'keys',
          show: true,
          minWidth: 120
        },
        {
          label: 'Last Seen',
          prop: 'last',
          show: true,
          minWidth: 150
        },
        {
          label: 'Primary metric',
          prop: 'metric',
          show: true,
          minWidth: 120
        }
      ],
      showError: false,
      errorMsg: ''
    }
  },
  mounted () {
    this.myDrawer = this.showDrawer
    this.getTopKeysData()
  },
  watch: {
    delKeyId (newVal) {
      if (newVal) {
        const obj = this.tableData.find(d => d.keyId === newVal)
        if (obj) {
          obj.filterKey = false
        }
      }
    }
  },
  methods: {
    unitConvert,
    dateFormatByAppearance,
    getTopKeysData (data) {
      this.loading = true
      const params = {}
      if (data) {
        // todo 具体入参按文档要求
        params.param = data
      }

      axios.get(api.detection.create.topKeys, { params }).then(res => {
        this.tableTotal = 0
        this.tableData = []

        if (res.status === 200) {
          this.tableTotal = res.data.data.total
          this.tableData = res.data.data.list
        } else {
          this.httpError(res.data)
        }
      }).catch(err => {
        this.httpError(err)
      }).finally(() => {
        this.loading = false
      })
    },
    /** 关闭topKeys弹窗 */
    closeDrawer () {
      this.myDrawer = false
      this.$emit('closeDrawer', false)
    },
    /** 单击topKeys弹窗某一项 */
    rowClick (data) {
      data.filterKey = true
      this.$emit('keyRowClick', data)
    },
    onRefresh () {
      this.getTopKeysData()
    },
    onSearch () {
      this.getTopKeysData(this.searchKey)
    },
    httpError (e) {
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    },
    tableRowClassName (row) {
      if (row.row.filterKey) {
        return 'key-click-row'
      }
    }
  }
}
</script>

<style lang="scss">
.history-top-key {
  width: 396px;
  height: 520px;

  .el-drawer__body {
    border: 1px #E2E5EC solid;
  }
}
.key-header {
  height: 41px;
  background: #F7F7F7;
  box-shadow: 0 1px 0 0 rgba(226,229,236,1);
  border-radius: 2px 2px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  font-family: NotoSansHans-Medium;
  font-size: 14px;
  color: #353636;
  font-weight: 500;

  i {
    font-size: 12px;
    color: #575757;
    cursor: pointer;
  }
}

.key-search {
  margin-left: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .key-search-icon {
    font-size: 13px;
    color: #999999;
  }

  .key-refresh {
    margin: 0 10px;
    color: #38ACD2;
    font-size: 14px;
    height: 28px;
    line-height: 28px;
    cursor: pointer;
  }
}

.key-total {
  margin: 10px 12px;
  font-family: NotoSansSChineseRegular;
  font-size: 14px;
  color: #999999;
  line-height: 21px;
  font-weight: 400;

  .key-total-number {
    color: #666666;
    margin-left: 4px;
  }
}

.el-table .key-click-row {
  background: #F5F7FA !important;
}
</style>
