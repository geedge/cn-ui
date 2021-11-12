<template>
  <el-dialog
      v-model="show"
      :top="top"
      :modal="modal"
      :custom-class="customClass"
      :show-close="showClose"
      :width="width"
      @close="closeDebug"
      @open="openDebug"
      destroy-on-close
  >

    <div class="wrapper">
        <el-select v-model="name" filterable placeholder="Select" class="item item-1" allow-create
                   @change="changPath">
          <template v-for="(proxy,index) in galaxyProxyData" :key="proxy.id">
            <el-option :label="proxy.name" :value="index"></el-option>
          </template>
        </el-select>
      <div class="item item-2 sub-grid-send">
        <el-select v-model="method" filterable placeholder="Select" style="width:100px;" >
          <el-option
              v-for="item in methodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <el-input v-model="path" placeholder="Please input" />
        <el-button @click="send">{{$t('galaxyProxy.debug.send')}}</el-button>
      </div>

      <div class="item item-3 sub-grid-params">
        <div class="sub-grid-params-add">
            <span style="padding-left: 15px;">{{$t('galaxyProxy.debug.requestParams')}}</span>
            <el-button size="mini" @click="handleAddDetails"><i class="cn-icon-add cn-icon"></i></el-button>
        </div>

        <el-table :data="paramsTableData" style="width: 100%;"
                  @selection-change="handleDetailSelectionChange"
                  ref="tb">
          <el-table-column  type="selection" align="center" label="" width="50px" style="border-left:0px;" />

          <el-table-column prop="key"  label="Key" align="center" width="100px" >
            <template #default="scope">
              <el-input   @change=""  v-model="scope.row.key"></el-input>
            </template>
          </el-table-column>

          <el-table-column prop="value"  label="Value" align="center" style="border-right:0px;">
            <template #default="scope">
              <el-input  @change=""  v-model="scope.row.value"></el-input>
            </template>
          </el-table-column>

        </el-table>

      </div>
      <div class="item item-4">
        <div class="request-header" >{{$t('galaxyProxy.debug.request.header')}}</div>
        <div class="request-header-content" ><pre v-html="proxyRequestHeader"  style="height: 98%;width: 98%;margin-left: -15px;margin-top: -10px;"></pre></div>
        <div class="response-header">{{$t('galaxyProxy.debug.response.header')}}</div>
        <div class="response-body">{{$t('galaxyProxy.debug.response.body')}}</div>
        <div class="response-header-content"><pre v-html="proxyResponseHeader"  style="height: 98%;width: 98%;margin-left: -15px;margin-top: -10px;"></pre></div>
        <div class="response-body-content color-pre__style">
            <pre v-html="proxyResponseBody"  style="height: 95%;width: 95%;"></pre>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { ref, defineComponent } from 'vue'
import { api } from '@/utils/api'
import { get, getForDebug, postForDebug } from '@/utils/http'
import axios from 'axios'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-chrome'

