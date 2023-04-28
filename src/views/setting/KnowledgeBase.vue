<template>
  <div style="height: 100%;overflow:auto;" class="knowledge-base">
    <div class="top-title">
      {{$t('overall.knowledgeBase')}}
    </div>
    <div class="knowledge-base__content" style="">
      <div class="left-filter" style="">
          <knowledge-filter ref="knowledgeFilter"
                  @reload="reload"
                  @clearList="clearList"></knowledge-filter>
      </div>
      <div class="right-list-card" style="">
        <div class="top-tools" style="">
          <button id="knowledge-base-add" :title="$t('knowledgeBase.createKnowledgeBase')" class="top-tool-btn margin-r-10 top-tool-btn--create"
                  style="width:72px;"
                  @click="jumpToCreatePage">
            <i class="cn-icon-xinjian cn-icon"></i>
            <span>{{$t('overall.create')}}</span>
          </button>
          <button id="knowledge-base-edit" :title="$t('knowledgeBase.select')" class="top-tool-btn margin-r-10"
                  style="width:72px;"
                  @click="toSelect">
            <i class="cn-icon-select cn-icon" ></i>
            <span>{{$t('overall.select')}}</span>
          </button>
          <button id="knowledge-base-delete" :title="$t('knowledgeBase.deleteKnowledgeBase')" class="top-tool-btn margin-r-10"
                  style="width:72px;" :disabled="disableDelete"
                  @click="toDelete">
            <i class="cn-icon-delete cn-icon"></i>
            <span>{{$t('overall.delete')}}</span>
          </button>
          <div class="top-tool-search margin-l-10" style="">
            <el-input v-model="keyWord"  size="small" @keyup.enter="onSearch"></el-input>
            <button class="top-tool-btn  top-tool-btn--search" style="border-radius: 0 2px 2px 0 !important;" @click="onSearch">
              <i class="el-icon-search"></i>
            </button>
          </div>
        </div>
        <div class="cards" style="" >
          <knowledge-base-table
                  ref="dataTable"
                  v-loading="tools.loading"
                  :api="url"
                  :custom-table-title="tools.customTableTitle"
                  :table-data="tableData"
                  :is-selected-status="isSelectedStatus"
                  :all-count="18"
                  @delete="toDelete"
                  @checkboxStatusChange="checkboxStatusChange"
          ></knowledge-base-table>
        </div>
        <div class="knowledge-pagination" style="">
          <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
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
              :row-style="rowStyle"
              cell-style="padding:4px 0px;font-size: 12px;color: #353636;font-weight: 400;"
              header-cell-style="padding:4px 0px;background: #F5F8FA;font-size: 12px;color: #353636;font-weight: 500;"
              :header-row-style="tableHeaderRowStyle">
      <el-table-column
              :resizable="false"
              align="center"
              type="selection"
              width="50">
      </el-table-column>
      <el-table-column property="id" label="ID" width="112"></el-table-column>
      <el-table-column property="tagType" label="Type" width="112"></el-table-column>
      <el-table-column property="tagName" label="Name"></el-table-column>
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
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import KnowledgeBaseTable from '@/components/table/setting/KnowledgeBaseTable'
import { api } from '@/utils/api'
import axios from 'axios'
import KnowledgeFilter from '@/views/setting/KnowledgeFilter'

