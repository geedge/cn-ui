<template>
  <div class="logins">
    <div class="inside">
      <div class="title">
        <img src="../public/images/logo-title.svg" alt=""/>
      </div>
      <el-form class="login__box">
        <el-form-item>
          <el-input class="login--input login__input" v-model="username">
            <template #prefix>
              <i class="cn-icon cn-icon-user2"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
              class="login--input"
              prefix-icon="Lock"
              type="password"
              @keyup.enter="login"
              v-model="pin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :disabled="licenseStatus !== 0"
              v-loading="loading"
              type="primary"
              class="login--input login--button"
              :class="{'login-btn__license-error':licenseStatus !== 0}"
              @click="login"
              @keyup.enter="login"
          >Login
          </el-button>
        </el-form-item>
        <el-form-item v-if="licenseStatus !== 0">
          <div class="license-error-msg">{{ licenseStatusErrMsg }}</div>
          <div class="license-file">
            <button class="license__btn margin-r-20" @click.prevent="downloadFile" @keyup.enter="login">
              <i class="cn-icon-download1 cn-icon margin-r-6"></i><span>Download c2v file</span>
            </button>
            <el-upload :action="`${baseUrl}sys/license/upload`"
                       ref="licenseUpload"
                       id="licenseUpload"
                       :multiple="false"
                       :show-file-list="false"
                       :accept="fileTypeLimit"
                       :file-list="fileList"
                       :auto-upload="false"
                       :on-change="fileChange"
                       :on-success="uploadSuccess"
                       :on-error="uploadError">
              <button class="license__btn" @click.prevent="">
                <i class="cn-icon-upload1 cn-icon margin-r-6"></i><span>Upload license</span>
              </button>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { storageKey, defaultLang } from '@/utils/constants'
import { api } from '@/utils/api'
import dayjs from 'dayjs'
import _ from 'lodash'
import utc from 'dayjs/plugin/utc'
import { ref } from 'vue'

dayjs.extend(utc)

export default {
  name: 'Login',
  data () {
    return {
      loading: false,
      username: '',
      pin: '',
      language: '',
      licenseStatus: 1,
      licenseStatusErrMsg: '',
      downloadC2vUrl: api.downloadLicenseC2v,
      supportID: ''
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
      if (this.licenseStatus !== 0) {
        return
      }
      this.loading = true
      axios.post(api.login, { username: this.username, pin: this.pin }).then(
        res => {
          if (res.status === 200) {
            if (!_.isEmpty(res.data.data.user.lang)) {
              localStorage.setItem(storageKey.language, res.data.data.user.lang)
            }
            if (!localStorage.getItem(storageKey.language)) {
              localStorage.setItem(storageKey.language, this.language)
            }
            if (!_.isEmpty(res.data.data.user.theme)) {
              localStorage.setItem(storageKey.theme, res.data.data.user.theme)
            }
            res.loginSuccessPath = this.$route.query.redirect
            this.loginSuccess(res)
            localStorage.setItem(storageKey.username, this.username)
            localStorage.setItem(storageKey.nickName, res.data.data.user.name)
            // localStorage.setItem(storageKey.userId, res.data.data.user.userId)
            localStorage.setItem(storageKey.userId, res.data.data.user.id)
            localStorage.setItem(storageKey.token, res.data.data.token)
            // const theme =
            this.$i18n.locale = localStorage.getItem(storageKey.language)
          }
        }
      ).catch(e => {
        console.error(e)
        this.loading = false
        this.blockOperation.query = false
        if (_.get(e, 'response.data.code', 0) === 518005) {
          this.$message.error(this.$t('Incorrect username or password'))
        } else {
          this.$message.error(this.errorMsgHandler(e))
        }
      })
    },
    downloadFile () {
      axios.get(this.downloadC2vUrl, { responseType: 'blob' }).then(res => {
        const disposition = res.headers['content-disposition']
        const fileName = decodeURI(disposition.split('filename=')[1])
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = fileName
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function () {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    fileChange (file, fileList) {
      if (file.status !== 'ready') return
      if (!_.endsWith(file.name, '.xml')) {
        this.fileList = []
        this.$message.error('Only support ' + this.fileTypeLimit + ' files')
      } else {
        this.fileList = fileList.slice(-1)
        this.$refs.licenseUpload.submit()
      }
    },
    uploadSuccess () {
      this.$message.success('Success')
      this.licenseStatus = 1
    },
    uploadError (error) {
      let errorMsg
      if (error.message) {
        errorMsg = JSON.parse(error.message).message
      } else {
        errorMsg = 'error'
      }
      this.$message.error('Upload failed: ' + errorMsg)
    },
    checkLicenseStatus () {
      axios.get(api.licenseStatus).then(res => {
        if (res.status === 200) {
          this.licenseStatus = res.data.data.status
        }
      }).catch(e => {
        this.licenseStatusErrMsg = this.errorMsgHandler(e)
      })
    },
    queryAppearance () {
      axios.get(api.appearance).then(res => {
        if (res.status === 200) {
          this.appearanceOut(res.data.data)
        }
      })
    },
    appearanceOut (data) {
      this.language = data.lang || defaultLang
      if (_.isEmpty(localStorage.getItem(storageKey.language))) {
        localStorage.setItem(storageKey.language, data.lang || defaultLang)
      }
      if (_.isEmpty(localStorage.getItem(storageKey.theme))) {
        localStorage.setItem(storageKey.theme, data.theme || 'light')
      }
      localStorage.setItem(storageKey.s3Enable, data.s3_enable)
      localStorage.setItem(storageKey.sysTimezone, data.timezone)
      window.$dayJs.tz.setDefault(data.timezone)
      localStorage.setItem(storageKey.timezoneOffset, window.$dayJs.tz().utcOffset() / 60)
      localStorage.setItem(storageKey.timezoneLocalOffset, dayjs().utcOffset() / 60)
      localStorage.setItem(storageKey.dateFormat, data.date_format)
      localStorage.setItem(storageKey.sysName, data.system_name)
      localStorage.setItem(storageKey.sysLogo, data.system_logo)
      localStorage.setItem(storageKey.mapConfig, data.map_config)
    }
  },
  async mounted () {
    this.queryAppearance()
    this.checkLicenseStatus()
  },
  setup () {
    const { currentRoute } = useRouter()
    return {
      loginSuccessPath: currentRoute.value.query.redirect,
      baseUrl: BASE_CONFIG.baseUrl,
      fileTypeLimit: '.xml',
      fileList: ref([])
    }
  }
}
</script>

<style>
.logins {
  background-image: url('../public/images/bg.png');
}
</style>
