<template>
  <div class="edit-tag-base">
    <loading :loading="initLoading"></loading>
    <div class="edit-tag-base__header">{{ editObject.id ? $t('overall.edit') : $t('overall.create') }}</div>
    <div class="edit-tag-base__body">
      <el-steps direction="vertical" :active="activeStep">
        <el-step v-for="(height, index) in stepHeights" :style="`flex-basis: ${height}px; flex-shrink: 0;`"
                 :key="index"></el-step>
      </el-steps>
      <el-collapse v-model="activeCollapses">
        <el-collapse-item name="0">
          <template #title>
            <div class="form-sub-title">{{ $t('tag.editInformation') }}</div>
          </template>
          <el-form :model="editObject" label-position="top" ref="form" :rules="rules">
            <!--name-->
            <el-form-item :label="$t('config.roles.name')" prop="name">
              <el-input class="form-input" maxlength="64" placeholder="" :disabled="!!editObject.id" show-word-limit
                        type="text" v-model="editObject.name" @blur="tagNameBlur"></el-input>
            </el-form-item>
            <el-form-item :label="$t('tag.category')" prop="category">
              <el-select v-model="editObject.category"
                         :class="(!!editObject.id || (uploaded && !importedDataNoData)) ? 'form-select__disable' : 'form-select__enable'"
                         placeholder=" "
                         popper-class="form-select-popper"
                         :disabled="!!editObject.id || (uploaded && !importedDataNoData)"
              >
                <template v-for="category in tagCategoryOptions" :key="category.value">
                  <el-option :label="category.label" :value="category.value"></el-option>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('overall.type')" prop="indicatorType">
              <el-select v-model="editObject.indicatorType"
                         :class="(!!editObject.id || (uploaded && !importedDataNoData)) ? 'form-select__disable' : 'form-select__enable'"
                         placeholder=" "
                         multiple
                         popper-class="form-select-popper"
                         :disabled="!!editObject.id || (uploaded && !importedDataNoData)"
              >
                <template v-for="type in tagType" :key="type.name">
                  <el-option :label="type.label" :value="type.value"></el-option>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('tag.intent')" prop="intent">
              <el-select v-model="editObject.intentLabel"
                         class="form-select__enable"
                         placeholder=" "
                         popper-class="form-select-popper"
                         @change="changeIntent"
              >
                <template #prefix>
                  <div class="tag-color">
                    <span class="tag-color__icon info" :class="editObject.intentName"></span>
                  </div>
                </template>
                <template v-for="intent in tagIntent" :key="intent.name">
                  <el-option :value="intent.label" :label="$t(intent.label)">
                    <div class="tag-color">
                      <span class="tag-color__icon" :class="intent.name"></span> <span>{{$t(intent.label)}}</span>
                    </div>
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('overall.remark')" prop="description">
              <el-input maxlength="255" show-word-limit :rows="4" type="textarea" resize='none'
                        v-model="editObject.description" id="role-box-input-remark"/>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="1" class="upload-collapse">
          <template #title>
            <div class="form-sub-title">{{ $t('overall.importFromFile') }}</div>
          </template>
          <loading :loading="uploadLoading"></loading>
          <el-upload :action="`${baseUrl}${apiVersion}/tag/parser`"
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
            <i class="cn-icon cn-icon-upload2"></i>
            <div class="el-upload__text">
              <div ref="uploadButton">{{ $t('knowledgeBase.dropFileHereOr') }}<em>{{ $t('knowledgeBase.clickToUpload') }}</em></div>
              <div class="upload-tip">{{ $t('knowledgeBase.supportCsv') }}<span @click.stop="downloadTemplate">{{$t('knowledgeBase.downloadTemplate')}}</span></div>
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
              <div class="entity-format-tip">
                <template v-if="editObject.indicatorType === tagType.find(t => t.name === 'ip').value">
                  <div><span>{{$t('overall.format')}}:</span></div>
                  <div><span>IPv4</span>  x.x.x.x</div>
                  <div><span>IPv4 CIDR</span>   x.x.x.x/n</div>
                  <div><span>IPv4 {{$t('overall.range')}}</span>   x.x.x.x-y.y.y.y</div>
                  <div><span>IPv6</span>   x:x:x::x</div>
                  <div><span>IPv6 CIDR</span>   x:x:x::x/n</div>
                  <div><span>IPv6 {{$t('overall.range')}}</span>   x:x:x::x-y:y:y::y</div>
                </template>
                <template v-else-if="editObject.indicatorType === tagType.find(t => t.name === 'domain').value">
                  <div><span>{{$t('overall.format')}}:</span></div>
                  <div><span>{{$t('entities.format.suffix')}}</span>  *example.com</div>
                  <div><span>{{$t('entities.format.exactly')}}</span>   $www.example.com</div>
                </template>
              </div>
              <el-form ref="editForm" :model="editTagForm" :rules="editTagFormRules">
                <table class="imported-table" v-if="!importedDataNoData">
                  <tr>
                    <th style="width: 230px">{{$t('tag.entityValue')}}</th>
                    <th>{{$t('tag.entityType')}}</th>
                    <th style="width: 200px">{{ $t('overall.tip') }}</th>
                    <th style="width: 50px"></th>
                  </tr>
                  <tr v-for="(d, i) in showImportedData" :key="importedType + d.entityValue + d.entityType + i">
                    <td class="imported-data-item" :title="d.entityValue">
                      <el-form-item v-if="(editIndex === i)  || (addEditFlag && d.entityValue === '' && d.entityType === '')" prop="entityValue">
                        <span class="imported-data-item-edit__input">
                          <el-input v-model="editTagForm.entityValue" @blur="onBlurTagItem(i)" size="mini"></el-input>
                        </span>
                      </el-form-item>
                      <span v-else>{{ d.entityValue }}</span>
                    </td>
                    <td class="imported-data-value" :title="d.entityType">
                      <el-form-item v-if="editIndex === i || (addEditFlag && d.entityValue === '' && d.entityType === '')" prop="entityType">
                        <span class="imported-data-item-edit__input">
                          <el-input v-model="editTagForm.entityType" @blur="onBlurTagItem(i)" size="mini"></el-input>
                        </span>
                      </el-form-item>
                      <span v-else>{{ d.entityType }}</span>
                    </td>
                    <td class="imported-data-msg" :title="d.msg">
                      <i :class="d.isValid === 1 ? 'el-icon-success' : (d.isValid === 0 ? 'el-icon-error' : '')"></i>&nbsp;&nbsp;{{(d.isValid === 1 && (d.msg==='' || !d.msg) )? $t('overall.success'): d.msg }}
                    </td>
                    <!--返回和保存按钮:修改记录-->
                    <td v-if="backEditFlag && !addEditFlag && editIndex === i" class="imported-data-btn">
                      <i class="cn-icon cn-icon-revoke imported-data-left-btn imported-data-back"
                         @click="backImportedData(i)"></i>
                      <i class="cn-icon cn-icon-save imported-data-save" @click="saveImportedData(i)"></i>
                    </td>
                    <!--保存和删除按钮：新增记录-->
                    <td v-else-if="(addEditFlag && editIndex === i) || (addEditFlag && d.entityValue === '' && d.entityType === '')" class="imported-data-btn">
                      <i class="cn-icon cn-icon-save imported-data-save" style="margin: 0 7px"
                         @click="saveImportedData(i)"></i>
                      <el-icon @click="removeImportedData(i)"><Close /></el-icon>
                    </td>
                    <!--编辑和删除按钮：进入修改记录状态-->
                    <td v-else class="imported-data-btn">
                      <i class="cn-icon cn-icon-edit1 imported-data-left-btn"
                         @click="editImportedData(i)"></i>
                      <el-icon @click="removeImportedData(i)"><Close /></el-icon>
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
                {{$t('overall.add')}}
              </el-button>
            </div>
            <transition name="el-zoom-in-top">
              <div class="preview-error-tip" v-if="previewErrorTip">{{ previewErrorTip }}</div>
              <div class="preview-error-tip" v-else-if="editTagErrorTip">{{ editTagErrorTip }}</div>
            </transition>
          </template>
        </el-collapse-item>
        <el-collapse-item name="3" class="enable-form__mt">
          <template #title>
            <div class="form-sub-title">{{ $t('tag.enable') }}</div>
          </template>

              <el-switch class="card-enable"
                         v-model="editObject.status"
                         active-color="#38ACD2"
                         inactive-color="#C0CEDB"
                         :active-value="1"
                         :inactive-value="0"
              >
              </el-switch>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="edit-tag-base__footer">
      <button class="business-button business-button--light tag__btn" @click="cancel">
        <span>{{ $t('overall.cancel') }}</span>
      </button>
      <button style="position: relative;" :class="{'disabled': blockOperation.save}"
              :disabled="blockOperation.save" class="business-button tag__btn" @click="save">
        <loading :loading="blockOperation.save"></loading>
        <span>{{ $t('overall.save') }}</span>
      </button>
    </div>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import { nextTick, reactive, ref } from 'vue'
