<template>
  <div class="edit-knowledge-base">
    <loading :loading="initLoading"></loading>
    <div class="edit-knowledge-base__header">{{ editObject.id ? $t('overall.edit') : $t('overall.create') }}</div>
    <div class="edit-knowledge-base__body">
      <el-steps direction="vertical" :active="activeStep">
        <el-step v-for="(height, index) in stepHeights" :style="`flex-basis: ${height}px; flex-shrink: 0;`"
                 :key="index"></el-step>
      </el-steps>
      <el-collapse v-model="activeCollapses">
        <el-collapse-item name="0">
          <template #title>
            <div class="form-sub-title">{{ $t('knowledgeBase.editInformation') }}</div>
          </template>
          <el-form :model="editObject" label-position="top" ref="form" :rules="rules">
            <!--name-->
            <el-form-item :label="$t('config.roles.name')" prop="tagName">
              <el-input class="form-input" maxlength="64" placeholder="" :disabled="!!editObject.id" show-word-limit
                        size="mini" type="text" v-model="editObject.tagName" @blur="tagNameBlur"></el-input>
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
              <el-input maxlength="255" show-word-limit :rows="4" size='mini' type="textarea"
                        v-model="editObject.remark" id="role-box-input-remark"/>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="1" class="upload-collapse">
          <template #title>
            <div class="form-sub-title">{{ $t('overall.importFromFile') }}</div>
          </template>
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
              <div>{{ $t('knowledgeBase.dropFileHereOr') }}<em>{{ $t('knowledgeBase.clickToUpload') }}</em></div>
              <div class="upload-tip">{{ $t('knowledgeBase.supportCsv') }}</div>
            </div>
          </el-upload>
          <transition name="el-zoom-in-top">
            <div class="upload-error-tip" v-if="uploadErrorTip">{{ uploadErrorTip }}</div>
          </transition>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template #title>
            <div class="form-sub-title">{{ $t('overall.preview') }}</div>
          </template>
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
            <div class="skeleton-tip">{{ $t('knowledgeBase.skeletonTip') }}</div>
          </div>
          <template v-else>
            <div class="imported-tip"><i class="cn-icon cn-icon-baocuo"/>
              &nbsp;&nbsp;{{ editObject.id && isLoad? $t('knowledgeBase.loadTip', {
              load: originalImportInfo.total
              }) : $t('knowledgeBase.importTip', {
              total: originalImportInfo.total,
              succeeded: originalImportInfo.succeeded,
              failed: originalImportInfo.failed
              }) }}
            </div>
            <div class="imported-table-box" :class="previewErrorTip ? 'imported-table-box--error' : ''">
              <el-form ref="editForm" :model="editTagForm" :rules="editTagFormRules">
                <table class="imported-table" v-if="!importedDataNoData">
                  <tr>
                    <th style="width: 230px">{{ importedTableFirstColumn }}</th>
                    <th style="width: 180px">Label</th>
                    <th v-if="!editObject.id">{{ $t('overall.import') }}</th>
                    <th style="width: 16px"></th>
                  </tr>
                  <tr v-for="(d, i) in showImportedData" :key="importedType + d.tagItem + d.tagValue + i">
                    <td class="imported-data-item" :title="d.tagItem">
                      <el-form-item v-if="(editObject.id && editIndex === i)  || (addEditFlag && d.tagItem === '' && d.tagValue === '')" prop="tagItem">
                        <span class="imported-data-item-edit__input">
                          <el-input v-model="editTagForm.tagItem" @blur="onBlurTagItem"></el-input>
                        </span>
                      </el-form-item>
                      <span v-else>{{ d.tagItem }}</span>
                    </td>
                    <td class="imported-data-value" :title="d.tagValue">
                      <el-form-item v-if="(editObject.id && editIndex === i) || (addEditFlag && d.tagItem === '' && d.tagValue === '')" prop="tagValue">
                        <span class="imported-data-item-edit__input">
                          <el-input v-model="editTagForm.tagValue" @blur="onBlurTagItem"></el-input>
                        </span>
                      </el-form-item>
                      <span v-else>{{ d.tagValue }}</span>
                    </td>
                    <td v-if="!editObject.id" class="imported-data-msg" :title="d.msg">
                      <i :class="d.status === 1 ? 'el-icon-success' : 'el-icon-error'"></i>&nbsp;&nbsp;{{ d.msg }}
                    </td>
                    <td v-else></td>
                    <!--返回和保存按钮-->
                    <td v-if="editObject.id && backEditFlag && !addEditFlag && editIndex === i" class="imported-data-btn">
                      <i v-if="editObject.id" class="cn-icon cn-icon-revoke imported-data-left-btn imported-data-back"
                         @click="backImportedData"></i>
                      <i class="cn-icon cn-icon-save imported-data-save" @click="saveImportedData(i)"></i>
                    </td>
                    <!--保存和删除按钮-->
                    <td v-else-if="(editObject.id && addEditFlag && editIndex === i) || (addEditFlag && d.tagItem === '' && d.tagValue === '')" class="imported-data-btn">
                      <i class="cn-icon cn-icon-save imported-data-save" style="margin: 0 7px"
                         @click="saveImportedData(i)"></i>
                      <i class="el-icon-close" @click="removeImportedData(i)"></i>
                    </td>
                    <!--编辑和删除按钮-->
                    <td v-else class="imported-data-btn">
                      <i v-if="editObject.id" class="cn-icon cn-icon-edit1 imported-data-left-btn"
                         @click="editImportedData(i)"></i>
                      <i class="el-icon-close" @click="removeImportedData(i)"></i>
                    </td>
                  </tr>
                </table>
                <chart-no-data v-else></chart-no-data>
              </el-form>
              <Pagination
                  class="imported-pagination"
                  :style="{'bottom': editObject.id ? '48px' : '0'}"
                  :page-obj="importedPageObj"
                  :store-page-no-on-url="false"
                  layout="prev,pager,next"
                  @pageNo='pageNo'
                  @prev-click="prev"
                  @next-click="next"
              ></Pagination>
              <!--新增按钮-->
              <el-button class="addTagBtn" :disabled="addEditFlag" @click="addTagAtLast">
                <i class="cn-icon cn-icon-add add-tag-btn" :style="{'color': addEditFlag ? '#C0C4CC !important' : '#575757'}"></i>
                Add
              </el-button>
            </div>
            <transition name="el-zoom-in-top">
              <div class="preview-error-tip" v-if="previewErrorTip">{{ previewErrorTip }}</div>
              <div class="preview-error-tip" v-else-if="editTagErrorTip">{{ editTagErrorTip }}</div>
            </transition>
          </template>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="edit-knowledge-base__footer">
      <button class="footer__btn footer__btn--light" @click="cancel">
        <span>{{ $t('overall.cancel') }}</span>
      </button>
      <button style="position: relative;" :class="{'footer__btn--disabled': blockOperation.save}"
              :disabled="blockOperation.save" class="footer__btn" @click="save">
        <loading size="small" :loading="blockOperation.save"></loading>
        <span>{{ $t('overall.save') }}</span>
      </button>
    </div>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import { nextTick, reactive, ref } from 'vue'
