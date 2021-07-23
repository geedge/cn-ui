  <template>
  <el-table
    id="roleTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    class="no-operation"
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
  >
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      v-for="(item, index) in customTableTitles"
      :key="`col-${index}`"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sort-orders="['ascending', 'descending']"
      :width="`${item.width}`"
      class="data-column"
    >
      <template #header>
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template  #default="scope">
        <span v-if="item.prop === 'time'">
                {{scope.row[item.prop]}} ms
              </span>
        <span v-else-if="item.prop === 'username'">{{formatUsername(scope.row)}}</span>
        <span v-else-if="item.prop === 'ctime'">{{utcTimeToSysTime(scope.row[item.prop])}}</span>
        <span v-else>{{scope.row[item.prop]}}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
export default {
  name: 'roleTable',
  mixins: [table],
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('config.operationlog.id'),
          prop: 'id',
          show: true,
          width: 80
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
          label: this.$t('config.operationlog.type'),
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
          prop: 'time',
          show: false
        },
        {
          label: this.$t('config.operationlog.params'),
          prop: 'params',
          show: false
        },
        {
          label: this.$t('config.operationlog.response'),
          prop: 'response',
          show: false
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
