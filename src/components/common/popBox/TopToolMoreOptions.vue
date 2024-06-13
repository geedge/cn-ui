<template>
  <el-dropdown :size="size" style="margin-left: 0px;">
    <button id="more" :class="triggerButtonClass" title="more...">
      <i class="cn-icon cn-icon-more-arrow-down" style="font-size: 12px;"></i>
    </button>
    <template #dropdown>
        <el-dropdown-menu >
          <!-- import、export之前的内容 -->
          <slot name="before"></slot>
          <el-dropdown-item v-if="importUrl">
            <div id="chart-import" @click="showImportBox(1)"><i class="cn-icon cn-icon-upload1"></i>{{$t('overall.import')}}</div>
          </el-dropdown-item>
          <el-dropdown-item v-if="exportUrl">
            <div id="chart-export" @click="exportAll"><i class="cn-icon cn-icon-download1"></i>{{$t('overall.export')}}</div>
          </el-dropdown-item>
          <!-- import、export之后的内容 -->
          <slot name="after"></slot>
        </el-dropdown-menu>
    </template>
    <el-dialog :close-on-click-modal="importBox.type!=3" :show-close="true" :title="importBox.title"  v-model="importBox.show" :width="importBox.width" append-to-body custom-class="cn-dialog" @close="closeDialog">
      <div v-if="importBox.type == 1">
        <div class="upload-body">
          <el-upload :id="id+'-json-input-file'"
                     ref="uploadExcel"
                     :auto-upload="false"
                     :file-list="importFileList"
                     :on-change="importChange"
                     accept=".json"
                     action=""
                     class="upload-demo"
                     drag>
            <el-icon><UploadFilled /></el-icon>
            <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
            <template #tip>
              <div class="el-upload__tip" >
                {{$t('overall.importTip')}}
              </div>
            </template>
          </el-upload>
        </div>
        <div slot="footer" class="footer">
          <div class="el-message-box__btns" style="text-align: right;">
            <button :id="id+'-json-import-template'" class="el-button el-button--default el-button--small" @click="downloadTemplate">
              <span>{{$t('overall.template')}}</span>
            </button>
            <button  :id="id+'-json-import-add'" :class="{'cn-btn-disabled':blockOperation.import}" :disabled="blockOperation.import" class="cn-btn el-button el-button--default el-button--small" @click="importJson">
              <span>{{$t('overall.import')}}</span>
            </button>
            <button :id="id+'-json-import-esc'" class="el-button el-button--default el-button--small" @click="closeDialog">
              <span>{{$t('overall.cancel')}}</span>
            </button>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-dropdown>
</template>

<script>
import axios from 'axios'
import { storageKey, EN } from '@/utils/constants'

export default {
  name: 'TopToolMoreOptions',
  props: {
    size: {
      type: String,
      default: 'small'
    },
    exportUrl: { type: String, default: '' },
    params: { type: Object },
    params2: { type: Object },
    exportFileName: { type: String },
    importUrl: { type: String, default: '' }, // 为空时不显示导入按钮
    link: { type: Object }, // 为空时不显示导出按钮
    showCur: { type: Boolean, default: true },
    id: { type: String, default: 'export' },
    triggerButtonClass: { // 触发下拉事件的按钮的class
      type: String,
      default: 'top-tool-btn'
    }
  },
  data () {
    return {
      importBox: { show: false, title: this.$t('overall.import'), type: 1, width: '600px' },
      importFile: null,
      importFileList: [],
      importResult: null,
      exportShow: false,
      paramsType: ''
    }
  },
  mounted () {
    this.getParamsType()
  },
  methods: {
    importChange (file, fileList) {
      if (fileList.length > 0) {
        this.importFileList = [fileList[fileList.length - 1]]
      }
      this.importFile = this.importFileList[0]
    },
    importJson () {
      if (this.importFile && this.importFile.raw) {
        this.blockOperation.import = true
        const form = new FormData()
        form.append('file', this.importFile.raw)
        if (this.paramsType) {
          form.append('type', this.paramsType)
        }
        form.append('language', localStorage.getItem(storageKey.language) ? localStorage.getItem(storageKey.language) : EN)
        axios.post(this.importUrl, form, { 'Content-Type': 'multipart/form-data' }).then(response => {
          if (response.status === 200 && response.data.msg === 'success') {
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.importSuccess') })
          } else {
            this.$message.error(response.msg)
          }
          this.blockOperation.import = false
        })
      } else {
        this.$message.error(this.$t('tip.noImportFile'))
      }
    },
    closeDialog () {
      this.importBox.show = false
      this.importResult = null
      this.importFileList = []
      this.importFile = null
    },
    downloadTemplate () {
      const language = localStorage.getItem(storageKey.language) || EN // 初始未选择默认 en 英文
      const fileName = this.exportFileName + '-' + this.$t('overall.template') + '-' + this.getTimeString() + '.json'

      let url = null
      const param = { language: language }
      if (this.paramsType === 'galaxy') {
        url = '/galaxy/setting/export'
        param.type = 'galaxy'
      }

      if (!url) {
        console.error('no interface support')
      }
      this.export(url, param, fileName)
    },
    exportAll () {
      const params = JSON.parse(JSON.stringify(this.params))
      if (this.params2) {
        Object.keys(this.params2).forEach(key => {
          if (params[key]) {
            if (params[key].prototype.toString.call(val) === '[object Object]') {
              Object.assign(params[key], this.params2[key])
            } else if (params[key].prototype.toString.call(val) === '[object Array]') {
              params[key].concat(this.params2[key])
            }
          } else {
            params[key] = this.params2[key]
          }
        })
      }
      params.pageSize = -1
      params.language = localStorage.getItem(storageKey.language) || EN

      this.export(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + '.json')
      this.closeDialog()
    },
    export (url, params, fileName) {
      if (this.paramsType) {
        params.type = this.paramsType
      }
      axios.get(url, { responseType: 'blob', params: params }).then(res => {
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
    },
    showImportBox (type) {
      this.importBox.show = true
      this.importBox.type = type
      if (type == 1) { // import
        this.importBox.title = this.$t('overall.import')
        this.importBox.width = '600px'
      }
    },
    getTimeString () {
      const split = '-'
      const date = new Date()
      const year = date.getFullYear()
      const month = this.formatNum(date.getMonth() + 1)
      const day = this.formatNum(date.getDate())
      const hours = this.formatNum(date.getHours())
      const minutes = this.formatNum(date.getMinutes())
      const seconds = this.formatNum(date.getSeconds())
      return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds
    },
    formatNum (num) {
      return num > 9 ? num : '0' + num
    },
    getParamsType () {
      const path = this.$route.path
      switch (path) {
        case '/galaxyProxy': this.paramsType = 'galaxy'; break
        default: this.paramsType = ''; break
      }
    }
  },
  watch: {
  }
}
</script>