import _ from 'lodash'
import { knowledgeBaseType, storageKey, unitTypes } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import axios from 'axios'
import { api } from '@/utils/api'
import { regular } from '@/utils/regular'
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
    const nameValidator = (rule, value) => {
      // /^[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-Za-z0-9\-\_]*$/
      const reg = /^[\u4e00-\u9fa5A-Za-z0-9\-\_]*$/
      return reg.test(value)
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
    const nameAndLabelDuplicateValidator = (rule, value, callback) => {
      let validate = true
      let index = -1 // 当前编辑的键值index
      // todo 查看是否重名前，需要对名称进行校验，分别是IP、domain、APP的校验
      const findData = this.importedData.find((item, i) => {
        index = i
        return (item.tagItem === this.editTagForm.tagItem && item.tagValue === this.editTagForm.tagValue)
      })
      if (findData) { // 找到1条记录
        // 如果name重复的第一个键值不是当前编辑item的index，即代表后续有重名的项了，提示重名
        const realIndex = (this.importedPageObj.pageSize * (this.importedPageObj.pageNo - 1)) + this.editIndex
        if (index !== realIndex) { // 记录为非当前记录，则数据重复
          validate = false
          this.editTagErrorTip = rule.message
          callback(new Error())
        }
      }
      return validate
    }
    const requiredItemValidator = (rule, value, callback) => {
      let validate = true
      const realValue = value.replace(/\s+/g, '')// 去掉空格
      if (realValue === '') {
        validate = false
        this.editTagErrorTip = rule.message
        callback(new Error())
      }
      return validate
    }
    const requiredValueValidator = (rule, value, callback) => {
      let validate = true
      const realValue = value.replace(/\s+/g, '')// 去掉空格
      if (realValue === '') {
        validate = false
        this.editTagErrorTip = rule.message
        callback(new Error())
      }
      return validate
    }
    const nameFormatValidator = (rule, value, callback) => {
      let validate = true
      const tagType = this.editObject.tagType// 当前选中的类型
      if (tagType === 'ip') {
        const formal = value.replace(/\s+/g, '')// 去掉空格
        if (formal.indexOf('/') !== -1) {
          if (!(regular.ipv4CIDR.test(formal)) && !(regular.ipv6CIDR.test(formal))) {
            validate = false
            this.editTagErrorTip = rule.message
            callback(new Error())
          }
        } else {
          if (!regular.ip.test(formal)) {
            validate = false
            this.editTagErrorTip = rule.message
            callback(new Error())
          }
        }
      } else if (tagType === 'app') {
        const pattern = /.*[*?!&$%#^,.;:<>/@\"{}\-\]\[=+_\\|].*$/
        if (pattern.test(value)) {
          validate = false
          this.editTagErrorTip = rule.message
          callback(new Error())
        }
      } else if (tagType === 'domain') { // 域名只支持 字母数字.-_
        if ((value.substr(0, 1) === '*' || value.substr(0, 1) === '$') &&
            !(value.substr(-1) === '*' || value.substr(-1) === '$')) {
          if (value.substr(0, 1) === '$') { // 处理$开头的情况
            // 域名中的标号都由英文字母和数字组成，每一个标号不超过63个字符，也不区分大小写字母。标号中除连字符（-）外不能使用其他的标点符号。
            // 级别最低的域名写在最左边，而级别最高的域名写在最右边。由多个标号组成的完整域名总共不超过255个字符
            const strFqdn = value.replace('$', '').trim()
            // let fqdnPattern = /^(?=^.{3,255}$)[a-zA-Z0-9_][-a-zA-Z0-9_]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
            const fqdnPattern = /^(?=^.{3,255}$)[a-zA-Z0-9*]?[-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9*][-a-zA-Z0-9]{0,62})+[(com)|(cn)|(xin)|(net)|(top)|(xyz)|(wang)|(shop)|(site)|(club)|(cc)|(fun)|(online)|(biz)|(red)|(link)|(ltd)|(mobi)|(info)|(org)|(name)|(vip)|(pro)|(work)|(tv)|(co)|(kim)|(group)|(tech)|(store)|(ren)|(pub)|(ink)|(live)|(wiki)|(design)]$/
            if (!fqdnPattern.test(strFqdn)) {
              validate = false
            }
          }
          const pattern = /^[*$]{1}[0-9a-zA-Z-._]{1,}$/
          if (!pattern.test(value.trim())) {
            validate = false
          }
          // 验证域名的合法 长度小于255
          const domain = value.replace('*', '').replace('$', '').trim()
          // 域名 长度小于255最多三级
          if (domain.length > 255 || domain.length < 3) {
            validate = false
          }
          // 域名不能以.或-或_结尾，且.与.不能连续
          if (domain.indexOf('..') > -1 || domain.substr(-1) === '.' || domain.substr(-1) === '-' || domain.substr(-1) === '_') {
            validate = false
          }
          // 每个.之间字符不大于63
          const split = domain.split('\\.')
          split.forEach(item => {
            if (item.length > 63) {
              validate = false
            }
          })
        } else {
          validate = false
        }
        if (!validate) {
          this.editTagErrorTip = rule.message
          callback(new Error())
        }
      }
      return validate
    }
    return {
      rules: {
        tagName: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          },
          {
            validator: nameValidator,
            message: this.$t('validate.onlyAllowNumberLetterChinese-_'),
            trigger: 'blur'
          },
          {
            validator: nameAndTypeValidator,
            message: this.$t('validate.duplicateRecord', { columns: '(' + this.$t('config.roles.name') + '+' + this.$t('overall.type') + ')' }),
            trigger: 'blur'
          }
        ],
        tagType: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          },
          {
            validator: typeAndNameValidator,
            message: this.$t('validate.duplicateRecord', { columns: '(' + this.$t('config.roles.name') + '+' + this.$t('overall.type') + ')' }),
            trigger: 'change'
          }
        ]
      },
      editTagFormRules: {
        tagItem: [
          {
            // required: true,
            validator: requiredItemValidator,
            message: this.$t('validate.required'),
            trigger: 'blur'
          },
          {
            validator: nameFormatValidator,
            message: this.$t('validate.wrongFormat'),
            trigger: 'blur'
          },
          {
            validator: nameAndLabelDuplicateValidator,
            message: this.$t('validate.duplicateName'),
            trigger: 'blur'
          }
        ],
        tagValue: [{
          // required: true,
          validator: requiredValueValidator,
          message: this.$t('validate.required'),
          trigger: 'blur'
        }]
      },
      editIndex: -1,
      backEditFlag: false,
      addEditFlag: false,
      editTagErrorTip: '', // 编辑错误提示
      timer: null,
      isShowUploadTips: false,
      isPreviewChange: false,
      isClick: false,
      pageNoForTable: 1
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
      if (this.fileList.length > 0 && this.fileList[0].status === 'success') {
        this.fileListBack = this.fileList[0]
      }
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
        this.isLoad = false
        originalImportedData.sort((a, b) => b.status - a.status)
        this.importedData = originalImportedData

        this.handleShowImportedData()
        this.addEditFlag = false
        this.editTagErrorTip = ''
        this.editIndex = -1
        this.isPreviewChange = true
      } else {
        this.uploadLoading = false
        this.$message.error(this.$t('tip.uploadFailed', { msg: response.message }))
      }
    },
    onRemove (files) {
      if (files && files.status === 'success') {
        this.uploaded = false
        this.typeSelectDisable = false
        this.importedData = []
        this.showImportedData = []
        this.originalImportInfo = {
          total: null,
          succeeded: null,
          failed: null
        }
        this.addEditFlag = false
        this.editTagErrorTip = ''
        this.editIndex = -1
        this.isPreviewChange = true
        this.importedDataNoData = true
      }
      if (this.fileListBack !== undefined && this.fileListBack.status === 'success' &&
            this.importedData.length > 0) {
        this.fileList[0] = this.fileListBack
      }
    },
    uploadTip () {
      if (!this.isShowUploadTips) {
        this.isShowUploadTips = true
        const self = this
        if (this.importedData.length > 0) {
          this.$confirm(this.$t('tip.uploadFile'), {
            confirmButtonText: this.$t('tip.confirm'),
            cancelButtonText: this.$t('overall.cancel'),
            message: this.$t('tip.uploadFileTips'),
            title: this.$t('tip.uploadFile'),
            type: 'warning',
            iconClass: 'width:0px;height:0px;',
            customClass: 'del-model'
          }).then(() => {
            this.isClick = true
            self.$refs.upload.$refs.uploadRef.handleClick()
          }).catch(() => {}).finally(() => {
            this.isShowUploadTips = false
          })
        } else {
          this.isClick = true
          this.isShowUploadTips = false
          self.$refs.upload.$refs.uploadRef.handleClick()
        }
      }
    },
    promiseState (p) {
      const t = {}
      return Promise.race([p, t])
        .then(v => (v === t) ? 'pending' : 'fulfilled', () => 'rejected')
    },
    beforeUpload (file) {
      return new Promise((resolve, reject) => {
        // 判断后缀，仅支持.csv
        if (!_.endsWith(file.name, '.csv')) {
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
              this.$confirm(this.$t('tip.uploadFile'), {
                confirmButtonText: this.$t('tip.confirm'),
                cancelButtonText: this.$t('overall.cancel'),
                message: this.$t('tip.uploadFileTips'),
                title: this.$t('tip.uploadFile'),
                type: 'warning',
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
    pageNo (val) {
      if (val !== this.importedPageObj.pageNo) {
        this.editTagErrorTip = ''
      }
      this.importedPageObj.pageNo = val
      this.editIndex = -1
    },
    prev () {
      this.importedPageObj.pageNo--
      this.editIndex = -1
    },
    next () {
      this.importedPageObj.pageNo++
      this.editIndex = -1
    },
    removeImportedData (index) { // index 为记录在当前页的索引
      this.editIndex = -1 // 取消编辑标识
      this.addEditFlag = false // 取消新增标识
      this.editTagErrorTip = ''

      const toRemoveIndex = (this.importedPageObj.pageNo - 1) * this.importedPageObj.pageSize + index
      this.importedData.splice(toRemoveIndex, 1)
      // 删除内容为空的新增记录
      const lastIndex = this.importedData.length - 1
      const lastData = this.importedData[lastIndex]
      if (lastData !== undefined && lastData.tagItem === '' && lastData.tagValue === '') {
        this.importedData.pop()
      }
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
      this.isPreviewChange = true
    },
    cancel () {
      const self = this
      if (this.isPreviewChange) {
        this.$confirm(this.$t('tip.leavePage'), {
          confirmButtonText: this.$t('tip.confirm'),
          cancelButtonText: this.$t('overall.cancel'),
          message: this.$t('tip.leavePageTips'),
          title: this.$t('tip.leavePage'),
          type: 'warning',
          iconClass: 'width:0px;height:0px;',
          customClass: 'del-model'
        }).then(() => {
          this.$router.push({
            path: '/knowledgeBase',
            query: {
              pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
              t: +new Date()
            }
          })
        }).catch(() => {})
      } else {
        this.$router.push({
          path: '/knowledgeBase',
          query: {
            pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
            t: +new Date()
          }
        })
      }
    },
    save () {
      if (this.blockOperation.save) {
        return
      }
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
          if (this.$refs.editForm) {
            this.$refs.editForm.validate((validImportData) => {
              if (validImportData) {
                // 校验通过后组织数据、请求接口
                if (valid && !this.uploadErrorTip && !this.previewErrorTip) {
                  if (this.importedData.length === 1 && this.importedData[0].tagItem === '') {
                    // this.blockOperation.save = false
                  } else {
                    const postData = {
                      tagName: this.editObject.tagName,
                      tagType: this.editObject.tagType,
                      data: []
                    }
                    // 避免点击新增后，并没有保存新增项就点击了save，此时删除新增的空白项
                    if (this.importedData[this.importedData.length - 1].tagItem === '') {
                      this.importedData.pop()
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
                      // d.itemList = [...d.itemList]
                      d.itemList = Array.from(d.itemList)
                    })
                    postData.remark = this.editObject.remark
                    const self = this
                    if (!this.editObject.id) {
                      axios.post(this.url, postData).then(response => {
                        if (response.data.code === 200) {
                          this.$message({
                            duration: 2000,
                            type: 'success',
                            message: this.$t('tip.saveSuccess')
                          })
                          this.$router.push({
                            path: '/knowledgeBase',
                            query: {
                              pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
                              t: +new Date()
                            }
                          })
                        } else {
                          this.errorMsgHandler(response)
                        }
                      }).catch(e => {
                        console.error(e)
                        this.errorMsgHandler(e)
                      }).finally(() => {
                        this.blockOperation.save = false
                      })
                    } else {
                      postData.id = this.editObject.id
                      axios.put(this.url, postData).then(response => {
                        if (response.data.code === 200) {
                          this.$message({
                            duration: 2000,
                            type: 'success',
                            message: this.$t('tip.saveSuccess')
                          })
                          this.$router.push({
                            path: '/knowledgeBase',
                            query: {
                              pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
                              t: +new Date()
                            }
                          })
                        } else {
                          this.errorMsgHandler(response)
                        }
                      }).catch(e => {
                        console.error(e)
                        this.errorMsgHandler(e)
                      }).finally(() => {
                        this.blockOperation.save = false
                      })
                    }
                  }
                } else {
                  this.blockOperation.save = false
                }
              } else {
                this.blockOperation.save = false
              }
            })
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
      return await axios.get(this.url, { params: { pageSize: 999 } }).catch(e => {
        console.error(e)
        this.errorMsgHandler(e)
      })
    },
    editImportedData (index) {
      this.editTagForm.tagItem = this.showImportedData[index].tagItem
      this.editTagForm.tagValue = this.showImportedData[index].tagValue

      // 点击编辑时，如正处于新增状态，则去除新增项（此时新增并为保存，不必保留）
      if (this.addEditFlag) {
        this.addEditFlag = false
        const dataLen = this.importedData.length % this.importedPageObj.pageSize
        if (dataLen === 1) {
          this.importedPageObj.total--
        }
        this.importedData.pop()
        this.handleShowImportedData()
      }

      this.editIndex = index
      this.backEditFlag = true
      this.editTagErrorTip = ''
    },
    backImportedData () {
      this.editTagForm = reactive({
        tagItem: '',
        tagValue: ''
      })

      this.editIndex = -1
      this.backEditFlag = false
      this.editTagErrorTip = ''
    },
    saveImportedData (index) {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.showImportedData[index].tagItem = this.editTagForm.tagItem
          this.showImportedData[index].tagValue = this.editTagForm.tagValue
          this.showImportedData[index].status = 1
          let num = -1
          const findData = this.importedData.find((item, i) => {
            num = i
            return (item.tagItem === this.editTagForm.tagItem && item.tagValue === this.editTagForm.tagValue)
          })
          if (!findData) {
            this.importedData[num].tagItem = this.editTagForm.tagItem
            this.importedData[num].tagValue = this.editTagForm.tagValue
            this.importedData[num].status = 1
          }

          this.addEditFlag = false
          this.editIndex = -1
          this.backEditFlag = false
          this.isPreviewChange = true
        }
      })
    },
    onBlurTagItem () {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.editTagErrorTip = ''
        }
      })
    },
    addTagAtLast () {
      this.editTagForm.tagItem = ''
      this.editTagForm.tagValue = ''
      const total = this.importedData.length
      this.addEditFlag = true
      // 如果已经有新增空白项，则不再进行新增操作
      if (this.importedData.length === 0 || (this.importedData[this.importedData.length - 1].tagItem !== '' && this.importedData[this.importedData.length - 1].tagValue !== '')) {
        if (total >= 10) {
          const lastPageSize = Math.ceil((total + 1) / 10)
          this.pageNo(lastPageSize)
        }
        this.importedData.push({ tagItem: '', tagValue: '', status: 1 })
        this.showImportedData.push({ tagItem: '', tagValue: '', status: 1 })
        this.importedDataNoData = false

        this.importedPageObj.total = this.importedData.length
        this.timer = setTimeout(() => {
          this.editIndex = this.showImportedData.length - 1
        }, 100)
      }
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
    const pageNo = this.$router.currentRoute.value.query.pageNoForTable
    this.pageNoForTable = pageNo || 1
    const div = document.getElementsByClassName('el-upload-dragger')[0]
    const self = this
    div.addEventListener('click', function (event) {
      this.isClick = true
      event.stopPropagation()
      event.preventDefault()
      self.uploadTip(event)
    })
    if (this.knowledgeBaseId) {
      this.isLoad = true
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
        } else {
          this.$message.error(this.errorMsgHandler(response))
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
        this.$router.push({
          path: '/knowledgeBase',
          query: {
            pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
            t: +new Date()
          }
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
    addEditFlag (n) {
      if (!n) {
        const lastIndex = this.importedData.length - 1
        const lastData = this.importedData[lastIndex]
        if (lastData && lastData.tagItem === '' && lastData.tagValue === '') {
          this.importedData.pop()
        }
      }
    },
    'importedPageObj.pageNo': {
      handler () {
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
    // 编辑项的form表单内容
    const editTagForm = reactive({
      tagItem: '', // 待编辑的item项，如ip、domain、app等
      tagValue: '' // 待编辑的label
    })

    const isLoad = ref(false)
    return {
      knowledgeBaseId,
      editObject,
      isLoad,
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
      fileListBack: ref(),
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
      fileTypeLimit: '.csv',
      editTagForm
    }
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>

<style lang="scss">
.del-model {
  display: flex;
  flex-direction: column;
  padding-bottom: 0 !important;
  width: 480px !important;
  height: 190px;

  .el-message-box__header {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #eee;
    height: 42px;
    background: #F7F7F7;
    box-shadow: 0 1px 0 0 rgba(53, 54, 54, 0.08);
    padding-left: 20px;
    padding-top: 14px;
    padding-bottom: 14px;

    .el-message-box__headerbtn {
      display: flex !important;
      flex-direction: row-reverse;
      justify-content: center;
      align-items: center;
      font-size: 10px;
      line-height: 10px;
      padding-right: 5px !important;

      i {
        width: 10px;
        height: 10px;
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
    height: 96px;
    font-size: 14px;
    color: #353636;
    letter-spacing: 0;
    line-height: 22px;
    font-weight: 400;
    padding-top: 8px;
    padding-right: 20px;
    padding-left: 20px;

    .el-message-box__message {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }

  .el-message-box__btns {
    height: 52px;
    border-top: 1px solid #eee;
    box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.07);
    padding: 11px 0 12px !important;

    .el-button--small {
      padding: 8px 21px !important;
      line-height: 12px;
      font-family: NotoSansHans-Medium !important;
      font-size: 12px;
      font-weight: 500;
      min-height: 28px;
    }

    .el-button:nth-child(1) {
      margin-right: 20px;
      width: 80px;
      height: 28px;
      color: #353636;
    }

    .el-button:nth-child(2) {
      width: 80px;
      height: 28px;
      margin-right: 20px;
      margin-left: 0 !important;
      background-color: #2d8cf0;
      border-color: #2d8cf0;
    }
  }
}
</style>
