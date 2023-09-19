<template>
  <el-table
        id="knowledgeBaseTable"
        ref="dataTable"
        :data="tableData"
        :height="height"
        border
        empty-text=" "
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
          v-for="(item, index) in tableTitle"
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
          <template v-else-if="item.prop === 'reference'" >
            <templage v-if="scope.row[item.prop] && scope.row[item.prop].length > 2" >
              <el-popover placement="right-end" trigger="hover" :show-arrow="false" offset="0" ref="referenceMoreInfo"
                          hide-after="0" >
                <template #reference>
                  <div class="reference-tag__show">
                    <div class="reference-tag__group">
                      <span class="reference-tag" v-for="(refer, index) in scope.row[item.prop].slice(0,2)" >{{refer}}</span>
                    </div>
                    <div class="reference-more">+{{scope.row[item.prop].length - 2}} more</div>
                  </div>
                </template>
                <div class="reference-tag__tip">
                  <span class="reference-tag" v-for="(refer, index) in scope.row[item.prop].slice(2)" >{{refer}}</span>
                </div>
              </el-popover>
            </templage>
            <template v-else>
              <template v-for="(refer, index) in scope.row[item.prop]">
                <div class="type-tag">{{refer}}</div>
              </template>
            </template>
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
            <el-switch v-model="scope.row.status"
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
      <template v-slot:empty >
        <div class="table-no-data" v-if="isNoData">
          <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
        </div>
      </template>
    </el-table>
</template>

<script>
import table from '@/mixins/table'
import { knowledgeBaseCategory, knowledgeBaseSource } from '@/utils/constants'
export default {
  name: 'KnowledgeBaseTableForRow',
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原table列
        {
          label: 'ID',
          prop: 'knowledgeId',
          show: true,
          width: 100,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          minWidth: 100,
          width: 150,
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('overall.type'),
          prop: 'source',
          width: 130,
          show: true
        }, {
          label: this.$t('knowledge.reference'),
          prop: 'reference',
          width: 180,
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'description',
          minWidth: 150,
          show: true
        },
        /*
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
        }, */
        {
          label: this.$t('overall.updateTime'),
          prop: 'opTime',
          show: true,
          width: 150,
          sortable: 'custom'
        },
        {
          label: this.$t('knowledge.status'),
          prop: 'status',
          show: true,
          width: 80
        }
      ]
    }
  },
  watch: {
    tableData: {
      handler (n) {
        if (this.tableData && this.tableData.length > 0) {
          this.tableData.forEach(item => {
            item.reference = []

            if (item.refRule && item.refRule.length > 0) {
              item.refRule.forEach(ref => {
                item.reference.push(ref.name)
              })
            }
          })
        }
      }
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
