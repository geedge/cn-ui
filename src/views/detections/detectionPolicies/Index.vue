<template>
  <div class="detection">
    <div class="detection-title">
      <span>{{ $t('overall.policies') }}</span>
      <span class="detection-title-label">
        {{ $t('detection.policesCreated', { total: policyTotal }) }}  |  {{ $t('detection.policesEnabled', { enabled: policyEnabledNum }) }}
      </span>
    </div>

    <div class="detection-content">
      <div class="detection-filter">
        <detection-filter @filterParams="getFilterParams" @policyTotal="getPolicyTotal" />
      </div>

      <div class="detection-block">
        <detection-tools
            @delete="toDelete"
            @create="onCreate"
            @edit="onEdit"
            @search="onSearch"
            :disableEdit="disableEdit"
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
      <el-table-column property="ruleId" label="ID" width="150"></el-table-column>
      <el-table-column property="name" label="Name"></el-table-column>
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
import DetectionFilter from '@/views/detections/detectionPolicies/PolicyFilter'
import DetectionTools from '@/views/detections/detectionPolicies/PolicyTools'
import DetectionTable from '@/views/detections/detectionPolicies/PolicyTable'
import { api } from '@/utils/api'
import dataListMixin from '@/mixins/data-list'
import DetectionDrawer from '@/views/detections/detectionPolicies/PolicyDrawer'
import axios from 'axios'

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
      url: api.detection.list,
      // url: api.knowledgeBase,
      listUrl: api.detection.list,
      tableId: 'detectionTable',
      isNoData: false,
      tableData: [],
      isSelectedStatus: false,
      batchDeleteObjs: [], // 待删除列表
      secondBatchDeleteObjs: [],
      disableEdit: true,
      disableDelete: true,
      showConfirmDialog: false,
      delItemList: [],
      showDrawer: false,
      drawerInfo: {},
      filterParams: {},
      policyTotal: 0,
      policyEnabledNum: 0
    }
  },
  methods: {
    onSearch (keyWord) {
      this.filterParams = {
        ...this.filterParams,
        q: keyWord
      }
      this.search(this.filterParams, 'detection')
    },
    toDelete (data) {
      if (data && data.ruleId) {
        this.secondBatchDeleteObjs = []
        this.batchDeleteObjs = []
        this.secondBatchDeleteObjs.push(data)
        this.batchDeleteObjs.push(data)
      }
      this.showDelDialog()
    },
    onCreate () {
      this.$router.push({
        path: '/detectionPolicy/create',
        query: {
          t: +new Date()
        }
      })
    },
    onEdit () {
      const pageNo = this.$router.currentRoute.value.query.pageNo
      this.$router.push({
        path: '/detectionPolicy/edit',
        query: {
          t: +new Date(),
          pageNoForTable: pageNo || 1,
          id: this.batchDeleteObjs[0].ruleId
        }
      })
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
        this.toggleLoading(true)
        axios.delete(api.detection.delete + '?ruleIds=' + ids).then(response => {
          if (response.status === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.secondBatchDeleteObjs.forEach((item) => {
              this.$refs.delDataTable.toggleRowSelection(item, false)
            })
            this.secondBatchDeleteObjs = []
            this.batchDeleteObjs = []
            delete this.searchLabel.category
            delete this.searchLabel.source
            this.getTableData()
          } else {
            this.$message.error(response.data.message)
          }
        }).finally(() => {
          this.toggleLoading(false)
          if (this.isSelectedStatus) {
            this.isSelectedStatus = false
            this.disableDelete = true
            this.secondBatchDeleteObjs = []
            this.batchDeleteObjs = []
            this.showConfirmDialog = false
          }
        })
      }
    },
    onRowDoubleClick (data) {
      this.showDrawer = true
      this.drawerInfo = data
    },
    getFilterParams (params) {
      const delList = []
      if (params.status) {
        this.filterParams.status = params.status
      } else {
        delete this.filterParams.status
        delList.push('status')
      }
      if (params.category) {
        this.filterParams.category = params.category
      } else {
        delete this.filterParams.category
        delList.push('category')
      }
      if (params.eventType) {
        this.filterParams.eventType = params.eventType
      } else {
        delete this.filterParams.eventType
        delList.push('eventType')
      }

      this.search(this.filterParams, 'detection', delList)
    },
    getPolicyTotal (total, enabledNum) {
      this.policyTotal = total
      this.policyEnabledNum = enabledNum
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
