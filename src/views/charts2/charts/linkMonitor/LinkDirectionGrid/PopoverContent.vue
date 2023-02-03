<template>
  <div class="link-statistical-dimension" style="position: relative">
    <div class="dimension-title" v-if="gridData.length>3">{{ $t('linkMonitor.egressLink') }}&nbsp;&&nbsp;{{ $t('linkMonitor.ingressLink') }}</div>
    <div class="dimension-title" v-else>{{ $t('linkMonitor.nextHopInternetOfGrid') }}</div>

    <chart-no-data v-if="isNoData"></chart-no-data>

    <chart-error class="link-block-error" v-if="showError" :content="content"/>

    <div class="data-grid" v-show="!isNoData && !showError">
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
        <div v-for="(item, index3) in row.egress" :key="index3">

          <el-popover :width="item.popoverWidth" placement="right" trigger="click">
            <template #reference>
              <div class="data-item data-item__hover">
                <div :class="item.usageMore90 ? 'data-item__point-red':'data-item__point'"></div>
                <div :class="item.scoreLow3 ? 'data-item__point-red':'data-item__point'"></div>
              </div>
            </template>

            <!--鼠标移动的弹窗模块-->
            <template #default>
              <div class="item-popover-header">
                <!--兼容下一跳情况-->
                <span v-if="row.nextHop" :test-id="`toNextHop${index2+1}`">{{ row.nextHop }}</span>
                <span v-else :test-id="`fromLinkId${index2+1}`">{{ row.linkId }}</span>
                <svg class="icon item-popover-header-icon" aria-hidden="true">
                  <use xlink:href="#cn-icon-arrow-right2"></use>
                </svg>
                <span v-if="row.nextHop" :test-id="`toNextHop${index3+1}`">{{ item.egressLinkDirection }}</span>
                <span v-else :test-id="`toLinkId${index3+1}`">{{ item.linkId }}</span>
              </div>

              <div class="item-popover-block">
                <div class="item-popover-block-title">{{ $t('linkMonitor.traffic') }}</div>

                <div style="display: flex">
                  <div class="row-dot">
                    <div :class="item.usageMore90 ? 'red-dot':'green-dot'"></div>
                  </div>
                  <div class="item-popover-block-content">
                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.bandwidthUsage') }}</div>

                      <div class="block-content-item-value" :style="{width: item.valueWidth + 'px'}">
                        <div :test-id="`egressUsage${gridData.length}-${index2+1}-${index3+1}`" style="margin-left: -10px">
                          <svg class="icon item-popover-up" aria-hidden="true">
                            <use xlink:href="#cn-icon-egress"></use>
                          </svg>
                          {{ convertValue(item.egressUsage) }}
                        </div>
                        <div :test-id="`ingressUsage${gridData.length}-${index2+1}-${index3+1}`">
                          <svg class="icon item-popover-down" aria-hidden="true">
                            <use xlink:href="#cn-icon-ingress"></use>
                          </svg>
                          {{ convertValue(item.ingressUsage) }}
                        </div>
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.linkBlock.total') }}</div>

                      <div :test-id="`totalBitsRate${gridData.length}-${index2+1}-${index3+1}`" class="block-content-item-value" :style="{width: item.valueWidth + 'px'}">
                        {{ unitConvert(item.totalBitsRate, unitTypes.bps).join('') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="item-popover-block">
                <div class="item-popover-block-title">{{ $t('linkMonitor.performance') }}</div>

                <div style="display: flex">
                  <div class="row-dot">
                    <div :class="item.scoreLow3 ? 'red-dot':'green-dot'"></div>
                  </div>
                  <div class="item-popover-block-content">
                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.npmScore1') }}</div>
                      <div :test-id="`score${gridData.length}-${index2+1}-${index3+1}`" class="block-content-item-value" :style="{width: item.valueWidth + 'px'}">
                        {{ item.score }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[0].name) }}</div>
                      <div :test-id="`tcp${gridData.length}-${index2+1}-${index3+1}`" class="block-content-item-value" :style="{width: item.valueWidth + 'px'}">
                        {{ unitConvert(item.establishLatencyMs, unitTypes.time).join('') }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[1].name) }}</div>
                      <div :test-id="`http${gridData.length}-${index2+1}-${index3+1}`" class="block-content-item-value" :style="{'width': item.valueWidth + 'px'}">
                        {{ unitConvert(item.httpResponseLatency, unitTypes.time).join('') }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[2].name) }}</div>
                      <div :test-id="`ssl${gridData.length}-${index2+1}-${index3+1}`" class="block-content-item-value" :style="{width: item.valueWidth + 'px'}">
                        {{ unitConvert(item.sslConLatency, unitTypes.time).join('') }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[3].name) }}</div>
                      <div :test-id="`packetLoss${gridData.length}-${index2+1}-${index3+1}`" class="block-content-item-value" :style="{width: item.valueWidth + 'px'}">
                        {{ unitConvert(item.tcpLostlenPercent, unitTypes.percent).join('') }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[4].name) }}</div>
                      <div :test-id="`packetRetrans${gridData.length}-${index2+1}-${index3+1}`" class="block-content-item-value" :style="{width: item.valueWidth + 'px'}">
                        {{ unitConvert(item.pktRetransPercent, unitTypes.percent).join('') }}
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
import ChartError from '@/components/common/Error'

export default {
  name: 'PopoverContent',
  props: {
    gridData: Array,
    isNoData: Boolean,
    showError: Boolean,
    content: String
  },
  components: {
    ChartError,
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
  },
  methods: {
    /**
     * 对单位进行转换，值小于0.0001的显示为<0.01%，除此之外正常转换显示
     * @param value
     * @returns {string}
     */
    convertValue (value) {
      let newValue = null
      if (value < 0.0001 && value !== 0) {
        newValue = '< 0.01%'
      } else {
        newValue = unitConvert(value, unitTypes.percent).join('')
      }

      return newValue
    }
  }
}
</script>
