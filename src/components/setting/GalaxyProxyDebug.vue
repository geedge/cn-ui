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

    <div class="debug-wrapper">
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
        <el-input v-model="fullPathWithParams" placeholder="Please input" readonly/>
        <el-button @click="send">{{$t('galaxyProxy.debug.send')}}</el-button>
      </div>

      <div class="item item-3 sub-grid-params">
        <div class="sub-grid-params-add">
            <span style="padding-left: 15px;">{{$t('galaxyProxy.debug.requestParams')}}</span>
            <el-button size="mini" @click="handleAddDetails"><i class="cn-icon-add cn-icon"></i></el-button>
        </div>

        <el-table :data="paramsTableData"
                  width="100%"
                  @selection-change="handleDetailSelectionChange"
                  :row-class-name="rowClassName"
                  empty-text=""
                  ref="tb">

          <el-table-column  type="selection" align="center" label="" width="30px" style="border-left:0px;" />

          <el-table-column  prop="key"  align="center"  width="80px" >
            <template #header>
              <div class="table-operation-title">{{$t('galaxyProxy.debug.key')}}</div>
            </template>
            <template #default="scope">
              <el-input   @change="paramsChange(scope.row)"  v-model="scope.row.key"></el-input>
            </template>
          </el-table-column>

          <el-table-column prop="value"   align="center" >
            <template #header>
              <div class="table-operation-title">{{$t('galaxyProxy.debug.value')}}</div>
            </template>
            <template #default="scope">
              <el-input  @change="paramsChange(scope.row)"  v-model="scope.row.value"></el-input>
            </template>
          </el-table-column>

          <el-table-column  align="center" style="border-right:0px;" width="70px">
            <template #header>
              <div class="table-operation-title">{{$t('overall.option')}}</div>
            </template>
            <template #default="scope">
              <div @click="deleteRow(scope.$index)"  class="debug__params-delete">{{$t('overall.delete')}}</div>
            </template>
          </el-table-column>
          <template v-slot:empty>
            <div style="height:0px;"></div>
          </template>

        </el-table>

      </div>
      <div class="item item-4">
        <div class="request-header" >{{$t('galaxyProxy.debug.request.header')}}</div>
        <div class="request-header-content" ><pre v-html="proxyRequestHeader"  style="height: 98%;width: 98%;margin-left: -15px;margin-top: -10px;"></pre></div>
        <div class="response-header">{{$t('galaxyProxy.debug.response.header')}}</div>
        <div class="response-body">{{$t('galaxyProxy.debug.response.body')}}</div>
        <div class="response-header-content"><pre v-html="proxyResponseHeader"  style="height: 98%;width: 98%;margin-left: -15px;margin-top: -10px;"></pre></div>
        <div class="response-body-content color-pre__style">
          <v-ace-editor
                  v-model:value="proxyResponseBody"
                  lang="json"
                  readonly="true"
                  theme="chrome"
                  style="height: 100%" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { api } from '@/utils/api'
import { getForDebug, postForDebug } from '@/utils/http'
import axios from 'axios'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-chrome'

