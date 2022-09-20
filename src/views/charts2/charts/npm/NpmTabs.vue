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
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
export default {
  name: 'NpmTabs',
  data () {
    return {
      leftOffset: 27
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
    const { query } = useRoute()
    const tabIndexParam = query.tabIndex
    const currentTab = ref(tabIndexParam ? parseInt(tabIndexParam) : 0)
    return {
      currentTab,
      tabs
    }
  },
  watch: {
    currentTab (n) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        tabIndex: n
      })
      overwriteUrl(newUrl)

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
      if (tabDom) {
        const offsetLeft = tabDom.offsetLeft
        const clientWidth = tabDom.clientWidth
        const clientLeft = tabDom.clientLeft
        const activeBar = document.querySelector('.npm-tabs .npm-tabs__active-bar')
        activeBar.style.cssText += `width: ${clientWidth + 2}px; left: ${offsetLeft + this.leftOffset + clientLeft - 1}px;`
      }
    }
  },
  mounted () {
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
      get(api.npm.overview.relatedSessions, params).then(res => {
        if (res.code === 200) {
          self.sessionData = res.data.result
          self.clientSessions = self.sessionData.clientSessions / (self.sessionData.clientSessions * 1 + self.sessionData.serverSessions * 1)
          self.serverSessions = self.sessionData.serverSessions / (self.sessionData.clientSessions * 1 + self.sessionData.serverSessions * 1)
        }
      }).finally(() => {
        if (self.clientSessions === 0) {
          self.currentTab = 1
          self.tabs[0].disable = true
          self.tabs[1].disable = false
          const tabEle = document.getElementById('tab-0')
          tabEle.style.cssText = 'cursor: not-allowed;'
          setTimeout(() => {
            self.handleActiveBar(1)
          }, 400)
        } else if (self.serverSessions === 0) {
          self.currentTab = 0
          self.tabs[0].disable = false
          self.tabs[1].disable = true
          setTimeout(() => {
            const tabEle = document.getElementById('tab-1')
            tabEle.style.cssText = 'cursor: not-allowed;'
            self.handleActiveBar(0)
          }, 400)
        } else {
          self.currentTab = 0
          self.tabs[0].disable = false
          self.tabs[1].disable = false
          setTimeout(() => {
            self.handleActiveBar(0)
          }, 400)
        }
      })
    } else {
      setTimeout(() => {
        this.handleActiveBar(this.currentTab)
      }, 400)
    }
  }
}
</script>
