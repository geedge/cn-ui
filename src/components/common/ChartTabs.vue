<template>
  <div class="chart-tabs administration-tabs">
    <div class="chart-tabs__active-bar" :style="{'background-color': color}"></div>
    <el-tabs v-model="currentTab" ref="elTabs" type="border-card" @tab-click="handleClick">
      <el-tab-pane
          v-for="(tab,index) in tabsData"
          :key="tab.i18n"
          :name="index"
          :disabled="tab.disable">
        <template #label>
          <div class="chart-tabs__label">
            <i :class="tab.icon"></i>
            <span>{{ $t(tab.i18n) }}</span>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<!--  start----------------调用方式----------------start  -->
<!--
   组件名：<chart-tabs></chart-tabs>
   目前有两种形式，分别是default、router
   默认default，非路由切换：<chart-tabs :data="tabsData" />
   路由模式router，点击tab路由切换：<chart-tabs :data="tabsData" router />
   数据格式：
   tabsData: [
      {
        i18n: 'entities.securityEvents',
        path: '/detection/securityEvent',
        icon: 'cn-icon cn-icon-a-SecurityEvent'
      }
  ]
  需要禁用，则对应对象里添加 disable: true
 -->
<!--
  active颜色：<chart-tabs :data="tabsData" color="red" />
-->
<!--
  接收回调：@click
-->
<!--  end----------------调用方式----------------end  -->
<script>
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'ChartTabs',
  props: {
    data: {
      type: Array
    },
    router: {
      type: String,
      default: 'noRouter'
    },
    color: {
      type: String
    }
  },
  data () {
    return {
      leftOffset: 27,
      // currentTab: '',
      // tabsData: '',
      routerList: []
    }
  },
  setup (props) {
    const tabsData = ref([])
    const router = useRouter()
    const routerPath = router.currentRoute.value.path
    const tabList = window.currentChartTabList
    let currentTab = 0

    if (props.data) {
      tabsData.value = [...props.data]
      tabsData.value.forEach(item => {
        if (!item.disable) {
          item.disable = false
        }
      })

      // 非路由跳转，获取tabIndex定位
      // 路由跳转，根据路由名对比传入数据，获取index从而定位
      // 路由模式为了切换有过渡，需要设置上次tab和当前tab
      if (props.router === 'noRouter') {
        const { query } = useRoute()
        const tabIndexParam = query.tabIndex
        currentTab = ref(tabIndexParam ? parseInt(tabIndexParam) : 0)
      } else if (!tabList) {
        currentTab = tabsData.value.findIndex(item => {
          return item.path === routerPath
        })
        window.currentChartTabList = [currentTab]
      } else {
        currentTab = tabList[1] ? parseFloat(tabList[1]) : parseFloat(tabList[0])
      }
    }

    return {
      currentTab,
      tabsData
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.init()
    })
  },
  watch: {
    currentTab (n) {
      if (this.router === 'noRouter') {
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, {
          tabIndex: n
        })
        overwriteUrl(newUrl)
      }

      this.$nextTick(() => {
        this.handleActiveBar(n)
      })
    }
  },
  methods: {
    init () {
      // 添加禁用小手
      this.tabsData.forEach((item, index) => {
        if (item.disable) {
          const tabEle = document.getElementById('tab-' + index)
          if (tabEle) {
            tabEle.style.cssText = 'cursor: not-allowed;'
          }
        }
      })

      if (window.currentChartTabList) {
        window.currentChartTabList.forEach((item) => {
          this.$nextTick(() => {
            this.handleActiveBar(parseFloat(item))
          })
        })
      } else {
        this.$nextTick(() => {
          this.handleActiveBar(this.currentTab)
        })
      }
    },
    handleActiveBar (index) {
      const activeDom = document.getElementsByClassName('el-tabs__item is-top is-active')
      const tabDom = document.getElementById('tab-' + index)

      if (tabDom && activeDom) {
        this.$nextTick(() => {
          // 数组长度为1，即代表刚刷新界面，获取active的dom添加样式，避免原模式错位问题
          // 可添加css样式，也可添加class类名，两个操作选一即可
          if (window.currentChartTabList.length === 1) {
            activeDom[0].style.cssText += 'border-top: 4px #046EC9 solid;border-radius: 5px 5px 0 0;transition: all linear .2s;'
          } else {
            const offsetLeft = tabDom.offsetLeft
            const clientWidth = tabDom.clientWidth
            const clientLeft = tabDom.clientLeft
            const activeBar = document.querySelector('.chart-tabs .chart-tabs__active-bar')
            activeBar.style.cssText += `width: ${clientWidth + 2}px; left: ${offsetLeft + this.leftOffset + clientLeft - 1}px;`
          }
        })
      }
    },
    handleClick (item) {
      if (window.currentChartTabList) {
        window.currentChartTabList.push(item.index)
        if (window.currentChartTabList.length > 2) {
          window.currentChartTabList.splice(0, 1)
        }
      } else {
        window.currentChartTabList = [item.index]
      }

      this.$emit('click', item)

      const query = { t: +new Date() }
      if (this.router === 'noRouter') {
        query.tabIndex = this.currentTab
      }

      this.$router.push({
        path: this.tabsData[item.index].path,
        query: query
      })
    }
  }
}
</script>
