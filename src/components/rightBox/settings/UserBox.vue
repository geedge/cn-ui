<template>
  <div class="right-box right-box-user">
    <div class="right-box__header">
      <div class="header__title">{{ editObject.id ? $t('config.user.editUser') : $t('config.user.createUser') }}</div>
      <div class="header__operation">
        <span v-cancel="{object: editObject, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="userForm" :model="editObject" :rules="editObject.id ? rules2 : rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('config.user.name')" prop="name">
            <el-input id="account-input-name" v-model="editObject.name"
                      :disabled="editObject.username==='admin' && editObject.id === 1"
                      maxlength="32" placeholder="" show-word-limit type="text"></el-input>
          </el-form-item>
          <!--username-->
          <el-form-item :label="$t('config.user.username')" prop="username">
            <el-input id="account-input-username" v-model="editObject.username"
                      :disabled="editObject.username==='admin' && editObject.id === 1"
                       maxlength="64" placeholder="" show-word-limit type="text"></el-input>
          </el-form-item>
          <!--password-->
          <el-form-item :label="$t('config.user.pin')" prop="pin">
            <el-input id="account-input-password" v-model="editObject.pin"  maxlength="16" placeholder=""
                      show-word-limit type="password" show-password @blur="pinBlur" @input="pinInput" autocomplete="new-password"></el-input>
          </el-form-item>
          <!--密码强度-->
          <el-progress
              :text-inside="true"
              class="my-progress"
              :percentage="percentage"
              :color="customColors" />
          <!--密码提示-->
          <div class="password-hint">{{ handleSpecialCode($t('validate.passwordHint')) }}</div>
          <!--pinChange-->
          <el-form-item :label="$t('config.user.confirmPin')" label-width="200px" prop="pinChange">
            <el-input id="account-input-pinChange" v-model="editObject.pinChange"  maxlength="16" placeholder=""
                      show-word-limit type="password"></el-input>
          </el-form-item>
          <!--email-->
          <el-form-item label="E-mail" prop="email">
            <el-input id="account-input-email" v-model="editObject.email" maxlength="35" show-word-limit placeholder="" type="text"></el-input>
          </el-form-item>
          <!--mobile-->
          <el-form-item :label="$t('config.user.mobile')" prop="mobile">
            <el-input id="account-input-mobile" v-model="editObject.mobile" maxlength="20" show-word-limit placeholder="" type="text"></el-input>
          </el-form-item>
          <!--roles-->
          <el-form-item :label="$t('config.user.roles')" prop="roleIds">
            <el-select id="account-input-roleIds"
                       v-model="editObject.roleIds"
                       :disabled="(editObject.username === 'admin') && editObject.id === 1"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=" "
                       popper-class="right-box-select-dropdown prevent-clickoutside"

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
                       placeholder=" "
                       popper-class="right-box-select-dropdown prevent-clickoutside"
            >
              <template v-for="lang in langData" :key="lang.value">
                <el-option :label="lang.label" :value="lang.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
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
            <div class="right-box-form-content-txt">{{ editObject.ctime }}</div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{object: editObject, func: esc}" class="business-button business-button--light">
        <span>{{ $t('overall.cancel') }}</span>
      </button>
      <button id="asset-edit-save" :disabled="blockOperation.save" class="business-button" @click="save">
        <span>{{ $t('overall.save') }}</span>
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
import { handleSpecialCode } from '@/utils/tools'

