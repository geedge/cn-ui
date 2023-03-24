<template>
  <div class="npm-recent">
    <div class="npm-recent-title">
      {{ $t('network.recentEvents') }}
      <chart-error v-if="showError" tooltip :content="errorMsg" />
    </div>
    <el-table
        id="tabTable"
        ref="dataTable"
        :data="tableData"
        class="npm-recent-table"
        :class="{'npm-recent-table-ten': tableData.length === 10}"
        empty-text=""
        height="100%"
    >
      <template v-for="(item, index) in customTableTitles" :key="index">
        <el-table-column class="data-column">
          <template #header>
            <span class="data-column__span">{{$t(item.label)}}</span>
          </template>
          <template  #default="scope" :column="item">
            <div class="data-recent-table">
              <template v-if="item.prop === 'eventSeverity'">
                <span class="data-recent-table-severity" :class="scope.row[item.prop]" :test-id="`eventSeverity-${scope.row.eventSeverity}-${scope.$index}`">{{scope.row[item.prop]}}</span>
              </template>
              <template v-else-if="item.prop === 'eventKey'">
                <span class="data-recent-table-entity click-active" @click="jumpPage(scope.row)" :test-id="`eventKey-${splitEventKey(scope.row.eventKey)}-${scope.$index}`">{{splitEventKey(scope.row[item.prop])}}</span>
              </template>
              <template v-else-if="item.prop === 'eventType'">
                <span class="data-recent-table-eventType" :test-id="`eventType-${scope.row.eventType}-${scope.$index}`">{{scope.row[item.prop]}}</span>
              </template>
              <span v-else-if="scope.row[item.prop]" :test-id="`startTime-${scope.$index}`">{{scope.row[item.prop]}}</span>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
      </template>
      <template v-slot:empty>
        <div class="table-no-data" v-show="isNoData">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#cn-icon-good"></use>
          </svg>
          <div class="table-no-data__title" test-id="noData">{{ $t('npm.thereNoEvents') }}</div>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import { getSecond, dateFormatByAppearance } from '@/utils/date-util'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import ChartError from '@/components/common/Error'
import axios from 'axios'
import { dataForNpmRecentEvents } from '@/utils/static-data'

export default {
  name: 'NpmRecentEvents',
  components: { ChartError },
  mixins: [chartMixin],
  setup () {
    const { query } = useRoute()
    const queryCondition = ref(query.queryCondition || '')
    const dimensionType = ref(query.dimensionType || '')
    return {
      queryCondition,
      dimensionType
    }
  },
  data () {
    return {
      tableData: [],
      customTableTitles: dataForNpmRecentEvents.customTableTitles,
      showError: false,
      errorMsg: ''
    }
  },
  watch: {
    timeFilter: {
      handler (n) {
        if (n) {
          this.recentEventsListData()
        }
      }
    }
  },
  methods: {
    recentEventsListData () {
      const condition = this.queryCondition.split(/["|'](.*?)["|']/)
      let url = ''
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        limit: 8
      }

      if (condition && condition.length > 1 && this.dimensionType) {
        params.param = condition[1]
        params.type = this.dimensionType
        if (params.type === 'serverIp' || params.type === 'clientIp') params.type = 'ip'
        params.limit = 10
        url = api.npm.events.recentEventsD
        this.customTableTitles = dataForNpmRecentEvents.customTableTitles1
      } else {
        url = api.npm.events.recentEvents
      }

      this.toggleLoading(true)
      axios.get(url, { params: params }).then(res => {
        res = res.data
        if (res.code === 200) {
          this.showError = false
          this.isNoData = res.data.result.length === 0
          res.data.result.forEach(e => {
            if (e.startTime) {
              e.startTime = dateFormatByAppearance(e.startTime)
            }
          })
          this.tableData = res.data.result
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    /**
     * 只要实体名称
     * @param key
     * @returns {*}
     */
    splitEventKey (key) {
      let name = ''
      name = key ? key.split(' ')[0] : '-'
      return name
    },
    jumpPage (item) {
      this.beforeRouterPush()
      this.$router.push({
        path: '/detection/performanceEvent',
        query: {
          t: +new Date(),
          eventId: item.eventId
        }
      })
    },
    /**
     * 在路由跳转前，即下钻前将路由数据保存起来，确保回退和前进保留当时状态
     */
    beforeRouterPush () {
      const currentRouter = this.$_.cloneDeep(this.$route.query)
      const historyList = this.$_.cloneDeep(this.$store.getters.getRouterHistoryList)

      const tempObj = {
        t: currentRouter.t,
        query: currentRouter,
        path: this.$_.cloneDeep(this.$route.path),
        params: this.$_.cloneDeep(this.$route.params)
      }
      if (historyList.length > 0) {
        let flag = true
        historyList.forEach((item, index) => {
          if (item.t === currentRouter.t) {
            historyList[index] = tempObj
            flag = false
          }
          if (!flag) {
            return true
          }
        })
        if (flag) historyList.push(tempObj)
      } else {
        historyList.push(tempObj)
      }
      this.$store.commit('setRouterHistoryList', historyList)
    },
    httpError (res) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(res)
    }
  },
  mounted () {
    this.recentEventsListData()
  }
}
</script>