export default {
  name: 'knowledgeBase',
  components: {
    cnDataList,
    KnowledgeBaseTable,
    KnowledgeFilter
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: api.knowledgeBase,
      tableId: 'knowledgeBaseTable', // 需要分页的table的id，用于记录每页数量
      isSelectedStatus: false,
      keyWord: '',
      showConfirmDialog: false,
      delItemList: [],
      secondBatchDeleteObjs: []
    }
  },
  watch: {
  },
  methods: {
    onSearch () {
      const params = {
        q: this.keyWord
      }
      this.clearList()
      this.search(params)
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

    delBatchKnowledge () {
      const ids = []
      if (this.secondBatchDeleteObjs && this.secondBatchDeleteObjs.length > 0) {
        this.secondBatchDeleteObjs.forEach(item => {
          ids.push(item.id)
        })
      }
      if (ids.length === 0) {
        this.$alert(this.$t('tip.pleaseSelect'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {})
      } else {
        this.tools.loading = true
        axios.delete(this.url + '?ids=' + ids).then(response => {
          if (response.data.code === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.secondBatchDeleteObjs.forEach((item) => {
              this.$refs.delDataTable.toggleRowSelection(item, false)
            })
            this.$refs.knowledgeFilter.reloadFilter()
            this.secondBatchDeleteObjs = []
            this.batchDeleteObjs = []
            this.getTableData()
          } else {
            this.$message.error(response.data.message)
          }
        }).finally(() => {
          this.tools.loading = false
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
    tableHeaderRowStyle ({ row, rowIndex }) {
      // if (rowIndex === 0) {
      // return 'font-weight: 500;font-size: 14px;'
      // }
    },
    rowStyle ({ row, rowIndex }) {
      // return 'height:32px !important;'//font-size: 14px;color: #666666;font-weight: 400;
    },
    submit () {
      this.delBatchKnowledge()
      this.showConfirmDialog = false
    },
    edit (u) {
      axios.get(`${this.url}/${u.id}`).then(response => {
        if (response.data.code === 200) {
          this.object = response.data.data.list[0]
          console.info(this.object)
        }
      }).catch(e => {
        console.error(e)
        if (e.response.data && e.response.data.message) {
          this.$message.error(e.response.data.message)
        } else {
          this.$message.error('Something went wrong...')
        }
      })
    },
    reload (params, isAll, isClearType) {
      this.disableDelete = true
      this.isSelectedStatus = false
      this.batchDeleteObjs = []
      this.secondBatchDeleteObjs = []
      this.getTableData(params, isAll, isClearType)
    },
    clearList () {
      this.disableDelete = true
      this.isSelectedStatus = false
      this.batchDeleteObjs = []
      this.secondBatchDeleteObjs = []
      this.tableData = 0
      this.pageObj.total = 0
    },
    toSelect () {
      this.$refs.dataTable.clearSelect()
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
        this.jumpToEditPage(this.batchDeleteObjs[0].id)
      }
    },
    toDelete (data) {
      if (data && data.id) {
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
        this.tools.loading = true
        axios.delete(this.url + '?ids=' + row.id).then(response => {
          if (response.data.code === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(e => {
          console.error(e)
          if (e.response.data && e.response.data.message) {
            this.$message.error(e.response.data.message)
          } else {
            this.$message.error('Something went wrong...')
          }
        }).finally(() => {
          this.tools.loading = false
        })
      }).catch(() => {})
    },
    jumpToEditPage (id) {
      this.$router.push({
        path: '/knowledgeBase/edit',
        query: {
          t: +new Date(),
          id: id
        }
      })
    },
    jumpToCreatePage () {
      this.$router.push({
        path: '/knowledgeBase/create',
        query: {
          t: +new Date()
        }
      })
    }
  },
  mounted () {

  },
  computed: {
  }
}
</script>
<style lang="scss">
  .del-model__hint {
    display:flex;
    flex-direction: column;
    padding-bottom:0px !important;
    width:480px !important;
    height:190px;
    .el-message-box__header{
      display: flex;
      flex-direction: row;
      border-bottom:1px solid #eee;
      height:42px;
      background: #F7F7F7;
      box-shadow: 0 1px 0 0 rgba(53,54,54,0.08);
      padding-left:20px;
      padding-top:14px;
      padding-bottom:14px;
      .el-message-box__headerbtn {
        display: flex !important;
        flex-direction: row-reverse;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        line-height: 10px;
        padding-right: 5px !important;
        i {
          width:10px;
          height:10px;
        }
      }
      .el-message-box__title {
        font-size: 14px !important;
        color: #353636;
        letter-spacing: 0;
        font-weight: 400;
      }
    }
    .el-message-box__content {
      height:96px;
      font-size: 14px;
      color: #353636;
      letter-spacing: 0;
      line-height: 22px;
      font-weight: 400;
      padding-top:8px;
      padding-right:20px;
      padding-left:20px;
      .el-message-box__message {
        padding-left:0px !important;
        padding-right:0px !important;
      }
    }
    .el-message-box__btns {
      height:52px;
      border-top:1px solid #eee;
      box-shadow: inset 0 -1px 0 0 rgba(0,0,0,0.07);
      padding:11px 0px 12px!important;
      .el-button--small {
        padding:8px 21px !important;
        line-height: 12px;
        //font-family: NotoSansHans-Medium !important;
        font-size: 12px;
        font-weight: 500;
        min-height: 28px;
      }
      .el-button:nth-child(1) {
        margin-right:20px;
        width:80px;
        height:28px;
        color: #353636;
      }
      .el-button:nth-child(2) {
        width:80px;
        height:28px;
        margin-right:20px;
        margin-left:0px !important;
        background-color:#2d8cf0;
        border-color:#2d8cf0;
      }
    }
  }
  .el-dialog {
    display: flex;
    flex-direction: column; // 水平分布
    margin: 0 !important;
    position: absolute;
    top: calc(50% - 150px);
    left: calc(50% - 240px);
  }
</style>
