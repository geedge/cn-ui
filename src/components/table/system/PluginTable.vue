<template>
  <el-table
    id="pluginTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    empty-text=" "
    border
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
          <span class="type-tag">{{typeText(scope.row['id'])}}</span>
        </template>
        <template v-else-if="item.prop === 'name'">
          <div class="plugin-name">
            <div class="icon-background"><img class="plugin-name-icon" :src="getIconUrl(scope.row['id'])"/></div>
            {{getName(scope.row['id'])}}
          </div>
        </template>
        <template v-else-if="item.prop === 'description'">
          <div class="two-line" :title="getDescription(scope.row['id'])">{{getDescription(scope.row['id'])}}</div>
        </template>
        <template v-else-if="item.prop === 'schedule'">
          <div class="two-line" >{{scheduleText(scope.row['id'])}}</div>
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
import { storageKey, pluginBasicInfo,pluginSchedule } from '@/utils/constants'

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
      loginName: localStorage.getItem(storageKey.username),
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
    typeText () {
      return function (id) {
        const t = pluginBasicInfo.find(t => t.id === id)
        return t ? t.type : 'Unknown Tag'
      }
    },
    scheduleText () {
      return function (type) {
        return this.$t(pluginSchedule.always)
      }
    },
    getIconUrl () {
      return function (id) {
        const basicInfo = pluginBasicInfo.find(bi => bi.id === id)
        return basicInfo ? basicInfo.iconUrl : ''
      }
    },
    getDescription () {
      return function (id) {
        const basicInfo = pluginBasicInfo.find(bi => bi.id === id)
        return basicInfo ? this.$t(basicInfo.desc) : '-'
      }
    },
    getName () {
      return function (id) {
        const basicInfo = pluginBasicInfo.find(bi => bi.id === id)
        return basicInfo ? this.$t(basicInfo.name) : '-'
      }
    }
  },
  methods: {
    statusChange (plugin) {
      let triggerStatus = plugin.triggerStatus
      let statusUrl = triggerStatus === '1' ? api.pluginStatusEnable : api.pluginStatusDisable
      statusUrl = statusUrl.replace('{{id}}', plugin.id)
      axios.post(statusUrl).then(response => {
        if (response.status === 200) {
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
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
