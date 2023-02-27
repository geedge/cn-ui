<template>
  <div style="height: 100%;">
    <cn-data-list
        ref="dataList"
        :tableId="tableId"
        v-model:custom-table-title="tools.customTableTitle"
        :api="url"
        from="knowledge-base"
        :layout="['columnCustomize','elementSet','search']"
        @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="knowledge-base-add" :title="$t('knowledgeBase.createKnowledgeBase')" class="top-tool-btn margin-r-10"
                type="button" @click="jumpToCreatePage">
          <i class="cn-icon-add cn-icon"></i>
        </button>
      </template>
      <template v-slot:default>
        <knowledge-base-table
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
        ></knowledge-base-table>
      </template>
      <!-- 分页组件 -->
      <template #pagination>
        <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
      </template>
    </cn-data-list>
  </div>
</template>
<script>
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import KnowledgeBaseTable from '@/components/table/setting/KnowledgeBaseTable'
import { api } from '@/utils/api'
import { get } from '@/utils/http'

export default {
  name: 'knowledgeBase',
  components: {
    cnDataList,
    KnowledgeBaseTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: api.knowledgeBase,
      tableId: 'knowledgeBaseTable' // 需要分页的table的id，用于记录每页数量

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
    },
    jumpToCreatePage () {
      this.$router.push({
        path: '/knowledgeBase/form',
        query: {
          t: +new Date()
        }
      })
    },
    getTableData () {
      this.tools.loading = false
      this.tableData = [
        {
          tagName: '我的IP库',
          buildIn: 0,
          id: 1,
          tagType: 'ip',
          remark: '我的IP库描述',
          updateTime: new Date()
        },
        {
          tagName: '我的domain库',
          buildIn: 0,
          id: 2,
          tagType: 'domain',
          remark: '我的domain库描述',
          updateTime: new Date()
        }
      ]
      this.pageObj.total = 2
    }
  }
}
</script>
