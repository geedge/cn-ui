<template>
  <div class="right-box right-box-user">
    <div class="right-box__header">
      <div class="header__title">{{editObject.id ? $t('config.user.editUser') : $t('config.user.createUser')}}</div>
      <div class="header__operation">
        <span v-cancel="{object: editObject, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="userForm" :model="editObject" :rules="editObject.id ? rules2 : rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('config.user.name')" prop="name">
            <el-input id="account-input-name" v-model="editObject.name" :disabled="editObject.username==='admin' && editObject.id === 1"
                      minlength="2" maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--username-->
          <el-form-item :label="$t('config.user.username')" prop="username">
            <el-input id="account-input-username" v-model="editObject.username" :disabled="editObject.username==='admin' && editObject.id === 1"
                      minlength="2" maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--password-->
          <el-form-item :label="$t('config.user.pin')" prop="pin">
            <el-input id="account-input-password" v-model="editObject.pin" minlength="5" maxlength="64" placeholder=""
                      show-word-limit size="small" type="password" @blur="pinBlur" autocomplete="new-password"></el-input>
          </el-form-item>
          <!--pinChange-->
          <el-form-item :label="$t('config.user.confirmPin')" label-width="200px" prop="pinChange">
            <el-input id="account-input-pinChange" v-model="editObject.pinChange" minlength="5" maxlength="64" placeholder=""
                      show-word-limit size="small" type="password"></el-input>
          </el-form-item>
          <!--email-->
          <el-form-item label="E-mail" prop="email">
            <el-input id="account-input-email" v-model="editObject.email" maxlength="35" show-word-limit placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--mobile-->
          <el-form-item :label="$t('config.user.mobile')" prop="mobile">
            <el-input id="account-input-mobile" v-model.number="editObject.mobile" maxlength="11" show-word-limit placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--roles-->
          <el-form-item :label="$t('config.user.roles')" prop="roleIds">
            <el-select id="account-input-roleIds"
                       v-model="editObject.roleIds"
                       :disabled="(editObject.username === 'admin') && editObject.id === 1"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small"
                       @change="()=>{ this.$forceUpdate() }">
              <template v-for="role in roleData" :key="role.id">
                <el-option :label="role.name" :value="role.id"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!--i18n-->
          <el-form-item :label="$t('config.i18n.lang')" prop="i18n">
            <el-select id="account-input-roleIds"
                       v-model="editObject.lang"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small">
              <template v-for="lang in langData" :key="lang.value">
                <el-option :label="lang.label" :value="lang.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!--theme-->
          <el-form-item :label="$t('config.user.theme')" prop="i18n">
            <el-select id="account-input-roleIds"
                       v-model="editObject.theme"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small">
              <template v-for="theme in themeData" :key="theme.value">
                <el-option :label="theme.label" :value="theme.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!--enable-->
          <el-form-item :label="$t('config.user.enable')">
            <el-switch
               id="account-input-status"
               v-model="editObject.status"
               :disabled="(editObject.username === loginName) || (editObject.username === 'admin' && editObject.id === 1)"
               :active-value="1"
               :inactive-value="0">
            </el-switch>
          </el-form-item>

          <el-form-item v-if="editObject.id" :label="$t('config.user.createTime')">
            <div class="right-box-form-content-txt">{{editObject.ctime}}</div>
          </el-form-item>

        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{object: editObject, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': blockOperation.save}" :disabled="blockOperation.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import rightBoxMixin from '@/mixins/right-box'
import axios from 'axios'
import _ from 'lodash'
import { themeData, langData, storageKey } from '@/utils/constants'
import { api } from '@/utils/api'

export default {
  name: 'UserBox',
  mixins: [rightBoxMixin],
  data () {
    const validatePin = (rule, value, callback) => { // 确认密码
      if (value.length < 5) {
        callback(new Error(this.$t('validate.atLeastFive')))
      } else {
        callback()
      }
    }
    const validateConfirmPin = (rule, value, callback) => { // 确认密码的二次校验
      if (value === '' && this.editObject.pin) {
        callback(new Error(this.$t('config.user.confirmPin')))
      } else if (value !== this.editObject.pin) {
        callback(new Error(this.$t('config.user.confirmPinErr')))
      } else {
        callback()
      }
    }
    const validateName = (rule, value, callback) => {
      let validate = true
      // const reg = /^[a-zA-Z0-9\u4e00-\u9fa5\u30a1-\u30f6\u3041-\u3093\uFF00-\uFFFF\u4e00-\u9fa5\u0400-\u04FF\s]{2,64}$/
      const reg = /^[\u4E00-\u9FA5\a-zA-Z0-9\u3040-\u309F\u0800-\u4e00\u0400-\u04FF\u2000-\u206F\s]{2,64}$/
      const emptyFlag = value[0] === ' ' || value[value.length - 1] === ' '
      validate = reg.test(value)
      if (value.length < 2) {
        callback(new Error(this.$t('validate.atLeastTwo')))
      } else if (!validate || value.trim() === '' || emptyFlag) {
        // 除满足中英日俄、数字空格外，不能全为空格，前后也不可为空格
        callback(new Error(this.$t('validate.name')))
      } else {
        callback()
      }
    }
    const validateUserName = (rule, value, callback) => {
      let validate = true
      // const reg = /^[a-zA-Z0-9_\u4e00-\u9fa5\u30a1-\u30f6\u3041-\u3093\uFF00-\uFFFF\u4e00-\u9fa5\u0400-\u04FF\s]{2,64}$/
      // 校验，只允许中、英、数字和下划线
      const reg = /^[\u4e00-\u9fa5_a-zA-Z0-9]{2,64}$/
      validate = reg.test(value)
      if (value.length < 2) {
        callback(new Error(this.$t('validate.atLeastTwo')))
      } else if (!validate) {
        callback(new Error(this.$t('validate.userName')))
      } else {
        callback()
      }
    }
    return {
      url: api.user,
      loginName: localStorage.getItem(storageKey.username),
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: validateUserName, trigger: 'blur' }
        ],
        pin: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: validatePin, trigger: 'blur' }
        ],
        pinChange: [
          { required: true, message: this.$t('validate.required') },
          { validator: validatePin, trigger: 'blur' },
          { validator: validateConfirmPin, trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ],
        mobile: [
          { required: false, message: this.$t('validate.required') },
          { pattern: /^(1[345678]\d{9})$/, message: this.$t('validate.mobile') }
        ]
      },
      rules2: { // 表单校验规则
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pinChange: [
          { validator: validateConfirmPin, trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]{5,64}$/, message: this.$t('validate.atLeastFive') }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ],
        mobile: [
          { required: false, message: this.$t('validate.required') },
          { pattern: /^(1[345678]\d{9})$/, message: this.$t('validate.mobile') }
        ]
      },
      roleData: [],
      themeData,
      langData
    }
  },
  setup () {
  },
  mounted () {
    this.getRoleData()
  },
  methods: {
    isCurrentUser (username) {
      return localStorage.getItem(storageKey.username) === username
    },
    /* 密码失去焦点 检验确认密码 */
    pinBlur () {
      if (this.editObject.pin && this.editObject.pinChange) {
        this.$refs.userForm.validateField('pinChange')
      }
    },
    save () {
      if (this.blockOperation.save) { return }
      this.blockOperation.save = true

      this.$refs.userForm.validate((valid) => {
        if (valid) {
          if (this.editObject.id) {
            axios.put(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.status === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                if (this.editObject.lang && this.editObject.id == localStorage.getItem(storageKey.userId)) {
                  const currentLang = localStorage.getItem(storageKey.language)
                  if (currentLang !== this.editObject.lang) {
                    localStorage.setItem(storageKey.language, this.editObject.lang)
                    window.location.reload()
                  }
                }
                this.esc(true)
              } else {
                this.$message.error(res.data.msg || res.data.message)
              }
            }).catch(err => {
              this.blockOperation.save = false
              const errMsg = err.response ? err.response : (err.message ? err.message : err.toString())
              this.$message.error(_.get(errMsg, 'data.message', []))
            })
          } else {
            axios.post(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.status === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.data.msg || res.data.message)
              }
            }).catch((err) => {
              this.blockOperation.save = false
              if (_.get(err, 'response.data.code') === 511036) {
                // TODO 改成国际化
                this.$message.error('This login name is already in use')
              } else {
                const errMsg = err.response ? err.response : (err.message ? err.message : err.toString())
                this.$message.error(_.get(errMsg, 'data.message', []))
              }
            })
          }
        } else {
          this.blockOperation.save = false
          return false
        }
      })
    },
    getRoleData () {
      axios.get(api.role, { pageSize: -1 }).then(response => {
        if (response.status === 200) {
          this.roleData = _.get(response, 'data.data.list', [])
        }
      })
    }
  },
  watch: {
    object: {
      deep: true,
      immediate: true,
      handler (n) {
        this.editObject = JSON.parse(JSON.stringify(n))
        if (!this.editObject.roleIds && this.editObject.roles) {
          this.editObject.roleIds = this.editObject.roles[0].id
        }
      }
    }
  }
}
</script>
