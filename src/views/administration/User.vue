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
        <button id="account-delete"  class="top-tool-btn margin-r-10"
                @click="delBatch">
          <i class="cn-icon-delete cn-icon"></i>
          <span>{{$t('overall.delete')}}</span>
        </button>
      </template>
      <template #default>
        <user-table
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
  }
}
</script>
