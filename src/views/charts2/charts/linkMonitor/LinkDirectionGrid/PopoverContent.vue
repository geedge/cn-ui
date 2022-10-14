<template>
  <div class="link-statistical-dimension" style="position: relative">
    <div class="dimension-title">{{ $t('linkMonitor.egressLink') }}&nbsp;&&nbsp;{{ $t('linkMonitor.ingressLink') }}
    </div>

    <chart-no-data v-if="isNoData"></chart-no-data>

    <div class="data-grid" v-show="!isNoData">
      <div class="egress-row">
        <div class="egress-id" v-for="(item, index) in gridData" :key="index">
          <!--兼容下一跳情况-->
          <span v-if="item.nextHop">{{ item.nextHop }}</span>
          <span v-else>{{ item.linkId }}</span>
        </div>
      </div>
      <div class="data-row" v-for="(row, index2) in gridData" :key="index2">
        <div class="ingress-id">
          <!--兼容下一跳情况-->
          <span v-if="row.nextHop">{{ row.nextHop }}</span>
          <span v-else>{{ row.linkId }}</span>
        </div>
        <div v-for="(item, index2) in row.egress" :key="index2">

          <el-popover :width="item.popoverWidth" placement="right" trigger="click">
            <template #reference>
              <div class="data-item data-item__hover">
                <div :class="row.egress[index2].usageMore90 ? 'data-item__point-red':'data-item__point'"></div>
                <div :class="row.egress[index2].scoreLow3 ? 'data-item__point-red':'data-item__point'"></div>
              </div>
            </template>

            <!--鼠标移动的弹窗模块-->
            <template #default>
              <div class="item-popover-header">
                <!--兼容下一跳情况-->
                <span v-if="row.nextHop">{{ row.nextHop }}</span>
                <span v-else>{{ row.linkId }}</span>
                <svg class="icon item-popover-header-icon" aria-hidden="true">
                  <use xlink:href="#cn-icon-arrow-right2"></use>
                </svg>
                <span v-if="row.nextHop">{{ row.egress[index2].egressLinkDirection }}</span>
                <span v-else>{{ row.egress[index2].linkId }}</span>
              </div>

              <div class="item-popover-block">
                <div class="item-popover-block-title">{{ $t('linkMonitor.traffic') }}</div>

                <div style="display: flex">
                  <div class="row-dot">
                    <div :class="row.egress[index2].usageMore90 ? 'red-dot':'green-dot'"></div>
                  </div>
                  <div class="item-popover-block-content">
                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.bandwidthUsage') }}</div>

                      <div class="block-content-item-value" :style="{width: row.egress[index2].valueWidth + 'px'}">
                        <div style="margin-left: -10px">
                          <svg class="icon item-popover-up" aria-hidden="true">
                            <use xlink:href="#cn-icon-egress"></use>
                          </svg>
                          {{ unitConvert(row.egress[index2].egressUsage, unitTypes.percent).join('') }}
                        </div>
                        <div>
                          <svg class="icon item-popover-down" aria-hidden="true">
                            <use xlink:href="#cn-icon-ingress"></use>
                          </svg>
                          {{ unitConvert(row.egress[index2].ingressUsage, unitTypes.percent).join('') }}
                        </div>
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.linkBlock.total') }}</div>

                      <div class="block-content-item-value" :style="{width: row.egress[index2].valueWidth + 'px'}">
                        {{unitConvert(row.egress[index2].totalBitsRate, unitTypes.bps).join('')}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="item-popover-block">
                <div class="item-popover-block-title">{{ $t('linkMonitor.performance') }}</div>

                <div style="display: flex">
                  <div class="row-dot">
                    <div :class="row.egress[index2].scoreLow3 ? 'red-dot':'green-dot'"></div>
                  </div>
                  <div class="item-popover-block-content">
                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.npmScore1') }}</div>
                      <div class="block-content-item-value" :style="{width: row.egress[index2].valueWidth + 'px'}">
                        {{ row.egress[index2].score }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[0].name) }}</div>
                      <div class="block-content-item-value" :style="{width: row.egress[index2].valueWidth + 'px'}">
                        {{ unitConvert(row.egress[index2].establishLatencyMs, unitTypes.time).join('') }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[1].name) }}</div>
                      <div class="block-content-item-value" :style="{'width': row.egress[index2].valueWidth + 'px'}">
                        {{ unitConvert(row.egress[index2].httpResponseLatency, unitTypes.time).join('') }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[2].name) }}</div>
                      <div class="block-content-item-value" :style="{width: row.egress[index2].valueWidth + 'px'}">
                        {{ unitConvert(row.egress[index2].sslConLatency, unitTypes.time).join('') }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[3].name) }}</div>
                      <div class="block-content-item-value" :style="{width: row.egress[index2].valueWidth + 'px'}">
                        {{ unitConvert(row.egress[index2].tcpLostlenPercent, unitTypes.percent).join('') }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[4].name) }}</div>
                      <div class="block-content-item-value" :style="{width: row.egress[index2].valueWidth + 'px'}">
                        {{ unitConvert(row.egress[index2].pktRetransPercent, unitTypes.percent).join('') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-popover>

        </div>
      </div>
    </div>
  </div>

</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import ChartNoData from '@/views/charts/charts/ChartNoData'
export default {
  name: 'PopoverContent',
  props: {
    gridData: Array,
    isNoData: Boolean
  },
  components: {
    ChartNoData
  },
  data () {
    return {
      unitConvert,
      unitTypes,
      npmNetworkName: [
        { name: 'networkAppPerformance.tcpConnectionEstablishLatency' },
        { name: 'networkAppPerformance.httpResponse' },
        { name: 'networkAppPerformance.sslResponseLatency' },
        { name: 'networkAppPerformance.packetLoss' },
        { name: 'overall.packetRetrans' }
      ]
    }
  }
}
</script>
