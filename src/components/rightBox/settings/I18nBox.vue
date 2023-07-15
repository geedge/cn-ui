<template>
  <div class="right-box right-box-user">
    <div class="right-box__header">
      <div class="header__title">{{editObject.id ? $t('config.i18n.edit') : $t('config.i18n.add')}}</div>
      <div class="header__operation">
        <span v-cancel="{object: editObject, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="i18nForm" :model="editObject" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input id="account-input-name" v-model="editObject.name" :disabled="editObject.name==='admin' && editObject.id === 1"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--code-->
          <el-form-item :label="$t('config.i18n.code')" prop="code">
            <el-input id="account-input-code" v-model="editObject.code" :disabled="editObject.code==='admin' && editObject.id === 1"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--lang-->
          <el-form-item :label="$t('config.i18n.lang')" prop="lang">
            <el-select id="account-input-roleIds"
                       v-model="editObject.lang"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small"
                       @change="()=>{ this.$forceUpdate() }">
              <template v-for="role in langData" :key="role.value">
                <el-option :label="role.value" :value="role.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!--value-->
          <el-form-item :label="$t('config.i18n.value')" label-width="200px" prop="value">
            <el-input id="account-input-value" v-model="editObject.value"  maxlength="64" placeholder=""
                      show-word-limit size="small"></el-input>
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
import { get, post, put } from '@/utils/http'
import { storageKey } from '@/utils/constants'
import { api } from '@/utils/api'

export default {
  name: 'I18nBox',
  mixins: [rightBoxMixin],
  data () {
    return {
      url: api.i18nSys,
      loginName: localStorage.getItem(storageKey.username),
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        code: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        lang: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        value: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      langData: []
    }
  },
  setup () {
  },
  mounted () {
    this.getLangData()
  },
  methods: {
    isCurrentUser (username) {
      return localStorage.getItem(storageKey.username) === username
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
                this.$message.error(res.msg || res.message)
              }
            })
          } else {
            post(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg || res.message)
              }
            })
          }
        } else {
          this.blockOperation.save = false
          return false
        }
      })
    },
    getLangData () {
      get(api.dict, { type: 'lang', pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.langData = response.data.list
        }
      })
    }
  }
}
</script>
