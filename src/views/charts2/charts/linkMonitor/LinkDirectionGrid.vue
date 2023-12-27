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
      // 获取缓存的链路配置
      let linkConfig = localStorage.getItem(storageKey.linkInfo)
      if (linkConfig) {
        linkConfig = JSON.parse(linkConfig)
      } else {
        this.isLinkShowError = true
        this.isNextShowError = true
        this.isLinkNoData = false
        this.isNextNoData = false
        this.linkErrorMsg = this.$t('tip.noLinkKnowledgeBaseFound')
        this.nextErrorMsg = this.$t('tip.noLinkKnowledgeBaseFound')
        return
      }
      // 根据配置判断是否是单向还是双向，只要有一条数据的direction=0或1，就视为双向。
      const isTwoWay = linkConfig.some(config => config.direction === 0 || config.direction === 1)
      /* 根据链路配置构造数据模型 */
      // 1.链路数据模型，根据interfaceName属性构造n*n矩阵，根据行列键值进行填充
      const linkGridData = []
      const interfaceNames = this.getNames(linkConfig)
      interfaceNames.forEach(name => {
        linkGridData.push({
          interfaceName: name,
          outList: interfaceNames.map(name1 => {
            return {
              interfaceName: name1,
              noData: true
            }
          })
        })
      })
      // 2.下一跳数据模型，根据peerCity属性构造n*n矩阵，根据行列键值进行填充
      const nextGridData = []
      const cities = this.getCities(linkConfig)
      cities.forEach(city => {
        nextGridData.push({
          peerCity: city,
          outList: cities.map(city1 => {
            return {
              peerCity: city1,
              noData: true
            }
          })
        })
      })

      /* 查数据 */
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      const dataRequest = axios.get(api.linkMonitor.bigramAnalysis, { params: params }).catch(e => {
        this.isLinkShowError = true
        this.isLinkNoData = false
        console.error(e)
        this.linkErrorMsg = this.errorMsgHandler(e)
      })
      const nextHopRequest = axios.get(api.linkMonitor.bigramNextHopAnalysis, { params: params }).catch(e => {
        this.isNextShowError = true
        this.isNextNoData = false
        console.error(e)
        this.nextErrorMsg = this.errorMsgHandler(e)
      })
      this.toggleLoading(true)

      Promise.all([dataRequest, nextHopRequest]).then(response => {
        if (response[0].status === 200 && response[1].status === 200) {
          const res = []
          res[0] = response[0].data
          // res[0] = bigramAnalysis.data
          res[1] = response[1].data
          // res[1] = bigramNextHopAnalysis.data
          if (response[0].status === 200) {
            this.isLinkShowError = false
            // 链路流量数据
            const linkData = res[0].data.result

            let isLinkNoData = linkData.length === 0

            if (!isLinkNoData) {
              linkData.forEach(d => {
                const inLink = linkConfig.find(l => l.linkId === parseInt(d.inLinkId))
                const outLink = linkConfig.find(l => l.linkId === parseInt(d.outLinkId))
                if (inLink && outLink) {
                  const row = linkGridData.find(g => g.interfaceName === inLink.interfaceName)
                  if (row) {
                    const outIndex = row.outList.findIndex(o => o.interfaceName === outLink.interfaceName)
                    if (outIndex > -1) {
                      const outUsage = this.computeUsage(d.outBitsRate, outLink.bandwidth)
                      const inUsage = this.computeUsage(d.inBitsRate, inLink.bandwidth)
                      row.outList[outIndex] = {
                        noData: false,
                        interfaceName: outLink.interfaceName,
                        outUsage: outUsage,
                        inUsage: inUsage,
                        usageMore90: outUsage >= 0.9 || inUsage >= 0.9,
                        popoverWidth: this.computeWidth(outUsage, inUsage, 'popover'),
                        valueWidth: this.computeWidth(outUsage, inUsage, 'value'),
                        totalBitsRate: d.totalBitsRate,
                        ...d
                      }
                    }
                  }
                }
              })
              this.linkGridData = linkGridData
              let furtherNoData = true
              linkGridData.forEach(lg => {
                const hasData = lg.outList.some(o => o.noData === false)
                if (hasData) {
                  furtherNoData = false
                }
              })
              isLinkNoData = furtherNoData
            }
            this.isLinkNoData = isLinkNoData
          } else {
            this.isLinkNoData = true
            this.isLinkShowError = true
            this.linkErrorMsg = this.errorMsgHandler(res[0])
          }

          if (response[1].status === 200) {
            this.isNextShowError = false

            // 链路下一跳信息
            const nextLinkData = res[1].data.result

            let isNextNoData = nextLinkData.length === 0
            if (!isNextNoData) {
              // 链路下一跳数据
              nextLinkData.forEach(d => {
                let outBandwidth = 0
                let inBandwidth = 0
                let bandwidth = 0
                linkConfig.forEach((item) => {
                  if (!isTwoWay) {
                    if (item.peerCity === d.outLinkDirection || item.peerCity === d.inLinkDirection) {
                      bandwidth += item.bandwidth
                    }
                  } else {
                    if (item.peerCity === d.outLinkDirection && item.direction === 0) {
                      outBandwidth += item.bandwidth
                    }
                    if (item.peerCity === d.inLinkDirection && item.direction === 1) {
                      inBandwidth += item.bandwidth
                    }
                  }
                })

                const row = nextGridData.find(g => g.peerCity === d.inLinkDirection)
                if (row) {
                  const outIndex = row.outList.findIndex(o => o.peerCity === d.outLinkDirection)
                  if (outIndex > -1) {
                    // 上行带宽使用情况计算
                    const outUsage = this.computeUsage(d.outBitsRate, isTwoWay ? outBandwidth : bandwidth)
                    // 下行带宽使用情况计算
                    const inUsage = this.computeUsage(d.inBitsRate, isTwoWay ? inBandwidth : bandwidth)

                    row.outList[outIndex] = {
                      noData: false,
                      peerCity: d.outLinkDirection,
                      outUsage: outUsage,
                      inUsage: inUsage,
                      usageMore90: outUsage >= 0.9 || inUsage >= 0.9, // 宽带使用超过90%，赋红点
                      popoverWidth: this.computeWidth(outUsage, inUsage, 'popover'),
                      valueWidth: this.computeWidth(outUsage, inUsage, 'value'),
                      totalBitsRate: d.totalBitsRate,
                      ...d
                    }
                  }
                }
              })
              this.nextGridData = nextGridData
              nextGridData.forEach(lg => {
                const hasData = lg.outList.some(o => o.noData === false)
                if (hasData) {
                  isNextNoData = false
                }
              })
            }
            this.isNextNoData = isNextNoData
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
        if (d.outList) {
          d.outList.forEach(t => {
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
      if (data && data.length > 0) {
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
      if (data && data.length > 0) {
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
    },
    // linkConfig去重获取name
    getNames (linkConfig) {
      const names = new Set()
      linkConfig.forEach(c => {
        names.add(c.interfaceName)
      })
      return Array.from(names)
    },
    // linkConfig去重获取city
    getCities (linkConfig) {
      const cities = new Set()
      linkConfig.forEach(c => {
        cities.add(c.peerCity)
      })
      return Array.from(cities)
    }
  }
}
</script>
