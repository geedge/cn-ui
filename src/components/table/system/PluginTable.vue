<template>
  <el-table
    id="pluginTable"
    ref="dataTable"
    :data="tableData"
    empty-text=" "
    class="plugin"
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
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
      :sortable="item.sortable"
      :width="`${item.width}`"
    >
      <template #header>
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
        <template v-if="item.prop === 'triggerStatus'">
          <el-switch
              v-model="scope.row.triggerStatus"
              active-value="1"
              inactive-value="0"
              @change="()=>{statusChange(scope.row)}">
          </el-switch>
        </template>
        <template v-else-if="item.prop === 'type'">
          <span class="type-tag" v-for="type in scope.row.type">{{type}}</span>
        </template>
        <template v-else-if="item.prop === 'name'">
          <div class="plugin-name">
            <div class="icon-background"><img class="plugin-name-icon" :src="scope.row['iconUrl']"/></div>
            {{scope.row['name']}}
          </div>
        </template>
        <template v-else-if="item.prop === 'description'">
          <div class="two-line" :title="$t(scope.row['desc'])">{{$t(scope.row['desc'])}}</div>
        </template>
        <template v-else-if="item.prop === 'schedule'">
          <div class="two-line" >{{$t(scope.row['schedule'])}}</div>
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
import axios from 'axios'
import { api } from '@/utils/api'
import { pluginBasicInfo } from '@/utils/constants'

export default {
  name: 'pluginTable',
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 100
        }, {
          label: this.$t('overall.remark'),
          prop: 'description',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('config.plugin.schedule'),
          prop: 'schedule',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('overall.status'),
          prop: 'triggerStatus',
          show: true,
          minWidth: 200
        }
      ]
    }
  },
  computed: {
  },
  methods: {
    statusChange (plugin) {
      const triggerStatus = plugin.triggerStatus
      let statusUrl = triggerStatus === '1' ? api.pluginStatusEnable : api.pluginStatusDisable
      statusUrl = statusUrl.replace('{{id}}', plugin.id)
      axios.post(statusUrl).then(response => {
        if (response.status === 200) {
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.operateSuccess') })
        } else {
          this.$message.error(response.data.message)
        }
        this.$emit('reload')
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      })
    }
  }
}
</script>
