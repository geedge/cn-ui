<template>
  <div>
    <cn-data-list
      ref="dataList"
      :tableId="tableId"
      v-model:custom-table-title="tools.customTableTitle"
      :api="url"
      :from="fromRoute.user"
      :layout="['columnCustomize','elementSet']"
    >
      <template #top-tool-right>
        <button
          id="account-add"
          v-has="'user_add'"
          class="top-tool-btn margin-r-10"
          type="button"
          @click="add"
        >
          <i class="cn-icon-add cn-icon"/>
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
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
      <user-box
              :object="object"
              @close="closeRightBox"
      />
    </el-drawer>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/dataList'
import userTable from '@/components/table/settings/UserTable'
import userBox from '@/components/rightBox/settings/UserBox'
import { put } from '@/utils/http'

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
      url: 'sys/user',
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

  }
}
</script>
