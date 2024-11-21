<template>
  <el-table
      id="userTable"
      ref="dataTable"
      :data="tableData"
      tooltip-effect="light"
      empty-text=" "
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      :row-class-name="tableRowClassName"
  >
    <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        width="55">
    </el-table-column>
    <el-table-column
        v-for="(item, index) in customTableTitles"
        :key="item.prop+index"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
        :sort-orders="['ascending', 'descending']"
        :sortable="item.sortable"
        :width="`${item.width}`"
    >
      <template #header>
        <span class="data-column__span">{{ item.label }}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
        <template v-if="item.prop === 'ctime'">
          <template v-if="scope.row[item.prop]">
            {{ dateFormatByAppearance(scope.row[item.prop]) || '-' }}
          </template>
          <template v-else><span>-</span></template>
        </template>
        <template v-else-if="item.prop === 'option'">
          <i class="cn-icon cn-icon-upload" style="cursor: pointer;" @click="clickOption(scope.row)"></i>
        </template>
        <span v-else>{{ scope.row[item.prop] || '-' }}</span>
      </template>
    </el-table-column>
    <template v-slot:empty>
      <div class="table-no-data" v-if="isNoData">
        <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
      </div>
    </template>
  </el-table>

  <el-dialog class="sources-dialog" v-model="dialogVisible" width="480">
    <template #header>
      <div class="sources-dialog__header">{{ $t('overall.upload') }}</div>
    </template>
    <div class="sources-dialog__body">
      <div class="dialog__body-upload">
        <loading :loading="uploadLoading"></loading>
        <el-upload :action="uploadUrl"
                   :headers="uploadHeaders"
                   :data="uploadParams"
                   :multiple="false"
                   :file-list="fileList"
                   :on-change="fileChange"
                   :on-success="uploadSuccess"
                   :before-upload="beforeUpload"
                   :on-progress="onUpload"
                   :on-error="uploadError"
                   :class="uploadErrorTip ? 'el-upload--error' : ''"
                   drag
                   :accept="fileTypeLimit"
                   ref="upload"
        >
          <i class="cn-icon cn-icon-upload2 upload-icon"></i>
          <div class="el-upload__text">
            <div ref="uploadButton">{{ $t('sources.dragFile') }}</div>
          </div>
        </el-upload>
      </div>
      <div class="dialog__body-tip">
        <div class="tip__text"
             v-for="(item, index) in tipsInfo[language]"
             :key="item.value"
             :style="{color: index===0 || index===3 ? 'var(--el-color-business)' : 'var(--el-text-color-regular)'}">
          {{ item.label }}
        </div>
      </div>
    </div>
    <template #footer>
      <div class="sources-dialog__footer">
        <button class="cancel-btn" @click="dialogVisible=false">{{ $t('overall.cancel') }}</button>
        <button class="upload-btn">{{ $t('overall.upload') }}</button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import table from '@/mixins/table'
