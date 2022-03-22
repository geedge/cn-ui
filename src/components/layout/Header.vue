<template>
  <div class="cn-header">
    <!--导航面包屑-->
    <div class="header__left">
      <span @click="shrink" class="shrink-button" :class="{'shrink-button--collapse': isShrink}"><i class="cn-icon cn-icon-expand"></i></span>
      <el-breadcrumb separator="/" style="padding-left: 20px; padding-top: 6px;">
        <el-breadcrumb-item :title="item" v-for="item in breadcrumb" :key="item" style="display: inline-block; max-width: 300px; height: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {{item}}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <el-select
          size="small"
          v-model="from"
          v-if="showEntityTypeSelector"
          style="padding-left: 25px; width: 140px;"
          class="entity-selector"
      >
        <el-option v-for="(value, key) in entityType" :label="value" :key="key" :value="key">
          <template v-if="value === entityType.ip"><i style="color: #23BF9A;" class="cn-icon cn-icon-ip"></i></template>
          <template v-else-if="value === entityType.domain"><i style="color: #23BF9A;" class="cn-icon cn-icon-domain"></i></template>
          <template v-else-if="value === entityType.app"><i style="color: #23BF9A;" class="cn-icon cn-icon-app2"></i></template>
          {{value}}
        </el-option>
        <template #prefix>
          <i style="color: #23BF9A;" class="cn-icon" :class="`cn-icon-${from}`"></i>
        </template>
      </el-select>
    </div>
    <!--个人操作-->
    <div class="personal">
      <el-dropdown>
        <div class="header-menu--item"><i class="cn-icon cn-icon-language"></i></div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <div id="header-to-english" :style="language === 'en'?'color:#0091ff':''" @click="changeLocal('en')">English</div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div id="header-to-chinese" :style="language === 'cn'?'color:#0091ff':''" @click="changeLocal('cn')">中文</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <div class='login-user header-menu--item'>{{username}}&nbsp;<i class="cn-icon cn-icon-arrow-down"></i></div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <div id="header-to-changepin" @click="showPinDialog">{{$t('overall.changePassword')}}</div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div id="header-to-logout" @click="logout">{{$t('overall.logout')}}</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-dialog v-model="showChangePin"
               width="30%"
               :before-close="handleClose">
      <el-form  :rules="changePassFormRules" :model="changePassForm" ref="changePassForm">
        <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item :label="$t('overall.currentPassword')" prop="oldPwd">
                <el-input v-model="changePassForm.oldPwd" type="password"></el-input>
              </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('overall.newPassword')" prop="newPwd">
              <el-input v-model="changePassForm.newPwd" type="password"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('overall.confirmNewPassword')" prop="newPwd2">
              <el-input v-model="changePassForm.newPwd2" type="password"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePin = false">{{$t('overall.cancel')}}</el-button>
          <el-button type="primary" @click="submit">{{$t('overall.update')}}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { get, put } from '@/utils/http'
import { entityType, storageKey } from '@/utils/constants'

export default {
  name: 'Header',
  data () {
    const passwordComparison = (rule, value, callback) => {
      if (value !== this.changePassForm.newPwd) {
        callback(new Error(this.$t('validate.passwordConsistent')))
      } else {
        callback()
      }
    }
    return {
      username: 'admin', // sessionStorage.getItem('cn-username'),
      language: localStorage.getItem('cn-language') ? localStorage.getItem('cn-language') : 'en',
      showChangePin: false,
      from: '', // entity类型
      changePassForm: {
        oldPwd: '',
        newPwd: '',
        newPwd2: ''
      },
      changePassFormRules: {
        oldPwd: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        newPwd: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        newPwd2: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: passwordComparison, trigger: 'blur' }]
      }
    }
  },
  computed: {
    breadcrumb () {
      const breadcrumbMap = []
      this.$store.getters.menuList.forEach(menu => {
        if (this.$_.isEmpty(menu.children) && menu.route) {
          breadcrumbMap.push({ name: this.$t(menu.i18n), path: menu.route })
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            breadcrumbMap.push({ name: child.i18n ? this.$t(child.i18n) : child.name, parentName: menu.i18n ? this.$t(menu.i18n) : menu.name, path: child.route })
          })
        }
      })
      const breadcrumb = breadcrumbMap.find(b => this.path === b.path)
      return breadcrumb ? [breadcrumb.parentName, breadcrumb.name] : []
    },
    path () {
      const { path } = useRoute()
      return path
    },
    showEntityTypeSelector () {
      return this.$store.getters.getShowEntityTypeSelector
    },
    isShrink () {
      return this.$store.getters.getIsShrink
    },
    storeFrom () {
      return this.$store.getters.from
    }
  },
  watch: {
    from (n) {
      this.$store.commit('entityTypeChange', n)
    },
    storeFrom (n) {
      if (this.from !== n) {
        this.from = n
      }
    }
  },
  mounted () {
    this.from = Object.keys(this.entityType)[0]
  },
  setup () {
    return {
      entityType // 所有entity类型，用于header下拉框选择
    }
  },
  methods: {
    handleClose () {
      this.showChangePin = false
    },
    changeLocal (lang) {
      if (lang !== localStorage.getItem('cn-language')) {
        localStorage.setItem('cn-language', lang)
        window.location.reload()
      }
    },
    showPinDialog () {
      this.showChangePin = true
    },
    logout () {
      localStorage.removeItem(storageKey.token)
      get('/logout')
    },
    refreshLang () {
      this.language = localStorage.getItem('cn-language')
      this.$i18n.locale = this.language
      this.$nextTick(() => {
        window.location.reload()
      })
    },
    shrink () {
      this.$store.commit('isShrink', !this.isShrink)
    },
    submit () {
      this.$refs.changePassForm.validate((valid) => {
        if (valid) {
          put('sys/user/pin', { oldPin: this.changePassForm.oldPwd, newPin: this.changePassForm.newPwd }).then(res => {
            if (res.code === 200) {
              this.$message.success('Success')
              this.showChangePin = false
            } else if (res.code === 518005) {
              this.$message.error('密码错误')
            }
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
