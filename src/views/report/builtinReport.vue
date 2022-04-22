<template>
  <div class="cn-builtin">
    <div class="cn-builtin-left">
      <div class="cn-builtin-left-title">
        {{$t('report.category')}}
      </div>
      <div class="cn-builtin-left-menu" :class="{'cn-active': builtinId === ''}" @click="builtinTabs('', '')">
        {{$t('dns.all')}}
      </div>
      <div class="cn-builtin-left-menu" :class="{'cn-active': builtinId === item.id}" v-for="item in builtinReportLeftMenu" :key="item.id" @click="builtinTabs(item.id)">
        {{item.name}}
      </div>
    </div>
    <div class="cn-builtin-right">
      <cn-data-list
          ref="dataList"
          :tableId="tableId"
          v-model:custom-table-title="tools.customTableTitle"
          :api="url"
          :from="fromRoute.builtinReport"
          :layout="['search']"
          @search="search"
      >
        <template #default>
          <builtin-report-table
              ref="dataTable"
              v-loading="tools.loading"
              :api="url"
              :custom-table-title="tools.customTableTitle"
              :height="mainTableHeight"
              :table-data="tableData"
              @download="download"
              @preview="preview"
              @orderBy="tableDataSort"
              @reload="getTableData"
              @selectionChange="selectionChange"
          />
        </template>
        <template #pagination>
          <pagination ref="pagination" :page-obj="pageObj" :tableData="tableData" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
        </template>
      </cn-data-list>
    </div>
  </div>
</template>

<script>
import { get } from '@/utils/http'
import builtinReportTable from '@/components/table/report/builtinReportTable'
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import { api } from '@/utils/api'

export default {
  name: 'Report',
  data () {
    return {
      builtinReportLeftMenu: [], // 左侧列表菜单数据
      builtinColor: false,
      builtinId: '',
      url: api.reportJob,
      blankObject: { // 空白对象
        id: '',
        name: '',
        ctime: '',
        remark: '',
        uniq: '',
        startTime: '',
        endTime: ''
      },
      tableId: 'builtinReportTable'
    }
  },
  mixins: [dataListMixin],
  components: {
    cnDataList,
    builtinReportTable
  },
  methods: {
    queryGetTempData () {
      get(api.reportTemp).then(res => {
        if (res.code === 200) {
          this.builtinReportLeftMenu = res.data.list
        }
      })
    },
    builtinTabs (id) {
      this.builtinId = id
      if (id !== '') {
        this.getTableData({ tempId: id })
      } else {
        this.getTableData()
      }
    }
  },
  mounted () {
    this.queryGetTempData()
  }
}
</script>
