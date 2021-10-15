<template>
  <div>
    <cn-data-list
      ref="dataList"
      :tableId="tableId"
      v-model:custom-table-title="tools.customTableTitle"
      :api="url"
      :from="fromRoute.chart"
      :layout="['columnCustomize','elementSet','searchInput']"
      @search="search"
    >
      <template #top-tool-right>
        <button
          id="account-add"
          class="top-tool-btn margin-r-10"
          type="button"
          @click="add"
        >
          <i class="cn-icon-add cn-icon"/>
        </button>
      </template>
      <template #default>
        <chart-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @delete="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
        />
      </template>
      <template #pagination>
        <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
      </template>
    </cn-data-list>
    <el-drawer
            v-model="rightBox.show"
            direction="rtl"
            :with-header="false"
            :size="700"
            destroy-on-close>
      <chart-box
              :object="object"
              @close="closeRightBox"
      />
    </el-drawer>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/dataList'
import chartTable from '@/components/table/settings/ChartTable'
import chartBox from '@/components/rightBox/settings/ChartBox'
import { api } from '@/utils/api'

export default {
  name: 'Chart',
  mixins: [dataListMixin],
  components: {
    cnDataList,
    chartTable,
    chartBox
  },
  data () {
    return {
      url: api.chart,
      listUrl: api.chartList,
      blankObject: { // 空白对象
        id: '',
        name: '',
        params: '',
        i18n: ''
      },
      tableId: 'chartTable'
    }
  }
}
</script>
