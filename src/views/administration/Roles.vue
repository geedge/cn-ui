<template>
  <div style="height: 100%;">
    <cn-data-list
            ref="dataList"
            :tableId="tableId"
            v-model:custom-table-title="tools.customTableTitle"
            :api="url"
            :from="fromRoute.roles"
            :layout="['columnCustomize','elementSet','search']"
            @search="search"
    >
      <template v-slot:top-tool-left>
        <button id="roles-add"  class="top-tool-btn margin-r-10 top-tool-btn--create"
                @click="add">
          <i class="cn-icon-xinjian cn-icon"></i>
          <span>{{$t('overall.create')}}</span>
        </button>
        <button id="roles-edit"  class="top-tool-btn margin-r-10" :disabled="disableEdit"
                @click="edit">
          <i class="cn-icon-edit cn-icon"></i>
          <span>{{$t('overall.edit')}}</span>
        </button>
        <button id="roles-delete"  class="top-tool-btn margin-r-10" :disabled="disableDelete"
                @click="delBatch">
          <i class="cn-icon-delete cn-icon"></i>
          <span>{{$t('overall.delete')}}</span>
        </button>

        <delete-button id="role-list-batch-delete" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default>
        <loading :loading="loading"></loading>
        <roles-table
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
            custom-class="common-right-box"
            :with-header="false"
            :size="700"
            destroy-on-close>
      <role-box :object="object" @close="closeRightBox"></role-box>
    </el-drawer>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import rolesTable from '@/components/table/administration/RoleTable'
import roleBox from '@/components/rightBox/settings/RoleBox'
import { api } from '@/utils/api'
import axios from 'axios'

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
    edit () {
      if (this.batchDeleteObjs.length === 0) {
        this.$alert(this.$t('tip.pleaseSelectForEdit'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {})
      } else {
        axios.get(`${this.url}`, { params: { ids: this.batchDeleteObjs[0].id } }).then(response => {
          if (response.status === 200) {
            this.object = response.data.data.list[0]
            this.rightBox.show = true
          }
        })
      }
    }
  }
}
</script>
