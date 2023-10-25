<template>
  <template v-if="!isNoData">
    <div class="card-type-title" v-if="aiTaggingList.length > 0">{{$t('knowledgeBase.intelligenceLearning')}}</div>
    <el-checkbox-group v-model="checkList" >
      <div class="card-box" v-for="data in aiTaggingList" :key="data.knowledgeId">
        <div @click="isSelectedStatus && data.isBuiltIn !== 1 && clickCard(data,$event)" @mouseenter="mouseenter(data)" @mouseleave="mouseleave(data)" class="card-item"  :class="data.isSelected ? 'card-selected' : ''">
          <div class="card-content">
            <div class="card-operate">
              <el-switch v-model="data.status"
                         class="card-enable"
                         active-color="#38ACD2"
                         inactive-color="#C0CEDB"
                         :active-value="1"
                         :inactive-value="0"
                         :before-change="(knowledgeId) => confirmSwitchLearning(data.knowledgeId)"
              >
              </el-switch>
            </div>
            <div class="card-icon">
              <img :src="data.iconUrl"/>
            </div>
            <div class="card-title">
              <div class="card-title-name" :title="data.label">{{data.label}}</div>
            </div>
            <div class="card-desc" :title="data.desc">{{data.desc ? data.desc : '—'}}</div>
          </div>
          <div class="card-operate__footer">
            <button v-if="data.showUpdate"
                    class="top-tool-btn--update"
                    @click="jumpToUpdatePage(data,true)">
              <i class="cn-icon-update-knowledge-base cn-icon"></i>
              <span>{{$t('overall.update')}}</span>
            </button>
          </div>
        </div>
      </div>
    </el-checkbox-group>
    <div class="card-type-title" style="margin-top:4px;"  v-if="websketchList.length > 0">{{$t('knowledgeBase.websketchIntegration')}}</div>
    <el-checkbox-group v-model="checkList" >
      <div class="card-box" v-for="data in websketchList" :key="data.knowledgeId">
        <div @click="isSelectedStatus && data.isBuiltIn !== 1 && clickCard(data,$event)"  @mouseenter="mouseenter(data)" @mouseleave="mouseleave(data)" class="card-item"  :class="data.isSelected ? 'card-selected' : ''">
        <div class="card-content">
          <div class="card-icon">
            <img :src="data.iconUrl"/>
          </div>
          <div class="card-title">
            <div class="card-title-name" :title="data.label">{{data.label}}</div>
          </div>
          <div class="card-desc" :title="data.desc ? data.desc:'—'">{{data.desc ? data.desc : '—'}}</div>
        </div>
        <div class="card-operate__footer">
          <button v-if="data.showUpdate" :title="$t('overall.update')" class="top-tool-btn--update"
                  @click="jumpToUpdatePage(data,false)">
            <i class="cn-icon-update-knowledge-base cn-icon"></i>
            <span>{{$t('overall.update')}}</span>
          </button>
        </div>
      </div>
      </div>
    </el-checkbox-group>
  </template>

  <div class="table-no-data" v-else>
    <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
  </div>

  <div class="center-dialog">
    <el-dialog v-model="showUpdateDialog"
               :custom-class="showAddUpdateDialog ? 'update-knowledge update-knowledge--upload' : 'update-knowledge'"
               :after-close="handleClose">
      <div class="knowledge-update__top" >
        <div class="update-left__icon">
          <img width="60" height="60" :src="updateKnowledge.iconUrl"/>
        </div>
        <div class="update-right">
          <div class="knowledge-enable">
            <div class="update-title">
              <div class="card-title-name" :title="updateKnowledge.label">{{updateKnowledge.label}}</div>
            </div>
            <el-switch v-model="updateKnowledge.status"
                       v-if="showEnable"
                       active-color="#38ACD2"
                       inactive-color="#C0CEDB"
                       :active-value="1"
                       :inactive-value="0"
                       :before-change="(knowledgeId) => confirmSwitchLearning(updateKnowledge.knowledgeId)"
            >
            </el-switch>
          </div>
          <div class="knowledge-desc" :title="updateKnowledge.desc">{{updateKnowledge.desc ? updateKnowledge.desc : '—'}}</div>
        </div>
      </div>
      <template v-if="!showAddUpdateDialog">
        <div class="knowledge-update" >
          <div class="update-title">
            <div class="card-title-name">update record</div>
          </div>
          <div class="update-operate">
            <button :title="$t('overall.update')" class="top-tool-btn--update"
                    @click="uploadRecord">
              <i class="cn-icon-update-knowledge-base cn-icon"></i>
              <span>{{$t('overall.update')}}</span>
            </button>
          </div>
        </div>
        <el-table ref="updateDataTable"
                  border
                  :data="updateHistoryList"
                  @selection-change="secondSelectionChange"
                  width="100%"
                  class="update-dialog__table"
                  cell-style="padding:6px 0px;font-size: 12px;color: #353636;font-weight: 400;line-height: 20px;border-right:none;"
                  header-cell-style="padding:8px 0px;font-size: 12px;color: #353636;font-weight: 500;border-right:none;">
          <el-table-column prop="opTime" label="Update time" width="150" ></el-table-column>
          <el-table-column prop="user" label="Operating user" width="150" >
            <template #default="scope" :column="item">
              <span>{{$_.get(scope.row, 'user.name', '-')}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="commitVersion" label="Version information" width="150"  ></el-table-column>
          <el-table-column prop="description" label="Description"></el-table-column>
        </el-table>
      </template>
      <template v-if="showAddUpdateDialog">
        <div class="update-knowledge-form">
          <loading :loading="uploadLoading"></loading>
          <el-form :model="updateObject" label-position="top" ref="form" :rules="rules">
            <!--name-->
            <el-form-item :label="$t('overall.name')" prop="name">
              <el-input class="form-input" maxlength="64" placeholder="" disabled show-word-limit
                        size="mini" type="text" v-model="updateObject.label"></el-input>
            </el-form-item>
            <el-form-item :label="$t('knowledge.upload')" prop="file">
              <el-upload :action="`${baseUrl}${apiVersion}/knowledgeBase/items/batch`"
                         :headers="uploadHeaders"
                         :multiple="false"
                         :file-list="fileList"
                         :data="uploadParams"
                         :on-change="fileChange"
                         :on-success="uploadSuccess"
                         :before-upload="beforeUpload"
                         :on-error="uploadError"
                         :class="uploadErrorTip ? 'el-upload--error' : ''"
                         :accept="fileTypeLimit"
                         :auto-upload="false"
                         ref="knowledgeUpload"
                         id="knowledgeUpload"
              >
                <el-button type="primary" class="uploadBtn"><i class="cn-icon cn-icon-a-1"></i></el-button>
              </el-upload>
            </el-form-item>

            <el-form-item :label="$t('knowledge.version')" prop="version">
              <el-input class="form-input" maxlength="64" placeholder="" disabled show-word-limit
                        size="mini" type="text" v-model="currentVersion"></el-input>
            </el-form-item>
            <el-form-item :label="$t('overall.remark')" prop="description" class="knowledge-remark">
              <el-input  maxlength="255" show-word-limit :rows="4" size='mini' type="textarea" resize='none'
                         v-model="updateObject.description" id="role-box-input-remark"/>
            </el-form-item>
          </el-form>
        </div>
        <div class="dialog-footer">
          <el-button @click="showAddUpdateDialog = false">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="submitConfirm">{{ $t('tip.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="showConfirmDialog"
               :title="$t('overall.tips')"
               custom-class="update-knowledge-tip"
               :width="480"
               :before-close="handleConfirmClose">
      <div class="dialog-message">{{$t('knowledge.updateTips')}}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmDialog = false">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="submit">{{ $t('tip.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
        v-model="showConfirmSwitch"
        :width="330"
        custom-class="confirm-knowledge-switch"
        :title="$t('overall.hint')"
    >
      <div class="dialog-message">{{ confirmSwitchLearningTip }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmSwitch = false">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="switchLearning">OK</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import table from '@/mixins/table'
import Loading from '@/components/common/Loading'
import { knowledgeCategoryValue, unitTypes, storageKey, builtInKnowledgeBaseBasicInfo } from '@/utils/constants'
import { ref } from 'vue'
import { api } from '@/utils/api'
import axios from 'axios'
import _ from 'lodash'
import unitConvert from '@/utils/unit-convert'
export default {
  name: 'knowledgeBaseTableForCard',
  mixins: [table],
  props: {
    isNoData: {
      type: Boolean,
      default: false
    },
    isSelectedStatus: {
      type: Boolean
    }
  },
  components: {
    Loading
  },
  data () {
    return {
      tableTitle: [],
      checkList: [],
      aiTaggingList: [],
      websketchList: [],
      showUpdateDialog: false,
      showConfirmDialog: false,
      showAddUpdateDialog: false,
      updateKnowledge: {},
      showEnable: false,
      updateHistoryList: [],
      updateObject: {},
      currentVersion: 0,
      uploadLoading: false,
      showConfirmSwitch: false,
      switchKnowledgeId: ''
    }
  },
  setup () {
    // 没上传过文件的提示
    const uploadErrorTip = ref('')
    return {
      baseUrl: BASE_CONFIG.baseUrl,
      apiVersion: BASE_CONFIG.apiVersion,
      uploadHeaders: {
        'Cn-Authorization': localStorage.getItem(storageKey.token)
      },
      uploadErrorTip,
      fileTypeLimit: '.csv',
      fileList: ref([]),
      uploadFileSizeLimit: 100 * 1024 * 1024
    }
  },
  methods: {
    fileChange (file, fileList) {
      // 判断后缀，仅支持.csv
      if (!_.endsWith(file.name, '.csv')) {
        this.fileList = []
        this.$message.error(this.$t('validate.fileTypeLimit', { types: this.fileTypeLimit }))
      } else if (file.size > this.uploadFileSizeLimit) { // 判断文件大小
        this.$message.error(this.$t('validate.fileSizeLimit', { size: unitConvert(this.uploadFileSizeLimit, unitTypes.byte).join('') }))
        this.fileList = []
      } else {
        this.fileList = fileList.slice(-1)
      }
    },
    uploadError (error) {
      let errorMsg
      if (error.message) {
        errorMsg = JSON.parse(error.message).message
      } else {
        errorMsg = 'error'
      }
      this.uploadLoading = false
      this.$message.error(this.$t('tip.uploadFailed', { msg: errorMsg }))
    },
    uploadSuccess (response) {
      this.uploadLoading = false
      this.uploaded = true
      /* this.uploaded = response.code === 200
      if (response.code === 200) { */
      this.$message.success(this.$t('tip.success'))
      this.showAddUpdateDialog = false
      axios.get(api.knowledgeBaseLog + '/' + this.updateKnowledge.knowledgeId, { params: { pageSize: 999 } }).then(res => {
        this.updateHistoryList = res.data.data.list
        this.currentVersion = this.updateHistoryList[0].commitVersion + 1
      })
      /* } else {
        this.$message.error(this.$t('tip.uploadFailed', { msg: response.message }))
      } */
    },
    beforeUpload (file) {
      this.uploadLoading = true
      this.showConfirmDialog = false
    },
    submitConfirm () {
      this.showConfirmDialog = true
    },
    submit () {
      this.$refs.knowledgeUpload.submit()
    },
    clickCard (data, event) {
      if (data.isSelected) { // 原来为选中，当前点击后未选中
        const index = this.checkList.indexOf(data)
        if (index > -1) {
          this.checkList.splice(index, 1)
        }
      } else {
        const index = this.checkList.indexOf(data)
        if (index === -1) {
          this.checkList.push(data)
        }
      }
      const val = !data.isSelected
      data.isSelected = val
      this.$emit('checkboxStatusChange', val, data)
    },
    checkboxStatusChange (val, data) {
      data.isSelected = val
      this.$emit('checkboxStatusChange', val, data)
    },
    handleClose () {
      this.showUpdateDialog = false
      this.showAddUpdateDialog = false
      this.uploadLoading = false
    },
    handleConfirmClose () {
      this.showConfirmDialog = false
    },
    handleUpdateClose () {
      this.showAddUpdateDialog = false
    },
    showUpdate () {
      this.showUpdateDialog = true
      this.showAddUpdateDialog = false
    },
    jumpToUpdatePage (data, showEnable) {
      axios.get(api.knowledgeBaseLog + '/' + data.knowledgeId, { params: { pageSize: 999 } }).then(res => {
        this.updateKnowledge = data
        this.updateHistoryList = res.data.data.list
        this.currentVersion = this.updateHistoryList[0].commitVersion + 1
        this.showEnable = showEnable
        this.showUpdate()
      })
    },
    uploadRecord () {
      this.showAddUpdateDialog = true
      this.updateObject.name = this.updateKnowledge.name
      this.updateObject.label = this.updateKnowledge.label
      this.updateObject.description = ''
    },
    clearSelect () {
      this.$nextTick(() => {
        this.checkList = []
        if (this.tableData && this.tableData.length > 0) {
          this.tableData.forEach(data => {
            data.isSelected = false
          })
        }
      })
    },
    mouseenter (card) {
      card.showUpdate = true
    },
    mouseleave (card) {
      card.showUpdate = false
    },
    del (data) {
      this.$emit('delete', data)
    },
    edit (id) {
      const pageNo = this.$router.currentRoute.value.query.pageNo
      const dataType = this.$router.currentRoute.value.query.dataType
      this.$router.push({
        path: '/knowledgeBase/edit',
        query: {
          t: +new Date(),
          pageNoForTable: pageNo || 1,
          id: id,
          dataType: dataType
        }
      })
    },
    confirmSwitchLearning (id) {
      this.showConfirmSwitch = true
      this.switchKnowledgeId = id
      return false
    },
    switchLearning () {
      const hint = this.aiTaggingList.find(d => d.knowledgeId === this.switchKnowledgeId)
      const toStatus = hint.status === 0 ? 1 : 0
      const url = toStatus === 0 ? api.knowledgeBaseLearningStop : api.knowledgeBaseLearningStart
      axios.post(`${url}?knowledgeId=${hint.knowledgeId}`).then(res => {
        if (res.status === 200) {
          hint.status = toStatus
          this.$message.success(this.$t('tip.success'))
        } else {
          console.error(res.message)
          this.$message.error(this.errorMsgHandler(res))
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      }).finally(() => {
        this.showConfirmSwitch = false
      })
    }
  },
  watch: {
    tableData: {
      handler (n) {
        if (this.tableData && this.tableData.length > 0) {
          this.aiTaggingList = []
          this.websketchList = []
          this.tableData.forEach(item => {
            item.showUpdate = false
            const basicInfo = builtInKnowledgeBaseBasicInfo.find(bi => bi.knowledgeId === item.knowledgeId)
            if (basicInfo) {
              item = {
                ...item,
                ...basicInfo
              }
              if (item.category === knowledgeCategoryValue.aiTagging) {
                this.aiTaggingList.push(item)
              } else if (item.category === knowledgeCategoryValue.webSketch) {
                this.websketchList.push(item)
              }
            }
          })
        }
      }
    },
    showAddUpdateDialog: {
      handler (n) {
        if (!n) {
          this.fileList = []
        }
      }
    }
  },
  mounted () {
    this.aiTaggingList = []
    this.websketchList = []
    this.tableData.forEach(item => {
      item.showUpdate = false
      if (item.category === knowledgeCategoryValue.aiTagging) {
        this.aiTaggingList.push(item)
      } else if (item.category === knowledgeCategoryValue.webSketch) {
        this.websketchList.push(item)
      }
    })
  },
  computed: {
    uploadParams () {
      return {
        knowledgeId: this.updateKnowledge.knowledgeId,
        action: 'overwrite',
        description: this.updateObject.description
      }
    },
    confirmSwitchLearningTip () {
      let tip = ''
      if (this.switchKnowledgeId) {
        const find = this.aiTaggingList.find(item => item.knowledgeId === this.switchKnowledgeId)
        if (find) {
          if (find.status === 0) {
            tip = this.$t('tip.confirmEnablePsiphon3') + '?'
          } else if (find.status === 1) {
            tip = this.$t('tip.confirmDisablePsiphon3') + '?'
          }
        }
      }
      return tip
    }
  }
}
</script>
