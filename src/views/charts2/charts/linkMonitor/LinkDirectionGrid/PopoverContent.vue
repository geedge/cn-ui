<template>
  <div class="link-statistical-dimension">
    <div class="dimension-title">{{ $t('linkMonitor.egressLink') }}&nbsp;&&nbsp;{{ $t('linkMonitor.ingressLink') }}
    </div>
    <div class="data-grid">
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

          <el-popover :width="370" placement="right" trigger="hover">
            <template #reference>
              <div class="data-item data-item__hover">
                <div :class="row.egress[index2].scoreLow3 ? 'data-item__point-red':'data-item__point'"></div>
                <div :class="row.egress[index2].usageMore90 ? 'data-item__point-red':'data-item__point'"></div>
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
                <span v-if="row.nextHop">{{ row.egress[index2].nextHop }}</span>
                <span v-else>{{ row.linkId }}</span>
              </div>

              <div class="item-popover-block">
                <div class="item-popover-block-title">{{ $t('linkMonitor.traffic') }}</div>

                <div style="display: flex">
                  <div class="row-dot">
                    <div :class="row.egress[index2].scoreLow3 ? 'red-dot':'green-dot'"></div>
                  </div>
                  <div class="item-popover-block-content">
                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.bandwidthUsage') }}</div>

                      <div class="block-content-item-value">
                        <div>
                          <svg class="icon item-popover-up" aria-hidden="true">
                            <use xlink:href="#cn-icon-egress"></use>
                          </svg>
                          {{ row.egress[index2].egressUsage }}%
                        </div>
                        <div>
                          <svg class="icon item-popover-down" aria-hidden="true">
                            <use xlink:href="#cn-icon-ingress"></use>
                          </svg>
                          {{ row.egress[index2].ingressUsage }}%
                        </div>
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.linkBlock.total') }}</div>

                      <div class="block-content-item-value">
                        {{ row.egress[index2].totalBytes / 1000 }}Mbps
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="item-popover-block">
                <div class="item-popover-block-title">{{ $t('linkMonitor.performance') }}</div>

                <div style="display: flex">
                  <div class="row-dot">
                    <div :class="row.egress[index2].usageMore90 ? 'red-dot':'green-dot'"></div>
                  </div>
                  <div class="item-popover-block-content">
                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t('linkMonitor.npmScore1') }}</div>
                      <div class="block-content-item-value">
                        {{ row.egress[index2].score }}
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[0].name) }}</div>
                      <div class="block-content-item-value">
                        {{ row.egress[index2].establishLatencyMs }}ms
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[1].name) }}</div>
                      <div class="block-content-item-value">
                        {{ row.egress[index2].httpResponseLatency }}ms
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[2].name) }}</div>
                      <div class="block-content-item-value">
                        {{ row.egress[index2].sslConLatency }}ms
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[3].name) }}</div>
                      <div class="block-content-item-value">
                        {{ row.egress[index2].tcpLostlenPercent * 100 }}%
                      </div>
                    </div>

                    <div class="block-content-item">
                      <div class="block-content-item-name">{{ $t(npmNetworkName[4].name) }}</div>
                      <div class="block-content-item-value">
                        {{ row.egress[index2].pktRetransPercent * 100 }}%
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
export default {
  name: 'PopoverContent',
  props: {
    gridData: Array
  },
  data () {
    return {
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
