<template>
  <div class="detection">
    <div class="detection-title">
      <span>{{ $t('overall.detections') }}</span>
      <span class="detection-title-label">
        60 Polices created(200 max） | 32 polices enabled(100 max)
      </span>
    </div>

    <div class="detection-content">
      <div class="detection-filter">
        <detection-filter></detection-filter>
      </div>

      <div class="detection-block">
        <detection-tools
            @delete="toDelete"
            @create="onCreate"
            @search="onSearch"
            :disableDelete="disableDelete"/>

        <div class="detection-table" style="position: relative">
          <loading :loading="loading"></loading>
          <detection-table
              ref="dataTable"
              height="100%"
              :api="url"
              :isNoData="isNoData"
              :custom-table-title="tools.customTableTitle"
              :table-data="tableData"
              :is-selected-status="isSelectedStatus"
              :all-count="18"
              @selectionChange="selectionChange"
              @reload="reloadRowList"
              @toggleLoading="toggleLoading"
              @rowDoubleClick="onRowDoubleClick"
          ></detection-table>
        </div>

        <div class="knowledge-pagination">
          <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
        </div>
      </div>
    </div>
  </div>

  <el-dialog
      v-model="showConfirmDialog"
      :title="$t('overall.hint')"
      width="480px"
      custom-class="del-model-hint"
      :before-close="handleClose">
    <div class="dialog-message">{{ $t('knowledge.deleteDataHint') }}</div>
    <el-table v-model="delItemList"
              ref="delDataTable"
              :data="batchDeleteObjs"
              @selection-change="secondSelectionChange"
              height="156px"
              width="100%"
              class="dialog-table"
              cell-style="padding:4px 0px;font-size: 12px;color: #353636;font-weight: 400;"
              header-cell-style="padding:4px 0px;background: #F5F8FA;font-size: 12px;color: #353636;font-weight: 500;">
      <el-table-column :resizable="false" align="center" type="selection" width="50"></el-table-column>
      <el-table-column property="ruleId" label="ID" width="70"></el-table-column>
      <el-table-column property="name" label="Name"></el-table-column>
      <el-table-column property="category" label="Category" width="100" :formatter="categoryFormat"></el-table-column>
      <el-table-column property="function" label="Function" width="110" :formatter="sourceFormat"></el-table-column>
    </el-table>
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmDialog = false">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="submit">{{ $t('tip.confirm') }}</el-button>
        </span>
    </template>
  </el-dialog>

  <div class="detection-drawer">
    <el-drawer v-model="showDrawer" :with-header="false">
      <detection-drawer :drawer-info="drawerInfo"></detection-drawer>
    </el-drawer>
  </div>

</template>

<script>
import DetectionFilter from '@/views/detectionsNew/DetectionFilter'
import DetectionTools from '@/views/detectionsNew/DetectionTools'
import DetectionTable from '@/views/detectionsNew/DetectionTable'
import { api } from '@/utils/api'
import dataListMixin from '@/mixins/data-list'
import DetectionDrawer from '@/views/detectionsNew/DetectionDrawer'

export default {
  name: 'Index',
  components: {
    DetectionFilter,
    DetectionTools,
    DetectionTable,
    DetectionDrawer
  },
  mixins: [dataListMixin],
  data () {
    return {
      // url: api.detection.list,
      url: api.knowledgeBase,
      listUrl: api.detection.list,
      tableId: 'detectionTable',
      isNoData: false,
      tableData: [],
      isSelectedStatus: false,
      batchDeleteObjs: [], // 待删除列表
      secondBatchDeleteObjs: [],
      disableDelete: true,
      showConfirmDialog: false,
      delItemList: [],
      showDrawer: false,
      drawerInfo: {}
    }
  },
  methods: {
    onSearch () {
      // todo 暂时禁用，后续再开发时解禁
      // const params = {
      //   ...this.filterParams,
      //   name: this.keyWord
      // }
      // this.clearList()
      // this.search(params)
      // this.$refs.knowledgeFilter.reloadFilter(this.checkedCategoryIds, this.checkedStatusIds)
    },
    toDelete (data) {
      // todo 暂时禁用，后续再开发时解禁
      // if (data && data.ruleId) {
      //   this.secondBatchDeleteObjs = []
      //   this.batchDeleteObjs = []
      //   this.secondBatchDeleteObjs.push(data)
      //   this.batchDeleteObjs.push(data)
      // }
      // this.showDelDialog()
    },
    onCreate () {
      // todo 暂时禁用，后续再开发时解禁
      // this.$router.push({
      //   path: '/detection/policies/create',
      //   query: {
      //     t: +new Date()
      //   }
      // })
    },
    selectionChange (objs) {
      this.batchDeleteObjs = []
      objs.forEach(obj => {
        const delObj = this.batchDeleteObjs.find(item => item.ruleId === obj.ruleId)
        if (delObj === undefined) {
          this.batchDeleteObjs.push(obj)
        }
      })
      this.disableEdit = this.batchDeleteObjs.length !== 1
      this.disableDelete = this.batchDeleteObjs.length < 1
    },
    reloadRowList () {
      this.getTableData()
    },
    toggleLoading () {
    },
    showDelDialog () {
      this.showConfirmDialog = true
      this.$nextTick(() => {
        this.batchDeleteObjs.forEach((item) => {
          this.$refs.delDataTable.toggleRowSelection(item, true)
        })
      })
    },
    handleClose () {
      this.showConfirmDialog = false
    },
    secondSelectionChange (objs) {
      this.secondBatchDeleteObjs = objs
    },
    categoryFormat (row, column) {
      // const category = row.category
      // const t = knowledgeBaseCategory.find(t => t.value === category)
      // return t ? t.name : category
    },
    sourceFormat (row, column) {
      // const source = row.source
      // const t = knowledgeBaseSource.find(t => t.value === source)
      // return t ? t.name : source
    },
    submit () {
      this.delBatchDetection()
      this.showConfirmDialog = false
    },
    delBatchDetection () {
      const ids = []
      if (this.secondBatchDeleteObjs && this.secondBatchDeleteObjs.length > 0) {
        this.secondBatchDeleteObjs.forEach(item => {
          ids.push(item.ruleId)
        })
      }
      if (ids.length === 0) {
        this.$alert(this.$t('tip.pleaseSelect'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {
        })
      } else {
        // todo 调用接口删除
        // this.toggleLoading(true)
        // axios.delete(api.detection.delete + '?ruleIds=' + ids).then(response => {
        //   if (response.data.code === 200) {
        //     this.delFlag = true
        //     this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
        //     this.secondBatchDeleteObjs.forEach((item) => {
        //       this.$refs.delDataTable.toggleRowSelection(item, false)
        //     })
        //     this.$refs.knowledgeFilter.reloadFilter()
        //     this.secondBatchDeleteObjs = []
        //     this.batchDeleteObjs = []
        //     delete this.searchLabel.category
        //     delete this.searchLabel.source
        //     this.getTableData()
        //   } else {
        //     this.$message.error(response.data.message)
        //   }
        // }).finally(() => {
        //   this.toggleLoading(false)
        //   if (this.isSelectedStatus != undefined) {
        //     this.isSelectedStatus = false
        //     this.disableDelete = true
        //     this.secondBatchDeleteObjs = []
        //     this.batchDeleteObjs = []
        //     this.showConfirmDialog = false
        //   }
        // })
      }
    },
    onRowDoubleClick (data) {
      // todo 暂时禁用，后续再开发时解禁
      // this.showDrawer = true
      // this.drawerInfo = data
    }
  }
}
</script>

<style lang="scss" scoped>
.detection {
  padding: 20px;
  height: 100%;
  overflow: auto;

  .detection-title {
    font-family: NotoSansHans-Black;
    line-height: 24px;
    font-size: 24px;
    color: #353636;
    font-weight: 900;
    display: flex;
    flex-direction: column;

    .detection-title-label {
      font-family: NotoSansSChineseRegular;
      font-size: 12px;
      color: #717171;
      letter-spacing: 0;
      line-height: 18px;
      font-weight: 400;
      margin-top: 5px;
    }
  }

  .detection-content {
    margin-top: 15px;
    width: 100%;
    height: calc(100% - 96px);
    display: flex;

    .detection-filter {
      width: 320px;
      height: calc(100% + 34px);
      background: #FFFFFF;
      border: 1px solid rgba(226, 229, 236, 1);
      border-radius: 4px;
      margin-right: 20px;
    }

    .detection-block {
      width: calc(100% - 340px);

      .detection-table {
        width: 100%;
        height: calc(100% - 44px);
        border-radius: 4px;
        margin-top: 12px;
      }
    }
  }
}
</style>
