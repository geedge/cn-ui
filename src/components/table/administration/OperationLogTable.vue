  <template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    tooltip-effect="light"
    :height="height"
    border
    empty-text=" "
    class="no-operation"
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    :cell-style="{paddingLeft: '20px'}"
    :header-cell-style="{paddingLeft: '20px'}"
  >
    <el-table-column
      v-for="(item, index) in customTableTitles"
      :key="item.prop+index"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sort-orders="['ascending', 'descending']"
      :width="`${item.width}`"
      class="data-column"
      :show-overflow-tooltip="['params', 'response'].indexOf(item.prop) > -1"
    >
      <template #header>
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template  #default="scope">
        <span v-if="item.prop === 'duration'">
                {{scope.row[item.prop]}}ms
              </span>
        <span v-else-if="item.prop === 'state'">
          <template v-if="scope.row[item.prop]===operationLogStateMapping.success">
            {{$t('operationLog.state.success')}}
          </template>
          <template v-else-if="scope.row[item.prop]===operationLogStateMapping.fail">
            {{$t('operationLog.state.fail')}}
          </template>
          <template v-else>
            {{scope.row[item.prop] || '-'}}
          </template>
        </span>
        <span v-else-if="item.prop === 'username'">{{formatUsername(scope.row)}}</span>
        <span v-else-if="item.prop === 'ctime'">{{dateFormatByAppearance(scope.row[item.prop])}}</span>
        <template v-else-if="item.prop === 'params' || item.prop === 'response'">
          <span>{{scope.row[item.prop] || '-'}}</span>
        </template>
        <span v-else>{{scope.row[item.prop] || '-'}}</span>
      </template>
    </el-table-column>
    <template v-slot:empty >
      <div class="table-no-data" v-if="isNoData">
        <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
      </div>
    </template>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { operationLogStateMapping } from '@/utils/constants'

export default {
  name: 'roleTable',
  mixins: [table],
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      operationLogStateMapping: operationLogStateMapping,
      tableTitle: [
        {
          label: this.$t('config.operationlog.id'),
          prop: 'id',
          show: true,
          minWidth: 100
        }, {
          label: this.$t('config.operationlog.username'),
          prop: 'username',
          show: true
        },
        {
          label: this.$t('config.operationlog.ip'),
          prop: 'ip',
          show: true
        },
        {
          label: this.$t('config.operationlog.operation'),
          prop: 'operation',
          show: true
        },
        {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true
        },
        {
          label: this.$t('config.operationlog.state'),
          prop: 'state',
          show: true
        },
        // {
        //   label: this.$t('config.operationlog.userId'),
        //   prop: 'userId',
        //   show: false,
        // },
        {
          label: this.$t('config.operationlog.operaId'),
          prop: 'operaId',
          show: false
        },
        {
          label: this.$t('config.operationlog.createDate'),
          prop: 'ctime',
          show: true
        },
        {
          label: this.$t('config.operationlog.time'),
          prop: 'duration',
          show: false
        },
        {
          label: this.$t('config.operationlog.params'),
          prop: 'params',
          show: false,
          minWidth: 150
        },
        {
          label: this.$t('config.operationlog.response'),
          prop: 'response',
          show: false,
          minWidth: 150
        }
      ]
    }
  },
  methods: {
    formatUsername (row) {
      if (row.username) {
        return row.username
      } else if (row.operation === 'login' && !row.username) { // 如果是登录 且登录失败
        return JSON.parse(row.params).username
      } else {
        return '-'
      }
    }
  }
}
</script>

<style lang="scss">
.list-page .cn-table .el-table:not(.chart-table) td {
  padding: 8px 0;
}
</style>
