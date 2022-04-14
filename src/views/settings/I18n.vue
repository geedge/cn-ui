<template>
  <div>
    <cn-data-list
        ref="dataList"
        :tableId="tableId"
        v-model:custom-table-title="tools.customTableTitle"
        :api="url"
        :from="fromRoute.user"
        :layout="['columnCustomize','elementSet','search']"
        @search="search"
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
        <i18n-table
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
      <i18n-box
          :object="object"
          @close="closeRightBox"
      />
    </el-drawer>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import i18nTable from '@/components/table/settings/I18nTable'
import i18nBox from '@/components/rightBox/settings/I18nBox'
import  { api } from '@/utils/api'
import { put } from '@/utils/http'

export default {
  name: 'I18n',
  mixins: [dataListMixin],
  components: {
    cnDataList,
    i18nTable,
    i18nBox
  },
  data () {
    return {
      url: api.i18n,
      blankObject: { // 空白对象
        id: '',
        name: '',
        code: '',
        lang: '',
        value: ''
      },
      tableId: 'i18nTable'
    }
  },
  methods: {
  }
}
</script>
