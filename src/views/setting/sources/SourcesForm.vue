<template>
  <div class="sources-form">
    <loading :loading="myLoading"></loading>
    <div class="sources-form__header">{{ sourceObj.id ? $t('sources.editSource') : $t('sources.createSource') }}</div>
    <div class="sources-form__body">
      <el-form ref="baseForm" :model="sourceObj" label-position="top" style="width: 620px" :rules="rules">
        <el-form-item :label="$t('overall.name')" prop="name">
          <el-input v-model="sourceObj.name" />
        </el-form-item>

        <el-form-item :label="$t('sources.dataFormat')" prop="dataFormat">
          <el-select v-model="sourceObj.dataFormat" placeholder="">
            <el-option
                v-for="item in formatOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="form__body__label"><span class="from-dot">*</span>{{ $t('overall.fields') }}</div>
      <el-form ref="fieldsForm" :model="sourceObj.fieldsData">
        <div class="form-fields__block">
          <div class="block__header">
            <div class="block__header-name">{{ $t('overall.name') }}</div>
            <div class="block__header-type">{{ $t('overall.type') }}</div>
            <div class="block__header-default">{{ $t('overall.default') }}</div>
          </div>

          <div class="block__body">
            <div class="block__body-container" v-for="(item, index) in sourceObj.fieldsData.data" :key="index">
              <el-form-item :prop="`data.${index}.name`" :rules="fieldsRules.name">
                <div class="block__body-name">
                  <el-input :ref="`name-${index}`" v-model="item.name" />
                </div>
              </el-form-item>
              <el-form-item :prop="`data.${index}.type`" :rules="fieldsRules.type">
                <div class="block__body-type">
                  <el-select ref="field-type" v-model="item.type" placeholder="">
                    <el-option
                        v-for="ite in typeOption"
                        :key="ite.value"
                        :label="ite.label"
                        :value="ite.value"
                    />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item :prop="`data.${index}.default`">
                <div class="block__body-default">
                  <el-input :ref="`default-${index}`" v-model="item.default" />
                </div>
              </el-form-item>
              <i class="cn-icon cn-icon-close remove-btn" @click="removeFieldItem(index)"></i>
            </div>
          </div>

          <div class="block__footer">
            <!--新增按钮-->
            <el-button class="addFieldBtn" @click="addFieldItem">
              <i class="cn-icon cn-icon-add add-field-btn"></i>
              {{$t('overall.add')}}
            </el-button>
          </div>
        </div>
      </el-form>

      <div class="form__body__label"><span class="from-dot">*</span>{{ $t('setting.lookups') }}</div>
      <el-form ref="lookupsForm" :model="sourceObj.lookupsData">
        <div class="form-fields__block">
          <div class="block__body">
            <div class="block__body-container" v-for="(item, index) in sourceObj.lookupsData.data" :key="index">
              <el-form-item :prop="`data.${index}.function`" :rules="lookupRules.function">
                <div class="block__body-function">
                  <el-select v-model="item.function" :placeholder="$t('setting.functionName')" @change="onChangeFunction(index)">
                    <el-option
                        v-for="ite in lookupsObj.functionOption"
                        :key="ite.value"
                        :label="ite.label"
                        :value="ite.value"
                    />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item :prop="`data.${index}.lookup_field`" :rules="lookupRules.lookup_field">
                <div class="block__body-field">
                  <el-select v-model="item.lookup_field" :placeholder="$t('setting.lookupField')">
                    <el-option
                        v-for="ite in lookupsObj.lookupFieldsOption"
                        :key="ite.name"
                        :label="ite.name"
                        :value="ite.name"
                    />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item :prop="`data.${index}.output_type`" :rules="lookupRules.output_type">
                <div class="block__body-field">
                  <el-select v-model="item.output_type" :placeholder="$t('setting.outputField')">
                    <el-option
                        v-for="ite in lookupsObj.outputFieldsOption[item.function]"
                        :key="ite.value"
                        :label="ite.label"
                        :value="ite.value"
                    />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item :prop="`data.${index}.output_field`" :rules="lookupRules.output_field">
                <div class="block__body-field-name">
                  <el-input v-model="item.output_field" :placeholder="$t('setting.outputFieldName')" />
                </div>
              </el-form-item>
              <i class="cn-icon cn-icon-close remove-btn" @click="removeLookupItem(index)"></i>
            </div>
          </div>

          <div class="block__footer">
            <!--新增按钮-->
            <el-button class="addFieldBtn" @click="addLookupItem">
              <i class="cn-icon cn-icon-add add-field-btn"></i>
              {{$t('overall.add')}}
            </el-button>
          </div>
        </div>
      </el-form>

      <div class="form__body__label">{{ $t('overall.remark') }}</div>
        <el-input
            class="form-description"
            maxlength="255"
            show-word-limit
            :rows="5"
            size='mini'
            type="textarea"
            resize='none'
            v-model="sourceObj.description"
            id="role-box-input-remark"/>

      <div class="form-setting__block margin-b-20">
        <div class="block-title"><span class="from-dot">*</span>{{ $t('overall.status') }}</div>
        <el-switch
            v-model="sourceObj.enable"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t(switchStatus(sourceObj.enable))"/>
      </div>
    </div>

    <div class="sources-form__footer">
      <button class="business-button business-button--light tag__btn" @click="cancel">
        <span>{{ $t('overall.cancel') }}</span>
      </button>
      <button style="position: relative;" :class="{'disabled': blockOperation.save}"
              :disabled="blockOperation.save" class="business-button tag__btn" @click="saveSource">
        <loading :loading="blockOperation.save"></loading>
        <span>{{ $t('overall.save') }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import _ from 'lodash'
import Loading from '@/components/common/Loading'
import { ElMessageBox } from 'element-plus'
import i18n from '@/i18n'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { api } from '@/utils/api'
import { switchStatus } from '@/utils/tools'
export default {
  name: 'SourceForm',
  components: {
    Loading
  },
  data () {
    const nameDuplicateValidator = async (rule, value, callback) => {
      let validate = true
      if (!this.sourceObj.id) {
        const response = await this.getSourceList()
        if (response.status === 200) {
          const find = response.data.data.list.find(d => d.name === value)
          if (find) {
            validate = false
            callback(new Error())
          }
        }
      }
      return validate
    }
    const nameValidator = (rule, value, callback) => {
      // 校验value包含字母、数字和下划线，并且不是全数字、全下划线和连续下划线
      const regex = /^(?=.*[a-zA-Z])(?=.*\d|^(?!\d+$))[a-zA-Z\d]+(?:_[a-zA-Z\d]+)*$/
      return regex.test(value)
    }
    const nameRepeat = (rule, value, callback) => {
      // 字段重复校验
      let validate = true
      const repeatList = this.sourceObj.fieldsData.data.filter(d => d.name === value)
      if (repeatList.length > 1) {
        validate = false
      }
      return validate
    }
    const outputFieldRepeat = (rule, value, callback) => {
      // 输出字段不能和输入字段重名
      let validate = true
      const repeatList = this.sourceObj.fieldsData.data.filter(d => d.name === value)
      if (repeatList.length > 0) {
        validate = false
      }
      return validate
    }
    return {
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: nameDuplicateValidator, message: this.$t('validate.duplicateRecord', { columns: `(${this.$t('config.roles.name')})` }), trigger: 'blur' }
        ],
        dataFormat: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      fieldsRules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: nameValidator, message: i18n.global.t('validate.onlyAllowNumberLetter_'), trigger: 'blur' },
          { validator: nameRepeat, message: i18n.global.t('validate.fieldDuplicate'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      lookupRules: {
        function: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        lookup_field: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        output_type: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        output_field: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: nameValidator, message: i18n.global.t('validate.onlyAllowNumberLetter_'), trigger: 'blur' },
          { validator: outputFieldRepeat, message: i18n.global.t('validate.outputFieldNotLookupField'), trigger: 'blur' }
        ]
      },
      // format下拉框数据
      formatOptions: [
        { label: 'json', value: 'json' },
        { label: 'csv', value: 'csv' }
      ],
      // field的type下拉框
      typeOption: [
        { label: 'string', value: 'string' },
        { label: 'int', value: 'int' },
        { label: 'float', value: 'float' },
        { label: 'long', value: 'long' },
        { label: 'double', value: 'double' }
      ],
      blockOperation: { save: false },
      addEditFlag: false, // 新增最后一个field标识
      lookupsObj: {
        // lookup的function name下拉列表
        functionOption: [
          { label: 'GEOIP_LOOKUP', value: 'GEOIP_LOOKUP' },
          { label: 'ASN_LOOKUP', value: 'ASN_LOOKUP' }
        ],
        // lookup的字段下拉列表
        lookupFieldsOption: this.sourceObj.fieldsData.data,
        // lookup的output字段下拉列表
        outputFieldsOption: {
          GEOIP_LOOKUP: [
            { label: 'COUNTRY', value: 'COUNTRY' },
            { label: 'PROVINCE', value: 'PROVINCE' },
            { label: 'CITY', value: 'CITY' },
            { label: 'LONGITUDE', value: 'LONGITUDE' },
            { label: 'LATITUDE', value: 'LATITUDE' },
            { label: 'ISP', value: 'ISP' },
            { label: 'ORGANIZATION', value: 'ORGANIZATION' }
          ],
          ASN_LOOKUP: [
            { label: 'ASN', value: 'ASN' }
          ]
        }
      },
      lookupsIndex: -1,
      lookupsForm: {
        function: '',
        lookup_field: '',
        output_type: '',
        output_field: ''
      }
    }
  },
  mounted () {
    if (this.sourceId) {
      this.initDetailInfo()
    }
  },
  methods: {
    switchStatus,
    /**
     * 编辑时初始化source详情
     */
    initDetailInfo () {
      axios.get(`${api.setting.source.source}/${this.sourceId}`).then(response => {
        if (response.status === 200) {
          if (!response.data.data) {
            throw new Error('No data found, id: ' + this.sourceId)
          }
          this.myLoading = false
          this.sourceObj = { ...this.sourceObj, ...response.data.data, sourceId: this.sourceId }
          this.sourceObj.fieldsData.data = JSON.parse(this.sourceObj.fields)
          this.sourceObj.lookupsData.data = JSON.parse(this.sourceObj.lookups)
          this.lookupsObj.lookupFieldsOption = this.sourceObj.fieldsData.data
        } else {
          console.error(response.data)
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
        this.$router.push({
          path: '/setting/source',
          query: {
            pageNo: this.pageNoForTable ? Number(this.pageNoForTable) : 1,
            t: +new Date()
          }
        })
      })
    },
    async saveSource () {
      const valid1 = await this.$refs.baseForm.validate((valid) => {
        return valid
      })
      const valid2 = await this.$refs.fieldsForm.validate((valid) => {
        return valid
      })
      const valid3 = await this.$refs.lookupsForm.validate((valid) => {
        return valid
      })
      if (valid1 && valid2 && valid3) {
        this.sourceObj.fields = JSON.stringify(this.sourceObj.fieldsData.data)
        this.sourceObj.lookups = JSON.stringify(this.sourceObj.lookupsData.data)
        if (this.sourceObj.fieldsData.data.length === 0 && this.sourceObj.lookupsData.data.length === 0) {
          ElMessageBox.alert(this.$t('detection.create.informationFilled'), this.$t('overall.tip'), {
            confirmButtonText: 'OK',
            callback: () => {}
          })
          return true
        }
        this.myLoading = true
        if (!this.sourceId) {
          // post调用是新增，put是编辑
          axios.post(api.setting.source.source, this.sourceObj).then(response => {
            if (response.status === 200) {
              this.$message({
                duration: 2000,
                type: 'success',
                message: this.$t('tip.saveSuccess')
              })

              this.$router.push({
                path: '/setting/source',
                query: {
                  t: +new Date()
                }
              })
            } else {
              console.error(response.data.message)
              this.$message.error(this.errorMsgHandler(response))
            }
          }).catch(e => {
            console.error(e)
            this.$message.error(this.errorMsgHandler(e))
          }).finally(() => {
            this.myLoading = false
          })
        } else {
          axios.put(api.setting.source.source, this.sourceObj).then(response => {
            if (response.status === 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })

              const { query } = this.$route
              const queryInfo = {
                pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
                t: +new Date()
              }
              if (query.name && query.id) {
                queryInfo.sourceId = query.id
                queryInfo.name = this.settingObj.name
              }
              this.$router.push({
                path: '/setting/source',
                query: queryInfo
              })
            } else {
              console.error(response.data.message)
              this.$message.error(this.errorMsgHandler(response))
            }
          }).catch(e => {
            console.error(e)
            this.$message.error(this.errorMsgHandler(e))
          }).finally(() => {
            this.myLoading = false
          })
        }
      }
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
            path: '/setting/source',
            query: {
              pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
              t: +new Date()
            }
          })
        }).catch(() => {})
      } else {
        this.$router.push({
          path: '/setting/source',
          query: {
            pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
            t: +new Date()
          }
        })
      }
    },
    addFieldItem () {
      this.$refs.fieldsForm.validate(valid => {
        if (valid) {
          this.addEditFlag = true
          this.sourceObj.fieldsData.data.push({ name: '', type: '', default: '' })
        }
      })
    },
    addLookupItem () {
      this.$refs.lookupsForm.validate(valid => {
        if (valid) {
          this.lookupsIndex = -1
          this.addEditFlag = true
          this.sourceObj.lookupsData.data.push({ function: '', lookup_field: '', output_type: '', output_field: '' })
        }
      })
    },
    removeFieldItem (i) {
      // 如果lookups里存在filed的字段，则进行提示
      const name = this.sourceObj.fieldsData.data[i].name
      const obj = this.sourceObj.lookupsData.data.find(d => d.lookup_field === name && name)
      if (obj) {
        ElMessageBox.alert(`${name}  ${this.$t('setting.deleteFieldTip')}`, this.$t('overall.tip'), {
          confirmButtonText: 'OK',
          callback: () => {}
        })
      } else {
        this.addEditFlag = false
        this.sourceObj.fieldsData.data.splice(i, 1)
      }
    },
    removeLookupItem (i) {
      this.addEditFlag = false
      this.sourceObj.lookupsData.data.splice(i, 1)
    },
    // lookups的function切换，重置outputField
    onChangeFunction (index) {
      this.sourceObj.lookupsData.data[index].output_type = ''
      // this.$refs.lookupsForm.clearValidate('output_type')
    },
    async getSourceList () {
      return await axios.get(api.setting.source.source, { params: { pageSize: 999 } }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      })
    }
  },
  setup () {
    const { query } = useRoute()
    const sourceId = ref(query.id || '')
    const pageNoForTable = ref(query.pageNoForTable || 1)
    const myLoading = ref(!!sourceId.value)
    const blankObject = {
      id: '',
      name: '',
      dataFormat: '',
      fields: [],
      // fields列表数据
      fieldsData: {
        data: [{ name: '', type: '', default: '' }]
      },
      lookups: [],
      // lookups列表数据
      lookupsData: {
        data: [{ function: '', lookup_field: '', output_type: '', output_field: '' }]
      },
      description: '',
      enable: 1
    }
    const sourceObj = ref(_.cloneDeep(blankObject))
    return {
      sourceId,
      pageNoForTable,
      myLoading,
      sourceObj
    }
  }
}
</script>
