<template>
  <template v-if="!isNoData">
    <div class="card-type-title" v-if="aiTaggingList.length > 0">{{$t('knowledgeBase.intelligenceLearning')}}</div>
    <el-checkbox-group v-model="checkList" >
      <div class="card-box" v-for="data in aiTaggingList" :key="data.knowledgeId">
        <div @click="isSelectedStatus && data.isBuiltIn !== 1 && clickCard(data,$event)"  @mouseenter="mouseenter(data)" @mouseleave="mouseleave(data)" class="card-item"  :class="data.isSelected ? 'card-selected' : ''">
          <div class="card-content">
            <div class="card-operate">
              <el-switch v-model="data.status"
                         class="card-enable"
                         active-color="#38ACD2"
                         inactive-color="#C0CEDB"
                         :active-value="1"
                         :inactive-value="0"
                         @change="changeStatus($event,data.knowledgeId)"
              >
              </el-switch>
            </div>
            <div class="card-icon">
              <i class="cn-icon-add-knowledge-base cn-icon" ></i>
            </div>
            <div class="card-title">
              <div class="card-title-name" :title="data.name">{{data.name}}</div>
            </div>
            <div class="card-desc" :title="data.description">{{data.description?data.description:'—'}}</div>
          </div>
          <div class="card-operate__footer">
            <button v-if="data.showUpdate"
                    :title="$t('overall.update')" class="top-tool-btn--update"
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
            <i class="cn-icon-add-knowledge-base cn-icon" ></i>
          </div>
          <div class="card-title">
            <div class="card-title-name" :title="data.name">{{data.name}}</div>
          </div>
          <div class="card-desc" :title="data.description">{{data.description?data.description:'—'}}</div>
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
               custom-class="update-knowledge"
               :before-close="handleClose">
      <div class="knowledge-update__top" >
        <div class="update-left__icon">
          <i class="cn-icon-add-knowledge-base cn-icon" ></i>
        </div>
        <div class="update-right">
          <div class="knowledge-enable">
            <div class="update-title">
              <div class="card-title-name" :title="updateKnowledge.name">{{updateKnowledge.name}}</div>
            </div>
            <el-switch v-model="updateKnowledge.status"
                       v-if="showEnable"
                       active-color="#38ACD2"
                       inactive-color="#C0CEDB"
                       :active-value="1"
                       :inactive-value="0"
                       @change="changeStatus($event,updateKnowledge.knowledgeId)"
            >
            </el-switch>
          </div>
          <div class="knowledge-desc" :title="updateKnowledge.description">{{updateKnowledge.description?updateKnowledge.description:'—'}}</div>
        </div>
      </div>
      <template v-if="!showAddUpdateDialog">
        <div class="knowledge-update" >
          <div class="update-title">
            <div class="card-title-name">update record</div>
          </div>
          <div class="update-operate">
            <button :title="$t('overall.update')" class="top-tool-btn--update"
                    @click="uploadRecord()">
              <i class="cn-icon-update-knowledge-base cn-icon"></i>
              <span>{{$t('overall.update')}}</span>
            </button>
          </div>
        </div>
        <el-table ref="updateDataTable"
                  border
                  :data="updateHistoryList"
                  @selection-change="secondSelectionChange"
                  max-height="653px"
                  width="100%"
                  class="update-dialog__table"
                  cell-style="padding:6px 0px;font-size: 12px;color: #353636;font-weight: 400;line-height: 20px;border-right:none;"
                  header-cell-style="padding:8px 0px;font-size: 12px;color: #353636;font-weight: 500;border-right:none;">
          <el-table-column property="opTime" label="Update time" width="150" ></el-table-column>
          <el-table-column property="opUser" label="Operating user" width="150" ></el-table-column>
          <el-table-column property="version" label="Version information" width="150"  ></el-table-column>
          <el-table-column property="description" label="Description"></el-table-column>
        </el-table>
      </template>
      <template v-if="showAddUpdateDialog">
        <div class="update-knowledge-form"  >
          <el-form :model="updateObject" label-position="top" ref="form" :rules="rules">
            <!--name-->
            <el-form-item :label="$t('overall.name')" prop="name">
              <el-input class="form-input" maxlength="64" placeholder="" disabled show-word-limit
                        size="mini" type="text" v-model="updateObject.name" @blur="tagNameBlur"></el-input>
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
                         :on-progress="onUpload"
                         :on-error="uploadError"
                         :class="uploadErrorTip ? 'el-upload--error' : ''"
                         :accept="fileTypeLimit"
                         ref="knowledgeUpload"
                         id="knowledgeUpload"
              >
                <el-button type="primary" class="uploadBtn"><i class="cn-icon cn-icon-a-1"></i></el-button>
              </el-upload>
            </el-form-item>

            <el-form-item :label="$t('knowledge.version')" prop="version">
              <el-input class="form-input" maxlength="64" placeholder="" disabled show-word-limit
                        size="mini" type="text" v-model="updateObject.version" @blur="tagNameBlur"></el-input>
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
               :before-close="handleConfirmClose">
      <div class="dialog-message">{{$t('knowledge.updateTips')}}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmDialog = false">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="submit">{{ $t('tip.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import table from '@/mixins/table'
