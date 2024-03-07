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
        <button id="i18n-add"
                class="top-tool-btn margin-r-10 top-tool-btn--create"
                @click="add">
          <i class="cn-icon-xinjian cn-icon"></i>
          <span>{{$t('overall.create')}}</span>
        </button>
        <button id="i18n-edit"  class="top-tool-btn margin-r-10"  :disabled="disableEdit"
                @click="editSelectRecord">
          <i class="cn-icon-edit cn-icon"></i>
          <span>{{$t('overall.edit')}}</span>
        </button>
        <button id="i18n-delete"  class="top-tool-btn margin-r-10" :disabled="disableDelete"
                @click="delBatch">
          <i class="cn-icon-delete cn-icon"></i>
          <span>{{$t('overall.delete')}}</span>
        </button>
      </template>
      <template #default>
        <loading :loading="loading"></loading>
        <i18n-table
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
        class="common-right-box"
        :size="700"
        :with-header="false"
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
import i18nTable from '@/components/table/administration/I18nTable'
import i18nBox from '@/components/rightBox/settings/I18nBox'
import { api } from '@/utils/api'

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
      url: api.i18nSys,
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
