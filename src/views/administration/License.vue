<template>
  <div class="license" :class="from">
    <div class="license-form">
      <el-form ref="licenseForm" :model="licenseObject" label-position="left" label-width="134px" size="small">
        <div class="license__loading"><loading :loading="loading"></loading></div>
        <el-form-item :label="`${$t('license.type')}：`" prop="type">
          {{ licenseObject.type }}
        </el-form-item>
        <el-form-item :label="`${$t('license.organization')}：`" prop="organization">
          <div class="">{{ licenseObject.organization }}</div>
        </el-form-item>
        <el-form-item :label="`${$t('license.supportId')}：`" prop="supportID">
          <div class="">{{ licenseObject.supportID }}</div>
        </el-form-item>
        <el-form-item :label="`${$t('license.dateIssued')}：`" prop="dateIssued">
          <div class="">{{ licenseObject.dateIssued }}</div>
        </el-form-item>
        <el-form-item :label="`${$t('license.dateExpires')}：`" prop="dateExpires">
          <div class="">{{ licenseObject.dateExpires }}</div>
        </el-form-item>
        <el-form-item :label="`${$t('license.licenseFile')}：`">
          <div class="license-file">
            <button class="business-button margin-r-20" @click.prevent="downloadFile">
              <i class="cn-icon-download1 cn-icon margin-r-6"></i><span>{{ $t('license.download') }}</span>
            </button>
            <el-upload :action="`${baseUrl}sys/license/upload`"
                       ref="licenseUpload"
                       id="licenseUpload"
                       :headers="uploadHeaders"
                       :multiple="false"
                       :show-file-list="false"
                       :accept="fileTypeLimit"
                       :file-list="fileList"
                       :auto-upload="false"
                       :on-change="fileChange"
                       :on-success="uploadSuccess"
                       :on-error="uploadError">
              <button class="business-button" @click.prevent="">
                <i class="cn-icon-upload1 cn-icon margin-r-6"></i><span>{{ $t('license.upload') }}</span>
              </button>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { api } from '@/utils/api'
import { storageKey } from '@/utils/constants'
import axios from 'axios'
import { ref } from 'vue'
import { dateFormat } from '@/utils/date-util'
import _ from 'lodash'
import Loading from '@/components/common/Loading'

export default {
  name: 'License',
  data () {
    return {
      url: api.license,
      downloadC2vUrl: api.downloadLicenseC2v,
      licenseObject: { // 对象
        type: '',
        organization: '',
        supportID: '',
        dateIssued: '',
        dateExpires: ''
      },
      loading:false
    }
  },
  components: {
    Loading
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      this.loading = true
      axios.get(this.url, { pageSize: -1 }).then(response => {
        if (response.status === 200) {
          this.licenseObject = response.data.data.license
          this.licenseObject.dateExpires = dateFormat(new Date(this.licenseObject.hasp.feature.license.exp_date * 1000))
          this.licenseObject.dateIssued = dateFormat(new Date(this.licenseObject.hasp.production_date * 1000))
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      }).finally(() => {
        this.loading = false
      })
    },

    fileChange (file, fileList) {
      if (file.status !== 'ready') return
      if (!_.endsWith(file.name, '.xml')) {
        this.fileList = []
        this.$message.error(this.$t('validate.fileTypeLimit', { types: this.fileTypeLimit }))
      } else {
        this.fileList = fileList.slice(-1)
        this.$refs.licenseUpload.submit()
      }
    },
    uploadSuccess (response) {
      this.initData()
      this.$message.success(this.$t('tip.success'))
    },
    uploadError (error) {
      let errorMsg
      if (error.message) {
        errorMsg = JSON.parse(error.message).message
      } else {
        errorMsg = 'error'
      }
      this.$message.error(this.$t('tip.uploadFailed', { msg: errorMsg }))
    },
    downloadFile () {
      axios.get(this.downloadC2vUrl, { responseType: 'blob' }).then(res => {
        let fileName = ''
        if (res.headers['content-disposition']) {
          fileName = res.headers['content-disposition'].split(';')[1].split('filename=')[1]
        }

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
        reader.onload = function (event) {
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
    }
  },
  setup () {
    return {
      baseUrl: BASE_CONFIG.baseUrl,
      apiVersion: BASE_CONFIG.apiVersion,
      uploadHeaders: {
        'Cn-Authorization': localStorage.getItem(storageKey.token)
      },
      fileTypeLimit: '.xml',
      fileList: ref([])
    }
  }
}
</script>
