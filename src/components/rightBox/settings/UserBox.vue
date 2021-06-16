<template>
  <div v-click-outside="{object: editObject, func: esc}" class="right-box right-box-user">
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
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--username-->
          <el-form-item :label="$t('config.user.username')" prop="username">
            <el-input id="account-input-username" v-model="editObject.username" :disabled="editObject.username==='admin' && editObject.id === 1"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--password-->
          <el-form-item :label="$t('config.user.pin')" prop="pin">
            <el-input id="account-input-password" v-model="editObject.pin"  maxlength="64" placeholder=""
                      show-word-limit size="small" type="password" @blur="pinBlur" autocomplete="new-password"></el-input>
          </el-form-item>
          <!--pinChange-->
          <el-form-item :label="$t('config.user.confirmPin')" label-width="200px" prop="pinChange">
            <el-input id="account-input-pinChange" v-model="editObject.pinChange"  maxlength="64" placeholder=""
                      show-word-limit size="small" type="password"></el-input>
          </el-form-item>
          <!--email-->
          <el-form-item label="E-mail" prop="email">
            <el-input id="account-input-email" v-model="editObject.email" maxlength="64" show-word-limit placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--mobile-->
          <el-form-item :label="$t('config.user.mobile')" prop="mobile">
            <el-input id="account-input-mobile" v-model.number="editObject.mobile" maxlength="64" show-word-limit placeholder="" size="small" type="text"></el-input>
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
          <!--enable-->
          <el-form-item :label="$t('config.user.enable')">
            <el-switch
               id="account-input-status"
               v-model="editObject.status"
               :active-color="theme.themeColor"
               :disabled="(editObject.username === loginName) || (editObject.username==='admin' && editObject.id==1)"
               :active-value="1"
               :inactive-value="0">
            </el-switch>
          </el-form-item>

          <el-form-item v-if="editObject.id" :label="$t('config.user.createTime')">
            <div class="right-box-form-content-txt">{{editObject.createAt}}</div>
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
import rightBoxMixin from '@/mixins/rightBox'
import { onMounted } from "vue";
import { get, post, put } from '@/utils/http'
export default {
  name: 'UserBox',
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
      url: 'sys/user',
      loginName: localStorage.getItem('cn-username'),
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pin: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pinChange: [
          { validator: validatePin, trigger: 'blur' },
          { required: true, message: '', trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ]
      },
      rules2: { // 表单校验规则
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pinChange: [
          { validator: validatePin, trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: this.$t('validate.email') }
        ]
      },
      roleData: []
    }
  },
  setup () {
  },
  mounted() {
    this.getRoleData()
  },
  methods: {
    isCurrentUser (username) {
      return localStorage.getItem('cn-username') === username
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
   getRoleData (){
     get('sys/role?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.roleData = response.data.list
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
        if ( !this.editObject.roleIds && this.editObject.roles ) {
          this.editObject.roleIds = this.editObject.roles[0].id
        }
      }
    }
  }
}
</script>
