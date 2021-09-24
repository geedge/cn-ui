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
          <template v-else-if="value === entityType.app"><i style="color: #23BF9A;" class="cn-icon cn-icon-app"></i></template>
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
      breadcrumbMap: [
        {
          path: '/panel/trafficSummary',
          parentName: this.$t('overall.dashboard'),
          name: this.$t('trafficSummary.trafficSummary')
        },
        {
          path: '/panel/networkAppPerformance',
          parentName: this.$t('overall.dashboard'),
          name: this.$t('networkAppPerformance.networkAppPerformance')
        }, {
          path: '/panel/dnsServiceInsights',
          parentName: this.$t('overall.dashboard'),
          name: this.$t('dnsServiceInsights')
        }, {
          path: '/entityExplorer',
          parentName: this.$t('overall.entities'),
          name: this.$t('overall.entityExplorer'),
          childName: ''
        }, {
          path: '/user',
          parentName: this.$t('overall.setting'),
          name: this.$t('overall.user')
        }, {
          path: '/role',
          parentName: this.$t('overall.setting'),
          name: this.$t('overall.role')
        }, {
          path: '/operationLog',
          parentName: this.$t('overall.setting'),
          name: this.$t('overall.operationLog')
        }, {
          path: '/i18n',
          parentName: this.$t('overall.setting'),
          name: 'I18N'
        }
      ],
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
      const breadcrumb = this.breadcrumbMap.find(b => this.path === b.path)
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
      sessionStorage.removeItem(storageKey.token)
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

<style lang="scss">
.cn-header {
  display: flex;
  height: 50px;

  .header__left {
    display: flex;
    align-items: center;
    flex-grow: 1;

    .shrink-button {
      margin-left: 20px;
      color: #A4ADB5;
      cursor: pointer;
      transition: all linear .4s;

      &.shrink-button--collapse {
        transform: rotateY(180deg);
      }
    }
  }
  .header-menu {
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;

    .el-dropdown {
      width: 60px;
      text-align: center;
      height: 36px;
      line-height: 50px;
      .el-dialog{
        width: 1000px;
        height: 70px;
        .el-dialog__header{
          .el-dialog__title{
            color: #fff;
          }
          .el-dialog__close{
            color: #fff;
            line-height: 50px;
            font-size: 30px;
          }
        }
      }
    }
  }
  .header-menu--item {
    color: #778391;
    cursor: pointer;
    transition: color linear .2s;
    i {
      font-size: 18px;
    }
  }
  .header-menu--item:hover {
    color: #313336;
  }
  .personal {
    display: flex;
    .el-dropdown {
      margin: 0 10px 0 30px;
      height: 36px;
      line-height: 50px;
      text-align: center;
    }
    .login-user {
      color: #333;
      i {
        color: #999;
        font-size: 12px;
      }
    }
  }
  .left-menu--pin {
    width: 20px;
    font-size: 20px;
    font-weight: 100;
    color: #999999;
    transition: all .4s;
    height: 100%;
    line-height: 50px;
    margin-left: 10px;
    i {
      transform: rotateY(0);
      transition: transform .4s;
    }
    i.icon-reverse {
      transform: rotateY(180deg);
    }
  }
  .left-menu--pin-normal{
  }
  .left-menu--pin-reverse{
  }
}
.link-title a {
  color: inherit;
  text-decoration: none;
}
.cn-breakcrumb {
  padding-left: 15px;
  line-height: 50px;

  .el-breadcrumb__item .el-breadcrumb__inner {
    color: #999;
  }
}
.entity-selector {
  .el-input__prefix {
    left: 7px !important;
  }
}
</style>
