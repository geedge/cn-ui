<template>
  <div class="npm-tabs">
    <div class="npm-tabs__active-bar"></div>
    <el-tabs v-model="currentTab" ref="elTabs" type="border-card">
      <el-tab-pane v-for="(tab,index) in tabs" :key="tab.i18n"  :name="index" :disabled="tab.disable" >
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
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { drillDownPanelTypeMapping } from '@/utils/constants'
export default {
  name: 'NpmTabs',
  data () {
    return {
      currentTab: 0,
      leftOffset: 27,
      tabs: []
    }
  },
  mixins: [chartMixin],
  watch: {
    currentTab (n) {
      this.$nextTick(() => {
        this.handleActiveBar(n)
      })
      setTimeout(() => {
        this.$emit('tabChange', n)
      }, 400)
    }
  },
  methods: {
    handleActiveBar (index) {
      const tabDom = document.getElementById('tab-' + index)
      const offsetLeft = tabDom.offsetLeft
      const clientWidth = tabDom.clientWidth
      const clientLeft = tabDom.clientLeft
      const activeBar = document.querySelector('.npm-tabs .npm-tabs__active-bar')
      activeBar.style.cssText += `width: ${clientWidth + 2}px; left: ${offsetLeft + this.leftOffset + clientLeft - 1}px;`
    }
  },
  mounted () {
    this.toggleLoading(false)
    if (this.chart.params && this.chart.params.tabs) {
      this.tabs = this.chart.params.tabs
      this.tabs.forEach(item => {
        item.disable = false
      })
    }

    if (this.chart.panelId === drillDownPanelTypeMapping.npmOverviewIp) {
      // 当client或server的session数为0时，对应tab置灰，不可选，默认高亮另一个不为0的tab
      const condition = this.$store.getters.getQueryCondition.split(/["|'](.*?)["|']/)
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        ip: condition[1]
      }
      get(api.npm.overview.relatedSessions, params).then(res => {
        if (res.code === 200) {
          this.sessionData = res.data.result
          this.clientSessions = this.sessionData.clientSessions / (this.sessionData.clientSessions * 1 + this.sessionData.serverSessions * 1)
          this.serverSessions = this.sessionData.serverSessions / (this.sessionData.clientSessions * 1 + this.sessionData.serverSessions * 1)
        }
      }).finally(() => {
        if (this.clientSessions === 0) {
          this.currentTab = 1
          this.tabs[0].disable = true
          this.tabs[1].disable = false
          const tabEle = document.getElementById('tab-0')
          tabEle.style.cssText = 'cursor: not-allowed;'
        } else if (this.serverSessions === 0) {
          this.tabs[0].disable = false
          this.tabs[1].disable = true
          setTimeout(() => {
            const tabEle = document.getElementById('tab-1')
            tabEle.style.cssText = 'cursor: not-allowed;'
            this.handleActiveBar(0)
          }, 400)
        } else {
          setTimeout(() => {
            this.handleActiveBar(0)
          }, 400)
        }
      })
    } else {
      setTimeout(() => {
        this.handleActiveBar(0)
      }, 400)
    }
  }
}
</script>
