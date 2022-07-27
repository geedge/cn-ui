<template>
  <div class="npm-app">
    <div class="npm-app-left">
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
                  <div v-if="scope.row.totalTrend === 'up'" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{parseInt(scope.row.totalTrendValue / scope.row.pTotalTrendValue)}}%
                  </div>
                  <div v-else-if="scope.row.totalTrend === 'down'" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;{{parseInt(scope.row.totalTrendValue / scope.row.pTotalTrendValue)}}%
                  </div>
                  <div v-else class="data-total-trend data-total-trend-black">
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                </template>
                <template v-else-if="item.prop === 'outbound'">
                  {{unitConvert(scope.row[item.prop], unitTypes.bps).join('')}}
                  <div v-if="scope.row.outboundTrend === 'up'" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{parseInt(scope.row.outboundTrendValue / scope.row.pOutboundTrendValue)}}%
                  </div>
                  <div v-else-if="scope.row.outboundTrend === 'down'" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;{{parseInt(scope.row.outboundTrendValue / scope.row.pOutboundTrendValue)}}%
                  </div>
                  <div v-else class="data-total-trend data-total-trend-black">
                    <i class="cn-icon-constant cn-icon"></i>
                  </div>
                </template>
                <template v-else-if="item.prop === 'inbound'">
                  {{unitConvert(scope.row[item.prop], unitTypes.bps).join('')}}
                  <div v-if="scope.row.inboundTrend === 'up'" class="data-total-trend data-total-trend-red">
                    <i class="cn-icon-rise1 cn-icon"></i>&nbsp;{{parseInt(scope.row.inboundTrendValue / scope.row.pInboundTrendValue)}}%
                  </div>
                  <div v-else-if="scope.row.inboundTrend === 'down'" class="data-total-trend data-total-trend-green">
                    <i class="cn-icon-decline cn-icon"></i>&nbsp;{{parseInt(scope.row.inboundTrendValue / scope.row.pInboundTrendValue)}}%
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
    </div>
  </div>
</template>

<script>
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
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
      tableData: [
        {
          category: 'network.video',
          score: 3,
          icon: 'cn-icon cn-icon-video',
          total: 10,
          totalTrend: 'up',
          inboundTrend: 'down',
          outboundTrend: '',
          totalTrendValue: 6,
          inboundTrendValue: 2,
          outboundTrendValue: 3,
          pTotalTrendValue: 5,
          pInboundTrendValue: 3,
          pOutboundTrendValue: 6,
          inbound: 0.1,
          outbound: 0.89
        },
        {
          category: 'network.socialNetwork',
          score: 2,
          icon: 'cn-icon cn-icon-social-network',
          total: 10,
          totalTrend: 'down',
          inboundTrend: 'down',
          outboundTrend: 'down',
          totalTrendValue: 6,
          inboundTrendValue: 2,
          outboundTrendValue: 3,
          pTotalTrendValue: 5,
          pInboundTrendValue: 3,
          pOutboundTrendValue: 6,
          inbound: 0.1,
          outbound: 0.89
        },
        {
          category: 'network.fileSharing',
          score: 1,
          icon: 'cn-icon cn-icon-file-sharing',
          total: 10,
          totalTrend: '',
          inboundTrend: '',
          totalTrendValue: 6,
          inboundTrendValue: 2,
          outboundTrendValue: 3,
          pTotalTrendValue: 5,
          pInboundTrendValue: 3,
          pOutboundTrendValue: 6,
          inbound: 0.1,
          outbound: 0.89
        },
        {
          category: 'network.gaming',
          score: 4,
          icon: 'cn-icon cn-icon-gaming',
          total: 10,
          totalTrend: 'up',
          inboundTrend: 'up',
          outboundTrend: '',
          totalTrendValue: 6,
          inboundTrendValue: 2,
          outboundTrendValue: 3,
          pTotalTrendValue: 5,
          pInboundTrendValue: 3,
          pOutboundTrendValue: 6,
          inbound: 0.1,
          outbound: 0.89
        },
        {
          category: 'network.email',
          score: 6,
          icon: 'cn-icon cn-icon-email',
          total: 10,
          totalTrend: 'down',
          inboundTrend: 'up',
          outboundTrend: 'down',
          totalTrendValue: 6,
          inboundTrendValue: 2,
          outboundTrendValue: 3,
          pTotalTrendValue: 5,
          pInboundTrendValue: 3,
          pOutboundTrendValue: 6,
          inbound: 0.1,
          outbound: 0.89
        },
        {
          category: 'network.voip',
          score: 5,
          icon: 'cn-icon cn-icon-voip',
          total: 10,
          totalTrend: 'down',
          inboundTrend: '',
          outboundTrend: 'down',
          totalTrendValue: 6,
          inboundTrendValue: 2,
          outboundTrendValue: 3,
          pTotalTrendValue: 5,
          pInboundTrendValue: 3,
          pOutboundTrendValue: 6,
          inbound: 0.1,
          outbound: 0.89
        }
      ],
      customTableTitles: [
        { label: 'network.category', prop: 'category' },
        { label: 'network.score', prop: 'score' },
        { label: 'network.total', prop: 'total' },
        { label: 'network.outbound', prop: 'outbound' },
        { label: 'network.inbound', prop: 'inbound' }
      ]
    }
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
    }
  }
}
</script>
