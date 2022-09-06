<template>
  <div class="npm-app">
    <div class="npm-app-left">
      <div class="npm-app-letter">
        <div v-for="(letter, index) in colorPatchData" :key="index">
          {{letter.letter}}
        </div>
      </div>
      <div class="npm-app-body">
        <div class="npm-app-body-patch" v-for="(data, index) in tableData" :key="index">
          <div class="npm-app-body-icon"><span><i :class="data.icon"></i></span></div>
          <div class="npm-app-body-color" v-for="(item, index) in 6" :key="index" :class="{'score-color': data.score >= index + 1}"></div>
        </div>
      </div>
    </div>
    <div class="npm-app-right">
      <el-table
          :id="`tabTable_${index}`"
          :ref="`dataTable_${index}`"
          :data="tableData"
          class="app-table"
          height="100%"
          empty-text=" "
      >
        <template v-for="(item, index) in customTableTitles" :key="index">
          <el-table-column class="data-column">
            <template #header>
              <span class="data-column__span">{{$t(item.label)}}</span>
            </template>
            <template  #default="scope" :column="item">
              <div class="data-total">
                <template v-if="item.prop === 'category'">
                  <span class="data-total-category-icon"><i :class="scope.row.icon"></i></span>
                  <span class="data-total-category-value" @click="drillDownData(scope.row.i18n)">{{$t(scope.row.i18n)}}</span>
                </template>
                <template v-else-if="item.prop === 'total'">
                  <div class="data-total-value">{{unitConvert(scope.row.totalPacketsRate, unitTypes.bps).join('')}}</div>
                  <div class="data-trend">
                    <div v-if="scope.row.bytesRateChainRatio > 0" class="data-total-trend data-total-trend-red">
                      <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(scope.row.bytesRateChainRatio, unitTypes.percent).join('')}}
                    </div>
                    <div v-else-if="scope.row.bytesRateChainRatio < 0" class="data-total-trend data-total-trend-green">
                      <i class="cn-icon-decline cn-icon"></i>&nbsp;{{unitConvert(scope.row.bytesRateChainRatio, unitTypes.percent).join('').replaceAll('-', '')}}
                    </div>
                    <div v-else-if="scope.row.bytesRateChainRatio === 0" class="data-total-trend data-total-trend-black">
                      <i class="cn-icon-constant cn-icon"></i>
                    </div>
                    <div v-else></div>
                  </div>
                </template>
                <template v-else-if="item.prop === 'outbound'">
                  <div class="data-total-value">{{unitConvert(scope.row.outboundPacketsRate, unitTypes.bps).join('')}}</div>
                  <div class="data-trend">
                    <div v-if="scope.row.outboundBytesRateChainRatio > 0" class="data-total-trend data-total-trend-red">
                      <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(scope.row.outboundBytesRateChainRatio, unitTypes.percent).join('')}}
                    </div>
                    <div v-else-if="scope.row.outboundBytesRateChainRatio < 0" class="data-total-trend data-total-trend-green">
                      <i class="cn-icon-decline cn-icon"></i>&nbsp;{{unitConvert(scope.row.outboundBytesRateChainRatio, unitTypes.percent).join('').replaceAll('-', '')}}
                    </div>
                    <div v-else-if="scope.row.outboundBytesRateChainRatio === 0" class="data-total-trend data-total-trend-black">
                      <i class="cn-icon-constant cn-icon"></i>
                    </div>
                    <div v-else></div>
                  </div>
                </template>
                <template v-else-if="item.prop === 'inbound'">
                  <div class="data-total-value">{{unitConvert(scope.row.inboundPacketsRate, unitTypes.bps).join('')}}</div>
                  <div class="data-trend">
                    <div v-if="scope.row.inboundBytesRateChainRatio > 0" class="data-total-trend data-total-trend-red">
                      <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(scope.row.inboundBytesRateChainRatio, unitTypes.percent).join('')}}
                    </div>
                    <div v-else-if="scope.row.inboundBytesRateChainRatio < 0" class="data-total-trend data-total-trend-green">
                      <i class="cn-icon-decline cn-icon"></i>&nbsp;{{unitConvert(scope.row.inboundBytesRateChainRatio, unitTypes.percent).join('').replaceAll('-', '')}}
                    </div>
                    <div v-else-if="scope.row.inboundBytesRateChainRatio === 0" class="data-total-trend data-total-trend-black">
                      <i class="cn-icon-constant cn-icon"></i>
                    </div>
                    <div v-else></div>
                  </div>
                </template>
                <template v-else-if="item.prop === 'score'">
                  <div v-if="scope.row.score <= 2" :class="{'data-score-red': scope.row.score <= 2}" class="data-score">
                    {{scope.row.score}}
                  </div>
                  <div v-else-if="scope.row.score <= 4" :class="{'data-score-yellow': scope.row.score <= 4}" class="data-score">
                    {{scope.row.score}}
                  </div>
                  <div v-else-if="scope.row.score <= 6" :class="{'data-score-green': scope.row.score <= 6}" class="data-score">
                    {{scope.row.score}}
                  </div>
                </template>
                <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
                <span v-else>-</span>
              </div>
            </template>
          </el-table-column>
        </template>
        <template v-slot:empty>
          <div class="table-no-data" v-show="isNoData">
            <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
          </div>
        </template>
      </el-table>
    </div>
  </div>
