<template>
  <div>
    <cn-data-list
            ref="dataList"
            v-model:custom-table-title="tools.customTableTitle"
            :api="url"
            :from="fromRoute.roles"
            :layout="['columnCustomize']"
    >
      <template v-slot:top-tool-right>
        <button id="roles-add" v-has="'role_add'" :title="$t('overall.createRole')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="role-list-batch-delete" v-has="'role_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default>
        <roles-table
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
          @showBottomBox="(targetTab) => { $refs.dataList.showBottomBox(targetTab, object) }"></roles-table>
      </template>
      <!-- 分页组件 -->
      <template #pagination>
        <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
      </template>
    </cn-data-list>
    <transition name="right-box">
      <role-box v-if="rightBox.show" :object="object" @close="closeRightBox"></role-box>
    </transition>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/dataList'
import rolesTable from '@/components/table/settings/RoleTable'
import roleBox from '@/components/rightBox/settings/RoleBox'

export default {
  name: 'roles',
  components: {
    cnDataList,
    roleBox,
    rolesTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/role',
      tableId: 'rolesTable', // 需要分页的table的id，用于记录每页数量
      blankObject: { // 空白对象
        name: ''
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('config.roles.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
      }
    }
  },
  methods: {
    edit (row) {
      this.object = { ...row }
      this.rightBox.show = true
    }
  }
}
</script>
