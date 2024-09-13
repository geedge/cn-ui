<template>
  <div class="knowledge-base">
    <div class="knowledge-base__top">
      <div class="top-title">
        {{$t('overall.knowledgeBase')}}
      </div>
    </div>
    <!-- 用户自定义列表 -->
    <div class="knowledge-base-user-defined__content" >
      <div class="right-list-card" >
        <div class="top-tools" >
          <div class="top-tools__left">
            <button id="knowledge-base-add" :title="$t('knowledgeBase.createKnowledgeBase')" class="top-tool-btn margin-r-10 top-tool-btn--create"
                    style="width:72px;"
                    v-if="hasPermission('createUserDefinedLibrary')"
                    @click="jumpToCreatePage">
              <i class="cn-icon-xinjian cn-icon"></i>
              <span>{{$t('overall.create')}}</span>
            </button>
            <button id="knowledge-base-edit" :title="$t('knowledgeBase.editKnowledgeBase')" class="top-tool-btn margin-r-10"  :disabled="disableEdit"
                    style="width:72px;"
                    v-if="hasPermission('editUserDefinedLibrary')"
                    @click="editSelectRecord">
              <i class="cn-icon-edit cn-icon" ></i>
              <span>{{$t('overall.edit')}}</span>
            </button>
            <button id="knowledge-base-delete" :title="$t('knowledgeBase.deleteKnowledgeBase')" class="top-tool-btn margin-r-10"
                    v-if="hasPermission('deleteUserDefinedLibrary')"
                    style="width:72px;" :disabled="disableDelete"
                    @click="toDelete">
              <i class="cn-icon-delete cn-icon"></i>
              <span>{{$t('overall.delete')}}</span>
            </button>
            <div class="top-tool-search margin-l-10" >
              <el-input v-model="keyWord"  size="small" @keyup.enter="onSearch"></el-input>
              <button class="top-tool-btn top-tool-btn--search" @click="onSearch">
                <el-icon><Search /></el-icon>
                <!--<i class="el-icon-search"></i>-->
              </button>
            </div>
          </div>
        </div>
        <div class="list-mode__row" style="position:relative;">
          <loading :loading="loading"></loading>
          <knowledge-base-table-for-row
                  ref="dataTable"
                  :api="url"
                  :isNoData="isNoData"
                  :custom-table-title="tools.customTableTitle"
                  :table-data="tableData"
                  :is-selected-status="isSelectedStatus"
                  @delete="toDelete"
                  @selectionChange="selectionChange"
                  @edit="edit"
                  @orderBy="tableDataSort"
                  @reload="reloadRowList"
                  @toggleLoading="toggleLoading"
          ></knowledge-base-table-for-row>
        </div>
        <div class="knowledge-pagination" >
          <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="showConfirmDialog"
             :title="$t('overall.hint')"
             width="480px"
             custom-class="del-model-hint"
             class="del-model-hint"
             :before-close="handleClose">
    <div class="dialog-message">{{$t('knowledge.deleteDataHint')}}</div>
    <el-table v-model="delItemList"
              ref="delDataTable"
              :data="batchDeleteObjs"
              @selection-change="secondSelectionChange"
              height="156px"
              width="100%"
              class="dialog-table"
              :cell-style="myCellStyle"
              :header-cell-style="myHeaderCellStyle">
      <el-table-column
              :resizable="false"
              align="center"
              type="selection"
              width="50">
      </el-table-column>
      <el-table-column property="knowledgeId" label="ID" width="150"></el-table-column>
      <el-table-column property="name" label="Name"></el-table-column>
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
import KnowledgeBaseTableForRow from '@/components/table/setting/KnowledgeBaseTableForRow'
import { api } from '@/utils/api'
import { knowledgeBaseCategory, knowledgeBaseSource, knowledgeCategoryValue } from '@/utils/constants'
import axios from 'axios'

export default {
  name: 'knowledgeBaseUserDefinedList',
  components: {
    KnowledgeBaseTableForRow
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
      secondBatchDeleteObjs: [],
      myCellStyle: {
        padding: '4px 0px',
        'font-size': '12px',
        color: '#353636',
        'font-weight': 400
      },
      myHeaderCellStyle: {
        padding: '4px 0px',
        background: '#F5F8FA',
        'font-size': '12px',
        color: '#353636',
        'font-weight': 500
      }
    }
  },
  watch: {
  },
  methods: {
    onSearch () {
      const params = {
        ...this.filterParams,
        name: this.keyWord,
        category: knowledgeCategoryValue.userDefined
      }
      this.clearList()
      this.search(params)
    },
    reloadRowList () {
      this.searchLabel.category = knowledgeCategoryValue.userDefined
      this.getTableData()
    },
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
        const cancelObjIndex = this.batchDeleteObjs.findIndex(item => item.knowledgeId === data.knowledgeId)
        if (cancelObjIndex > -1) {
          this.batchDeleteObjs.splice(cancelObjIndex, 1)
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
        customClass: 'del-model-message-box',
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
    jumpToEditPage (id) {
      const pageNo = this.$router.currentRoute.value.query.pageNo
      this.$router.push({
        path: '/knowledgeBase/userDefined/edit',
        query: {
          t: +new Date(),
          pageNoForTable: pageNo || 1,
          id: id
        }
      })
    },
    jumpToCreatePage () {
      this.$router.push({
        path: '/knowledgeBase/userDefined/create',
        query: {
          t: +new Date()
        }
      })
    }
  },
  mounted () {
    this.filterParams = {}
    this.searchLabel.category = knowledgeCategoryValue.userDefined
  }
}
</script>
