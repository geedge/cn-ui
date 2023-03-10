<template>
  <div style="height: 100%;" class="knowledge-base">
    <div class="top-title">
      {{$t('overall.knowledgeBase')}}
    </div>
    <cn-data-list
        ref="dataList"
        :tableId="tableId"
        v-model:custom-table-title="tools.customTableTitle"
        :api="url"
        from="knowledge-base"
        :layout="['columnCustomize','elementSet','search']"
        @search="search"
    >
      <template v-slot:top-tool-left>
        <button id="knowledge-base-add" :title="$t('knowledgeBase.createKnowledgeBase')" class="top-tool-btn margin-r-10 top-tool-btn--create"
                @click="jumpToCreatePage">
          <i class="cn-icon-xinjian cn-icon"></i>
          <span>{{$t('overall.create')}}</span>
        </button>
        <!--
        <button id="knowledge-base-edit" :title="$t('knowledgeBase.editKnowledgeBase')" class="top-tool-btn margin-r-10"  :disabled="disableEdit"
                @click="edit">
          <i class="cn-icon-edit cn-icon" ></i>
          <span>{{$t('overall.edit')}}</span>
        </button>
        -->
        <button id="knowledge-base-delete" :title="$t('knowledgeBase.deleteKnowledgeBase')" class="top-tool-btn margin-r-10"
                @click="delBatch">
          <i class="cn-icon-delete cn-icon"></i>
          <span>{{$t('overall.delete')}}</span>
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
import axios from 'axios'

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
      axios.get(`${this.url}`, { params: { ids: u.id } }).then(response => {
        if (response.data.code === 200) {
          this.object = response.data.data.list[0]
        }
      })
    },
    del (row) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.tools.loading = true
        axios.delete(this.url + '?ids=' + row.id).then(response => {
          if (response.data.code === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.data.message)
          }
        }).finally(() => {
          this.tools.loading = false
        })
      })
    },
    jumpToCreatePage () {
      this.$router.push({
        path: '/knowledgeBase/form',
        query: {
          t: +new Date()
        }
      })
    }
  }
}
</script>
