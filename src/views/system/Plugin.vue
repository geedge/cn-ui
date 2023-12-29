<template>
  <div style="height: 100%;">
    <cn-data-list
      ref="dataList"
      :tableId="tableId"
      v-model:custom-table-title="tools.customTableTitle"
      :api="url"
      :from="fromRoute.plugin"
      :layout="['columnCustomize','search']"
      @search="search"
    >
      <template #default>
        <loading :loading="loading"></loading>
        <plugin-table
          ref="dataTable"
          :api="url"
          :isNoData="isNoData"
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
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import pluginTable from '@/components/table/system/PluginTable'
import { api } from '@/utils/api'
import axios from 'axios'

export default {
  name: 'Plugin',
  mixins: [dataListMixin],
  components: {
    cnDataList,
    pluginTable
  },
  data () {
    return {
      url: api.pluginList,
      blankObject: { // 空白对象
        id: '',
        name: '',
        remark: '',
        type: '',
        schedule: '',
        status: 1
      },
      tableId: 'userTable'
    }
  },
  methods: {
    getTableData (params, isAll, isClearType) {
      if (isAll) {
        this.searchLabel = null
      } else if (isClearType) {
        this.searchLabel.type = ''// 换新接口需要修改的属性名称
      }
      if (params) {
        this.searchLabel = { ...this.searchLabel, ...params }
      }
      //this.searchLabel = { ...this.searchLabel, ...this.pageObj }
      //this.searchLabel = {...this.searchLabel,jobGroup:3}
      this.isNoData = false
      this.toggleLoading(true)
      delete this.searchLabel.total
      let listUrl = this.url
      if (this.listUrl) {
        listUrl = this.listUrl
      }
      //this.searchLabel.category = 'ai_tagging'
      axios.get(listUrl, { params: this.searchLabel }).then(response => {
        if (response.status === 200) {
          for (let i = 0; i < response.data.data.list.length; i++) {
            response.data.data.list[i].status = response.data.data.list[i].status + ''
          }
          this.tableData = response.data.data.list
          this.pageObj.total = response.data.data.total
        } else {
          console.error(response.data)
          this.isNoData = true
          if (response.data.message) {
            this.$message.error(response.data.message)
          } else {
            this.$message.error(this.$t('tip.somethingWentWrong'))
          }
        }
      }).finally(() => {
        this.toggleLoading(false)
        this.isNoData = !this.tableData || this.tableData.length === 0
      })
    }
  },
  unmounted () {
    this.isNoData = false
  }
}
</script>