export default {
  name: 'GalaxyProxyDebug',
  props: {
    showDebug: Boolean,
    top: {
      type: String,
      default: '5vh'
    },
    modal: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: String,
      default: 'proxy-debug__dialog'
    },
    showClose: {
      type: Boolean,
      default: true
    },
    width: { // 高度需要通过customClass自行定义
      type: [String, Number],
      default: '90vw'
    },
    curGalaxyProxy: Object // 实体，{ name: '', path: '', icon: icon-class }
  },
  components: {
    VAceEditor
  },
  data () {
    return {
      show: false,
      galaxyProxyData: [],
      name: '',
      paramsTableData: [
        {
          key: 'q',
          value: 'ip'
        },
        {
          key: 'addr',
          value: '192'
        }
      ],
      // 选中的数据
      checkedDetail: {},
      methodOptions: [
        {
          value: 'GET',
          label: 'GET'
        },
        {
          value: 'POST',
          label: 'POST'
        }
      ],
      method: 'GET',
      path: '',
      proxyResponseBody: '',
      proxyRequestHeader: '',
      proxyResponseHeader: ''
    }
  },
  setup () {
  },
  methods: {

    handleAddDetails () {
      if (this.paramsTableData == undefined) {
        this.paramsTableData = new Array()
      }
      const obj = {}
      obj.key = ''
      obj.value = ''

      this.paramsTableData.push(obj)
    },

    // 单选框选中数据
    handleDetailSelectionChange (selection) {
      this.checkedDetail = {}
      selection.forEach(t => {
        this.checkedDetail[t.key] = t.value
      })
    },

    async getGalaxyProxyData (value) {
      await get(api.galaxyProxy + '?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.galaxyProxyData = response.data.list
        }
      })
    },

    changPath (index) {
      // 修改input的值
      this.path = this.galaxyProxyData[index].path
      this.method = this.galaxyProxyData[index].method.toUpperCase()
    },

    send () {
      // this.path = "galaxy/setting?pageNo=1&pageSize=1"
      const finalUrl = axios.defaults.baseURL + 'interface' + this.path
      // 注意有GET与POST两种方式
      if (this.method.toUpperCase() == 'GET') {
        getForDebug(finalUrl, this.checkedDetail).then(response => {
          this.proxyResponseBody = this.syntaxHighlight(JSON.parse(JSON.stringify(response.data)))
          this.proxyResponseHeader = this.syntaxHighlight(JSON.parse(JSON.stringify(response.headers)))
          this.proxyRequestHeader = this.syntaxHighlight(JSON.parse(JSON.stringify(response.config.headers)))
          this.proxyResponseHeader = this.proxyResponseHeader.replace(/{/g, '').replace(/}/g, '').replace(/"/g, '')
          this.proxyRequestHeader = this.proxyRequestHeader.replace(/{/g, '').replace(/}/g, '').replace(/"/g, '')
        })
      } else if (this.method.toUpperCase() == 'POST') {
        postForDebug(finalUrl, this.checkedDetail).then(response => {
          if (response) {
            this.proxyResponseBody = this.syntaxHighlight(JSON.parse(JSON.stringify(response.data)))
            this.proxyResponseHeader = this.syntaxHighlight(JSON.parse(JSON.stringify(response.headers)))
            this.proxyRequestHeader = this.syntaxHighlight(JSON.parse(JSON.stringify(response.config.headers)))

            this.proxyResponseHeader = this.proxyResponseHeader.replace(/{/g, '').replace(/}/g, '').replace(/"/g, '')
            this.proxyRequestHeader = this.proxyRequestHeader.replace(/{/g, '').replace(/}/g, '').replace(/"/g, '')
          }
        })
      }
    },

    // 格式化json
    syntaxHighlight (json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2)
      }
      json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'number'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key'
          } else {
            cls = 'string'
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean'
        } else if (/null/.test(match)) {
          cls = 'null'
        }
        return '<span class="' + cls + '">' + match + '</span>'
      })
    },

    closeDebug () {
      const paramsTableData = []
      const q = {}
      q.key = 'q'
      q.value = 'ip'
      const addr = {}
      addr.key = 'addr'
      addr.value = '192'

      paramsTableData.push(q)
      paramsTableData.push(addr)

      this.paramsTableData = JSON.parse(JSON.stringify(paramsTableData))
      this.proxyResponseBody = ''
      this.proxyResponseHeader = ''
      this.proxyRequestHeader = ''
      this.name = ''
      this.path = ''
      for (const key in this.curGalaxyProxy) {
        delete this.curGalaxyProxy[key]
      }
    },
    openDebug () {
      if (this.curGalaxyProxy.path) {
        this.name = this.curGalaxyProxy.name
        this.path = this.curGalaxyProxy.path
        this.method = this.curGalaxyProxy.method.toUpperCase()
      } else {
        this.name = ''
        this.path = ''
        this.method = 'GET'
      }
    }
  },
  mounted () {
    // 获取代理名称及路径
    this.getGalaxyProxyData()
  },
  watch: {
    showDebug (n, o) {
      this.show = n
    },
    show (n, o) {
      this.$emit('update:show-debug', n)
    }
  }
}
</script>