</template>

<script>
import { unitTypes, npmCategoryInfoMapping, networkTable, operationType, npmCategoryToAppCategoryMap } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import { getChainRatio, computeScore } from '@/utils/tools'
import chartMixin from '@/views/charts2/chart-mixin'
export default {
  name: 'NpmAppCategoryScore',
  data () {
    return {
      unitConvert,
      unitTypes,
      colorPatchData: [
        { letter: '' },
        { letter: 'A' },
        { letter: 'B' },
        { letter: 'C' },
        { letter: 'D' },
        { letter: 'E' },
        { letter: 'F' }
      ],
      tableData: [],
      customTableTitles: [
        { label: 'network.category', prop: 'category' },
        { label: 'network.score', prop: 'score' },
        { label: 'network.total', prop: 'total' },
        { label: 'network.outbound', prop: 'outbound' },
        { label: 'network.inbound', prop: 'inbound' }
      ],
      isNoData: false
    }
  },
  mixins: [chartMixin],
  watch: {
    timeFilter: {
      handler (n) {
        this.init()
      }
    }
  },
  methods: {
    init () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      // 获取table后三列内容
      const currentTrafficRequest = get(api.npm.overview.appTrafficAnalysis, { ...params, cycle: 0 })
      const lastCycleTrafficRequest = get(api.npm.overview.appTrafficAnalysis, { ...params, cycle: 1 })
      this.toggleLoading(true)
      Promise.all([currentTrafficRequest, lastCycleTrafficRequest]).then(res => {
        const prevData = res[1].data.result
        const data = res[0].data.result
        if (data && data.length > 0) {
          this.isNoData = false
          const tableData = data.map(d => {
            const mapping = npmCategoryInfoMapping.find(mapping => mapping.appSubcategory === d.appSubcategory)
            const result = {
              ...mapping,
              ...d,
              bytesRateChainRatio: '-',
              inboundBytesRateChainRatio: '-',
              outboundBytesRateChainRatio: '-'
            }

            const prev = prevData.find(p => p.appSubcategory === d.appSubcategory)
            if (prev) {
              result.bytesRateChainRatio = getChainRatio(d.totalBitsRate, prev.totalBitsRate)
              result.inboundBytesRateChainRatio = getChainRatio(d.inboundBitsRate, prev.inboundBitsRate)
              result.outboundBytesRateChainRatio = getChainRatio(d.outboundBitsRate, prev.outboundBitsRate)
            }
            return result
          })
          // 计算分数
          const tcpRequest = get(api.npm.overview.appTcpSessionDelay, params)
          const httpRequest = get(api.npm.overview.appHttpResponseDelay, params)
          const sslRequest = get(api.npm.overview.appSslConDelay, params)
          const tcpLostRequest = get(api.npm.overview.appTcpLostlenPercent, params)
          const packetRetransRequest = get(api.npm.overview.appPacketRetransPercent, params)
          Promise.all([tcpRequest, httpRequest, sslRequest, tcpLostRequest, packetRetransRequest]).then(res => {
            const keyPre = ['tcp', 'http', 'ssl', 'tcpLost', 'packetRetrans']
            res.forEach((r, i) => {
              if (r.code === 200) {
                tableData.forEach(t => {
                  let score = 0
                  const find = r.data.result.find(d => d.appSubcategory === t.appSubcategory)
                  if (find) {
                    score = computeScore(find, i)
                  }
                  t[keyPre[i] + 'Score'] = score
                })
              } else {
                tableData.forEach(t => {
                  t[keyPre[i] + 'Score'] = 0
                })
              }
            })
            tableData.forEach(t => {
              t.score = Math.ceil((t.tcpScore + t.httpScore + t.sslScore + t.tcpLostScore + t.packetRetransScore) * 6)
              if (t.score > 6) {
                t.score = 6
              }
            })
            this.tableData = tableData
          })
        } else {
          this.tableData = []
          this.isNoData = true
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    drillDownData (key) {
      const value = npmCategoryToAppCategoryMap[key]
      const tabType = 'network.applicationCategories'
      const oldCurTab = this.$store.getters.getNetworkOverviewBeforeTab
      const curTable = networkTable.networkOverview
      const list = this.$store.getters.getNetworkOverviewTabList
      const tabGroup = list.filter(item => item.label === tabType)
      if (tabGroup && tabGroup.length > 0) {
        this.$store.commit('setNetworkOverviewBeforeTab', tabGroup[0])
      }
      this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      this.$store.commit('setTabOperationType', operationType.fourthMenu)

      const queryCondition = []
      const searchProps = tabGroup[0].dillDownProp
      searchProps.forEach(item => {
        queryCondition.push(item + "='" + value + "'")
      })
      this.$store.commit('setQueryCondition', queryCondition.join(' OR '))

      this.$store.getters.menuList.forEach(menu => {
        if (this.$_.isEmpty(menu.children) && menu.route) {
          if (this.$route.path === menu.route) {
            menu.columnName = tabType
            menu.columnValue = value
            this.$store.commit('setPanelName', value)
            this.$store.commit('setBreadcrumbColumnName', tabType)
            this.$store.commit('setDimensionType', tabGroup[0] ? tabGroup[0].prop : '')
            this.$store.commit('setBreadcrumbColumnValue', value)
          }
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            if (this.$route.path === child.route) {
              child.columnName = tabType
              child.columnValue = value
              this.$store.commit('setPanelName', value)
              this.$store.commit('setBreadcrumbColumnName', tabType)
              this.$store.commit('setDimensionType', tabGroup[0] ? tabGroup[0].prop : '')
              this.$store.commit('setBreadcrumbColumnValue', value)
            }
          })
        }
      })
      let toPanel = null
      list.forEach((item, index) => {
        if (item.label === tabType) {
          item.checked = false
          toPanel = item.panelId
        }
        if (oldCurTab && (item.label === oldCurTab.label)) {
          item.checked = true
        }
      })
      this.$store.commit('setNetworkOverviewTabList', list)
      const tabObjGroup = list.filter(item => item.checked)
      if (tabObjGroup && tabObjGroup.length > 0) {
        const curTab = tabObjGroup[0]
        this.$store.commit('setNetworkOverviewCurrentTab', curTab)
      }
      this.$router.push({
        params: {
          thirdPanel: curTable.panelIdOfThirdMenu ? curTable.panelIdOfThirdMenu : '',
          fourthPanel: toPanel || ''
        }
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
