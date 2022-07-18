<template>
  <div class="cn-header">
    <div class="cn-header__banner">
      <div class="banner__left">
        <span @click="shrink" class="shrink-button" :class="{'shrink-button--collapse': showMenu}"><i class="cn-icon cn-icon-navigation"></i></span>
        <img alt="loading..." height="26" :src="logo?logo:require('../../assets/img/logo-header.svg')"/>
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
    </div>
    <div class="cn-header__nav">
      <i class="cn-icon cn-icon-a-NetworkAnalytics"></i>
      <el-breadcrumb class="header__left-breadcrumb" separator=">">
        <el-breadcrumb-item class="header__left-breadcrumb-item" :title="item" v-for="item in breadcrumb" :key="item">
          {{item}}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 菜单 -->
    <el-drawer
        v-model="showMenu"
        direction="ttb"
        custom-class="cn-menu"
        modal-class="cn-menu-modal"
        :with-header="false"
        :show-close="false"
    >
      <div class="cn-menu__left">
        <div class="left-menu" v-for="menu in otherMenu" :key="menu.id">
          <i :class="menu.icon"></i>
          <span>{{$t(menu.i18n || menu.name)}}</span>
          <i class="cn-icon cn-icon-right"></i>
        </div>
      </div>
      <div class="cn-menu__middle">
        <div class="middle-menus middle-menus--network-analytics">
          <div class="middle-menus__header">{{$t('overall.networkAnalytics')}}</div>
          <div class="middle-menus__body">
            <template v-for="(menu, index) in networkAnalyticsMenu.children" :key="index">
              <div class="middle-menu" v-if="index < 5" @click="jump(menu.route)">{{$t(menu.i18n || menu.name)}}</div>
            </template>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 改密码 -->
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
import { api } from '@/utils/api'

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
      username: localStorage.getItem(storageKey.username),
      language: localStorage.getItem(storageKey.language) ? localStorage.getItem(storageKey.language) : 'en',
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
      },
      showMenu: false
    }
  },
  computed: {
    networkAnalyticsMenu () {
      return this.$store.getters.menuList.find(menu => menu.code === 'networkAnalytics')
    },
    otherMenu () {
      return this.$store.getters.menuList.filter(menu => menu.code !== 'networkAnalytics')

      /* function excludeButton (menu) {
        for (let i = 0; i < menu.length; i++) {
          if (menu[i].type === 2) {
            menu.splice(i, 1)
            i--
          } else {
            if (menu[i].children && menu[i].children.length > 0) {
              excludeButton(menu[i].children)
            }
          }
        }
      } */
    },
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
    storeFrom () {
      return this.$store.getters.from
    },
    route () {
      return this.$route.path
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
      if (lang !== localStorage.getItem(storageKey.language)) {
        localStorage.setItem(storageKey.language, lang)
        window.location.reload()
      }
    },
    showPinDialog () {
      this.showChangePin = true
    },
    logout () {
      sessionStorage.removeItem(storageKey.tokenExpireCurrentPath)
      localStorage.removeItem(storageKey.token)
      get(api.logout)
    },
    refreshLang () {
      this.language = localStorage.getItem(storageKey.language)
      this.$i18n.locale = this.language
      this.$nextTick(() => {
        window.location.reload()
      })
    },
    shrink () {
      this.showMenu = !this.showMenu
    },
    submit () {
      this.$refs.changePassForm.validate((valid) => {
        if (valid) {
          put(api.pin, { oldPin: this.changePassForm.oldPwd, newPin: this.changePassForm.newPwd }).then(res => {
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
    },
    jump (route) {
      if (route === this.route) {
        this.refresh()
        return
      }
      this.$router.push({
        path: route,
        query: {
          t: +new Date()
        }
      })
      this.showMenu = false
    },
    refresh () {
      this.$emit('refresh')
    }
  }
}
</script>
