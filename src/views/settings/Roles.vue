<template>
  <div>
    <cn-data-list
            ref="dataList"
            :tableId="tableId"
            v-model:custom-table-title="tools.customTableTitle"
            :api="url"
            :from="fromRoute.roles"
            :layout="['columnCustomize','elementSet','search']"
            @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="roles-add" :title="$t('overall.createRole')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="cn-icon-add cn-icon"></i>
        </button>
        <delete-button id="role-list-batch-delete" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
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
        ></roles-table>
      </template>
      <!-- 分页组件 -->
      <template #pagination>
        <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
      </template>
    </cn-data-list>
    <el-drawer
            v-model="rightBox.show"
            direction="rtl"
            :with-header="false"
            destroy-on-close>
      <role-box :object="object" @close="closeRightBox"></role-box>
    </el-drawer>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import rolesTable from '@/components/table/settings/RoleTable'
import roleBox from '@/components/rightBox/settings/RoleBox'
import { api } from '@/utils/api'
import { get } from '@/utils/http'

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
      url: api.role,
      tableId: 'rolesTable', // 需要分页的table的id，用于记录每页数量
      blankObject: { // 空白对象
        name: '',
        buildIn: '',
        i18n: '',
        id: '',
        menuIds: [],
        remark: '',
        uby: 0,
        utime: ''
      }
    }
  },
  methods: {
    edit (u) {
      get(`${this.url}`, { ids: u.id }).then(response => {
        if (response.code === 200) {
          this.object = response.data.list[0]
          this.rightBox.show = true
        }
      })
    }
  }
}
</script>