import { knowledgeCategoryValue, storageKey } from '@/utils/constants'
import { ref } from 'vue'
import { updateKnowledgeUrl } from '@/utils/api'
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
      updateKnowledgeUrl: updateKnowledgeUrl
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
      fileList: ref([])
    }
  },
  methods: {
    fileChange (files, fileList) {
      this.fileList = fileList.slice(-1)
    },
    uploadError () {
      this.$message.error(this.$t('tip.uploadFailed', { msg: 'error' }))
    },
    uploadSuccess (response) {
      const uploadFile = this.fileList ? this.fileList[0] : null
      let fileName = uploadFile ? uploadFile.name : ''
      fileName = fileName.substring(0, fileName.indexOf('.'))
      this.updateObject.version = fileName.length >= 8 ? fileName.substring(fileName.length - 8) : fileName
      this.uploaded = response.code === 200
      if (response.code === 200) {

      } else {
        this.$message.error(this.$t('tip.uploadFailed', { msg: response.message }))
      }
    },
    beforeUpload (file) {

    },
    onUpload () {

    },
    updateKnowledgeBase () {
      axios.post(this.updateKnowledgeUrl + '?knowledgeIds=' + ids).then(response => {
        if (response.data.code === 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.success') })
          // 重新查询历史记录
        } else {
          this.$message.error(response.data.message)
        }
      }).finally(() => {

      })
    },
    submitConfirm () {
      this.showConfirmDialog = true
    },
    submit () {
      // this.updateKnowledgeBase()//更新列表数据
      this.showConfirmDialog = false
      this.showAddUpdateDialog = false
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
      this.updateKnowledge = data
      this.showEnable = showEnable
      this.showUpdate()
    },
    uploadRecord () {
      this.showAddUpdateDialog = true
      this.updateObject.name = this.updateKnowledge.name
      this.updateObject.version = ''
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
      this.tableData.forEach(t => {
        if (t.knowledgeId === card.knowledgeId) {
          t.showUpdate = true
        }
      })
    },
    mouseleave (card) {
      this.tableData.forEach(t => {
        if (t.knowledgeId === card.knowledgeId) {
          t.showUpdate = false
        }
      })
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
            if (item.category === knowledgeCategoryValue.aiTagging) {
              this.aiTaggingList.push(item)
            } else if (item.category === knowledgeCategoryValue.webSketch) {
              this.websketchList.push(item)
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

    const update = {
      opTime: '2023-07-26 16:27:55',
      opUser: 'admin',
      version: 'v2.8',
      description: ' It can\'t be identified by the payload signature.'
    }
    this.updateHistoryList.push(update)
    this.updateHistoryList.push(update)
    this.updateHistoryList.push(update)
    this.updateHistoryList.push(update)
    this.updateHistoryList.push(update)
  },
  computed: {
    uploadParams () {
      return {
        knowledgeId: this.updateKnowledge.knowledgeId,
        action: 'update'
      }
    }
  }
}
</script>
