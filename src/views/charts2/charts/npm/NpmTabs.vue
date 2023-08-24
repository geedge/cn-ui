<template>
  <div class="npm-tabs">
    <div class="npm-tabs__active-bar"></div>
    <el-tabs v-model="currentTab" ref="elTabs" type="border-card" v-show="isCurTabReady"
             @tab-click="handleClick">
      <el-tab-pane v-for="(tab,index) in tabs" :key="tab.i18n" :name="JSON.stringify(index)" :disabled="tab.disable" >
        <template #label>
          <div class="npm-tab__label">
            <i :class="tab.icon"></i>
            <span>{{$t(tab.i18n)}}</span>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import axios from 'axios'
import { drillDownPanelTypeMapping } from '@/utils/constants'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { ref } from 'vue'
export default {
  name: 'NpmTabs',
  data () {
    return {
      leftOffset: 27,
      currentTab: ref('0'),
      isCurTabReady: false
    }
  },
  mixins: [chartMixin],
  setup (props) {
    const tabs = ref([])
    if (props.chart.params && props.chart.params.tabs) {
      tabs.value = [...props.chart.params.tabs]
      tabs.value.forEach(item => {
        item.disable = false
      })
    }
    return {
      tabs
    }
  },
  emits: ['tabChange'],
  watch: {
    currentTab (n) {
      this.reloadUrl(n)

      this.$nextTick(() => {
        this.handleActiveBar(n)
      })
      setTimeout(() => {
        this.$emit('tabChange', n)
      }, 400)
    },
    timeFilter: {
      handler () {
        this.initTabs()
      }
    }
  },
  methods: {
    initTabs () {
      const { query } = this.$route
      const tabIndexParam = query.tabIndex
      const curTabIndexInUrl = tabIndexParam ? parseInt(tabIndexParam) : null
      if (this.chart.panelId === drillDownPanelTypeMapping.npmOverviewIp) {
        const self = this
        // 当client或server的session数为0时，对应tab置灰，不可选，默认高亮另一个不为0的tab
        const conditionStr = this.$route.query.queryCondition ? this.$route.query.queryCondition : ''
        const condition = conditionStr.split(/["|'](.*?)["|']/)
        const params = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          ip: condition[1]
        }
        axios.get(api.npm.overview.relatedSessions, { params: params }).then(res => {
          if (res.status === 200) {
            self.sessionData = res.data.data.result
            self.clientSessions = self.sessionData.clientSessions / (self.sessionData.clientSessions * 1 + self.sessionData.serverSessions * 1)
            self.serverSessions = self.sessionData.serverSessions / (self.sessionData.clientSessions * 1 + self.sessionData.serverSessions * 1)
          }
        }).finally(() => {
          const thirdMenu = this.$route.query.thirdMenu
          self.ableTab(0)
          self.ableTab(1)
          let curTabIndex = 0
          if (thirdMenu === 'network.clientIps') {
            curTabIndex = 0
            if (self.serverSessions === 0) {
              self.disableTab(1)
            } else if (curTabIndexInUrl !== null) {
              curTabIndex = curTabIndexInUrl
            }
          } else if (thirdMenu === 'network.serverIps') {
            curTabIndex = 1
            if (self.clientSessions === 0) {
              self.disableTab(0)
            } else if (curTabIndexInUrl !== null) {
              curTabIndex = curTabIndexInUrl
            }
          } else {
            // 禁用tab设置
            if (self.clientSessions === 0) {
              self.disableTab(0)
            }
            if (self.serverSessions === 0) {
              self.disableTab(1)
            }
            // 当前tab设置
            if (self.clientSessions !== 0 && self.serverSessions === 0) {
              curTabIndex = 0
            } else if (self.clientSessions === 0 && self.serverSessions !== 0) {
              curTabIndex = 1
            } else { // 都为0或者都不为0，则停留在url中tab参数指定的tab
              if (curTabIndexInUrl !== null) {
                curTabIndex = curTabIndexInUrl
              }
            }
          }
          this.$nextTick(() => {
            self.currentTab = JSON.stringify(curTabIndex)
            self.isCurTabReady = true
            // URL中tabIndex的设置，client初始化时查询条件需要：side条件
            self.reloadUrl(self.currentTab)

            setTimeout(() => {
              self.handleActiveBar(self.currentTab)
            }, 400)
            setTimeout(() => {
              this.$emit('tabChange', self.currentTab)
            }, 400)
          })
        })
      } else {
        this.currentTab = curTabIndexInUrl ? JSON.stringify(curTabIndexInUrl) : '0'
        this.isCurTabReady = true
        setTimeout(() => {
          this.handleActiveBar(this.currentTab)
        }, 400)
      }
    },
    handleClick (tab) {
      this.reloadUrl(tab.index)
    },
    handleActiveBar (index) {
      const tabDom = document.getElementById('tab-' + index)
      if (tabDom) {
        const offsetLeft = tabDom.offsetLeft
        const clientWidth = tabDom.clientWidth
        const clientLeft = tabDom.clientLeft
        const activeBar = document.querySelector('.npm-tabs .npm-tabs__active-bar')
        activeBar.style.cssText += `width: ${clientWidth + 2}px; left: ${offsetLeft + this.leftOffset + clientLeft - 1}px;`
      }
    },
    disableTab (n) {
      this.tabs[n].disable = true
      const tabEle = document.getElementById('tab-' + n)
      tabEle.style.cssText = 'cursor: not-allowed;'
    },
    ableTab (n) {
      this.tabs[n].disable = false
      const tabEle = document.getElementById('tab-' + n)
      tabEle.style.cssText = 'cursor: pointer;'
    },
    reloadUrl (index) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        tabIndex: index
      })
      overwriteUrl(newUrl)
    }
  },
  mounted () {
    this.initTabs()
  }
}
</script>
