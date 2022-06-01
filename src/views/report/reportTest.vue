<template>
  <div class="cn-builtin">
    <div class="cn-builtin-left">
      <div class="cn-builtin-left-title">
        {{$t('report.category')}}
      </div>
      <div class="cn-builtin-left-menu" :class="{'cn-active': !builtinId}" @click="builtinTabs(null)">
        {{$t('dns.all')}}
      </div>
      <div class="cn-builtin-left-menu" :class="{'cn-active': builtinId === item.id}" v-for="item in builtinReportLeftMenu" :key="item.id" @click="builtinTabs(item.id)">
        {{item.name}}
      </div>
    </div>
    <div class="cn-builtin-right">
      <cn-data-list
          ref="dataList"
          :tableId="tableId"
          v-model:custom-table-title="tools.customTableTitle"
          :api="url"
          :from="fromRoute.builtinReport"
          :layout="['search']"
          @search="search"
      >
        <template #top-tool-right>
          <button
              id="account-add"
              class="top-tool-btn"
              type="button"
              @click="add"
          >
            <i class="cn-icon-add cn-icon"/>
          </button>
        </template>
        <template #default>
          <builtin-report-table
              ref="dataTable"
              v-loading="tools.loading"
              :api="url"
              :custom-table-title="tools.customTableTitle"
              :height="mainTableHeight"
              :table-data="tableData"
              @download="download"
              @delete="del"
              @edit="edit"
              @preview="preview"
              @orderBy="tableDataSort"
              @reload="getTableData"
              @selectionChange="selectionChange"
          />
        </template>
        <template #pagination>
          <pagination ref="pagination" :page-obj="pageObj" :tableData="tableData" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
        </template>
      </cn-data-list>
      <el-drawer
          v-model="rightBox.show"
          direction="rtl"
          :with-header="false"
          :size="700"
          destroy-on-close>
        <builtin-report-box
            :object="object"
            :check-week-list-data="checkWeekListData"
            :check-months-list-data="checkMonthsListData"
            @close="closeRightBox"
        />
      </el-drawer>
    </div>
  </div>
</template>

<script>
import { get } from '@/utils/http'
import builtinReportTable from '@/components/table/report/reportTestTable'
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import { api } from '@/utils/api'
import builtinReportBox from '@/components/rightBox/report/reportTestBox'

export default {
  name: 'Report',
  data () {
    return {
      builtinReportLeftMenu: [], // 左侧列表菜单数据
      builtinColor: false,
      builtinId: '',
      url: api.reportJob,
      blankObject: { // 空白对象
        id: '',
        name: '',
        ctime: '',
        remark: '',
        uniq: '',
        startTime: '',
        endTime: ''
      },
      checkWeekListData: [
        this.$t('report.sunday'),
        this.$t('report.onMonday'),
        this.$t('report.tuesday'),
        this.$t('report.wednesday'),
        this.$t('report.thursday'),
        this.$t('report.friday'),
        this.$t('report.saturday')
      ],
      checkMonthsListData: [
        this.$t('report.january'),
        this.$t('report.february'),
        this.$t('report.march'),
        this.$t('report.april'),
        this.$t('report.may'),
        this.$t('report.june'),
        this.$t('report.july'),
        this.$t('report.august'),
        this.$t('report.september'),
        this.$t('report.october'),
        this.$t('report.november'),
        this.$t('report.december')
      ],
      tableId: 'builtinReportTable'
    }
  },
  mixins: [dataListMixin],
  components: {
    cnDataList,
    builtinReportTable,
    builtinReportBox
  },
  methods: {
    queryGetTempData () {
      get(api.reportTemp).then(res => {
        if (res.code === 200) {
          this.builtinReportLeftMenu = res.data.list
        }
      })
    },
    builtinTabs (id) {
      this.getTableData({ tempId: id })
      this.builtinId = id
    }
  },
  mounted () {
    this.queryGetTempData()
  }
}
</script>
