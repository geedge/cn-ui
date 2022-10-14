<template>
  <div class="link-direction-grid">
    <!--左侧链路出入口-->
    <popover-content :isNoData="isNoData" :gridData="gridData" style="width: 900px;"/>

    <!--右侧链路下一跳-->
    <popover-content :isNoData="isNoData" :gridData="gridData2"/>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import { get } from '@/utils/http'
import { storageKey } from '@/utils/constants'
import PopoverContent from './LinkDirectionGrid/PopoverContent'
import { computeScore } from '@/utils/tools'

export default {
  name: 'LinkDirectionGrid',
  mixins: [chartMixin],
  data () {
    return {
      gridData: [],
      gridData2: [],
      isNoData: false
    }
  },
  components: {
    PopoverContent
  },
  watch: {
    timeFilter: {
      handler (n) {
        this.init()
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 链路基本信息
      let linkInfo = localStorage.getItem(storageKey.linkInfo)
      linkInfo = JSON.parse(linkInfo)
      // console.log('LinkDirectionGrid.vue---init--获取链路基本信息缓存', linkInfo)

      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      const dataRequest = get(api.linkMonitor.bigramAnalysis, params)
      const nextHopRequest = get(api.linkMonitor.bigramNextHopAnalysis, params)
      this.toggleLoading(true)

      Promise.all([dataRequest, nextHopRequest]).then(res => {
        if (res[0].code === 200 && res[1].code === 200) {
          // 链路流量数据
          const linkData = res[0].data.result
          // 接口数据乱序，根据入链路id（ingressLinkId）大小排序之后，
          // 再根据同ingressLinkId下的egressLinkId进行排序
          linkData.sort((a, b) => {
            if (a.ingressLinkId != b.ingressLinkId) {
              return a.ingressLinkId - b.ingressLinkId
            }
            return a.egressLinkId - b.egressLinkId
          })

          // 链路下一跳信息
          const nextLinkData = res[1].data.result
          // 接口数据乱序，根据出方向排序，再根据同个出方向下的入进行排序
          nextLinkData.sort((a, b) => {
            if (a.ingressLinkDirection != b.ingressLinkDirection) {
              return a.ingressLinkDirection.localeCompare(b.ingressLinkDirection)
            }
            return a.egressLinkDirection.localeCompare(b.egressLinkDirection)
          })

          this.isNoData = linkData.length === 0 && nextLinkData.length === 0
          if (this.isNoData) {
            return
          }

          // 链路流量数据
          const gridData = []
          // 链路下一跳数据
          const gridData2 = []
          linkData.forEach(d => {
            const ingressLink = linkInfo.find(l => l.originalLinkId === d.ingressLinkId)
            const egressLink = linkInfo.find(l => l.originalLinkId === d.egressLinkId)
            if (ingressLink && egressLink) {
              const data = gridData.find(g => g.linkId === ingressLink.linkId)

              // 上行使用情况计算
              const egressUsage = this.computeUsage(d.egressBytes, egressLink.bandwidth)
              // 下行使用情况计算
              const ingressUsage = this.computeUsage(d.ingressBytes, ingressLink.bandwidth)
              // 宽带使用超过90%，赋红点
              d.usageMore90 = false
              if (egressUsage >= 0.9 || ingressUsage >= 0.9) {
                d.usageMore90 = true
              }
              // 计算npm分数
              // 分数低于3分，赋红点
              d.score = this.localComputeScore(d)
              d.scoreLow3 = false
              if (d.score < 3) {
                d.scoreLow3 = true
              }

              if (data) {
                const existedEgressLink = data.egress.find(e => e.linkId === egressLink.linkId)
                if (!existedEgressLink) {
                  data.egress.push({
                    linkId: egressLink.linkId,
                    egressUsage: egressUsage,
                    ingressUsage: ingressUsage,
                    totalBytes: d.totalBytes,
                    ...d
                  })
                }
              } else {
                gridData.push({
                  linkId: ingressLink.linkId,
                  egress: [{
                    linkId: egressLink.linkId,
                    egressUsage: egressUsage,
                    ingressUsage: ingressUsage,
                    totalBytes: d.totalBytes,
                    ...d
                  }]
                })
              }
            }
          })

          this.gridData = gridData

          nextLinkData.forEach(d => {
            const ingressLink = linkInfo.find(l => l.nextHop === d.ingressLinkDirection && l.direction === 'ingress')
            const egressLink = linkInfo.find(l => l.nextHop === d.egressLinkDirection && l.direction === 'egress')

            if (ingressLink && egressLink) {
              const data = gridData2.find(g => g.linkId === ingressLink.linkId)

              let egressBanwidth = 0
              let ingressBanwidth = 0
              linkInfo.forEach((item) => {
                if (item.nextHop === d.egressLinkDirection && item.direction === 'egress') {
                  egressBanwidth += item.bandwidth
                }
                if (item.nextHop === d.ingressLinkDirection && item.direction === 'ingress') {
                  ingressBanwidth += item.bandwidth
                }
              })

              // 上行使用情况计算
              const egressUsage = this.computeUsage(d.egressBytes, egressBanwidth)
              // 下行使用情况计算
              const ingressUsage = this.computeUsage(d.ingressBytes, ingressBanwidth)
              // 宽带使用超过90%，赋红点
              d.usageMore90 = false
              if (egressUsage >= 0.9 || ingressUsage >= 0.9) {
                d.usageMore90 = true
              }
              // 计算npm分数
              // 分数低于3分，赋红点
              d.score = this.localComputeScore(d)
              d.scoreLow3 = false
              if (d.score < 3) {
                d.scoreLow3 = true
              }

              if (data) {
                const existedEgressLink = data.egress.find(e => e.linkId === egressLink.linkId)
                if (!existedEgressLink) {
                  data.egress.push({
                    linkId: egressLink.linkId,
                    nextHop: egressLink.nextHop,
                    egressUsage: egressUsage,
                    ingressUsage: ingressUsage,
                    totalBytes: d.totalBytes,
                    ...d
                  })
                }
              } else {
                gridData2.push({
                  linkId: ingressLink.linkId,
                  nextHop: ingressLink.nextHop,
                  egress: [{
                    linkId: egressLink.linkId,
                    nextHop: ingressLink.nextHop,
                    egressUsage: egressUsage,
                    ingressUsage: ingressUsage,
                    totalBytes: d.totalBytes,
                    ...d
                  }]
                })
              }
            }
          })

          this.gridData2 = gridData2
        } else {
          this.isNoData = true
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    /**
     * 计算上下行使用占比
     */
    computeUsage (e, bandwidth) {
      let usage = e / bandwidth
      if (usage >= 1) {
        usage = 1
      }
      return usage
    },
    /**
     * 本地计算npm分数
     */
    localComputeScore (data, bandwidth) {
      const keyPre = ['tcp', 'http', 'ssl', 'tcpLost', 'packetRetrans']
      let score = 0
      keyPre.forEach((item, index) => {
        score = computeScore(data, index)
        data[keyPre[index] + 'Score'] = score
      })
      let npmScore = Math.ceil((data.tcpScore + data.httpScore + data.sslScore + data.tcpLostScore + data.packetRetransScore) * 6)
      if (npmScore > 6) {
        npmScore = 6
      }
      return npmScore
    }
  }
}
</script>
