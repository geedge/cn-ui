<template>
  <div class="knowledge-base">
    <div class="knowledge-base__top">
      <div class="top-title">
        {{$t('overall.knowledgeBase')}}
      </div>
      <div class="builtIn-to-user-defined" >
        <button :title="$t('knowledgeBase.userDefinedLibrary')" class="top-tool-btn--user_defined_library"
                v-if="hasPermission('userDefinedLibrary')"
                @click="changeToUserDefinedList">
          <i class="cn-icon-add-knowledge-base cn-icon" ></i>
          <span>{{$t('knowledgeBase.userDefinedLibrary')}}</span>
        </button>
      </div>
    </div>

    <!-- 内置库列表 -->
    <div class="knowledge-base-built-in__content" >
      <div class="list-card" >
        <div class="list-mode__card" >
          <loading :loading="loading"></loading>
          <knowledge-base-table-for-card
                  ref="dataTableCard"
                  :api="url"
                  :isNoData="isNoData"
                  :table-data="tableData"
                  :is-selected-status="isSelectedStatus"
                  @delete="toDelete"
                  @checkboxStatusChange="checkboxStatusChange"
                  @reload="getBuiltInData"
                  @toggleLoading="toggleLoading"
          ></knowledge-base-table-for-card>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="showConfirmDialog"
             :title="$t('overall.hint')"
             width="480px"
             custom-class="del-model-hint"
             :before-close="handleClose">
    <div class="dialog-message">{{$t('knowledge.deleteDataHint')}}</div>
    <el-table v-model="delItemList"
              ref="delDataTable"
              :data="batchDeleteObjs"
              @selection-change="secondSelectionChange"
              height="156px"
              width="100%"
              class="dialog-table"
              cell-style="padding:4px 0px;font-size: 12px;color: #353636;font-weight: 400;"
              header-cell-style="padding:4px 0px;background: #F5F8FA;font-size: 12px;color: #353636;font-weight: 500;">
      <el-table-column
              :resizable="false"
              align="center"
              type="selection"
              width="50">
      </el-table-column>
      <el-table-column property="knowledgeId" label="ID" width="150"></el-table-column>
      <el-table-column property="name" label="Name"></el-table-column>
      <!--  <el-table-column property="category" label="Category" width="100" :formatter = "categoryFormat"></el-table-column>
        <el-table-column property="source" label="Source" width="110" :formatter = "sourceFormat"></el-table-column> -->
    </el-table>
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmDialog = false">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="submit">{{ $t('tip.confirm') }}</el-button>
        </span>
    </template>
  </el-dialog>
</template>
<script>
import dataListMixin from '@/mixins/data-list'
import KnowledgeBaseTableForCard from '@/components/table/setting/knowledgeBaseTableForCard'
import { api } from '@/utils/api'
import { knowledgeBaseCategory, knowledgeBaseSource, knowledgeCategoryValue } from '@/utils/constants'
import axios from 'axios'