export default {
  name: 'GalaxyProxyDebug',
  components: {
    VAceEditor
  },
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
  data () {
    return {
      show: false,
      galaxyProxyData: [],
      name: '',
      paramsTableData: [

      ],
      // 选中的数据
      checkedDetail: {},
      checkedRowData: [],
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
      path: '', // 不带参数的路径，用于请求URL
      fullPathWithParams: '', // 带参数的完整路径，用于界面显示
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

    // 删除当前行
    deleteRow (index) {
      this.paramsTableData.splice(index, 1)
      this.updateUrlParams()
    },

    rowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
    },

    // 参数发送改变时
    paramsChange (row) {
      this.fullPathWithParams = this.path
      this.checkedDetail = {}
      this.checkedRowData.forEach(t => {
        if (t.key != '') {
          this.checkedDetail[t.key] = t.value
        }
      })
      if (this.fullPathWithParams != '') {
        this.updateUrlParams()
      }
    },

    updateUrlParams () {
      this.fullPathWithParams = this.path
      let params = ''
      for (const key in this.checkedDetail) {
        if (key != '') {
          params = params + key + '=' + this.checkedDetail[key] + '&'
        }
      }
      if (params.endsWith('&')) {
        params = params.substring(0, params.length - 1)
      }
      if (params != '') {
        this.fullPathWithParams = this.fullPathWithParams + '?' + params
      }
    },

    // 单选框选中数据
    handleDetailSelectionChange (selection) {
      this.checkedDetail = {}
      this.checkedRowData = selection
      selection.forEach((item, index) => {
        this.checkedDetail[item.key] = item.value
      })
      this.updateUrlParams()
    },

    async getGalaxyProxyData (value) {
      await axios.get(api.galaxyProxy + '?pageSize=-1').then(response => {
        if (response.status === 200) {
          this.galaxyProxyData = response.data.data.list
        }
      })
    },

    syntaxUrl (json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2)
      }
      return json = json.replace(/,/g, '&').replace(/{/g, '').replace(/}/g, '').replace(/"/g, '').replace(/:/g, '=').replace(/ /g, '')
    },

    changPath (index) {
      // 修改input的值
      this.path = axios.defaults.baseURL + 'interface' + this.galaxyProxyData[index].path
      this.updateUrlParams()
      this.method = this.galaxyProxyData[index].method.toUpperCase()
    },

    send () {
      // this.path = "galaxy/setting?pageNo=1&pageSize=1"
      // 注意有GET与POST两种方式
      if (this.method.toUpperCase() == 'GET') {
        getForDebug(this.path, this.checkedDetail).then(response => {
          this.proxyResponseBody = this.syntaxJson(JSON.parse(JSON.stringify(response.data)))
          this.proxyResponseHeader = this.syntaxJson(JSON.parse(JSON.stringify(response.headers)))
          this.proxyRequestHeader = this.syntaxJson(JSON.parse(JSON.stringify(response.config.headers)))
          this.proxyResponseHeader = this.proxyResponseHeader.replace(/{/g, '').replace(/}/g, '').replace(/"/g, '')
          this.proxyRequestHeader = this.proxyRequestHeader.replace(/{/g, '').replace(/}/g, '').replace(/"/g, '')
        })
      } else if (this.method.toUpperCase() == 'POST') {
        postForDebug(this.path, this.checkedDetail).then(response => {
          if (response) {
            this.proxyResponseBody = this.syntaxJson(JSON.parse(JSON.stringify(response.data)))
            this.proxyResponseHeader = this.syntaxJson(JSON.parse(JSON.stringify(response.headers)))
            this.proxyRequestHeader = this.syntaxJson(JSON.parse(JSON.stringify(response.config.headers)))

            this.proxyResponseHeader = this.proxyResponseHeader.replace(/{/g, '').replace(/}/g, '').replace(/"/g, '')
            this.proxyRequestHeader = this.proxyRequestHeader.replace(/{/g, '').replace(/}/g, '').replace(/"/g, '')
          }
        })
      }
    },
    // 格式化json
    syntaxJson (json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2)
      }
      return json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
    },
    closeDebug () {
      this.paramsTableData = []// JSON.parse(JSON.stringify(paramsTableData))
      this.proxyResponseBody = ''
      this.proxyResponseHeader = ''
      this.proxyRequestHeader = ''
      this.name = ''
      this.path = ''
      this.fullPathWithParams = ''
      for (const key in this.curGalaxyProxy) {
        delete this.curGalaxyProxy[key]
      }
    },
    openDebug () {
      if (this.curGalaxyProxy.path) {
        this.name = this.curGalaxyProxy.name
        this.path = axios.defaults.baseURL + 'interface' + this.curGalaxyProxy.path
        this.fullPathWithParams = this.path
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
    },
    path (n, o) {
      this.updateUrlParams()
    }
  }
}
</script>
