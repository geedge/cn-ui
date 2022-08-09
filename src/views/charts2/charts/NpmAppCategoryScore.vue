<template>
  <div class="npm-app">
<!--    <div class="npm-app-left">
      <div class="npm-app-letter">
        <div v-for="(letter, index) in colorPatchData" :key="index">
          {{letter.letter}}
        </div>
      </div>
      <div class="npm-app-body">
        <div class="npm-app-body-patch">
          <div class="npm-app-body-icon"><span><i class="cn-icon cn-icon-video"></i></span></div>
          <div class="npm-app-body-color" v-for="(item, index) in 6" :key="index" :class="{'score-color': tableData[0].score >= index + 1}"></div>
        </div>
        <div class="npm-app-body-patch">
          <div class="npm-app-body-icon"><span><i class="cn-icon cn-icon-social-network"></i></span></div>
          <div class="npm-app-body-color" v-for="(item, index) in 6" :key="index" :class="{'score-color': tableData[1].score >= index + 1}"></div>
        </div>
        <div class="npm-app-body-patch">
          <div class="npm-app-body-icon"><span><i class="cn-icon cn-icon-file-sharing"></i></span></div>
          <div class="npm-app-body-color" v-for="(item, index) in 6" :key="index" :class="{'score-color': tableData[2].score >= index + 1}"></div>
        </div>
        <div class="npm-app-body-patch">
          <div class="npm-app-body-icon"><span><i class="cn-icon cn-icon-gaming"></i></span></div>
          <div class="npm-app-body-color" v-for="(item, index) in 6" :key="index" :class="{'score-color': tableData[3].score >= index + 1}"></div>
        </div>
        <div class="npm-app-body-patch">
          <div class="npm-app-body-icon"><span><i class="cn-icon cn-icon-email"></i></span></div>
          <div class="npm-app-body-color" v-for="(item, index) in 6" :key="index" :class="{'score-color': tableData[4].score >= index + 1}"></div>
        </div>
        <div class="npm-app-body-patch">
          <div class="npm-app-body-icon"><span><i class="cn-icon cn-icon-voip"></i></span></div>
          <div class="npm-app-body-color" v-for="(item, index) in 6" :key="index" :class="{'score-color': tableData[5].score >= index + 1}"></div>
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
                  <span class="data-total-category-value">{{$t(scope.row[item.prop])}}</span>
                </template>
                <template v-else-if="item.prop === 'total'">
                  {{unitConvert(scope.row[item.prop], unitTypes.bps).join('')}}
                  <div v-if="chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).value === 'up' && chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total !== 0" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total, unitTypes.percent).join('')}}
                  </div>
                  <div v-else-if="chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).value === 'down' && chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total !== 0" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;{{unitConvert(chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total, unitTypes.percent).join('')}}
                  </div>
                  <div v-else class="data-total-trend data-total-trend-black">
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                </template>
                <template v-else-if="item.prop === 'outbound'">
                  {{unitConvert(scope.row[item.prop], unitTypes.bps).join('')}}
                  <div v-if="chainCalculation(scope.row.outboundTrendValue, scope.row.pOutboundTrendValue).value === 'up' && chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total !== 0" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total, unitTypes.percent).join('')}}
                  </div>
                  <div v-else-if="chainCalculation(scope.row.outboundTrendValue, scope.row.pOutboundTrendValue).value === 'down' && chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total !== 0" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;{{unitConvert(chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total, unitTypes.percent).join('')}}
                  </div>
                  <div v-else class="data-total-trend data-total-trend-black">
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                </template>
                <template v-else-if="item.prop === 'inbound'">
                  {{unitConvert(scope.row[item.prop], unitTypes.bps).join('')}}
                  <div v-if="chainCalculation(scope.row.inboundTrendValue, scope.row.pInboundTrendValue).value === 'up' && chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total !== 0" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{unitConvert(chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total, unitTypes.percent).join('')}}
                  </div>
                  <div v-else-if="chainCalculation(scope.row.inboundTrendValue, scope.row.pInboundTrendValue).value === 'down' && chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total !== 0" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;{{unitConvert(chainCalculation(scope.row.totalTrendValue, scope.row.pTotalTrendValue).total, unitTypes.percent).join('')}}
                  </div>
                  <div v-else class="data-total-trend data-total-trend-black">
                    <i class="cn-icon-constant cn-icon"></i>
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
      </el-table>
    </div>-->
  </div>
</template>

<script>
import { unitTypes, npmCategoryInfoMapping } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import { getChainRatio } from '@/utils/tools'

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
      ]
    }
  },
  props: {
    timeFilter: Object
  },
  methods: {
    tableCellStyle ({ row, column, rowIndex, columnIndex }) {
      let style = 'border-right:0px;font-size:12px;padding:7px 0 !important;border-bottom: 1px solid #ECECEC;'
      if (rowIndex === this.tableData.length - 1) {
        style = style + 'border-bottom:0px !important;'
      }
      if (columnIndex === 0) {
        style = style + 'color:#046ECA;'
      }
      return style
    },
    tableHeaderCellStyle ({ row, column, rowIndex, columnIndex }) {
      return 'border-right:0px;font-size:12px;font-weight:500;padding:4px 0 !important;border-bottom: 1px solid #E2E5EC;'
    },
    chainCalculation (period, pperiod) {
      const periodicData = {}
      if (period > pperiod) {
        periodicData.value = 'up'
        periodicData.total = (period - pperiod) / pperiod
      } else if (period < pperiod) {
        periodicData.value = 'down'
        periodicData.total = (pperiod - period) / pperiod
      } else {
        periodicData.value = ''
        periodicData.total = 0
      }
      return periodicData
    },
    init (params) {
      if (!params) {
        params = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime)
        }
      }
      // 获取table后三列内容
      const currentTrafficRequest = get(api.npm.overview.appTrafficAnalysis, { ...params, cycle: 0 })
      const lastCycleTrafficRequest = get(api.npm.overview.appTrafficAnalysis, { ...params, cycle: 1 })
      Promise.all([currentTrafficRequest, lastCycleTrafficRequest]).then(res => {
        const prevData = res[1].data.result
        const data = res[0].data.result
        if (data && data.length > 0) {
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
              result.bytesRateChainRatio = prev.totalBitsRate === 0 ? '-' : getChainRatio(d.totalBitsRate, prev.totalBitsRate)
              result.inboundBytesRateChainRatio = prev.inboundBitsRate === 0 ? '-' : getChainRatio(d.inboundBitsRate, prev.inboundBitsRate)
              result.outboundBytesRateChainRatio = prev.outboundBitsRate === 0 ? '-' : getChainRatio(d.outboundBitsRate, prev.outboundBitsRate)
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
                    score = this.computeScore(find, i)
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
              t.score = (t.tcpScore + t.httpScore + t.sslScore + t.tcpLostScore + t.packetRetransScore) * 6
            })
            console.info(tableData)
          })
        }
      })
    },
    computeScore (data, index) {
      if (index === 0) {
        return 0.3 * (data.establishLatencyMs - 500) / (50 - 500)
      } else if (index === 1) {
        return 0.05 * (data.httpResponseLatency - 500) / (50 - 500)
      } else if (index === 2) {
        return 0.05 * (data.sslConLatency - 500) / (50 - 500)
      } else if (index === 3) {
        return 0.3 * (data.tcpLostlenPercent - 0.5) / (0.01 - 0.5)
      } else if (index === 4) {
        return 0.3 * (data.pktRetransPercent - 0.5) / (0.01 - 0.5)
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