<style lang="scss">

  .proxy-debug__dialog {
    height: 90vh;
    overflow: hidden;
    .el-dialog__header {
      display: none;
    }
    .el-dialog__body {
      height: 100%;
      padding: 0;
    }
  }
  .my-editor {
    margin-top: 4px;
    border: 1px solid $--right-box-border-color;

    .prism-editor__textarea {
      outline: none;
    }
  }
  .wrapper{
      width: 100%;
      height:100%;
      background: #fff;
      text-align: center;
      display: grid;
      grid-template-columns: 25% auto;
      grid-template-rows: 60px auto;
      grid-row-gap: 20px;
      grid-column-gap: 20px;
      padding:25px;

      .item{
        text-align: center;
        border:1px solid #bbbbbb;
        font-size: 4em;
        text-align: center;

        color: #000C18;
        line-height: 60px;
        font-size: 16px;
        text-align: left;
      }

      .item-1 {
        border:0px;
      }

      .item-2 {
        background-color: #ffffff;
        border:0px;
        .el-input__inner {
          border-radius: 0px;
          border-left: 0px;
          border-right:0px;
          border-top: 1px solid #bbbbbb;
          border-bottom: 1px solid #bbbbbb;
          color: #606266;
          height: 60px;
          line-height: 60px;
          padding: 0 15px;
        }
      }

      .sub-grid-send{
        width: 100%;
        height:100%;
        background: #fff;
        text-align: center;
        display: grid;
        grid-template-columns: 100px auto 80px;
        grid-template-rows: 60px;
        grid-row-gap: 0px;
        grid-column-gap: 0px;
        padding:0px;
      }

      .item-3 {
        background-color: #ffffff;

        .el-input__inner{
          border: 0px;
        }
        .el-input__inner:hover {
          border: 0px;
        }
        .el-input__inner:focus {
          border: 1px solid #bbbbbb;
        }

        .el-table__header, .el-table__body{
          witdh:100% !important;
        }

        .el-table__header-wrapper{
          height: 60px;
        }

        .el-table th.is-leaf, .el-table td {
          border-top: 1px solid #bbbbbb;
          border-left: 1px solid #bbbbbb;
          border-right: 0px;
          padding-top: 3px;
          padding-bottom: 3px;
        }

        .el-table{
          border-bottom: 1px solid #bbbbbb;
          border-right: 1px solid #bbbbbb;
        }

        .el-table .cell {
          line-height: 23px;
          padding-left: 3px;
          padding-right: 3px;
          text-align: center;
        }

        .el-table__body tr:hover >td {
          background-color: #ffffff;
        }

        .el-table__body tr:focus >td {
          background-color: cadetblue;
        }
      }

      .item-4 {
        height:100%;
        overflow:hidden;
        background-color: #ffffff;
        display: grid;
        grid-template-columns: 40% 60%;
        grid-template-rows: 60px  minmax(100px, 1fr) 60px minmax(100px, 2fr);
        grid-row-gap: 0px;
        grid-column-gap: 0px;

        pre {outline: 0px; padding: 0px; margin: 0px;height:360px;line-height: 20px; font-family: Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace;}
        .color-pre__style{
          height: 95%;
          width: 95%;
          .string { color: green; }
          .number { color: darkorange; }
          .boolean { color: blue; }
          .null { color: magenta; }
          .key { color: red; }
        }
        .request-header {
          grid-column-start: 1;
          grid-column-end: 3;
          border-bottom:1px solid #bbbbbb;
          padding-left: 15px;
        }

        .request-header-content{
          grid-column-start: 1;
          grid-column-end: 3;
          border-bottom:1px solid #bbbbbb;
          padding-left: 0px;
          overflow:scroll;
          height: 100%;
          width:100%;
          line-height: 30px;
        }

        .response-header {
          border-right:1px solid #bbbbbb;
          border-bottom:1px solid #bbbbbb;
          padding-left: 15px;
        }

        .response-header-content {
          border-right:1px solid #bbbbbb;
          padding-left: 0px;
          height: 100%;
          width:100%;
          overflow:scroll;
          line-height: 30px;
        }

        .response-body {
          border-bottom:1px solid #bbbbbb;
          padding-left: 15px;
        }

        .response-body-content {
          padding-left: 5px;
          height:100%;
          width:100%;
          overflow:scroll;
        }
      }

      .sub-grid-params{
            width: 100%;
            height:100%;
            background: #fff;
            text-align: center;
            display: grid;
            grid-template-columns: 100%;
            grid-template-rows: 60px auto;
            grid-row-gap: 0px;
            grid-column-gap: 0px;
            padding:0px;

      }

      .sub-grid-params-add{
        width: 100%;
        height:100%;
        background: #fff;
        text-align: left;
        display: grid;
        grid-template-columns: 70% 30%;
        grid-template-rows:100%;
        grid-row-gap: 0px;
        grid-column-gap: 0px;
        padding:0px;
      }

      .el-select .el-input .el-input__inner{
        height: 60px;
        border-radius:0px;
        border:1px solid #bbbbbb;
      }
      .el-select .el-input .el-select__caret {
        line-height:60px;
        font-weight: bolder;
        color:black;
      }

      .el-button {
        border-color: #bbbbbb;
      }

      .sub-grid-params-add  .el-button {
        height: 38px;
        margin-top: 11px;
        margin-right: 10px;
      }
  }
</style>
