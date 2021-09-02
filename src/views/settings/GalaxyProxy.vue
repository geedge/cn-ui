<template>
  <div>
    <cn-data-list
        ref="dataList"
        :tableId="tableId"
        v-model:custom-table-title="tools.customTableTitle"
        :api="url"
        :from="fromRoute.galaxyProxy"
        :layout="['columnCustomize','elementSet','searchInput']"
        @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="galaxy-proxy-add" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="cn-icon-add cn-icon"></i>
        </button>
      </template>
      <template v-slot:default>
        <galaxy-proxy-table
            ref="dataTable"
            v-loading="tools.loading"
            :api="url"
            :custom-table-title="tools.customTableTitle"
            :height="mainTableHeight"
            :table-data="tableData"
            @delete="del"
            @edit="edit"
            @orderBy="tableDataSort"
            @reload="getTableData"
            @selectionChange="selectionChange"
            @copy="copy"
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
        :size="700"
        :with-header="false"
        destroy-on-close>
      <galaxy-proxy-box :object="object" @close="closeRightBox"></galaxy-proxy-box>
    </el-drawer>
  </div>
</template>

<script>
import cnDataList from '@/components/table/CnDataList'
import galaxyProxyBox from '@/components/rightBox/settings/GalaxyProxyBox'
import galaxyProxyTable from '@/components/table/settings/GalaxyProxyTable'
import dataListMixin from '@/mixins/dataList'
import { api } from '@/utils/api'

export default {
  name: 'GalaxyProxy',
  components: {
    cnDataList,
    galaxyProxyBox,
    galaxyProxyTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: api.galaxyProxy,
      tableId: 'galaxySettingTable', // 需要分页的table的id，用于记录每页数量
      blankObject: { // 空白对象
        name: ''
      }
    }
  }
}
</script>

<style>

</style>