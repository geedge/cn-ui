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
                v-if="hasPermission('createUser')"
                @click="add">
          <i class="cn-icon-xinjian cn-icon"></i>
          <span>{{$t('overall.create')}}</span>
        </button>
        <button id="account-edit"  class="top-tool-btn margin-r-10" :disabled="disableEdit"
                v-if="hasPermission('editUser')"
                @click="editSelectRecord">
          <i class="cn-icon-edit cn-icon"></i>
          <span>{{$t('overall.edit')}}</span>
        </button>
        <button id="account-delete"  class="top-tool-btn margin-r-10" :disabled="disableDelete"
                v-if="hasPermission('deleteUser')"
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
            custom-class="common-right-box"
            :size="700"
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
import axios from 'axios'

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
      // this.tableData = []
      this.toggleLoading(true)
      delete this.searchLabel.total
      let listUrl = this.url
      if (this.listUrl) {
        listUrl = this.listUrl
      }
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
