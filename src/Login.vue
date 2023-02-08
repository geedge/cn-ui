<template>
  <div class="logins">
    <div class="inside">
      <div class="title">域名解析服务监测系统</div>
      <el-form class="login__box">
        <el-form-item>
          <el-input
              prefix-icon="cn-icon cn-icon-user2"
              class="login--input login__input"
            v-model="username"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
              class="login--input"
              prefix-icon="el-icon-lock"
              type="password"
              @keyup.enter="login"
            v-model="pin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              v-loading="loading"
              type="primary"
              class="login--input login--button"
              @click="login"
              @keyup.enter="login"
              style="font-size: 16px;"
            >Login</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { post, get } from '@/utils/http'
import { useRouter } from 'vue-router'
import { storageKey } from '@/utils/constants'
import { api } from '@/utils/api'
import dayjs from 'dayjs'
import _ from 'lodash'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export default {
  name: 'Login',
  data () {
    return {
      loading: false,
      username: '',
      pin: ''
    }
  },
  methods: {
    ...mapActions(['loginSuccess']),
    login () {
      if (!this.username || !this.pin) {
        return
      }
      if (!this.blockOperation.query) {
        this.blockOperation.query = true
      } else {
        return
      }
      this.loading = true
      post(api.login, { username: this.username, pin: this.pin }).then(
        res => {
          if (res.code === 200) {
            if (!_.isEmpty(res.data.lang)) {
              localStorage.setItem(storageKey.language, res.data.lang)
            }
            if (!_.isEmpty(res.data.theme)) {
              localStorage.setItem(storageKey.theme, res.data.theme)
            }
            res.loginSuccessPath = this.$route.query.redirect
            this.loginSuccess(res)
            localStorage.setItem(storageKey.username, this.username)
            localStorage.setItem(storageKey.userId, res.data.userId)
            localStorage.setItem(storageKey.token, res.data.token)
          } else if (res.code === 518005) {
            this.$message.error(this.$t('Incorrect username or password'))
            this.loading = false
            this.blockOperation.query = false
          } else {
            this.$message.error('Unknown error')
            this.loading = false
            this.blockOperation.query = false
          }
        }
      ).catch(e => {
        console.error(e)
        this.loading = false
        this.blockOperation.query = false
        this.$message.error(this.$t('tip.unknownError'))
      })
    },
    queryAppearance () {
      get(api.appearance).then(res => {
        if (res.code === 200) {
          this.appearanceOut(res.data)
        }
      })
    },
    appearanceOut (data) {
      if (_.isEmpty(localStorage.getItem(storageKey.language))) {
        localStorage.setItem(storageKey.language, data.lang || 'zh')
      }
      if (_.isEmpty(localStorage.getItem(storageKey.theme))) {
        localStorage.setItem(storageKey.theme, data.theme || 'light')
      }
      localStorage.setItem(storageKey.s3Enable, data.s3_enable)
      localStorage.setItem(storageKey.sysTimezone, data.timezone)
      window.$dayJs.tz.setDefault(data.timezone)
      localStorage.setItem(storageKey.timezoneOffset, window.$dayJs.tz().utcOffset() / 60)
      localStorage.setItem(storageKey.timezoneLocalOffset, dayjs().utcOffset() / 60)
      localStorage.setItem(storageKey.dateFormat, data.dateFormat)
      localStorage.setItem(storageKey.sysName, data.system_name)
      localStorage.setItem(storageKey.sysLogo, data.system_logo)
    }
  },
  mounted () {
    this.queryAppearance()
  },
  setup (props) {
    const { currentRoute } = useRouter()
    return {
      loginSuccessPath: currentRoute.value.query.redirect
    }
  }
}
</script>

<style scoped>
.logins {
  background-color: #000C18;
  background-size: auto;
  background-repeat: round;
  background-image: url('../public/images/bg.png');
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}

>>>.el-input__inner {
  background-color: #0B325C !important;
  border: none;
  border-radius: 0px;
  border-bottom: 1px solid #295688;
  font-size: 14px;
  line-height: 14px;
}
>>>.el-input__inner:hover {
  border-color: #295688;
}
>>>.el-input__inner:focus {
  border-color: #295688;
}
.el-button--primary:hover, .el-button--primary:focus, .el-button--primary:active {
  background: #21B4ED;
  border-color: #21B4ED;
  color: #FFFFFF;
}
>>>.el-loading-mask {
  background-color: transparent;
}
>>>input {
  -webkit-text-fill-color: rgba(231,234,237, .8) !important;
  transition: background-color 500000000000000000s ease-in-out 0s !important;
  caret-color: #fff ;
}
.inside {
  width: 414px;
  height: 524px;
  background: #0B325C;
  border: 1px solid rgba(103,179,245,0.65);
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.38);
  border-radius: 4px;
}
.inside {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.inside > div {
  display: block;
}

.title {
  margin-top: 90px;
  padding: 0 70px;
  color: white;
  font-size: 40px;
  text-align: center;
}
.login__box {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
>>>.el-form-item {
  width: 334px;
  margin-bottom: 25px;
}
>>>.el-input__prefix {
  color: #6DBBFF;
}
>>>.el-input__prefix i {
  width: 17px;
  font-size: 17px;
}
.login__box .el-form-item:nth-of-type(3) {
  margin-top: 25px;
  margin-bottom: 65px;
}
.login--button {
  background: #21B4ED;
  border-radius: 4px;
  border: 0;
  font-weight: 400;
  font-size: 16px;
  color: #FFFFFF;
  line-height: 22px;
  width: 334px;
  height: 52px;
}
</style>
