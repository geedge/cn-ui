<template>
  <div class="logins">
    <div class="inside">
      <div class="title">
        <img src="../public/images/cion.png" />
      </div>
      <el-form class="login__box">
        <el-form-item>
          <el-input
              prefix-icon="el-icon-user"
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
            if (!_.isEmpty(res.data.s3_upload)) {
              localStorage.setItem(storageKey.s3Enable, res.data.s3_upload)
            }
            res.loginSuccessPath = this.$route.query.redirect
            this.loginSuccess(res)
            localStorage.setItem(storageKey.username, this.username)
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

<style>
 .logins{
  background-color: #000C18;
  background-size: auto;
  background-repeat: round;
  background-image: url('../public/images/bg.png');
  display: flex;
   height: 100%;
  justify-content: center;
  align-items: center;
   margin: auto;
}

.inside {
  opacity: 0.78;
  background: #051a37;
  border-radius: 6px;
  width: 368px;
  height: 400px;
  /* margin-top:340px; */
}
.inside > div {
  display: block;
}

.title {
  margin-top: 70px;
  text-align: center;

}
.title > img {
  height: 43px;
  width: 248px;
}
.login--input{
  width: 300px;
  height: 40px;
}
 .login__input:first-of-type{
   margin-top: 45.57px;
 }
 .login__box{
   width: 300px;
   height: 250px;
   margin: auto;
 }
.login--button {
  background: #0091ff;
  color: #fff;
  border-radius: 4px;
  border: 0;
  font-weight: 400;
  text-align: center;
}
</style>
