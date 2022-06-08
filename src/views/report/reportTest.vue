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
        <report-box
            :object="object"
            :category-list="builtinReportLeftMenu"
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
import ReportBox from '@/components/rightBox/report/ReportBox'

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
        source: '',
        cTime: '',
        uTime: '',
        remark: '',
        config: {
          isRepeat: 0,
          isScheduler: 0,
          cronExpression: '',
          startTime: '',
          endTime: '',
          queryConfig: {},
          schedulerConfig: {
            type: 'day',
            weekDates: [],
            months: [],
            monthDates: [],
            monthWeekDates: [],
            interval: 1
          },
          timeConfig: {
            type: 'yesterday',
            offset: 1,
            unit: ''
          }
        },
        schedulerStart: '',
        schedulerEnd: '',
        categoryId: ''
      },
      checkWeekListData: [
        'report.sunday',
        'report.monday',
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
    ReportBox
  },
  methods: {
    queryGetTempData () {
      get(api.reportCategory).then(res => {
        if (res.code === 200) {
          this.builtinReportLeftMenu = res.data.list
        }
      })
    },
    builtinTabs (id) {
      this.getTableData({ categoryId: id })
      this.builtinId = id
    },
    edit (u) {
      this.initConfig(u)
      this.object = u
      this.rightBox.show = true
    },
    initConfig (u) {
      if (!u.config) {
        u.config = {
          isRepeat: 0,
          cronExpression: '',
          startTime: '',
          endTime: '',
          queryConfig: {},
          schedulerConfig: {
            type: 'day',
            weekDates: [],
            months: [],
            monthDates: [],
            monthWeekDates: [],
            interval: 1
          },
          timeConfig: {
            type: 'yesterday',
            offset: 1,
            unit: ''
          }
        }
      } else if (!u.config.schedulerConfig) {
        u.config.schedulerConfig = {
          type: 'day',
          weekDates: [],
          months: [],
          monthDates: [],
          monthWeekDates: [],
          interval: 1
        }
      } else if (!u.config.timeConfig) {
        u.config.timeConfig = {
          type: 'yesterday',
          offset: 1,
          unit: ''
        }
      }
    }
  },
  mounted () {
    this.queryGetTempData()
  }
}
</script>