export default {
  name: 'knowledgeBase',
  components: {
    KnowledgeBaseTableForCard
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: api.knowledgeBase,
      listUrl: api.knowledgeBaseList,
      tableId: 'knowledgeBaseTable', // 需要分页的table的id，用于记录每页数量
      isSelectedStatus: false,
      filterParams: {},
      checkedCategoryIds: [],
      checkedStatusIds: [],
      keyWord: '',
      showConfirmDialog: false,
      delItemList: [],
      secondBatchDeleteObjs: []
    }
  },
  watch: {
  },
  methods: {
    categoryFormat (row, column) {
      const category = row.category
      const t = knowledgeBaseCategory.find(t => t.value === category)
      return t ? t.name : category
    },
    sourceFormat (row, column) {
      const source = row.source
      const t = knowledgeBaseSource.find(t => t.value === source)
      return t ? t.name : source
    },
    handleClose () {
      this.showConfirmDialog = false
    },
    showDelDialog () {
      this.showConfirmDialog = true
      this.$nextTick(() => {
        this.batchDeleteObjs.forEach((item) => {
          this.$refs.delDataTable.toggleRowSelection(item, true)
        })
      })
    },
    secondSelectionChange (objs) {
      this.secondBatchDeleteObjs = objs
    },
    selectionChange (objs) {
      this.batchDeleteObjs = []
      objs.forEach(obj => {
        const delObj = this.batchDeleteObjs.find(item => item.knowledgeId === obj.knowledgeId)
        if (delObj === undefined) {
          this.batchDeleteObjs.push(obj)
        }
      })
      if (this.batchDeleteObjs.length === 1) {
        this.disableEdit = false
      } else {
        this.disableEdit = true
      }
      if (this.batchDeleteObjs.length >= 1) {
        this.disableDelete = false
      } else {
        this.disableDelete = true
      }
    },
    checkboxStatusChange (isCheck, data) {
      if (isCheck) {
        const delObj = this.batchDeleteObjs.find(item => item.knowledgeId === data.knowledgeId)
        if (delObj === undefined) {
          this.batchDeleteObjs.push(data)
        }
      } else {
        const cancleObjIndex = this.batchDeleteObjs.findIndex(item => item.knowledgeId === data.knowledgeId)
        if (cancleObjIndex > -1) {
          this.batchDeleteObjs.splice(cancleObjIndex, 1)
        }
      }
      if (this.batchDeleteObjs.length === 1) {
        this.disableEdit = false
      } else {
        this.disableEdit = true
      }
      if (this.batchDeleteObjs.length >= 1) {
        this.disableDelete = false
      } else {
        this.disableDelete = true
      }
    },
    delBatchKnowledge () {
      const ids = []
      if (this.secondBatchDeleteObjs && this.secondBatchDeleteObjs.length > 0) {
        this.secondBatchDeleteObjs.forEach(item => {
          ids.push(item.knowledgeId)
        })
      }
      let hasReference = false
      let referenceKnowledge = null
      this.batchDeleteObjs.forEach(item => {
        if (item.reference && item.reference.length > 0) {
          hasReference = true
          referenceKnowledge = item
        }
      })

      if (ids.length === 0) {
        this.$alert(this.$t('tip.pleaseSelect'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {})
      } else if (hasReference) {
        this.$message.error(this.$t('knowledgeBase.deleteReferenceObjects', { name: referenceKnowledge.name }))
      } else {
        this.toggleLoading(true)
        axios.delete(this.url + '?knowledgeIds=' + ids).then(response => {
          if (response.status === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.secondBatchDeleteObjs.forEach((item) => {
              this.$refs.delDataTable.toggleRowSelection(item, false)
            })
            this.secondBatchDeleteObjs = []
            this.batchDeleteObjs = []
            // delete this.searchLabel.category
            delete this.searchLabel.source
            this.searchLabel.category = knowledgeCategoryValue.userDefined
            this.getTableData()
          } else {
            this.$message.error(response.data.message)
          }
        }).finally(() => {
          this.toggleLoading(false)
          if (this.isSelectedStatus != undefined) {
            this.isSelectedStatus = false
            this.disableDelete = true
            this.secondBatchDeleteObjs = []
            this.batchDeleteObjs = []
            this.showConfirmDialog = false
          }
        })
      }
    },
    submit () {
      this.delBatchKnowledge()
      this.showConfirmDialog = false
    },
    edit (u) {
      axios.get(`${this.url}/${u.id}`).then(response => {
        if (response.status === 200) {
          this.object = response.data.data.list[0]
        }
      }).catch(e => {
        console.error(e)
        if (e.response.data && e.response.data.message) {
          this.$message.error(e.response.data.message)
        } else {
          this.$message.error(this.$t('tip.somethingWentWrong'))
        }
      })
    },
    reload (params, isAll, isClearType, checkedCategoryIds, checkedStatusIds) {
      this.disableDelete = true
      this.isSelectedStatus = false
      this.batchDeleteObjs = []
      this.secondBatchDeleteObjs = []
      this.filterParams = params
      this.checkedCategoryIds = checkedCategoryIds
      this.checkedStatusIds = checkedStatusIds
      params = {
        ...params,
        name: this.keyWord
      }
      this.getTableData(params, isAll, isClearType)
    },
    clearList () {
      this.disableDelete = true
      this.isSelectedStatus = false
      this.batchDeleteObjs = []
      this.secondBatchDeleteObjs = []
      this.tableData = []
      this.pageObj.total = 0
    },
    toSelect () {
      this.$refs.dataTableCard.clearSelect()
      this.isSelectedStatus = !this.isSelectedStatus
      this.disableDelete = true
      this.batchDeleteObjs = []
      this.secondBatchDeleteObjs = []
    },
    editSelectRecord () {
      if (this.batchDeleteObjs.length === 0) {
        this.$alert(this.$t('tip.pleaseSelectForEdit'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {})
      } else {
        this.jumpToEditPage(this.batchDeleteObjs[0].knowledgeId)
      }
    },
    changeToUserDefinedList () {
      this.$router.push({
        path: '/knowledgeBase/userDefined',
        query: {
          t: +new Date()
        }
      })
    },
    toDelete (data) {
      if (data && data.knowledgeId) {
        this.secondBatchDeleteObjs = []
        this.batchDeleteObjs = []
        this.secondBatchDeleteObjs.push(data)
        this.batchDeleteObjs.push(data)
      }
      this.showDelDialog()
    },
    del (row) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.toggleLoading(true)
        axios.delete(this.url + '?knowledgeIds=' + row.id).then(response => {
          if (response.status === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            // delete this.searchLabel.category
            delete this.searchLabel.source
            this.searchLabel.category = knowledgeCategoryValue.userDefined
            this.getTableData()
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(e => {
          console.error(e)
          if (e.response.data && e.response.data.message) {
            this.$message.error(e.response.data.message)
          } else {
            this.$message.error(this.$t('tip.somethingWentWrong'))
          }
        }).finally(() => {
          this.toggleLoading(false)
        })
      }).catch(() => {})
    },
    getBuiltInData () {
      this.isNoData = false
      this.toggleLoading(true)
      const params = {
        category: knowledgeCategoryValue.aiTagging + ',' + knowledgeCategoryValue.webSketch,
        pageSize: -1
      }
      axios.get(this.listUrl, { params }).then(response => {
        if (response.status === 200) {
          this.tableData = response.data.data.list
          this.isNoData = !this.tableData || this.tableData.length === 0
        } else {
          console.error(response.data)
          this.isNoData = true
          if (response.data.message) {
            this.$message.error(response.data.message)
          } else {
            this.$message.error(this.$t('tip.somethingWentWrong'))
          }
        }
      }).catch(() => {
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.filterParams = {}
    this.getBuiltInData()
  }
}
</script>
