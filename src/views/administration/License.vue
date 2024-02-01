<template>
  <div class="license" :class="from">
    <div class="license-form">
      <el-form ref="licenseForm" :model="licenseObject"  label-position="left" label-width="134px" size="small">
        <el-form-item  :label="`${$t('license.type')}：`" prop="type">
          {{licenseObject.type}}
        </el-form-item>
        <el-form-item :label="`${$t('license.organization')}：`" prop="organization">
          <div class="">{{licenseObject.organization}}</div>
        </el-form-item>
        <el-form-item :label="`${$t('license.supportId')}：`" prop="supportId">
          <div class="">{{licenseObject.supportId}}</div>
        </el-form-item>
        <el-form-item :label="`${$t('license.dateIssued')}：`" prop="dateIssued">
          <div class="">{{licenseObject.dateIssued}}</div>
        </el-form-item>
        <el-form-item :label="`${$t('license.dateExpires')}：`" prop="dateExpires">
          <div class="">{{licenseObject.dateExpires}}</div>
        </el-form-item>
        <el-form-item :label="`${$t('license.licenseFile')}：`" prop="licenseFile">
          <div class="license-file">
            <button style="position: relative;" class="license__btn margin-r-20" @click.prevent="downloadFile">
              <i class="cn-icon-download1 cn-icon margin-r-6"></i><span>{{$t('license.download')}}</span>
            </button>
            <el-upload :action="`${baseUrl}${apiVersion}/sys/license/upload`"
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
              <button style="position: relative;" class="license__btn" @click.prevent="">
                <i class="cn-icon-upload1 cn-icon margin-r-6"></i><span>{{$t('license.upload')}}</span>
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
import { storageKey} from '@/utils/constants'
import axios from 'axios'
import { ref } from 'vue'

export default {
  name: 'License',
  data () {
    return {
      url: api.license,
      downloadC2vUrl: api.downloadLicenseC2v,
      licenseObject: { // 对象
        type: 'Evaluation',
        organization: 'Geedge Networks',
        supportId: 'GN-4896037090286046',
        dateIssued: '2023-12-13 18:52:33 (UTC+08:00)',
        dateExpires: '2024-11-24 07:59:59 (UTC+08:00)',
        licenseFile: null
      }
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      axios.get(this.url, { pageSize: -1 }).then(response => {
        if (response.status === 200) {
          //this.licenseObject = response.data.data
        }
      })
    },
    fileChange (file, fileList) {
      if(file.status !== 'ready') return
      if (!_.endsWith(file.name, '.xml')) {
        this.fileList = []
        this.$message.error(this.$t('validate.fileTypeLimit', { types: this.fileTypeLimit }))
      } else {
        this.fileList = fileList.slice(-1)
        this.$refs.licenseUpload.submit()
      }
    },
    uploadSuccess (response) {
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
    downloadFile(){
      axios.get('/sys/license/download', { responseType: 'blob'}).then(res => {
        let fileName = 'CN-GDNT-'+this.licenseObject.supportId.substring(this.licenseObject.supportId.indexOf('-')+1)+'-license-apply.xml'
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject,fileName)
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
  },
}
</script>
