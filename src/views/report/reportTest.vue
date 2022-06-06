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
              @delete="del"
              @edit="edit"
              @download="download"
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
      url: api.reportTemp,
      blankObject: {
        id: '',
        name: '',
        type: '',
        // config: '',
        source: '',
        cTime: '',
        uTime: '',
        htmContent: '',
        remark: '',
        uniq: '',
        config: {
          isRepeat: 0,
          cronExpression: '',
          startTime: '',
          endTime: '',
          queryConfig: {
            key1: '',
            key2: ''
          },
          schedulerConfig: {
            // type: '',
            week_dates: [1, 2, 3, 4, 5, 6, 7],
            months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            month_dates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            month_week_dates: [0, 1, 2, 3, 4, 5, 6],
            interval: 1
          },
          timeConfig: {
            type: 'day',
            offset: 0,
            unit: ''
          }
        },
        schedulerStart: '',
        schedulerEnd: '',
        category_id: 1
      },
      checkWeekListData: [
        'report.sunday',
        'report.onMonday',
        'report.tuesday',
        'report.wednesday',
        'report.thursday',
        'report.friday',
        'report.saturday'
      ],
      checkMonthsListData: [
        'report.january',
        'report.february',
        'report.march',
        'report.april',
        'report.may',
        'report.june',
        'report.july',
        'report.august',
        'report.september',
        'report.october',
        'report.november',
        'report.december'
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
      console.log(api.reportCategory)
      get(api.reportCategory).then(res => {
        this.builtinReportLeftMenu = [
          { id: 1, name: 'Tencent网络服务质量监测报告(IDC精简版)' },
          { id: 2, name: '网络服务质量监测报告(IDC精简版)' },
          { id: 3, name: '出入口整体流量监测报告' },
          { id: 4, name: '出入口字节跳动流量监测报告' }
        ]
        if (res.code === 200) {
          this.builtinReportLeftMenu = res.data.list
        }
      })
    },
    builtinTabs (id) {
      this.getTableData({ tempId: id })
      this.builtinId = id
    },
    edit (u) {
      get(this.url, { id: u.id, name: u.name }).then(response => {
        if (response.code === 200) {
          let dataList = []
          dataList = response.data.list.map(item => {
            return {
              ...item,
              config: JSON.parse(item.config)
            }
          })
          this.object = dataList[0]
          this.rightBox.show = true
        }
      })
    }
  },
  mounted () {
    this.queryGetTempData()
  }
}
</script>
