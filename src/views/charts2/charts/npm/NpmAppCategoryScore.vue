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
                  <span class="data-total-category-value">{{$t(scope.row.i18n)}}</span>
                </template>
                <template v-else-if="item.prop === 'total'">
                  {{unitConvert(scope.row.totalPacketsRate, unitTypes.bps).join('')}}
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
                </template>
                <template v-else-if="item.prop === 'outbound'">
                  {{unitConvert(scope.row.outboundPacketsRate, unitTypes.bps).join('')}}
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
                </template>
                <template v-else-if="item.prop === 'inbound'">
                  {{unitConvert(scope.row.inboundPacketsRate, unitTypes.bps).join('')}}
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
    </div>
  </div>
</template>

<script>
import { unitTypes, npmCategoryInfoMapping } from '@/utils/constants'
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
      ]
    }
  },
  mixins: [chartMixin],
  watch: {
    timeFilter: {
      deep: true,
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
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