export default {
  name: 'UserBox',
  mixins: [rightBoxMixin],
  data () {
    const validatePin = (rule, value, callback) => { // 确认密码
      const reg = /^[-\d\w/~!@#$%^&*_.?]+$/g
      const isValid = value.match(reg) // 返回匹配到的值
      if (value && value.length < 8) {
        callback(new Error(this.$t('validate.atLeastEight')))
      } else if (!isValid || this.passwordLevel(this.editObject.pin) === 1) {
        callback(new Error(handleSpecialCode(this.$t('validate.passwordError'))))
      } else {
        callback()
      }
    }
    const validateConfirmPin = (rule, value, callback) => { // 确认密码的二次校验
      if (_.isEmpty(value) && !_.isEmpty(this.editObject.pin)) { // 密码有内容，确认密码没内容
        callback(new Error(this.$t('config.user.confirmPin')))
      } else if (!_.isEmpty(value) && value !== this.editObject.pin) { // 密码有内容，确认密码也有内容，内容不一致
        callback(new Error(this.$t('config.user.confirmPinErr')))
      } else {
        callback()
      }
    }
    const validateUserName = (rule, value, callback) => {
      let validate = true
      // const reg = /^[a-zA-Z0-9_\u4e00-\u9fa5\u30a1-\u30f6\u3041-\u3093\uFF00-\uFFFF\u4e00-\u9fa5\u0400-\u04FF\s]{2,64}$/
      // 校验，只允许英文、数字和标点符号
      const reg = /^[A-Za-z0-9~!@#$%^&*_.?]+$/
      validate = reg.test(value)
      if (!validate) {
        callback(new Error(this.$t('validate.userName1')))
      } else {
        callback()
      }
    }
    return {
      url: api.user,
      loginName: localStorage.getItem(storageKey.username),
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.nameLength'), trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('validate.userNameLength'), trigger: 'blur' },
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
          { pattern: /^(\d{1,20})$/, message: this.$t('validate.mobile') }
        ]
      },
      rules2: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.nameLength'), trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('validate.userNameLength'), trigger: 'blur' },
          { validator: validateUserName, trigger: 'blur' }
        ],
        pinChange: [
          { validator: validateConfirmPin, trigger: 'blur' },
          { validator: validatePin, trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ],
        mobile: [
          { required: false, message: this.$t('validate.required') },
          { pattern: /^(\d{1,20})$/, message: this.$t('validate.mobile') }
        ]
      },
      roleData: [],
      themeData,
      langData,
      percentage: 0, // 密码强度
      customColors: [ // 密码强度颜色指标
        { color: '#d32423', percentage: 26 },
        { color: '#fdbf12', percentage: 51 },
        { color: '#99c708', percentage: 76 },
        { color: '#099407', percentage: 100 }
      ]
    }
  },
  setup () {
  },
  mounted () {
    this.getRoleData()
  },
  methods: {
    handleSpecialCode,
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
      if (this.blockOperation.save) {
        return
      }
      this.blockOperation.save = true

      this.$refs.userForm.validate((valid) => {
        if (valid) {
          if (this.editObject.id) {
            axios.put(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.status === 200) {
                this.$message({
                  duration: 2000,
                  type: 'success',
                  message: this.$t('tip.saveSuccess')
                })
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
                this.$message({
                  duration: 2000,
                  type: 'success',
                  message: this.$t('tip.saveSuccess')
                })
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
    },
    pinInput () {
      if (this.editObject?.pin.length < 8) {
        this.percentage = 25
      } else if (this.editObject?.pin.length < 10) {
        this.percentage = this.passwordLevel(this.editObject.pin) > 1 ? 2 * 25 : this.passwordLevel(this.editObject.pin) * 25
      } else if (this.editObject?.pin.length < 12) {
        this.percentage = this.passwordLevel(this.editObject.pin) === 4 ? 3 * 25 : this.passwordLevel(this.editObject.pin) * 25
      } else {
        this.percentage = this.passwordLevel(this.editObject.pin) * 25
      }
    },
    passwordLevel (I) {
      let H = 0
      for (let a = 0; a < I.length; a++) {
        H |= this.CharMode(I.charCodeAt(a))
      }
      return this.bitTotal(H)
    },
    CharMode (H) {
      if (H >= 48 && H <= 57) { // 数字
        return 1
      }
      if (H >= 65 && H <= 90) { // 大写
        return 2
      }
      if (H >= 97 && H <= 122) { // 小写
        return 4
      } else {
        return 8
      }
    },
    bitTotal (H) {
      let I = 0
      for (let j = 0; j < 4; j++) {
        if (H & 1) {
          I++
        }
        H >>>= 1
      }
      return I
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
