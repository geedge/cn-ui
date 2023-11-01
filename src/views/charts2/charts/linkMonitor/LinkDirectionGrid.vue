<template>
  <div class="link-direction-grid">
    <!--左侧链路出入口-->
    <popover-content :title="$t('linkMonitor.egressLink') + ' & ' + $t('linkMonitor.ingressLink')" :isNoData="isLinkNoData" :gridData="linkGridData" :showError="isLinkShowError" :content="linkErrorMsg" style="width: 900px;"/>

    <!--右侧链路下一跳-->
    <popover-content :title="$t('linkMonitor.nextHopInternetOfGrid')" :isNoData="isNextNoData" :gridData="nextGridData" :showError="isNextShowError" :content="nextErrorMsg" />
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import { storageKey } from '@/utils/constants'
import PopoverContent from './LinkDirectionGrid/PopoverContent'
import { computeScore } from '@/utils/tools'
import axios from 'axios'
import _ from 'lodash'

export default {
  name: 'LinkDirectionGrid',
  mixins: [chartMixin],
  data () {
    return {
      linkGridData: [],
      nextGridData: [],
      isLinkNoData: false,
      isNextNoData: false,
      isLinkShowError: false, // 显示左侧链路报错标识
      linkErrorMsg: '', // 左侧链路的报错信息
      isNextShowError: false, // 显示右侧下一跳报错标识
      nextErrorMsg: '', // 右侧下一跳的报错信息
      scoreDataState: false // 评分数据是否加载完成
    }
  },
  components: {
    PopoverContent
  },
  watch: {
    timeFilter: {
      handler () {
        this.init()
      }
    },
    scoreBaseState (n) {
      if (n && this.scoreDataState) {
        this.handleScoreData(this.linkGridData)
        this.handleScoreData(this.nextGridData)
      }
    },
    scoreDataState (n) {
      if (n && this.scoreBaseState) {
        this.handleScoreData(this.linkGridData)
        this.handleScoreData(this.nextGridData)
      }
    }
  },
  computed: {
    scoreBaseState () {
      return this.$store.getters.scoreBaseReady
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.scoreDataState = false
      // 链路基本信息
      let linkInfo = localStorage.getItem(storageKey.linkInfo)
      linkInfo = JSON.parse(linkInfo)

      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      const dataRequest = axios.get(api.linkMonitor.bigramAnalysis, { params: params }).catch(e => {
        this.isLinkShowError = true
        this.isLinkNoData = false
        this.linkErrorMsg = this.errorMsgHandler(e)
      })
      const nextHopRequest = axios.get(api.linkMonitor.bigramNextHopAnalysis, { params: params }).catch(e => {
        this.isNextShowError = true
        this.isNextNoData = false
        this.nextErrorMsg = this.errorMsgHandler(e)
      })
      this.toggleLoading(true)

      Promise.all([dataRequest, nextHopRequest]).then(response => {
        if (response[0].status === 200 && response[1].status === 200) {
          const res = []
          res[0] = response[0].data
          res[1] = response[1].data
          if (response[0].status === 200) {
            this.isLinkShowError = false
            // 链路流量数据
            const linkData = res[0].data.result
            // 接口数据乱序，根据入链路id（inLinkId）大小排序之后，
            // 再根据同inLinkId下的outLinkId进行排序
            linkData.sort((a, b) => {
              if (a.inLinkId !== b.inLinkId) {
                return a.inLinkId - b.inLinkId
              }
              return a.outLinkId - b.outLinkId
            })

            this.isLinkNoData = linkData.length === 0
            if (!this.isLinkNoData) {
              // 链路流量数据
              const linkGridData = []
              // 默认构造10*10矩阵，根据行列键值进行填充，最后再删除空行空列
              linkInfo.forEach(link => {
                if (link.direction === 'in') {
                  const outList = []
                  linkInfo.forEach(link1 => {
                    if (link1.direction === 'out') {
                      outList.push({ linkId: link1.linkId, noData: true })
                    }
                  })
                  linkGridData.push({ linkId: link.linkId, out: outList })
                }
              })

              linkData.forEach(d => {
                const inLink = linkInfo.find(l => l.originalLinkId === d.inLinkId)
                const outLink = linkInfo.find(l => l.originalLinkId === d.outLinkId)
                if (inLink && outLink) {
                  // 上行使用情况计算
                  const outUsage = this.computeUsage(d.outBitsRate, outLink.bandwidth)
                  // 下行使用情况计算
                  const inUsage = this.computeUsage(d.inBitsRate, inLink.bandwidth)
                  // 宽带使用超过90%，赋红点

                  d.usageMore90 = outUsage >= 0.9 || inUsage >= 0.9
                  // 计算npm分数
                  // 分数低于3分，赋红点
                  // d.score = this.localComputeScore(d)

                  // d.scoreLow3 = d.score < 3 || d.score === '-'

                  const xAxis = inLink.linkId.split('Hundredgige').pop() - 1
                  const yAxis = outLink.linkId.split('Hundredgige').pop() - 1
                  linkGridData[xAxis].out[yAxis] = {
                    noData: false,
                    linkId: outLink.linkId,
                    outUsage: outUsage,
                    inUsage: inUsage,
                    popoverWidth: this.computeWidth(outUsage, inUsage, 'popover'),
                    valueWidth: this.computeWidth(outUsage, inUsage, 'value'),
                    totalBitsRate: d.totalBitsRate,
                    ...d
                  }
                }
              })

              // 一行如果无数据，则删除该行，默认10*10矩阵
              const rowXIndex = 0
              this.handleXRowNoData(linkGridData, rowXIndex)
              // 一列如果无数据，则删除该列，默认10*10矩阵
              const rowYIndex = 0
              this.handleYRowNoData(linkGridData, rowYIndex)
              this.isLinkNoData = linkGridData.length === 0
              this.linkGridData = linkGridData
            }
          } else {
            this.isLinkNoData = true
            this.isLinkShowError = true
            this.linkErrorMsg = this.errorMsgHandler(res[0])
          }

          if (response[1].status === 200) {
            this.isNextShowError = false

            // 链路下一跳信息
            const nextLinkData = res[1].data.result
            // 接口数据乱序，根据入方向排序，再根据同个入方向下的出方向进行排序
            nextLinkData.sort((a, b) => {
              if (a.inLinkDirection !== b.inLinkDirection) {
                return a.inLinkDirection.localeCompare(b.inLinkDirection, 'zh')
              }
              return a.outLinkDirection.localeCompare(b.outLinkDirection, 'zh')
            })

            this.isNextNoData = nextLinkData.length === 0
            if (!this.isNextNoData) {
              // 链路下一跳数据
              let nextGridData = []
              const nextGridTemplate = [
                { linkId: 'Hundredgige2', nextHop: 'City2', out: [] },
                { linkId: 'Hundredgige1', nextHop: 'City1', out: [] },
                { linkId: 'Hundredgige4', nextHop: 'City3', out: [] }
              ]
              nextGridData = JSON.parse(JSON.stringify(nextGridTemplate))
              nextGridData.forEach(link => {
                link.out = JSON.parse(JSON.stringify(nextGridTemplate))
                link.out.forEach(link1 => {
                  link1.noData = true
                  link1.coordinate = `${link.linkId}-${link1.linkId}`
                  delete link1.out
                })
              })

              nextLinkData.forEach(d => {
                const inLink = linkInfo.find(l => l.nextHop === d.inLinkDirection && l.direction === 'in')
                const outLink = linkInfo.find(l => l.nextHop === d.outLinkDirection && l.direction === 'out')

                if (inLink && outLink) {
                  // const data = nextGridData.find(g => g.linkId === inLink.linkId)

                  let outBandwidth = 0
                  let inBandwidth = 0
                  linkInfo.forEach((item) => {
                    if (item.nextHop === d.outLinkDirection && item.direction === 'out') {
                      outBandwidth += item.bandwidth
                    }
                    if (item.nextHop === d.inLinkDirection && item.direction === 'in') {
                      inBandwidth += item.bandwidth
                    }
                  })

                  // 上行使用情况计算
                  const outUsage = this.computeUsage(d.outBitsRate, outBandwidth)
                  // 下行使用情况计算
                  const inUsage = this.computeUsage(d.inBitsRate, inBandwidth)
                  // 宽带使用超过90%，赋红点

                  d.usageMore90 = outUsage >= 0.9 || inUsage >= 0.9
                  // 计算npm分数
                  // 分数低于3分，赋红点
                  // d.score = this.localComputeScore(d)

                  // d.scoreLow3 = d.score < 3 || d.score === '-'

                  const xAxis = inLink.linkId
                  const yAxis = outLink.linkId
                  nextGridData.forEach((link, index) => {
                    link.out.forEach((link1, index1) => {
                      if (link1.coordinate === (xAxis + '-' + yAxis)) {
                        nextGridData[index].out[index1] = {
                          coordinate: link1.coordinate,
                          noData: false,
                          linkId: outLink.linkId,
                          nextHop: outLink.nextHop,
                          outUsage: outUsage,
                          inUsage: inUsage,
                          popoverWidth: this.computeWidth(outUsage, inUsage, 'popover'),
                          valueWidth: this.computeWidth(outUsage, inUsage, 'value'),
                          totalBitsRate: d.totalBitsRate,
                          ...d
                        }
                      }
                    })
                  })
                }
              })

              // 一行如果无数据，则删除该行，默认3*3矩阵
              const rowXIndex = 0
              this.handleXRowNoData(nextGridData, rowXIndex)
              // 一列如果无数据，则删除该列，默认3*3矩阵
              const rowYIndex = 0
              this.handleYRowNoData(nextGridData, rowYIndex)

              this.isNextNoData = nextGridData.length === 0
              this.nextGridData = nextGridData
            }
          } else {
            this.isNextNoData = true
            this.isNextShowError = true
            this.nextErrorMsg = this.errorMsgHandler(res[1])
          }
        }
      }).finally(() => {
        this.scoreDataState = true
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
    localComputeScore (data) {
      let score = 0
      const dataScore = {
        establishLatencyMs: _.get(data, 'establishLatencyMs', null),
        httpResponseLatency: _.get(data, 'httpResponseLatency', null),
        sslConLatency: _.get(data, 'sslConLatency', null),
        tcpLostlenPercent: _.get(data, 'tcpLostlenPercent', null),
        pktRetransPercent: _.get(data, 'pktRetransPercent', null)
      }
      score = computeScore(dataScore)
      return score
    },
    handleScoreData (data) {
      data.forEach(d => {
        if (d.out) {
          d.out.forEach(t => {
            const data = {
              establishLatencyMs: t.establishLatencyMs,
              httpResponseLatency: t.httpResponseLatency,
              sslConLatency: t.sslConLatency,
              tcpLostlenPercent: t.tcpLostlenPercent,
              pktRetransPercent: t.pktRetransPercent
            }
            t.score = computeScore(data, this.$store.getters.getScoreBase)
            t.scoreLow3 = t.score < 3 || t.score === '-'
          })
        }
      })
    },
    /**
     * 计算popover弹窗和右侧数据模块的宽度
     * 弹窗最小宽度为360px，右侧数据最小宽度为75px，右侧数据每大一位，popover弹窗宽度增加7px
     */
    computeWidth (out, _in, flag) {
      let width = 0
      let length = 0

      let outUsage = ''
      let inUsage = ''

      if (out < 0.0001 && out !== 0) {
        outUsage = '<0.01%'
      } else {
        outUsage = JSON.stringify(parseFloat((out * 100).toFixed(2)))
      }
      if (_in < 0.0001 && _in !== 0) {
        inUsage = '<0.01%'
      } else {
        inUsage = JSON.stringify(parseFloat((_in * 100).toFixed(2)))
      }

      length = outUsage.length + inUsage.length - 1

      if (flag === 'popover') {
        width = 360 + length * 7
      } else {
        width = 75 + length * 7
      }

      return width
    },
    /**
     * 删除空行
     * @param data
     * @param index
     */
    handleXRowNoData (data, index) {
      if (data) {
        const item = data[index]
        let tempList = []
        if (item) {
          tempList = item.out.filter(l => l.noData)
          // 如果该行数据都为空，则删除该行
          if (tempList.length === item.out.length) {
            data.splice(index, 1)
            this.handleXRowNoData(data, index)
          } else if (index < (data.length - 2)) {
            index = index + 1
            this.handleXRowNoData(data, index)
          }
        }
      }
    },
    /**
     * 删除空列
     * @param data
     * @param index
     */
    handleYRowNoData (data, index) {
      const rowList = []
      if (data) {
        data.forEach(item => {
          if (item.out[index]) {
            if (item.out[index].noData) {
              rowList.push(item.out[index].noData)
            }
          }
        })

        if (rowList.length === data.length) {
          data.forEach(item => {
            item.out.splice(index, 1)
          })
          this.handleYRowNoData(data, index)
        } else if (index < (data[0].out.length - 1)) {
          this.handleYRowNoData(data, index + 1)
        }
      }
    }
  }
}
</script>
