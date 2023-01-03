<template>
  <div class="npm-app" :class="showError?'npm-app-border':''">
    <chart-error v-if="showError" :content="errorMsg" />

    <div class="npm-app-left" v-if="!showError">
      <div class="npm-app-letter" :class="{'npm-app-letter-no-data': isNoData}">
        <div v-for="(letter, index) in colorPatchData" :key="index">
          {{letter.letter}}
        </div>
      </div>
      <chart-no-data v-if="isNoData"></chart-no-data>
      <div class="npm-app-body" v-else>
        <div class="npm-app-body-patch" v-for="(data, index) in tableData" :key="index">
          <div class="npm-app-body-icon"><span><i :class="data.icon"></i></span></div>
          <div class="npm-app-body-color" v-for="(item, index) in 6" :key="index" :class="{'score-color': data.score >= index + 1}"></div>
        </div>
      </div>
    </div>
    <el-table
        id="tabTable"
        ref="dataTable"
        :data="tableData"
        class="app-table"
        height="100%"
        empty-text=" "
        v-if="!showError">
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
                <div class="data-total-value">{{unitConvert(scope.row.totalPacketsRate, unitTypes.bps).join(' ')}}</div>
                <div class="data-trend">
                  <div v-if="scope.row.bytesRateChainRatio > 0" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;
                    <span v-if="scope.row.bytesRateChainRatio <= 5">
                        {{unitConvert(scope.row.bytesRateChainRatio, unitTypes.percent).join('')}}
                      </span>
                    <span v-else>>500.00%</span>
                  </div>
                  <div v-else-if="scope.row.bytesRateChainRatio < 0" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;
                    <span v-if="scope.row.bytesRateChainRatio >= -5">
                        {{unitConvert(scope.row.bytesRateChainRatio, unitTypes.percent).join('').replaceAll('-', '')}}
                      </span>
                    <span v-else>>500.00%</span>
                  </div>
                  <div v-else-if="scope.row.bytesRateChainRatio === 0" class="data-total-trend data-total-trend-black">
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                  <div v-else></div>
                </div>
              </template>
              <template v-else-if="item.prop === 'outbound'">
                <div class="data-total-value">{{unitConvert(scope.row.outboundPacketsRate, unitTypes.bps).join(' ')}}</div>
                <div class="data-trend">
                  <div v-if="scope.row.outboundBytesRateChainRatio > 0" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;
                    <span v-if="scope.row.outboundBytesRateChainRatio <= 5">
                        {{unitConvert(scope.row.outboundBytesRateChainRatio, unitTypes.percent).join('')}}
                      </span>
                    <span v-else>>500.00%</span>
                  </div>
                  <div v-else-if="scope.row.outboundBytesRateChainRatio < 0" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;
                    <span v-if="scope.row.outboundBytesRateChainRatio >= -5">
                        {{unitConvert(scope.row.outboundBytesRateChainRatio, unitTypes.percent).join('').replaceAll('-', '')}}
                      </span>
                    <span v-else>>500.00%</span>
                  </div>
                  <div v-else-if="scope.row.outboundBytesRateChainRatio === 0" class="data-total-trend data-total-trend-black">
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                  <div v-else></div>
                </div>
              </template>
              <template v-else-if="item.prop === 'inbound'">
                <div class="data-total-value">{{unitConvert(scope.row.inboundPacketsRate, unitTypes.bps).join(' ')}}</div>
                <div class="data-trend">
                  <div v-if="scope.row.inboundBytesRateChainRatio > 0" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;
                    <span v-if="scope.row.inboundBytesRateChainRatio <= 5">
                        {{unitConvert(scope.row.inboundBytesRateChainRatio, unitTypes.percent).join('')}}
                      </span>
                    <span v-else>>500.00%</span>
                  </div>
                  <div v-else-if="scope.row.inboundBytesRateChainRatio < 0" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;
                    <span v-if="scope.row.inboundBytesRateChainRatio >= -5">
                        {{unitConvert(scope.row.inboundBytesRateChainRatio, unitTypes.percent).join('').replaceAll('-', '')}}
                      </span>
                    <span v-else>>500.00%</span>
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
                <div v-else-if="scope.row.score === '-'" class="data-score-no-data">
                  -
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
</template>

