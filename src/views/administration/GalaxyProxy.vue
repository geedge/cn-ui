<template>
  <div style="height: 100%;">
    <cn-data-list
        ref="dataList"
        :tableId="tableId"
        v-model:custom-table-title="tools.customTableTitle"
        :api="url"
        :from="fromRoute.galaxyProxy"
        :layout="['columnCustomize','elementSet','search']"
        @search="search"
    >
      <template v-slot:top-tool-left>
        <button id="galaxy-proxy-clear-cache" class="top-tool-btn margin-r-10" :title="$t('overall.clearCache')"
                type="button" @click="clearCache">
          <i class="cn-icon cn-icon-clear-cache"></i>
        </button>
        <button id="galaxy-proxy-add"
                class="top-tool-btn margin-r-10 top-tool-btn--create"
                @click="add">
          <i class="cn-icon-xinjian cn-icon"></i>
          <span>{{$t('overall.create')}}</span>
        </button>
        <button id="galaxy-edit"  class="top-tool-btn margin-r-10" :disabled="disableEdit"
                @click="editSelectRecord">
          <i class="cn-icon-edit cn-icon"></i>
          <span>{{$t('overall.edit')}}</span>
        </button>
        <button id="galaxy-delete"  class="top-tool-btn margin-r-10"
                @click="delBatch">
          <i class="cn-icon-delete cn-icon"></i>
          <span>{{$t('overall.delete')}}</span>
        </button>
        <button id="galaxy-proxy-debug" class="top-tool-btn margin-r-10"  :title="$t('overall.debug')"
                type="button" @click="debug(true,{})">
          <i class="cn-icon-category cn-icon"></i>
        </button>
        <top-tool-more-options
                ref="export"
                id="model"
                :params="searchLabel"
                class="top-tool-export margin-l-10 margin-r-10"
                export-file-name="galaxyProxy"
                export-url="/galaxy/setting/export"
                import-url="/galaxy/setting/import"
                @afterImport="getTableData"
        >
          <template v-slot:before>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:default>
        <loading :loading="loading"></loading>
        <galaxy-proxy-table
            ref="dataTable"
            :api="url"
            :isNoData="isNoData"
            :custom-table-title="tools.customTableTitle"
            :height="mainTableHeight"
            :table-data="tableData"
            @delete="del"
            @edit="edit"
            @orderBy="tableDataSort"
            @reload="getTableData"
            @selectionChange="selectionChange"
            @copy="copy"
            @debug="debugRow"
        ></galaxy-proxy-table>
      </template>
      <!-- 分页组件 -->
      <template #pagination>
        <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
      </template>
    </cn-data-list>
    <el-drawer
        v-model="rightBox.show"
        direction="rtl"
        custom-class="common-right-box"
        :size="700"
        :with-header="false"
        destroy-on-close>
      <galaxy-proxy-box :object="object" @close="closeRightBox"></galaxy-proxy-box>
    </el-drawer>
  </div>
  <galaxy-proxy-debug
          v-model:show-debug="showDebug"
          top="5vh"
          :show-close="false"
          :curGalaxyProxy="curGalaxyProxy"></galaxy-proxy-debug>
</template>

<script>
import cnDataList from '@/components/table/CnDataList'
import galaxyProxyBox from '@/components/rightBox/settings/GalaxyProxyBox'
import galaxyProxyTable from '@/components/table/administration/GalaxyProxyTable'
import dataListMixin from '@/mixins/data-list'
import { api } from '@/utils/api'
import axios from 'axios'
import TopToolMoreOptions from '@/components/common/popBox/TopToolMoreOptions'
import galaxyProxyDebug from '@/components/setting/GalaxyProxyDebug'

export default {
  name: 'GalaxyProxy',
  components: {
    cnDataList,
    galaxyProxyBox,
    galaxyProxyTable,
    TopToolMoreOptions,
    galaxyProxyDebug
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: api.galaxyProxy,
      tableId: 'galaxySettingTable', // 需要分页的table的id，用于记录每页数量
      blankObject: { // 空白对象
        name: ''
      },
      showDebug: false,
      curGalaxyProxy: {}
    }
  },
  methods: {
    edit (u) {
      axios.get(`${this.url}/${u.id}`).then(response => {
        if (response.status === 200) {
          const editObject = response.data.data
          editObject.targetHeader || (editObject.targetHeader = '')
          editObject.preHandle || (editObject.preHandle = '')
          editObject.postHandle || (editObject.postHandle = '')
          editObject.targetParam || (editObject.targetParam = '')
          this.object = editObject
          this.rightBox.show = true
        }
      })
    },
    debug (isTopDebug, u) {
      if (!isTopDebug && u) {
        this.curGalaxyProxy = JSON.parse(JSON.stringify(u))
      }
      this.showDebug = true
    },
    debugRow (u) {
      this.debug(false, u)
    },
    clearCache () {
      axios.put(`${this.url}/clearCache`).then(response => {
        if (response.status === 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.success') })
        } else {
          this.$message.error(response.data.message)
        }
      }).catch(() => {
        this.$message.error(this.$t('tip.unknownError'))
      })
    }

  }
}
</script>