import _ from 'lodash'
import { tagType, storageKey, unitTypes, itemListHeight, tagCategoryValue, tagIntent, tagCategoryOptions } from '@/utils/constants'
import Pagination from '@/components/common/Pagination'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import axios from 'axios'
import { api } from '@/utils/api'
import { regular } from '@/utils/regular'
import unitConvert from '@/utils/unit-convert'
import Loading from '@/components/common/Loading'
import { ElMessageBox } from 'element-plus'

export default {
  name: 'CreateTag',
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
        this.$refs.form.clearValidate('type')
        const response = await this.getTagList()
        if (response.status === 200) {
          const self = this
          const find = response.data.data.list.find(d => d.name === value && self.isSameArray(d.indicatorType.split(','), self.editObject.indicatorType))
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
        this.$refs.form.clearValidate('name')
        const response = await this.getTagList()
        if (response.status === 200) {
          const self = this
          const find = response.data.data.list.find(d => d.name === this.editObject.name && self.isSameArray(d.indicatorType.split(','), value))
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
      // 查看是否重名前，需要对名称进行校验，分别是IP、domain
      const findData = this.importedData.find((item, i) => {
        index = i
        return (item.entityValue === this.editTagForm.entityValue && item.entityType === this.editTagForm.entityType)
      })
      if (findData) { // 找到1条记录
        // 如果name重复的第一个键值不是当前编辑item的index，即代表后续有重名的项了，提示重名
        const realIndex = (this.importedPageObj.pageSize * (this.importedPageObj.pageNo - 1)) + this.editIndex
        if (index !== realIndex) { // 记录为非当前记录，则数据重复
          validate = false
          this.editTagErrorTip = rule.message
          this.showImportedData[this.editIndex].msg = rule.message
          this.showImportedData[this.editIndex].isValid = 0
          callback(new Error())
        }
      }
      return validate
    }
    const requiredItemValidator = (rule, value, callback) => {
      value = this.editTagForm.entityValue
      let validate = true
      const index = this.editIndex
      const realValue = value.replace(/\s+/g, '')// 去掉空格
      if (realValue === '') {
        validate = false
        this.editTagErrorTip = rule.message
        this.showImportedData[index].msg = rule.message
        this.showImportedData[index].isValid = 0
        callback(new Error())
      }
      return validate
    }
    const requiredValueValidator = (rule, value, callback) => {
      value = this.editTagForm.entityType
      const index = this.editIndex
      let validate = true
      if (!value) {
        validate = false
      } else {
        const realValue = value.replace(/\s+/g, '')// 去掉空格
        if (realValue === '') {
          validate = false
          this.editTagErrorTip = rule.message
          this.showImportedData[index].msg = rule.message
          this.showImportedData[index].isValid = 0
          callback(new Error())
        }
      }
      return validate
    }
    const typeRangeValidator = (rule, value, callback) => {
      value = this.editTagForm.entityType
      const index = this.editIndex
      let validate = true
      if (!value) {
        validate = false
      } else {
        const realValue = value.replace(/\s+/g, '')// 去掉空格
        if (this.editObject.indicatorType.length === 1 &&
            this.editObject.indicatorType[0] === 'IP' && realValue !== 'IP') {
          validate = false
          this.editTagErrorTip = rule.message
          this.showImportedData[index].msg = rule.message
          this.showImportedData[index].isValid = 0
          callback(new Error())
        } else if (this.editObject.indicatorType.length === 1 &&
            this.editObject.indicatorType[0] === 'Domain' && realValue !== 'Domain') {
          validate = false
          this.editTagErrorTip = rule.message
          this.showImportedData[index].msg = rule.message
          this.showImportedData[index].isValid = 0
          callback(new Error())
        } else if (realValue !== 'IP' && realValue !== 'Domain') {
          validate = false
          this.editTagErrorTip = rule.message
          this.showImportedData[index].msg = rule.message
          this.showImportedData[index].isValid = 0
          callback(new Error())
        }
      }
      return validate
    }
    const nameFormatValidator = (rule, value, callback) => {
      value = this.editTagForm.entityValue
      const index = this.editIndex
      let validate = true
      const type = this.editTagForm.entityType// 当前类型
      if (type === 'IP') {
        const formal = value.replace(/\s+/g, '')// 去掉空格
        if (formal.indexOf('/') !== -1) {
          if (!(regular.ipv4CIDR.test(formal)) && !(regular.ipv6CIDR.test(formal))) {
            validate = false
            this.editTagErrorTip = rule.message
            this.showImportedData[index].msg = rule.message
            this.showImportedData[index].isValid = 0
            callback(new Error())
          }
        } else if (formal.indexOf('-') !== -1) {
          const split2 = formal.split('-')
          const startIp = split2[0].replace(/\s+/g, '')
          const endIp = split2[1].replace(/\s+/g, '')
          if (regular.ipv4Range.test(startIp) && regular.ipv4Range.test(endIp)) {
            // ipv4对比大小
            if (!(regular.compareIP4(startIp) <= regular.compareIP4(endIp))) {
              validate = false
              this.editTagErrorTip = rule.message
              this.showImportedData[index].msg = rule.message
              this.showImportedData[index].isValid = 0
              callback(new Error())
            }
          } else if (regular.ipv6Range.test(startIp) && regular.ipv6Range.test(endIp)) {
            // ipv6对比大小
            if (!regular.ipv6Reg(startIp, endIp)) {
              validate = false
              this.editTagErrorTip = rule.message
              this.showImportedData[index].msg = rule.message
              this.showImportedData[index].isValid = 0
              callback(new Error())
            }
          } else {
            validate = false
            this.editTagErrorTip = rule.message
            this.showImportedData[index].msg = rule.message
            this.showImportedData[index].isValid = 0
            callback(new Error())
          }
        } else {
          if (!regular.ip.test(formal)) {
            validate = false
            this.editTagErrorTip = rule.message
            this.showImportedData[index].msg = rule.message
            this.showImportedData[index].isValid = 0
            callback(new Error())
          }
        }
      } else if (type === 'Domain') { // 域名只支持 字母数字.-_
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
          this.showImportedData[index].msg = rule.message
          this.showImportedData[index].isValid = 0
          callback(new Error())
        }
      }
      return validate
    }
    return {
      rules: {
        name: [
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
        indicatorType: [
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
        entityType: [{
          // required: true,
          validator: requiredValueValidator,
          message: this.$t('validate.required'),
          trigger: 'blur'
        }, {
          validator: typeRangeValidator,
          message: this.$t('validate.wrongType'),
          trigger: 'blur'
        }],
        entityValue: [
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
        ]
      },
      editIndex: -1,
      backEditFlag: false,
      addEditFlag: false,
      editTagErrorTip: '', // 编辑错误提示
      timer: null,
      isShowUploadTips: false,
      isPreviewChange: false,
      isClick: false,
      pageNoForTable: 1,
      status: 1,
      oldItemIds: [],
      oldTagItem: {},
      tagIntent,
      tagCategoryOptions
    }
  },
  methods: {
    isSameArray (arr1, arr2) {
      // Arrary.some: 有一项不满足 返回false
      // Arrary.indexOf: 查到返回下标，查不到返回 -1
      if (arr1.length !== arr2.length) {
        return false
      }
      return !arr1.some(item => arr2.indexOf(item) === -1)
    },
    changeIntent (label) {
      const curColorObj = this.tagIntent.find(item => item.label === this.editObject.intentLabel)
      this.editObject.intent = curColorObj.value
      this.editObject.intentName = curColorObj.name
    },
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
    handleSpeticalTypeData (originalImportedData) {
      originalImportedData.forEach(item => {
        if (item.entityType === 'IP') {
          const format = item.addrFormat
          if (format === 'Single') {
            item.entityValue = item.ip1
          } else if (format === 'CIDR') {
            item.entityValue = item.ip1 + '/' + item.ip2
          } else if (format === 'Range') {
            item.entityValue = item.ip1 + '-' + item.ip2
          }
        } else if (item.entityType === 'Domain') {
          item.entityValue = item.entityValue
        }
      })
      return originalImportedData
    },
    uploadSuccess (response) {
      if (response.code === 200) {
        this.uploaded = true
        // 上传成功后去掉upload和preview的错误提示
        this.uploadErrorTip = ''
        this.previewErrorTip = ''
        this.importedType = this.editObject.indicatorType
        const originalImportedData = _.cloneDeep(response.data.list)
        this.importedDataNoData = originalImportedData.length === 0
        if (originalImportedData.length > 0) {
          originalImportedData.forEach(data => {
            if (data.isValid === 1) {
              data.msg = this.$t('overall.success')
            } else if (data.isValid === 0) {
              if (data.errorAttribute === 'entityType') {
                data.msg = this.$t('validate.wrongType')
              } else if (data.errorAttribute === 'entityValue') {
                data.msg = this.$t('validate.wrongFormat')
              }
            }
          })
        }
        this.originalImportInfo = {
          total: originalImportedData.length,
          succeeded: originalImportedData.filter(d => d.isValid === 1).length,
          failed: originalImportedData.filter(d => d.isValid !== 1).length
        }
        this.isLoad = false
        originalImportedData.sort((a, b) => b.isValid - a.isValid)
        this.importedData = this.handleSpeticalTypeData(originalImportedData)
        this.addItemList = _.cloneDeep(this.importedData).filter(item => { return item.isValid === 1 })
        this.updateItemList = []
        this.deleteItemIds = this.oldItemIds

        this.handleShowImportedData()
        this.addEditFlag = false
        this.editTagErrorTip = ''
        this.editIndex = -1
        this.isPreviewChange = true
        this.stepHeights[2] = itemListHeight.hasData
        this.stepHeightConstant.third = itemListHeight.hasData
      } else {
        this.uploadLoading = false
        this.$message.error(this.$t('tip.uploadFailed', { msg: response.message }))
      }
    },
    onRemove (files) {
      if (files && files.status === 'success') {
        this.uploaded = false
        this.typeSelectDisable = false
        this.importedData.forEach(item => {
          if (item.id) {
            const delIndex = this.deleteItemIds.indexOf(item.id)
            if (delIndex === -1) {
              this.deleteItemIds.push(item.id)
            }
          }
        })
        this.addItemList = []
        this.updateItemList = []
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

        if (!this.editObject.id) { // 新增且删除文件时，高度变为250
          this.stepHeights[2] = itemListHeight.noData
          this.stepHeightConstant.third = itemListHeight.noData
        }
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
          ElMessageBox.confirm(this.$t('tip.uploadFile'), {
            confirmButtonText: this.$t('tip.confirm'),
            cancelButtonText: this.$t('overall.cancel'),
            message: this.$t('tip.uploadFileTips'),
            title: this.$t('tip.uploadFile'),
            // type: 'warning',
            iconClass: 'width:0px;height:0px;',
            customClass: 'del-model'
          }).then(() => {
            this.isClick = true
            document.getElementsByName('file')[0].click()
          }).catch(() => {}).finally(() => {
            this.isShowUploadTips = false
          })
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
    backEditData () {
      if (this.oldTagItem.isValid) {
        this.showImportedData[this.oldTagItem.index].isValid = this.oldTagItem.isValid
        this.showImportedData[this.oldTagItem.index].msg = this.oldTagItem.msg
      }
    },
    pageNo (val) {
      this.backEditData()
      if (val !== this.importedPageObj.pageNo) {
        this.editTagErrorTip = ''
      }
      this.importedPageObj.pageNo = val
      this.editIndex = -1
      this.oldTagItem = {}
    },
    prev () {
      this.backEditData()
      this.importedPageObj.pageNo--
      this.editIndex = -1
      this.oldTagItem = {}
    },
    next () {
      this.backEditData()
      this.importedPageObj.pageNo++
      this.editIndex = -1
      this.oldTagItem = {}
    },
    removeImportedData (index) { // index 为记录在当前页的索引
      this.backEditData()
      this.editIndex = -1 // 取消编辑标识
      this.addEditFlag = false // 取消新增标识
      this.editTagErrorTip = ''

      const toRemoveIndex = (this.importedPageObj.pageNo - 1) * this.importedPageObj.pageSize + index
      const delItem = this.importedData[toRemoveIndex]
      if (delItem.id) {
        if (this.deleteItemIds.indexOf(delItem.id) === -1) {
          this.deleteItemIds.push(delItem.id)
        }
        const delIndex = this.updateItemList.findIndex(item => item.id === delItem.id)
        if (delIndex > -1) {
          this.updateItemList.splice(delIndex, 1)
        }
      } else {
        const delIndex = this.addItemList.findIndex(item => item.entityValue === delItem.entityValue && item.entityType === delItem.entityType)
        if (delIndex > -1) {
          this.addItemList.splice(delIndex, 1)
        }
      }
      this.importedData.splice(toRemoveIndex, 1)
      // 删除内容为空的新增记录
      const lastIndex = this.importedData.length - 1
      const lastData = this.importedData[lastIndex]
      if (lastData !== undefined && lastData.entityValue === '' && lastData.entityType === '') {
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
      this.oldTagItem = {}
    },
    cancel () {
      const self = this
      if (this.isPreviewChange) {
        ElMessageBox.confirm(this.$t('tip.leavePage'), {
          confirmButtonText: this.$t('tip.confirm'),
          cancelButtonText: this.$t('overall.cancel'),
          message: this.$t('tip.leavePageTips'),
          title: this.$t('tip.leavePage'),
          // type: 'warning',
          iconClass: 'width:0px;height:0px;',
          customClass: 'del-model'
        }).then(() => {
          this.$router.push({
            path: '/tag/userDefined',
            query: {
              pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
              t: +new Date()
            }
          })
        }).catch(() => {})
      } else {
        this.$router.push({
          path: '/tag/userDefined',
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
        this.$refs.form.validateField('name')
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
                  if (this.importedData.length === 1 && this.importedData[0].entityValue === '') {
                    // this.blockOperation.save = false
                  } else {
                    const userId = localStorage.getItem(storageKey.userId)
                    const postData = {
                      name: this.editObject.name,
                      category: this.editObject.category,
                      intent: this.editObject.intent,
                      indicatorType: this.editObject.indicatorType.join(','),
                      description: this.editObject.description,
                      status: this.editObject.status,
                      user: {
                        id: userId ? Number(userId) : 1
                      }
                    }
                    // 避免点击新增后，并没有保存新增项就点击了save，此时删除新增的空白项
                    if (this.importedData[this.importedData.length - 1].entityValue === '') {
                      this.importedData.pop()
                    }

                    const self = this
                    if (!this.editObject.id) {
                      postData.addItemList = this.addItemList
                      axios.post(this.url, postData).then(response => {
                        if (response.status === 200) {
                          this.$message({
                            duration: 2000,
                            type: 'success',
                            message: this.$t('tip.saveSuccess')
                          })
                          this.$router.push({
                            path: '/tag/userDefined',
                            query: {
                              pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
                              t: +new Date()
                            }
                          })
                        } else {
                          this.$message.error(this.errorMsgHandler(response))
                        }
                      }).catch(e => {
                        console.error(e)
                        this.$message.error(this.errorMsgHandler(e))
                      }).finally(() => {
                        this.blockOperation.save = false
                      })
                    } else {
                      postData.updateItemList = this.updateItemList
                      postData.addItemList = this.addItemList
                      postData.deleteItemIds = this.deleteItemIds
                      postData.id = this.editObject.id
                      axios.put(this.url, postData).then(response => {
                        if (response.status === 200) {
                          this.$message({
                            duration: 2000,
                            type: 'success',
                            message: this.$t('tip.saveSuccess')
                          })
                          this.$router.push({
                            path: '/tag/userDefined',
                            query: {
                              pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
                              t: +new Date()
                            }
                          })
                        } else {
                          this.$message.error(this.errorMsgHandler(response))
                        }
                      }).catch(e => {
                        console.error(e)
                        this.$message.error(this.errorMsgHandler(e))
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
      return this.importedData.filter(d => d.isValid !== 1).length > 0
    },
    async getTagList () {
      return await axios.get(this.listUrl, { params: { pageSize: 999 } }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    editImportedData (index) {
      this.backEditData()
      this.editTagForm.entityValue = this.showImportedData[index].entityValue
      this.editTagForm.entityType = this.showImportedData[index].entityType

      // 点击编辑时，如正处于新增状态，则去除新增项（此时新增并未保存，不必保留）
      if (this.addEditFlag) {
        this.addEditFlag = false
        const dataLen = this.importedData.length % this.importedPageObj.pageSize
        if (dataLen === 1) {
          this.importedPageObj.total--
        }
        this.importedData.pop()
        this.handleShowImportedData()
      }
      this.oldTagItem = {
        isValid: this.showImportedData[index].isValid,
        msg: this.showImportedData[index].msg,
        entityValue: this.showImportedData[index].entityValue,
        entityType: this.showImportedData[index].entityType,
        index: index
      }
      this.editIndex = index
      this.backEditFlag = true
      this.editTagErrorTip = ''
    },
    backImportedData (index) {
      this.editTagForm = reactive({
        entityValue: '',
        entityType: ''
      })
      this.showImportedData[index].isValid = this.oldTagItem.isValid
      this.showImportedData[index].msg = this.oldTagItem.msg
      this.editIndex = -1
      this.backEditFlag = false
      this.editTagErrorTip = ''
    },
    updateData (data) {
      if (data) {
        const updateItemIndex = this.updateItemList.findIndex(item => item.id === data.id)
        if (updateItemIndex > -1) {
          this.updateItemList.splice(updateItemIndex, 1, data)
        } else {
          let updateItemData = {
            id: data.id,
            entityType: data.entityType,
            entityValue: data.entityValue
          }
          if (this.editObject.indicatorType === 'IP') {
            const sepCidrIndex = data.entityValue.indexOf('/')
            const sepRangeIndex = data.entityValue.indexOf('-')
            if (sepCidrIndex > -1) { // CIDR
              updateItemData = {
                ...updateItemData,
                addrFormat: 'CIDR',
                ip1: data.entityValue.substring(0, sepCidrIndex),
                ip2: data.entityValue.substring(sepCidrIndex + 1)
              }
            } else if (sepRangeIndex > -1) {
              updateItemData = {
                ...updateItemData,
                addrFormat: 'Range',
                ip1: data.entityValue.substring(0, sepRangeIndex),
                ip2: data.entityValue.substring(sepRangeIndex + 1)
              }
            } else { // Single
              updateItemData = {
                ...updateItemData,
                addrFormat: 'Single',
                ip1: data.entityValue,
                ip2: ''
              }
            }
          } else if (this.editObject.indicatorType === 'Domain') {
            updateItemData = {
              ...updateItemData,
              domain: data.entityValue
            }
          }
          this.updateItemList.push(updateItemData)
        }
      }
    },
    addData (data, oldTag) {
      if (data) {
        let addItemIndex = -1
        if (oldTag) {
          addItemIndex = this.addItemList.findIndex(item => item.entityValue === oldTag.entityValue && item.entityType === oldTag.entityType)
        } else {
          addItemIndex = this.addItemList.findIndex(item => item.entityValue === data.entityValue && item.entityType === data.entityType)
        }
        let addItem = data
        if (this.editObject.indicatorType === 'IP') {
          const sepCidrIndex = data.entityValue.indexOf('/')
          const sepRangeIndex = data.entityValue.indexOf('-')
          if (sepCidrIndex > -1) { // CIDR
            addItem = {
              ...addItem,
              addrFormat: 'CIDR',
              ip1: data.entityValue.substring(0, sepCidrIndex),
              ip2: data.entityValue.substring(sepCidrIndex + 1)
            }
          } else if (sepRangeIndex > -1) {
            addItem = {
              ...addItem,
              addrFormat: 'Range',
              ip1: data.entityValue.substring(0, sepRangeIndex),
              ip2: data.entityValue.substring(sepRangeIndex + 1)
            }
          } else { // Single
            addItem = {
              ...addItem,
              addrFormat: 'Single',
              ip1: data.entityValue,
              ip2: ''
            }
          }
        } else if (this.editObject.indicatorType === 'Domain') {
          addItem = {
            ...addItem,
            domain: data.entityValue
          }
        }

        if (addItemIndex === -1) {
          this.addItemList.push(addItem)
        } else {
          this.addItemList.splice(addItemIndex, 1, addItem)
        }
      }
    },
    saveImportedData (index) { // 分为新增的保存，修改的保存
      const self = this
      this.$refs.editForm.validate(valid => {
        if (valid) {
          const oldTag = {
            entityValue: self.showImportedData[index].entityValue,
            entityType: self.showImportedData[index].entityType
          }
          self.showImportedData[index].entityValue = self.editTagForm.entityValue
          self.showImportedData[index].entityType = self.editTagForm.entityType
          let num = -1
          const findData = self.importedData.find((item, i) => {
            num = i
            return (item.entityValue === self.editTagForm.entityValue && item.entityType === self.editTagForm.entityType)
          })
          if (!findData) { // 新增记录(包括新增和修改界面)
            self.importedData[num].entityValue = self.editTagForm.entityValue
            self.importedData[num].entityType = self.editTagForm.entityType
            self.importedData[num].isValid = 1
            self.addData(self.importedData[num])
          } else { // 修改记录
            if (findData.id) { // 修改界面的修改记录
              self.updateData(findData, oldTag)
            } else { // 新增界面的修改记录
              self.addData(findData, oldTag)
            }
          }

          self.addEditFlag = false
          self.editIndex = -1
          self.backEditFlag = false
          self.isPreviewChange = true
          this.oldTagItem = {}
        } else {
          self.showImportedData[index].isValid = 0
        }
      })
    },
    onBlurTagItem (index) {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.editTagErrorTip = ''
          this.showImportedData[index].isValid = 1
          this.showImportedData[index].msg = this.$t('overall.success')
        } else {
          this.showImportedData[index].isValid = 0
        }
      })
    },
    addTagAtLast () {
      this.backEditData()
      this.editTagForm.entityValue = ''
      this.editTagForm.entityType = ''
      const total = this.importedData.length
      this.addEditFlag = true
      // 如果已经有新增空白项，则不再进行新增操作
      if (this.importedData.length === 0 || !(this.importedData[this.importedData.length - 1].entityValue === '' && this.importedData[this.importedData.length - 1].entityType === '')) {
        if (total >= 10) {
          const lastPageSize = Math.ceil((total + 1) / 10)
          this.pageNo(lastPageSize)
        }
        this.importedData.push({ entityValue: '', entityType: '' })
        this.showImportedData.push({ entityValue: '', entityType: '' })
        this.importedDataNoData = false

        this.importedPageObj.total = this.importedData.length
        this.timer = setTimeout(() => {
          this.editIndex = this.showImportedData.length - 1
        }, 100)
      }
      this.oldTagItem = {}
    },
    downloadTemplate () {
      window.open('/assets/tagTemplate.zip', '_blank')
    }
  },
  computed: {
    uploadParams () {
      return {
        indicatorType: this.editObject.indicatorType.join(',')
      }
    },
    activeStep () {
      if (this.editObject.id) {
        return 3
      } else if (this.tagNameFirstBlur) {
        // return this.uploaded ? 2 : 1
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
      self.isClick = true
      if (!self.isShowUploadTips && self.importedData.length === 0) {
        self.isClick = true
        self.isShowUploadTips = false
      } else {
        event.stopPropagation()
        event.preventDefault()
        self.uploadTip(event)
      }
    })
    if (this.id) {
      this.stepHeights[2] = itemListHeight.hasData// 修改的时候一直是478
      this.stepHeightConstant.third = itemListHeight.hasData// 修改的时候一直是478
      this.isLoad = true
      axios.get(`${api.tag}/${this.id}`, { params: { pageSize: -1 } }).then(response => {
        if (response.status === 200) {
          if (!response.data.data) {
            throw new Error('No data found, id: ' + this.id)
          }
          this.editObject = response.data.data
          if (response.data.data.intent) {
            const curIntentObj = this.tagIntent.find(item => item.value === response.data.data.intent)
            this.editObject.intent = curIntentObj ? curIntentObj.value : this.tagIntent[0].value
            this.editObject.intentName = curIntentObj ? curIntentObj.name : this.tagIntent[0].name
            this.editObject.intentLabel = curIntentObj ? curIntentObj.label : this.tagIntent[0].label
          } else {
            this.editObject.intent = this.tagIntent[0].value
            this.editObject.intentName = this.tagIntent[0].name
            this.editObject.intentLabel = this.tagIntent[0].label
          }
          if (response.data.data.indicatorType) {
            this.editObject.indicatorType = this.editObject.indicatorType.split(',')
          }
          this.importedData = this.handleSpeticalTypeData(this.editObject.itemList)
          this.importedData.forEach(item => {
            this.oldItemIds.push(item.id)
          })
          this.handleShowImportedData()
          this.originalImportInfo = {
            total: this.importedData.length,
            succeeded: this.importedData.length,
            failed: 0
          }
          this.importedPageObj.total = this.importedData.length
          this.importedType = this.editObject.indicatorType
          this.initLoading = false
        } else {
          this.$message.error(this.errorMsgHandler(response))
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
        this.$router.push({
          path: '/tag/userDefined',
          query: {
            pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
            t: +new Date()
          }
        })
      })
    } else {
      this.editObject.intent = this.tagIntent[0].value
      this.editObject.intentName = this.tagIntent[0].name
      this.editObject.intentLabel = this.tagIntent[0].label
      this.stepHeightConstant.third = itemListHeight.noData// 进入新增时为250
    }
  },
  watch: {
    activeCollapses (n) {
      const index0 = n.indexOf('0')
      const index1 = n.indexOf('1')
      const index2 = n.indexOf('2')
      if (index0 > -1) { // 第一个折叠为发开状态
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
      if (index2 > -1) {
        if (this.stepHeights[2] === this.stepHeightConstant.collapse) {
          this.stepHeights.splice(2, 1, this.stepHeightConstant.third)
        }
      } else {
        if (this.stepHeights[2] === this.stepHeightConstant.third) {
          this.stepHeights.splice(2, 1, this.stepHeightConstant.collapse)
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
        if (lastData && lastData.entityValue === '' && lastData.entityType === '') {
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
    const id = query.id || ''
    const url = api.tag
    const listUrl = api.tagList
    // 空白对象
    const blankObject = {
      name: '',
      buildIn: '',
      id: '',
      category: 'VPN',
      indicatorType: ['IP'],
      description: '',
      updateTime: '',
      status: 1,
      intent: '',
      intentLabel: '',
      intentName: ''
    }
    /* 将组织后的数据还原拉平 */
    const revertImportedData = (data) => {
      const importedData = []
      data.forEach(d => {
        d.itemList.forEach(item => {
          importedData.push({
            entityValue: item,
            entityType: d.entityType,
            isValid: 1
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
    // 新增数据
    const addItemList = ref([])
    // 修改的数据
    const updateItemList = ref([])
    // 删除的数据
    const deleteItemIds = ref([])
    // table分页对象
    const importedPageObj = ref({
      pageNo: 1,
      pageSize: 10,
      total: null
    })
    const importedType = ref('')
    const uploadLoading = ref(false)
    const initLoading = ref(!!id)
    const handleShowImportedData = async () => {
      const startIndex = (importedPageObj.value.pageNo - 1) * importedPageObj.value.pageSize
      const endIndex = importedPageObj.value.pageNo * importedPageObj.value.pageSize
      showImportedData.value = importedData.value.slice(startIndex, endIndex)
      await nextTick()
      uploadLoading.value = false
    }
    // 折叠组件控制
    const activeCollapses = ref(['0', '1', '2', '3'])
    // 步骤条控制
    const stepHeightConstant = {
      collapse: 58,
      first: 413,
      second: 296,
      third: itemListHeight.noData
    }

    const stepHeights = ref([stepHeightConstant.first, stepHeightConstant.second, stepHeightConstant.third, stepHeightConstant.collapse])

    // 没上传过文件的提示
    const uploadErrorTip = ref('')
    // 预览区无内容的提示
    const previewErrorTip = ref('')
    // 编辑项的form表单内容
    const editTagForm = reactive({
      entityValue: '', // 待编辑的item项，如ip、domain等
      entityType: '' // 待编辑的label
    })

    const isLoad = ref(false)
    return {
      id,
      editObject,
      isLoad,
      tagNameFirstBlur: ref(false),
      blankObject,
      activeCollapses,
      stepHeightConstant,
      stepHeights,
      tagType,
      importedData,
      showImportedData,
      addItemList,
      updateItemList,
      deleteItemIds,
      importedPageObj,
      importedType,
      revertImportedData,
      handleShowImportedData,
      baseUrl: BASE_CONFIG.baseUrl,
      apiVersion: BASE_CONFIG.apiVersion,
      fileList: ref([]),
      fileListBack: ref(),
      uploadHeaders: {
        'Cn-Authorization': localStorage.getItem(storageKey.token)
      },
      uploaded: ref(false),
      importedDataNoData: ref(false),
      url,
      listUrl,
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
.el-overlay-message-box, .el-message-box {
  padding: 0 !important;
}
.el-overlay-message-box {
  text-align: center !important;
}
.is-message-box .el-overlay-message-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.del-model {
  &.el-message-box {
    max-width: 480px !important;
  }
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
    padding-left: 21px;
    padding-top: 10px;
    padding-bottom: 14px;

    .el-message-box__headerbtn {
      display: flex !important;
      flex-direction: row-reverse;
      justify-content: center;
      align-items: center;
      font-size: 10px;
      line-height: 10px;
      padding-right: 10px !important;

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
    padding-top: 9px;
    padding-right: 20px;
    padding-left: 21px;

    .el-message-box__message {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }

  .el-message-box__btns {
    height: 52px;
    border-top: 1px solid #eee;
    box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.07);
    padding: 13px 1px 12px 0;

    .el-button {
      font-size: 12px;
    }
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
