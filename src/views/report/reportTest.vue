<template>
  <div class="cn-builtin">
    <div class="cn-builtin-left">
      <loading :loading="builtinLeftLoading"></loading>
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
              :api="url"
              :custom-table-title="tools.customTableTitle"
              :category-list="builtinReportLeftMenu"
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
          destroy-on-close>
        <report-box
            :object="object"
            :category-list="builtinReportLeftMenu"
            :current-category-id="builtinId"
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
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import ReportBox from '@/components/rightBox/report/ReportBox'
import Loading from '@/components/common/Loading'

export default {
  name: 'Report',
  data () {
    return {
      builtinReportLeftMenu: [], // 左侧列表菜单数据
      builtinColor: false,
      builtinId: -1,
      url: api.reportTemp,
      blankObject: {
        id: '',
        name: '',
        type: '',
        source: 'session_record_cn',
        cTime: '',
        uTime: '',
        remark: '',
        config: {
          isRepeat: 0,
          isScheduler: 0,
          cronExpression: '',
          startTime: '',
          endTime: '',
          queryParam: {},
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
            unit: 'hour'
          }
        },
        schedulerStart: '',
        schedulerEnd: '',
        categoryId: '',
        categoryParams: []
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
      tableId: 'builtinReportTable',
      builtinLeftLoading: false
    }
  },
  mixins: [dataListMixin],
  components: {
    Loading,
    cnDataList,
    builtinReportTable,
    ReportBox
  },
  mounted () {
    this.$nextTick(() => {
      this.queryGetTempData();      
    });    
  },
  methods: {
    /**
     * 向地址栏添加/删除参数
     */
     reloadUrl (newParam, clean) {
      const { query } = this.$route;
      let newUrl = urlParamsHandler(window.location.href, query, newParam);
      if(clean) {
        newUrl = urlParamsHandler(window.location.href, query, newParam, clean);
      }
      overwriteUrl(newUrl)
    },
    queryGetTempData () {
      this.builtinLeftLoading = true
      get(api.reportCategory).then(res => {
        if (res.code === 200) {
          this.builtinReportLeftMenu = res.data.list.map(c => {
            return {
              ...c,
              config: c.config ? JSON.parse(c.config) : {}
            }
          })
          let tabId = sessionStorage.getItem('report_select_tab');
          if(tabId != null) {
            tabId = JSON.parse(tabId);
            this.builtinId = tabId;
            this.builtinTabs(this.builtinId);            
          } else {
            this.builtinId = null;
            this.getTableData();
          }
        }
        this.builtinLeftLoading = false
      })
    },
    getTableData (params) {
      if (params) {
        this.searchLabel = { ...this.searchLabel, ...params }
      }
      this.searchLabel = { ...this.searchLabel, ...this.pageObj }
      // this.tools.loading = true
      delete this.searchLabel.total
      let listUrl = this.url
      if (this.listUrl) {
        listUrl = this.listUrl
      }

      let urlTabId = this.$route.query.tabId;

      // 该请求不知道为什么会走2次，此处留个记录，后续解决。为避免请求两次，所以加上判断保证请求一次
      // 前面条件是第一次进来时，左侧菜单栏点击缓存为null的情况；
      // 后面条件是点击菜单栏后刷新界面的情况
      if((this.builtinId === null) || (this.builtinId > -1 && urlTabId !== undefined)) {
        get(listUrl, this.searchLabel).then(response => {
          // this.tools.loading = false
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              response.data.list[i].status = response.data.list[i].status + ''
            }
            this.tableData = response.data.list.map(item => {
              return {
                ...item,
                config: item.config ? JSON.parse(item.config) : {}
              }
            })
            this.pageObj.total = response.data.total;
            // TODO 回到顶部
          }
        })
      }

    },
    /**
     * 点击左侧tab页
     */
    builtinTabs (id) {
      this.getTableData({ categoryId: id })
      this.builtinId = id

      sessionStorage.setItem('report_select_tab', JSON.stringify(id));

      if(id != null) {
        let newParam = {
          tabId: id
        }
        this.reloadUrl(newParam);
      } else {
        let newQuery = JSON.parse(JSON.stringify(this.$route.query)) // 深拷贝路由数据
        delete newQuery.tabId;
        this.reloadUrl(newQuery, 'cleanOldParams');
      }
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
          queryParam: {},
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
  }
}
</script>
