<template>
  <div style="height: 100%;">
    <cn-data-list
      ref="dataList"
      :tableId="tableId"
      v-model:custom-table-title="tools.customTableTitle"
      :api="url"
      :from="fromRoute.user"
      :layout="['columnCustomize','elementSet','search']"
      @search="search"
    >
      <template #top-tool-left>
        <button id="account-add" class="top-tool-btn margin-r-10 top-tool-btn--create"
                @click="add">
          <i class="cn-icon-xinjian cn-icon"></i>
          <span>{{$t('overall.create')}}</span>
        </button>
        <button id="account-edit"  class="top-tool-btn margin-r-10" :disabled="disableEdit"
                @click="editSelectRecord">
          <i class="cn-icon-edit cn-icon"></i>
          <span>{{$t('overall.edit')}}</span>
        </button>
        <button id="account-delete"  class="top-tool-btn margin-r-10" :disabled="disableDelete"
                @click="delBatch">
          <i class="cn-icon-delete cn-icon"></i>
          <span>{{$t('overall.delete')}}</span>
        </button>
      </template>
      <template #default>
        <loading :loading="loading"></loading>
        <user-table
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
    <el-drawer
            v-model="rightBox.show"
            direction="rtl"
            :with-header="false"
            destroy-on-close>
      <user-box
              :object="object"
              @close="closeRightBox"
      />
    </el-drawer>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import userTable from '@/components/table/administration/UserTable'
import userBox from '@/components/rightBox/settings/UserBox'
import { api } from '@/utils/api'
import { get } from '@/utils/http'

export default {
  name: 'User',
  mixins: [dataListMixin],
  components: {
    cnDataList,
    userTable,
    userBox
  },
  data () {
    return {
      url: api.user,
      blankObject: { // 空白对象
        id: '',
        name: '',
        username: '',
        email: '',
        pin: '',
        mobile: '',
        status: 1,
        roleIds: '',
        pinChange: ''
      },
      tableId: 'userTable'
    }
  },
  methods: {
    getTableData (params, isAll, isClearType) {
      if (isAll) {
        this.searchLabel = null
      } else if (isClearType) {
        // this.searchLabel.tagType = ''
        this.searchLabel.type = ''// 换新接口需要修改的属性名称
      }
      if (params) {
        this.searchLabel = { ...this.searchLabel, ...params }
      }
      this.searchLabel = { ...this.searchLabel, ...this.pageObj }
      this.isNoData = false
      this.tableData = []
      this.toggleLoading(true)
      delete this.searchLabel.total
      let listUrl = this.url
      if (this.listUrl) {
        listUrl = this.listUrl
      }
      get(listUrl, this.searchLabel).then(response => {
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
        } else {
          console.error(response)
          this.isNoData = true
          if (response.message) {
            this.$message.error(response.message)
          } else {
            this.$message.error('Something went wrong...')
          }
        }
      }).finally(() => {
        this.toggleLoading(false)
        if (!this.tableData || this.tableData.length === 0) {
          this.isNoData = true
        } else {
          this.isNoData = false
        }
      })
    }
  },
  unmounted () {
    this.isNoData = false
  }
}
</script>
