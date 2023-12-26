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
        <template v-if="item.prop === 'status'">
          <el-switch
              v-if="hasPermission('editUser')"
              v-model="scope.row.status"
              active-value="1"
              inactive-value="0"
              @change="()=>{statusChange(scope.row)}">
          </el-switch>
          <template v-else>
            <span v-if="scope.row.status === '1'">{{$t('detection.create.enabled')}}</span>
            <span v-else>{{$t('detection.create.disabled')}}</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'type'">
          <span class="type-tag">{{tagSourceText(scope.row[item.prop])}}</span>
        </template>
        <template v-else-if="item.prop === 'name'">
          <div class="plugin-name">
            <div class="icon-background"><img class="plugin-name-icon" :src="getIconUrl(scope.row['knowledgeId'])"/></div>
            {{scope.row[item.prop] || '-'}}
          </div>
        </template>
        <template v-else-if="item.prop === 'description'">
          <div class="two-line" :title="getDescription(scope.row['knowledgeId'])">{{getDescription(scope.row['knowledgeId'])}}</div>
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
import { storageKey, knowledgeBaseSource, builtInKnowledgeBaseBasicInfo } from '@/utils/constants'

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
          prop: 'status',
          show: true,
          minWidth: 200
        }
      ]
    }
  },
  computed: {
    tagSourceText () {
      return function (type) {
        const t = knowledgeBaseSource.find(t => t.value === type)
        return t ? t.name : 'Unknown Tag'
      }
    },
    getIconUrl () {
      return function (knowledgeId) {
        const basicInfo = builtInKnowledgeBaseBasicInfo.find(bi => bi.knowledgeId === knowledgeId)
        return basicInfo ? basicInfo.iconUrl : ''
      }
    },
    getDescription () {
      return function (knowledgeId) {
        const basicInfo = builtInKnowledgeBaseBasicInfo.find(bi => bi.knowledgeId === knowledgeId)
        return basicInfo ? this.$t(basicInfo.desc) : '-'
      }
    }
  },
  methods: {
    statusChange (plugin) {
      /*
      axios.put('sys/plugin', user).then(response => {
        if (response.status === 200) {
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.data.message)
        }
        this.$emit('reload')
      }) */
    }
  }
}
</script>
