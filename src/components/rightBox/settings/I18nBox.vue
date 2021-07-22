<template>
  <div v-click-outside="{object: editObject, func: esc}" class="right-box right-box-user">
    <div class="right-box__header">
      <div class="header__title">{{editObject.id ? $t('edit I18n') : $t('create I18n')}}</div>
      <div class="header__operation">
        <span v-cancel="{object: editObject, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="i18nForm" :model="editObject" :rules="editObject.id ? rules2 : rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('name')" prop="name">
            <el-input id="account-input-name" v-model="editObject.name" :disabled="editObject.name==='admin' && editObject.id === 1"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--code-->
          <el-form-item :label="$t('code')" prop="code">
            <el-input id="account-input-code" v-model="editObject.code" :disabled="editObject.code==='admin' && editObject.id === 1"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--lang-->
          <el-form-item :label="$t('lang')" prop="lang">
            <el-select placeholder=""  v-model="editObject.lang" style="width:640px;">
              <el-option
                  v-for="item in  options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                 >
              </el-option>
            </el-select>
<!--            <el-input id="account-input-password" v-model="editObject.lang"  maxlength="64" placeholder=""
                      show-word-limit size="small"  @blur="pinBlur" autocomplete="new-password"></el-input>-->
          </el-form-item>
          <!--value-->
          <el-form-item :label="$t('value')" label-width="200px" prop="value">
            <el-input id="account-input-value" v-model="editObject.value"  maxlength="64" placeholder=""
                      show-word-limit size="small"></el-input>
          </el-form-item>
          <!--enable-->
<!--          <el-form-item :label="$t('config.user.enable')">
            <el-switch
                id="account-input-status"
                v-model="editObject.status"
                :active-color="theme.themeColor"
                :disabled="(editObject.username === loginName) || (editObject.username==='admin' && editObject.id==1)"
                :active-value="1"
                :inactive-value="0">
            </el-switch>
          </el-form-item>-->
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
import rightBoxMixin from '@/mixins/rightBox'
import { get, post, put } from '@/utils/http'
export default {
  name: 'I18nBox',
  mixins: [rightBoxMixin],
  data () {
    const validatePin = (rule, value, callback) => { // 确认密码的二次校验
      if (value === '' && this.editObject.pin) {
        callback(new Error(this.$t('config.user.inputConfirmPin')))
      } else if (value !== this.editObject.pin) {
        callback(new Error(this.$t('config.user.confirmPinErr')))
      } else {
        callback()
      }
    }
    return {
      options: [{
        value: 'en',
        label: 'en'
      }, {
        value: 'cn',
        label: 'cn'
      }],
      url: 'sys/i18n',
      loginName: localStorage.getItem('cn-username'),
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        code: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        value: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      rules2: { // 表单校验规则
        code: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        value: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      roleData: []
    }
  },
  setup () {
  },
  mounted () {
    this.getRoleData()
  },
  methods: {
    isCurrentUser (username) {
      return localStorage.getItem('cn-username') === username
    },
    /* 密码失去焦点 检验确认密码 */
    pinBlur () {
      if (this.editObject.pin && this.editObject.pinChange) {
        this.$refs.i18nForm.validateField('pinChange')
      }
    },
    save () {
      if (this.blockOperation.save) { return }
      this.blockOperation.save = true

      this.$refs.i18nForm.validate((valid) => {
        if (valid) {
          if (this.editObject.id) {
            put(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            post(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
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
      get('sys/i18n?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.roleData = response.data.list
        }
      })
    }
  }
}
</script>