import { dateFormatByAppearance } from '@/utils/date-util'
import { storageKey, unitTypes, EN } from '@/utils/constants'
import _ from 'lodash'
import unitConvert from '@/utils/unit-convert'
import { ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { api } from '@/utils/api'
import Loading from '@/components/common/Loading'

export default {
  name: 'SourcesTable',
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  mixins: [table],
  data () {
    return {
      sourceId: '',
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          minWidth: 50,
          sortable: 'custom'
        },
        {
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          sortable: 'custom',
          minWidth: 150
        },
        {
          label: this.$t('overall.remark'),
          prop: 'description',
          show: true,
          minWidth: 350
        },
        {
          label: this.$t('config.user.createTime'),
          prop: 'ctime',
          show: true,
          minWidth: 150
        },
        {
          label: this.$t('overall.option'),
          prop: 'option',
          show: true
        }
      ],
      dialogVisible: false,
      uploadUrl: BASE_CONFIG.baseUrl + api.setting.source.sourceUpload,
      uploadHeaders: {
        'Cn-Authorization': localStorage.getItem(storageKey.token)
      },
      fileList: [],
      fileTypeLimit: '.csv',
      language: localStorage.getItem(storageKey.language) || EN,
      uploadLoading: false,
      tipsInfo: {
        en: [
          { value: 0, label: 'You can now integrate data to our platform using two methods:' },
          { value: 1, label: '1. File Upload: Access the upload feature on our website to submit your files directly.' },
          { value: 2, label: '2. Kafka Direct Transmission: Send your data to a specific Kafka topic on our servers, ensuring each message includes a header with the source_id.' },
          { value: 3, label: 'For Kafka server information, please contact your administrator.' }
        ],
        zh: [
          { value: 0, label: '您现在可以使用两种方法将数据集成到我们的平台：' },
          { value: 1, label: '1. 文件上传：访问我们网站的上传功能直接提交您的文件。' },
          { value: 2, label: '2. Kafka 直接传输：将您的数据发送到我们服务器上的特定 Kafka 主题，确保每条消息都包含带有 source_id 的标头。' },
          { value: 3, label: '有关 Kafka 服务器的信息，请联系您的管理员。' }
        ]
      },
      uploadFileSizeLimit: 1024 * 1024 * 1024,
      isClick: true
    }
  },
  components: {
    Loading
  },
  computed: {
    uploadParams () {
      return {
        sourceId: this.sourceId
      }
    }
  },
  methods: {
    dateFormatByAppearance,
    clickOption (item) {
      this.sourceId = item.id
      this.dialogVisible = true
      this.fileTypeLimit = `.${item.dataFormat}`
    },
    // 禁止勾选buildIn为1的项，即禁止修改、删除admin的账号
    checkSelectable (row) {
      return row.isBuiltIn !== 1
    },
    fileChange (files, fileList) {
      if (this.fileList.length > 0 && this.fileList[0].status === 'success') {
        this.fileListBack = this.fileList[0]
      }
      this.fileList = fileList.slice(-1)
    },
    uploadSuccess () {
      this.uploaded = false
      this.dialogVisible = false
      this.$message.success(this.$t('tip.success'))
    },
    beforeUpload (file) {
      return new Promise((resolve, reject) => {
        // 判断后缀，仅支持.csv
        if (!_.endsWith(file.name, this.fileTypeLimit)) {
          this.$message.error(this.$t('validate.fileTypeLimit', { types: this.fileTypeLimit }))
          this.fileList = []
          reject(new Error(this.$t('validate.fileTypeLimit', { types: this.fileTypeLimit })))
        } else if (file.size > this.uploadFileSizeLimit) { // 判断文件大小
          this.$message.error(this.$t('validate.fileSizeLimit', { size: unitConvert(this.uploadFileSizeLimit, unitTypes.byte).join('') }))
          this.fileList = []
          reject(new Error(this.$t('validate.fileSizeLimit', { size: unitConvert(this.uploadFileSizeLimit, unitTypes.byte).join('') })))
        } else {
          if (!this.isClick) {
            if (this.importedData.length > 0) {
              ElMessageBox.confirm(this.$t('tip.uploadFile'), {
                confirmButtonText: this.$t('tip.confirm'),
                cancelButtonText: this.$t('overall.cancel'),
                message: this.$t('tip.uploadFileTips'),
                title: this.$t('tip.uploadFile'),
                // type: 'warning',
                iconClass: 'width:0px;height:0px;',
                customClass: 'del-model'
              }).then(() => {
                resolve()
              }).catch(e => {
                reject(e)
              })
            } else {
              resolve()
            }
          } else {
            resolve()
          }
        }
      })
    },
    onUpload () {
      this.uploadLoading = true
      this.typeSelectDisable = true
      this.isClick = false
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
    tableRowClassName (row) {
      if (row.row.isBuiltIn === 1) {
        return 'table-disabled-row'
      }
    }
  },
  setup () {
    // 没上传过文件的提示
    const uploadErrorTip = ref('')

    return {
      uploadErrorTip
    }
  }
}
</script>
