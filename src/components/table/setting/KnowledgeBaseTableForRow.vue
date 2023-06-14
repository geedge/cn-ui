<template>
  <el-table
      id="knowledgeBaseTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
  >
    <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        :selectable="selectable"
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
        :sortable="item.sortable"
        :width="`${item.width}`"
        class="data-column"
    >
      <template #header>
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template  #default="scope" :column="item">
        <template v-if="item.prop === 'name'" >
          <template v-if="scope.row.i18n">
            <span :title="scope.row[item.prop]">{{$t(scope.row.i18n)}}</span>
          </template>
          <template v-else-if="scope.row.name">
            <span :title="scope.row[item.prop]">{{scope.row.name}}</span>
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'category'">
          <span >{{tagCategoryText(scope.row[item.prop])}}</span>
        </template>
        <template v-else-if="item.prop === 'source'">
          <span class="type-tag">{{tagSourceText(scope.row[item.prop])}}</span>
        </template>
        <template v-else-if="item.prop === 'opTime' || item.prop === 'ctime'">
          <template v-if="scope.row[item.prop]">
            {{dateFormatByAppearance(scope.row[item.prop])}}
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'cuser' || item.prop === 'uuser'">
          <template v-if="scope.row[item.prop]">
            {{scope.row[item.prop].username || '-'}}
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'description'">
          <span class="list-desc" :title="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
        </template>
        <template v-else-if="item.prop === 'status'">
          <el-switch class="card-enable"
                     v-model="scope.row.status"
                     active-color="#38ACD2"
                     inactive-color="#C0CEDB"
                     :active-value="1"
                     :inactive-value="0"
                     @change="changeStatus($event,scope.row.knowledgeId)"
          >
          </el-switch>
        </template>
        <span v-else>{{scope.row[item.prop] || '-'}}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { knowledgeBaseCategory, knowledgeBaseSource } from '@/utils/constants'
export default {
  name: 'KnowledgeBaseTableForRow',
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原table列
        {
          label: 'ID',
          prop: 'knowledgeId',
          show: true,
          width: 60,
          sortable: 'custom'
        }, {
          label: this.$t('config.roles.name'),
          prop: 'name',
          minWidth: 100,
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('overall.category'),
          prop: 'category',
          width: 100,
          show: true
        }, {
          label: this.$t('overall.source'),
          prop: 'source',
          width: 130,
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'description',
          minWidth: 150,
          show: true
        },
        {
          label: this.$t('overall.createdBy'),
          prop: 'opUser',
          show: false
        },
        {
          label: this.$t('config.user.createTime'),
          prop: 'ctime',
          show: false,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.updatedBy'),
          prop: 'uuser',
          show: false
        },
        {
          label: this.$t('overall.updateTime'),
          prop: 'opTime',
          show: true,
          sortable: 'custom'
        },
        {
          label: this.$t('knowledge.status'),
          prop: 'status',
          show: true,
          minWidth: 40
        }
      ]
    }
  },
  computed: {
    tagCategoryText () {
      return function (type) {
        const t = knowledgeBaseCategory.find(t => t.value === type)
        return t ? t.name : ''
      }
    },
    tagSourceText () {
      return function (type) {
        const t = knowledgeBaseSource.find(t => t.value === type)
        return t ? t.name : ''
      }
    }
  }
}
</script>
