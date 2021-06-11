<template>
  <div>
    <cn-data-list
      ref="dataList"
      v-model:custom-table-title="tools.customTableTitle"
      :api="url"
      :from="fromRoute.user"
      :layout="['columnCustomize']"
    >
      <template #top-tool-right>
        <button
          id="account-add"
          v-has="'user_add'"
          class="top-tool-btn margin-r-10"
          type="button"
          @click="add"
        >
          <i class="cn-icon-create-square cn-icon"/>
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
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
        />
      </template>
      <template #pagination>
<!--        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination> -->
      </template>
    </cn-data-list>
    <transition name="right-box">
      <user-box
        v-if="rightBox.show"
        :object="object"
        @close="closeRightBox"
      />
    </transition>
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
  components: {
    cnDataList,
    userTable,
    userBox
  },
  mixins: [dataListMixin],
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
        status: '1',
        roleIds: '',
        pinChange: ''
      },
      tableId: 'userTable'
    }
  },
  methods: {
    statusChange (user) {
      if (user.roles) {
        user.roleIds = user.roles.map(t => t.id)
      }
      put(this.url, user).then(response => {
        if (response.code === 200) {
          this.rightBox.show = false
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.getTableData()
      })
    }
  }
}
</script>
