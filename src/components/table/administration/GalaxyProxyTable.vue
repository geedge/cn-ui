<template>
  <el-table
    class="galaxy-proxy-table"
    id="userTable"
    ref="dataTable"
    :data="tableData"
    tooltip-effect="light"
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
      width="55">
    </el-table-column>
    <el-table-column
      v-for="item in customTableTitles"
      :key="item.prop"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sort-orders="['ascending', 'descending']"
      :sortable="item.sortable"
      :width="`${item.width}`"
      :show-overflow-tooltip="['targetParam', 'targetHeader', 'preHandle', 'postHandle'].indexOf(item.prop) === -1"
    >
      <template #header>
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
        <template v-if="item.prop === 'targetParam' || item.prop === 'targetHeader'">
          <template v-if="scope.row[item.prop]">
            <el-popover
                width="250px"
                popper-class="js-code-highlight"
                placement="left"
                trigger="hover"
            >
              <template #reference>
                <span style="color: #41ABFD">{...}</span>
              </template>
              <div class="highlight-box">
                <span class="highlight-box__copy-btn" @click="copyValue(scope.row[item.prop])"><el-icon><CopyDocument /></el-icon></span>
                <highlightjs
                    language="json"
                    :code="scope.row[item.prop]"
                />
              </div>
            </el-popover>
          </template>
          <template v-else>-</template>
        </template>
        <template v-else-if="item.prop === 'preHandle' || item.prop === 'postHandle'">
          <template v-if="scope.row[item.prop]">
            <el-popover
                width="250px"
                popper-class="js-code-highlight"
                placement="left"
                trigger="hover"
            >
              <template #reference>
                <span style="color: #41ABFD">{...}</span>
              </template>
              <div class="highlight-box">
                <span class="highlight-box__copy-btn" @click="copyValue(scope.row[item.prop])"><el-icon><CopyDocument /></el-icon></span>
                <highlightjs
                    language="js"
                    :code="scope.row[item.prop]"
                />
              </div>
            </el-popover>
          </template>
          <template v-else>-</template>
        </template>
        <span v-else>{{scope.row[item.prop] ? scope.row[item.prop] : '-'}}</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <template #header>
        <div class="table-operation-title">{{$t('overall.option')}}</div>
      </template>
      <template #default="scope">
        <div class="table-operation-items">
          <el-dropdown size="medium" trigger="hover" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more">
              <i class="cn-icon cn-icon-more-arrow-down"></i>
            </div>
            <template #dropdown>
              <el-dropdown-menu >
                <el-dropdown-item :command="['copy', scope.row]"><i class="cn-icon cn-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
                <el-dropdown-item :command="['debug', scope.row]"><i class="cn-icon cn-icon-debug"></i><span class="operation-dropdown-text">{{$t('overall.debug')}}</span></el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
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
import { copyValue } from '@/utils/tools'

export default {
  name: 'galaxyProxyTable',
  mixins: [table],
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 100,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          sortable: 'custom',
          width: 150
        }, {
          label: this.$t('overall.path'),
          prop: 'path',
          show: true,
          width: 150
        }, {
          label: this.$t('overall.method'),
          prop: 'method',
          show: true,
          width: 150
        }, {
          label: this.$t('overall.version'),
          prop: 'version',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('galaxyProxy.targetUrl'),
          prop: 'targetUrl',
          show: true,
          width: 250
        }, {
          label: this.$t('galaxyProxy.targetParam'),
          prop: 'targetParam',
          show: true,
          width: 150
        }, {
          label: this.$t('galaxyProxy.targetHeader'),
          prop: 'targetHeader',
          show: true,
          width: 150
        }, {
          label: 'Pre handle',
          prop: 'preHandle',
          show: true,
          width: 150
        }, {
          label: 'Post handle',
          prop: 'postHandle',
          show: true,
          width: 150
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true
        }
      ]
    }
  },
  setup () {
    return {
      copyValue
    }
  }
}
</script>