<script>
import { unitTypes, npmCategoryInfoMapping, networkTable, operationType, npmCategoryToAppCategoryMap, curTabState } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import {
  getChainRatio,
  computeScore,
  urlParamsHandler,
  overwriteUrl,
  getUserDrilldownTableConfig
} from '@/utils/tools'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import ChartError from '@/components/common/Error'
export default {
  name: 'NpmAppCategoryScore',
  data () {
    return {
      unitConvert,
      unitTypes,
      colorPatchData: [
        { letter: '' },
        { letter: 'F' },
        { letter: 'E' },
        { letter: 'D' },
        { letter: 'C' },
        { letter: 'B' },
        { letter: 'A' }
      ],
      tableData: [],
      customTableTitles: [
        { label: 'network.category', prop: 'category' },
        { label: 'network.score', prop: 'score' },
        { label: 'network.total', prop: 'total' },
        { label: 'network.outbound', prop: 'outbound' },
        { label: 'network.inbound', prop: 'inbound' }
      ],
      isNoData: false,
      curTabState: curTabState,
      urlChangeParams: {},
      showError: false,
      errorMsg: ''
    }
  },
  components: {
    ChartError,
    ChartNoData
  },
  mixins: [chartMixin],
  watch: {
    timeFilter: {
      handler () {
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
        if (res[0].code === 200 && res[1].code === 200) {
          this.showError = false
          this.errorMsg = ''
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
              let msg = ''

              res.forEach((r, i) => {
                if (r.code === 200) {
                  tableData.forEach(t => {
                    const find = r.data.result.find(d => d.appSubcategory === t.appSubcategory)
                    t[keyPre[i] + 'Score'] = find
                  })
                } else {
                  this.showError = true
                  msg = msg + ',' + r.message
                  if (msg.indexOf(',') === 0) {
                    msg = msg.substring(1, msg.length)
                  }
                  if (msg.lastIndexOf(',') === msg.length - 1) {
                    msg = msg.substring(0, msg.length - 1)
                  }
                  this.errorMsg = msg
                }
              })
              tableData.forEach(t => {
                const data = {
                  establishLatencyMs: t.tcpScore ? t.tcpScore.establishLatencyMs : null,
                  httpResponseLatency: t.httpScore ? t.httpScore.httpResponseLatency : null,
                  sslConLatency: t.sslScore ? t.sslScore.sslConLatency : null,
                  tcpLostlenPercent: t.tcpLostScore ? t.tcpLostScore.tcpLostlenPercent : null,
                  pktRetransPercent: t.packetRetransScore ? t.packetRetransScore.pktRetransPercent : null
                }
                t.score = computeScore(data)
              })
              this.tableData = tableData
            }).finally(() => {
              this.toggleLoading(false)
            })
          } else {
            this.tableData = []
            this.isNoData = true
            this.toggleLoading(false)
          }
        } else {
          this.toggleLoading(false)
          this.showError = true
          this.errorMsg = ''
          let msg = res[0].message + ', ' + res[1].message
          if (msg.indexOf(',') === 0) {
            msg = msg.substring(1, msg.length)
          }
          if (msg.lastIndexOf(',') === msg.length - 1) {
            msg = msg.substring(0, msg.length - 1)
          }
          this.errorMsg = msg
        }
      }).catch(e => {
        console.error(e)
        this.toggleLoading(false)
        this.showError = true
        this.errorMsg = ''
        this.errorMsg = e.message
      })
    },
    getUrlParam (param, defaultValue, isNumber) {
      if (isNumber) {
        return this.$route.query[param] ? Number(this.$route.query[param]) : defaultValue
      } else {
        return this.$route.query[param] ? this.$route.query[param] : defaultValue
      }
    },
    async drillDownData (key) {
      const value = npmCategoryToAppCategoryMap[key]
      const tabType = 'network.applicationCategories'
      const oldCurTab = this.getUrlParam(this.curTabState.networkOverviewBeforeTab, '')
      const curTable = networkTable.networkAppPerformance
      const tableType = this.$route.params ? this.$route.params.typeName : 'networkOverview'
      const metric = this.getUrlParam(this.curTabState.tableMetric, 'Bits/s')
      const list = await getUserDrilldownTableConfig(tableType, metric)
      const tabGroup = list.filter(item => item.label === tabType)
      if (tabGroup && tabGroup.length > 0) {
        this.urlChangeParams[this.curTabState.networkOverviewBeforeTab] = tabGroup[0].prop
      }
      this.urlChangeParams[this.curTabState.tabOperationBeforeType] = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      this.urlChangeParams[this.curTabState.tabOperationType] = operationType.fourthMenu

      const queryCondition = []
      const searchProps = tabGroup[0].dillDownProp
      searchProps.forEach(item => {
        queryCondition.push(item + "='" + value + "'")
      })
      this.urlChangeParams[this.curTabState.queryCondition] = queryCondition.join(' OR ')

      this.$store.getters.menuList.forEach(menu => {
        if (this.$_.isEmpty(menu.children) && menu.route) {
          if (this.$route.path === menu.route) {
            menu.columnName = tabType
            menu.columnValue = value
            this.urlChangeParams[this.curTabState.panelName] = value
            this.urlChangeParams[this.curTabState.thirdMenu] = tabType
            this.urlChangeParams[this.curTabState.dimensionType] = tabGroup[0] ? tabGroup[0].prop : ''
            this.urlChangeParams[this.curTabState.fourthMenu] = value
          }
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            if (this.$route.path === child.route) {
              child.columnName = tabType
              child.columnValue = value
              this.urlChangeParams[this.curTabState.panelName] = value
              this.urlChangeParams[this.curTabState.thirdMenu] = tabType
              this.urlChangeParams[this.curTabState.dimensionType] = tabGroup[0] ? tabGroup[0].prop : ''
              this.urlChangeParams[this.curTabState.fourthMenu] = value
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
        if (oldCurTab && (item.prop === oldCurTab)) {
          item.checked = true
        }
      })
      this.$store.commit('setNetworkOverviewTabList', list)
      const tabObjGroup = list.filter(item => item.checked)
      if (tabObjGroup && tabObjGroup.length > 0) {
        const curTab = tabObjGroup[0]
        this.urlChangeParams[this.curTabState.curTab] = curTab
      }
      this.changeUrlTabState()
      this.$router.push({
        query: {
          ...this.$route.query,
          thirdPanel: curTable.panelIdOfThirdMenu ? curTable.panelIdOfThirdMenu : '',
          fourthPanel: toPanel || '',
          t: +new Date()
        }
      })
    },
    changeUrlTabState () {
      if (this.urlChangeParams && JSON.stringify(this.urlChangeParams) !== '{}') {
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, this.urlChangeParams)
        overwriteUrl(newUrl)
      }
      this.urlChangeParams = {}
    }
  },
  mounted () {
    this.init()
  }
}
</script>
