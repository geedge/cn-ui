<template>
  <div>
    <cn-data-list
      ref="dataList"
      :api="url"
      :tableId="tableId"
      :layout="['search', 'elementSet','search']"
      v-model:custom-table-title="tools.customTableTitle"
      :from="fromRoute.operationLog"
      @search="search">
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
          @search="search"
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
import { api } from '@/utils/api'

export default {
  name: 'operationLog',
  components: {
    cnDataList,
    operationLogTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: api.operationLog,
      tableId: 'operationLogTable' // 需要分页的table的id，用于记录每页数量
    }
  }
}
</script>
