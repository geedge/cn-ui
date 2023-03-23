<template>
  <div class="edit-knowledge-base">
    <loading :loading="initLoading"></loading>
    <div class="edit-knowledge-base__header">{{editObject.id ? $t('overall.edit') : $t('overall.create')}}</div>
    <div class="edit-knowledge-base__body">
      <el-steps direction="vertical" :active="activeStep">
        <el-step v-for="(height, index) in stepHeights" :style="`flex-basis: ${height}px; flex-shrink: 0;`" :key="index"></el-step>
      </el-steps>
      <el-collapse v-model="activeCollapses">
        <el-collapse-item name="0">
          <template #title><div class="form-sub-title">{{$t('knowledgeBase.editInformation')}}</div></template>
          <el-form :model="editObject" label-position="top" ref="form" :rules="rules">
            <!--name-->
            <el-form-item :label="$t('config.roles.name')" prop="tagName">
              <el-input class="form-input" maxlength="64" placeholder="" :disabled="!!editObject.id" show-word-limit size="mini" type="text" v-model="editObject.tagName" @blur="tagNameBlur"></el-input>
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
            <el-form-item :label="$t('overall.remark')" prop="remark">
              <el-input maxlength="255" show-word-limit :rows="4" size='mini' type="textarea" v-model="editObject.remark" id="role-box-input-remark"/>
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
                     :on-error="uploadError"
                     :class="uploadErrorTip ? 'el-upload--error' : ''"
                     drag
                     :accept="fileTypeLimit"
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
          <div class="skeleton-border" v-if="!uploaded && !editObject.id">
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
          <template v-else>
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
                  <td><i class="el-icon-close" @click="removeImportedData(i)"></i></td>
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
          </template>
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
import { ref, nextTick } from 'vue'
import _ from 'lodash'
import { knowledgeBaseType, storageKey, unitTypes } from '@/utils/constants'
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
  data () {
    const nameValidator = (rule, value, callback) => {
      let validate = true
      // /^[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-Za-z0-9\-\_]*$/
      const reg = /^[\u4e00-\u9fa5A-Za-z0-9\-\_]*$/
      validate = reg.test(value)
      return validate
    }
    const nameAndTypeValidator = async (rule, value, callback) => {
      let validate = true
      if (!this.editObject.id) {
        this.$refs.form.clearValidate('tagType')
        const response = await this.getKnowledgeBaseList()
        if (response.data.code === 200) {
          const find = response.data.data.list.find(d => d.tagName === value && d.tagType === this.editObject.tagType)
          if (find) {
            validate = false
            callback(new Error())
          }
        }
      }
      return validate
    }
    const typeAndNameValidator = async (rule, value, callback) => {
      let validate = true
      if (!this.editObject.id) {
        this.$refs.form.clearValidate('tagName')
        const response = await this.getKnowledgeBaseList()
        if (response.data.code === 200) {
          const find = response.data.data.list.find(d => d.tagName === this.editObject.tagName && d.tagType === value)
          if (find) {
            validate = false
            callback(new Error())
          }
        }
      }
      return validate
    }
    return {
      rules: {
        tagName: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: nameValidator, message: this.$t('validate.onlyAllowNumberLetterChinese-_'), trigger: 'blur' },
          { validator: nameAndTypeValidator, message: this.$t('validate.duplicateRecord', { columns: '(' + this.$t('config.roles.name') + '+' + this.$t('overall.type') + ')' }), trigger: 'blur' }
        ],
        tagType: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: typeAndNameValidator, message: this.$t('validate.duplicateRecord', { columns: '(' + this.$t('config.roles.name') + '+' + this.$t('overall.type') + ')' }), trigger: 'change' }
        ],
        remark: [
          { validator: nameValidator, message: this.$t('validate.onlyAllowNumberLetterChinese-_'), trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    tagNameBlur () {
      if (!this.tagNameFirstBlur) {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.tagNameFirstBlur = true
          }
        })
      }
    },
    fileChange (files, fileList) {
      this.fileList = fileList.slice(-1)
    },
    uploadError () {
      this.uploadLoading = false
      this.$message.error(this.$t('tip.uploadFailed', { msg: 'error' }))
    },
    uploadSuccess (response) {
      this.uploaded = response.code === 200
      if (response.code === 200) {
        // 上传成功后去掉upload和preview的错误提示
        this.uploadErrorTip = ''
        this.previewErrorTip = ''

        this.importedType = this.editObject.tagType

        const originalImportedData = _.cloneDeep(response.data.data)
        this.importedDataNoData = originalImportedData.length === 0
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
      // 判断后缀，仅支持.csv
      if (!_.endsWith(file.name, '.csv')) {
        this.$message.error(this.$t('validate.fileTypeLimit', { types: this.fileTypeLimit }))
        this.fileList = []
        return false
      }
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
      this.typeSelectDisable = true
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
    removeImportedData (index) {
      const toRemoveIndex = (this.importedPageObj.pageNo - 1) * this.importedPageObj.pageSize + index
      this.importedData.splice(toRemoveIndex, 1)
      this.importedPageObj.total--
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
      this.$router.push({
        path: '/knowledgeBase',
        t: +new Date()
      })
    },
    save () {
      if (this.blockOperation.save) { return }
      this.blockOperation.save = true
      // 校验form + upload + preview
      this.$refs.form.validate(valid => {
        this.$refs.form.validateField('tagName')
        if (!this.uploaded && !this.editObject.id) {
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
        if (valid) {
          // 校验通过后组织数据、请求接口
          if (valid && !this.uploadErrorTip && !this.previewErrorTip) {
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
            if (!this.editObject.id) {
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
              }).catch(e => {
                console.error(e)
                if (e.response.data && e.response.data.message) {
                  this.$message.error(e.response.data.message)
                } else {
                  this.$message.error('Something went wrong...')
                }
              }).finally(() => {
                this.blockOperation.save = false
              })
            } else {
              postData.id = this.editObject.id
              axios.put(this.url, postData).then(response => {
                if (response.data.code === 200) {
                  this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                  this.$router.push({
                    path: '/knowledgeBase',
                    t: +new Date()
                  })
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
                this.blockOperation.save = false
              })
            }
          } else {
            this.blockOperation.save = false
          }
        } else {
          this.blockOperation.save = false
        }
      })
    },
    hasErrorImportedData () {
      return this.importedData.filter(d => d.status !== 1).length > 0
    },
    async getKnowledgeBaseList () {
      return await axios.get(this.url, { params: { pageSize: 999 } })
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
    },
    activeStep () {
      if (this.editObject.id) {
        return 2
      } else if (this.tagNameFirstBlur) {
        return this.uploaded ? 2 : 1
      } else {
        return 0
      }
    }
  },
  mounted () {
    if (this.knowledgeBaseId) {
      axios.get(`${api.knowledgeBase}/${this.knowledgeBaseId}`).then(response => {
        if (response.data.code === 200) {
          if (!response.data.data) {
            throw new Error('No data found, id: ' + this.knowledgeBaseId)
          }
          this.editObject = response.data.data
          this.importedData = this.revertImportedData(this.editObject.data)
          this.handleShowImportedData()
          this.originalImportInfo = {
            total: this.importedData.length,
            succeeded: this.importedData.length,
            failed: 0
          }
          this.importedPageObj.total = this.importedData.length
          this.importedType = this.editObject.tagType
          this.initLoading = false
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
        this.$router.push({
          path: '/knowledgeBase',
          t: +new Date()
        })
      })
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
    const knowledgeBaseId = query.id || ''
    const url = api.knowledgeBase
    // 空白对象
    const blankObject = {
      tagName: '',
      buildIn: '',
      id: '',
      tagType: 'ip',
      remark: '',
      updateTime: ''
    }
    /* 将组织后的数据还原拉平 */
    const revertImportedData = (data) => {
      const importedData = []
      data.forEach(d => {
        d.itemList.forEach(item => {
          importedData.push({
            tagItem: item,
            tagValue: d.tagValue,
            status: 1
          })
        })
      })
      return importedData
    }
    // form绑定的对象
    const editObject = ref(_.cloneDeep(blankObject))
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
    // table分页对象
    const importedPageObj = ref({
      pageNo: 1,
      pageSize: 10,
      total: null
    })
    const importedType = ref('')
    const uploadLoading = ref(false)
    const initLoading = ref(!!knowledgeBaseId)
    const handleShowImportedData = async () => {
      const startIndex = (importedPageObj.value.pageNo - 1) * importedPageObj.value.pageSize
      const endIndex = importedPageObj.value.pageNo * importedPageObj.value.pageSize
      showImportedData.value = importedData.value.slice(startIndex, endIndex)
      await nextTick()
      uploadLoading.value = false
    }
    // 折叠组件控制
    const activeCollapses = ref(['0', '1', '2'])
    // 步骤条控制
    const stepHeightConstant = {
      collapse: 58,
      first: 333,
      second: 284
    }
    const stepHeights = ref([stepHeightConstant.first, stepHeightConstant.second, stepHeightConstant.collapse])

    // 没上传过文件的提示
    const uploadErrorTip = ref('')
    // 预览区无内容的提示
    const previewErrorTip = ref('')
    return {
      knowledgeBaseId,
      editObject,
      tagNameFirstBlur: ref(false),
      blankObject,
      activeCollapses,
      stepHeightConstant,
      stepHeights,
      knowledgeBaseType,
      importedData,
      showImportedData,
      importedPageObj,
      importedType,
      revertImportedData,
      handleShowImportedData,
      baseUrl: BASE_CONFIG.baseUrl,
      fileList: ref([]),
      uploadHeaders: {
        'Cn-Authorization': localStorage.getItem(storageKey.token)
      },
      uploaded: ref(false),
      importedDataNoData: ref(false),
      url,
      originalImportInfo,
      uploadErrorTip,
      previewErrorTip,
      typeSelectDisable: ref(false),
      uploadFileSizeLimit: 100 * 1024 * 1024,
      uploadLoading,
      initLoading,
      fileTypeLimit: '.csv'
    }
  }
}
</script>
