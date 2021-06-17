<template>
  <div>
    <cn-data-list
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet']"
      v-model:custom-table-title="tools.customTableTitle"
      :from="fromRoute.operationLog"
      @search="search"
      :search-msg="searchMsg">
      <template v-slot:default>
        <operation-log-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></operation-log-table>
      </template>
      <!-- 分页组件 -->
      <template #pagination>
        <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
      </template>
    </cn-data-list>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/dataList'
import operationLogTable from '@/components/table/settings/OperationLogTable'

export default {
  name: 'operationLog',
  components: {
    cnDataList,
    operationLogTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/log',
      tableId: 'operationLogTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            id: 11,
            name: this.$t('config.operationlog.type'),
            type: 'input',
            label: 'type',
            disabled: false
          }, {
            id: 12,
            name: this.$t('config.operationlog.username'),
            type: 'input',
            label: 'username',
            disabled: false
          }, {
            id: 13,
            name: this.$t('config.operationlog.operation'),
            type: 'selectString',
            label: 'operation',
            disabled: false
          }, {
            id: 14,
            name: this.$t('config.operationlog.operaId'),
            type: 'input',
            label: 'operaId',
            disabled: false
          }, {
            id: 16,
            name: this.$t('config.operationlog.state'),
            type: 'selectString',
            label: 'state',
            disabled: false
          }, {
            id: 17,
            name: this.$t('config.operationlog.params'),
            type: 'input',
            label: 'params',
            disabled: false
          }
        ]
      }
    }
  }
}
</script>
