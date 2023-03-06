<template>
  <div class="edit-knowledge-base">
    <div class="edit-knowledge-base__header">{{$t('knowledgeBase.createKnowledgeBase')}}</div>
    <div class="edit-knowledge-base__body">
      <el-steps direction="vertical" :active="activeStep">
        <el-step v-for="(height, index) in stepHeights" :style="`flex-basis: ${height}px;`" :key="index"></el-step>
      </el-steps>
      <el-collapse v-model="activeCollapses">
        <el-collapse-item name="0">
          <template #title><div class="form-sub-title">{{$t('knowledgeBase.editInformation')}}</div></template>
          <el-form :model="editObject" label-position="top" ref="form" :rules="rules">
            <!--name-->
            <el-form-item :label="$t('config.roles.name')" prop="tagName">
              <el-input maxlength="64" placeholder="" :disabled="!!editObject.id" show-word-limit size="mini" type="text" v-model="editObject.tagName"></el-input>
            </el-form-item>
            <el-form-item :label="$t('overall.type')" prop="tagType">
              <el-select v-model="editObject.tagType"
                         class="form-select"
                         placeholder=" "
                         popper-class="form-select-popper"
                         :disabled="!!editObject.id || typeSelectDisable"
                         size="mini"
              >
                <template v-for="type in knowledgeBaseType" :key="type.name">
                  <el-option :label="type.name" :value="type.value"></el-option>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('overall.remark')">
              <el-input maxlength="256" show-word-limit :rows="4" size='mini' type="textarea" v-model="editObject.remark" id="role-box-input-remark"/>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="1" class="upload-collapse">
          <template #title><div class="form-sub-title">{{$t('overall.importFromFile')}}</div></template>
          <loading :loading="uploadLoading"></loading>
          <el-upload :action="`${baseUrl}knowledge/import`"
                     :headers="uploadHeaders"
                     :data="uploadParams"
                     :multiple="false"
                     :file-list="fileList"
                     :on-change="fileChange"
                     :on-success="uploadSuccess"
                     :on-remove="onRemove"
                     :before-upload="beforeUpload"
                     :on-progress="onUpload"
                     :class="uploadErrorTip ? 'el-upload--error' : ''"
                     drag
                     accept=".csv"
                     ref="upload"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              <div>{{$t('knowledgeBase.dropFileHereOr')}}<em>{{$t('knowledgeBase.clickToUpload')}}</em></div>
              <div class="upload-tip">{{$t('knowledgeBase.supportCsv')}}</div>
            </div>
          </el-upload>
          <transition name="el-zoom-in-top">
            <div class="upload-error-tip" v-if="uploadErrorTip">{{uploadErrorTip}}</div>
          </transition>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template #title><div class="form-sub-title">{{$t('overall.preview')}}</div></template>
          <div class="skeleton-border" v-if="!uploaded">
            <el-skeleton>
              <template #template>
                <div v-for="item of 6" :key="item" class="skeleton-item-row">
                  <el-skeleton-item variant="text" style="width: calc(33% - 25px); margin-right: 38px;"/>
                  <el-skeleton-item variant="text" style="width: calc(33% - 25px); margin-right: 38px;"/>
                  <el-skeleton-item variant="text" style="width: calc(33% - 26px);"/>
                </div>
              </template>
            </el-skeleton>
            <div class="skeleton-tip">{{$t('knowledgeBase.skeletonTip')}}</div>
          </div>
          <div v-else>
            <div class="imported-tip"><i class="cn-icon cn-icon-baocuo"/>
              &nbsp;&nbsp;{{$t('knowledgeBase.importTip', { total: originalImportInfo.total, succeeded: originalImportInfo.succeeded, failed: originalImportInfo.failed })}}
            </div>
            <div class="imported-table-box" :class="previewErrorTip ? 'imported-table-box--error' : ''">
              <table class="imported-table" v-if="!importedDataNoData">
                <tr>
                  <th width="230">{{importedTableFirstColumn}}</th>
                  <th width="180">Label</th>
                  <th>{{$t('overall.import')}}</th>
                  <th width="16"></th>
                </tr>
                <tr v-for="(d, i) in showImportedData" :key="importedType + d.tagItem + d.tagValue + i">
                  <td class="imported-data-item" :title="d.tagItem">{{d.tagItem}}</td>
                  <td class="imported-data-value" :title="d.tagValue">{{d.tagValue}}</td>
                  <td class="imported-data-msg" :title="d.msg"><i :class="d.status === 1 ? 'el-icon-success' : 'el-icon-error'"></i>&nbsp;&nbsp;{{d.msg}}</td>
                  <td><i class="el-icon-close" @click="removeImportedData(d)"></i></td>
                </tr>
              </table>
              <chart-no-data v-else></chart-no-data>
              <Pagination
                  class="imported-pagination"
                  :page-obj="importedPageObj"
                  :store-page-no-on-url="false"
                  layout="prev,pager,next"
                  @pageNo='pageNo'
                  @prev-click="prev"
                  @next-click="next"
              ></Pagination>
            </div>
            <transition name="el-zoom-in-top">
              <div class="preview-error-tip" v-if="previewErrorTip">{{previewErrorTip}}</div>
            </transition>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="edit-knowledge-base__footer">
      <button class="footer__btn footer__btn--light" @click="cancel">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button style="position: relative;" :class="{'footer__btn--disabled': blockOperation.save}" :disabled="blockOperation.save" class="footer__btn" @click="save">
        <loading size="small" :loading="blockOperation.save"></loading>
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import _ from 'lodash'
import { knowledgeBaseType, storageKey, unitTypes } from '@/utils/constants'
import i18n from '@/i18n'
import Pagination from '@/components/common/Pagination'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import axios from 'axios'
import { api } from '@/utils/api'
import unitConvert from '@/utils/unit-convert'
import Loading from '@/components/common/Loading'
export default {
  name: 'CreateKnowledgeBase',
  components: {
    Pagination,
    ChartNoData,
    Loading
  },
  methods: {
    fileChange (files, fileList) {
      this.fileList = fileList.slice(-1)
    },
    uploadSuccess (response) {
      this.uploaded = response.code === 200
      if (response.code === 200) {
        // 上传成功后去掉upload和preview的错误提示
        this.uploadErrorTip = ''
        this.previewErrorTip = ''
        this.typeSelectDisable = true

        this.importedType = this.editObject.tagType
        const originalImportedData = response.data.data
        this.originalImportInfo = {
          total: originalImportedData.length,
          succeeded: originalImportedData.filter(d => d.status === 1).length,
          failed: originalImportedData.filter(d => d.status !== 1).length
        }
        originalImportedData.sort((a, b) => b.status - a.status)
        this.importedData = originalImportedData
        this.handleShowImportedData()
      } else {
        this.uploadLoading = false
        this.$message.error(this.$t('tip.uploadFailed', { msg: response.message }))
      }
    },
    onRemove (files, fileList) {
      this.uploaded = false
      this.typeSelectDisable = false
      this.importedData = []
      this.showImportedData = []
      this.originalImportInfo = {
        total: null,
        succeeded: null,
        failed: null
      }
    },
    beforeUpload (file) {
      // 判断文件大小
      if (file.size > this.uploadFileSizeLimit) {
        this.$message.error(this.$t('validate.fileSizeLimit', { size: unitConvert(this.uploadFileSizeLimit, unitTypes.byte).join('') }))
        this.fileList = []
        return false
      }
      return true
    },
    onUpload (event, file) {
      this.uploadLoading = true
    },
    handleShowImportedData () {
      const startIndex = (this.importedPageObj.pageNo - 1) * this.importedPageObj.pageSize
      const endIndex = this.importedPageObj.pageNo * this.importedPageObj.pageSize
      this.showImportedData = this.importedData.slice(startIndex, endIndex)
      this.$nextTick(() => {
        this.uploadLoading = false
      })
    },
    pageNo (val) {
      this.importedPageObj.pageNo = val
    },
    prev () {
      this.importedPageObj.pageNo--
    },
    next () {
      this.importedPageObj.pageNo++
    },
    removeImportedData (data) {
      const toRemoveIndex = this.importedData.findIndex(d => d.tagName === data.tagName && d.tagItem === data.tagItem)
      this.importedData.splice(toRemoveIndex, 1)
      this.importedPageObj.total = this.importedData.length
      this.handleShowImportedData()
      // 若删除后本页无数据，则页码减1，或者提示无数据
      if (this.showImportedData.length === 0) {
        if (this.importedData.length > 0) {
          this.importedPageObj.pageNo--
          this.handleShowImportedData()
        } else {
          this.importedDataNoData = true
        }
      }
      // 删除后若有错误提示且列表中不再有错误项，则清空错误提示
      if (!this.hasErrorImportedData() && this.previewErrorTip) {
        this.previewErrorTip = ''
      }
    },
    cancel () {
      history.back()
    },
    save () {
      if (this.blockOperation.save) { return }
      this.blockOperation.save = true
      // 校验form + upload + preview
      let formValid
      this.$refs.form.validate(valid => {
        formValid = valid
      })

      if (!this.uploaded) {
        this.uploadErrorTip = this.$t('validate.required')
      } else {
        this.uploadErrorTip = ''
      }

      if (this.importedData.length === 0) {
        this.previewErrorTip = this.$t('validate.required')
      } else if (this.hasErrorImportedData()) {
        this.previewErrorTip = this.$t('validate.pleaseCheckForErrorItem')
      } else {
        this.previewErrorTip = ''
      }

      // 校验通过后组织数据、请求接口
      if (formValid && !this.uploadErrorTip && !this.previewErrorTip) {
        const postData = {
          tagName: this.editObject.tagName,
          tagType: this.editObject.tagType,
          data: []
        }
        this.importedData.forEach(d => {
          const findData = postData.data.find(d2 => d2.tagValue === d.tagValue)
          if (findData) {
            findData.itemList.add(d.tagItem)
          } else {
            const set = new Set()
            set.add(d.tagItem)
            postData.data.push({
              tagValue: d.tagValue,
              itemList: set
            })
          }
        })
        postData.data.forEach(d => {
          d.itemList = [...d.itemList]
        })
        postData.remark = this.editObject.remark
        axios.post(this.url, postData).then(response => {
          if (response.data.code === 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.$router.push({
              path: '/knowledgeBase',
              t: +new Date()
            })
          } else {
            this.$message.error(response.data.message)
          }
        }).finally(() => {
          this.blockOperation.save = false
        })
      } else {
        this.blockOperation.save = false
      }
    },
    hasErrorImportedData () {
      return this.importedData.filter(d => d.status !== 1).length > 0
    }
  },
  computed: {
    uploadParams () {
      return {
        type: this.editObject.tagType
      }
    },
    importedTableFirstColumn () {
      const t = this.knowledgeBaseType.find(t => t.value === this.importedType)
      return t ? t.name : ''
    }
  },
  watch: {
    activeCollapses (n) {
      const index0 = n.indexOf('0')
      const index1 = n.indexOf('1')
      if (index0 > -1) {
        if (this.stepHeights[0] === this.stepHeightConstant.collapse) {
          this.stepHeights.splice(0, 1, this.stepHeightConstant.first)
        }
      } else {
        if (this.stepHeights[0] === this.stepHeightConstant.first) {
          this.stepHeights.splice(0, 1, this.stepHeightConstant.collapse)
        }
      }
      if (index1 > -1) {
        if (this.stepHeights[1] === this.stepHeightConstant.collapse) {
          this.stepHeights.splice(1, 1, this.stepHeightConstant.second)
        }
      } else {
        if (this.stepHeights[1] === this.stepHeightConstant.second) {
          this.stepHeights.splice(1, 1, this.stepHeightConstant.collapse)
        }
      }
    },
    importedData (n) {
      this.importedPageObj.total = n.length
    },
    'importedPageObj.pageNo': {
      handler (n) {
        this.handleShowImportedData()
      }
    }
  },
  setup () {
    const { query } = useRoute()
    const knowledgeBaseId = ref(query.id || '')
    // 空白对象
    const blankObject = {
      tagName: '',
      buildIn: '',
      id: '',
      tagType: 'ip',
      remark: '',
      updateTime: ''
    }
    // form绑定的对象
    const editObject = ref(_.cloneDeep(blankObject))
    // 折叠组件控制
    const activeCollapses = ref(['0', '1', '2'])
    // 步骤条控制
    const activeStep = ref('')
    const stepHeightConstant = {
      collapse: 58,
      first: 333,
      second: 284
    }
    const stepHeights = ref([stepHeightConstant.first, stepHeightConstant.second, stepHeightConstant.collapse])
    // 表单校验规则
    const rules = {
      tagName: [
        { required: true, message: i18n.global.t('validate.required'), trigger: 'blur' }
      ],
      tagType: [
        { required: true, message: i18n.global.t('validate.required'), trigger: 'change' }
      ]
    }
    // 所有导入的数据
    const importedData = ref([])
    // 导入数据的原始数量信息
    const originalImportInfo = ref({
      total: null,
      succeeded: null,
      failed: null
    })
    // table中显示的导入的数据
    const showImportedData = ref([])
    const importedPageObj = ref({
      pageNo: 1,
      pageSize: 10,
      total: null
    })
    const importedType = ref('')
    // 没上传过文件的提示
    const uploadErrorTip = ref('')
    // 预览区无内容的提示
    const previewErrorTip = ref('')
    return {
      knowledgeBaseId,
      editObject,
      blankObject,
      activeCollapses,
      activeStep,
      stepHeightConstant,
      stepHeights,
      knowledgeBaseType,
      rules,
      importedData,
      showImportedData,
      importedPageObj,
      importedType,
      baseUrl: BASE_CONFIG.baseUrl,
      fileList: ref([]),
      uploadHeaders: {
        'Cn-Authorization': localStorage.getItem(storageKey.token)
      },
      uploaded: ref(false),
      importedDataNoData: ref(false),
      url: api.knowledgeBase,
      originalImportInfo,
      uploadErrorTip,
      previewErrorTip,
      typeSelectDisable: ref(false),
      uploadFileSizeLimit: 100 * 1024 * 1024,
      uploadLoading: ref(false)
    }
  }
}
</script>
