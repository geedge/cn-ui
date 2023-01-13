<template>
  <div class="chart-tabs administration-tabs">
    <div class="chart-tabs__active-bar" :style="{'background-color': color}"></div>
    <el-tabs v-model="currentTab" ref="elTabs" type="border-card" @tab-click="handleClick">
      <el-tab-pane
          v-for="(tab,index) in tabsData"
          :key="tab.i18n"
          :name="JSON.stringify(index)"
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
      timer: null
    }
  },
  setup (props) {
    const tabsData = ref([])
    const router = useRouter()
    const routerPath = router.currentRoute.value.path
    const tabList = window.currentChartTabList
    let currentTab = '0'

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
        currentTab = ref(tabIndexParam ? JSON.stringify(tabIndexParam) : '0')
      } else if (!tabList) {
        // 此处为刷新界面时，根据当前路由获取index
        currentTab = tabsData.value.findIndex(item => {
          return item.path === routerPath
        })
        currentTab = JSON.stringify(currentTab)
        window.currentChartTabList = [{ path: routerPath, index: currentTab }]
      } else {
        // 此处为切换界面，如果window里保存的路径和tabsData里的路径一致，选择window数据并使用
        // 两个不一致的话，则默认选择tabsData里的第一条
        let obj0 = null
        let obj1 = null
        obj0 = tabsData.value.find(item => { return item.path === tabList[0].path })

        if (tabList[1]) {
          obj1 = tabsData.value.find(item => { return item.path === tabList[1].path })
        }

        if (obj0 && obj1) {
          currentTab = tabList[1].index
          // 场景：从遮罩面板进入界面时，重置状态，默认选中第一个tab
          if (routerPath === tabList[0].path) {
            currentTab = tabList[0].index
            window.currentChartTabList.splice(1, 1)
          }
        } else if (obj0) {
          currentTab = tabList[0].index
        } else {
          window.currentChartTabList = [{ path: tabsData.value[0].path, index: '0' }]
          currentTab = '0'
        }
      }
    }

    return {
      currentTab,
      tabsData
    }
  },
  mounted () {
    const time = this.router === 'noRouter' ? 900 : 0
    this.timer = setTimeout(() => {
      this.$nextTick(() => {
        this.init()
      })
    }, time)
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

      if (window.currentChartTabList && this.router !== 'noRouter') {
        window.currentChartTabList.forEach((item) => {
          this.$nextTick(() => {
            this.handleActiveBar(parseFloat(item.index))
          })
        })
      } else {
        this.$nextTick(() => {
          this.handleActiveBar(this.currentTab)
        })
        window.currentChartTabList = null
      }
    },
    handleActiveBar (index) {
      const activeDom = document.getElementsByClassName('el-tabs__item is-top is-active')
      const tabDom = document.getElementById('tab-' + index)

      if (tabDom && activeDom) {
        this.$nextTick(() => {
          const offsetLeft = tabDom.offsetLeft
          const clientWidth = tabDom.clientWidth
          const clientLeft = tabDom.clientLeft
          const activeBar = document.querySelector('.chart-tabs .chart-tabs__active-bar')

          if (this.router === 'noRouter') {
            activeBar.style.cssText += `width: ${clientWidth + 2}px; left: ${offsetLeft + this.leftOffset + clientLeft - 1}px;`
          } else {
            // 数组长度为1，即代表刚刷新界面，获取active的dom添加样式，避免原模式错位问题
            // 可添加css样式，也可添加class类名，两个操作选一即可
            if (window.currentChartTabList.length === 1) {
              // 此处操作是因为初始化时给active加border，导致tab下移，故需要将整体往上移动对应高度
              const topDom = document.getElementsByClassName('el-tabs__header is-top')
              topDom[0].style.cssText += 'top: -3px'
              activeDom[0].style.cssText += 'height: calc(100% - 1px);border-top: 4px #046EC9 solid;border-radius: 5px 5px 0 0;transition: all linear .2s;'
            } else {
              activeBar.style.cssText += `width: ${clientWidth + 2}px; left: ${offsetLeft + this.leftOffset + clientLeft - 1}px;`
              activeDom[0].style.cssText += 'height:calc(100% + 1px)'
            }
          }
        })
      }
    },
    handleClick (item) {
      this.$emit('click', item)

      if (this.router === 'noRouter') {
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, {
          t: +new Date(),
          tabIndex: item.index
        })
        overwriteUrl(newUrl)
      } else {
        window.currentChartTabList.push({
          path: this.tabsData[item.index].path,
          index: item.index
        })

        if (window.currentChartTabList.length > 2) {
          window.currentChartTabList.splice(0, 1)
        }

        this.$router.push({
          path: this.tabsData[item.index].path,
          query: {
            t: +new Date()
          }
        })
      }
    }
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    const path = this.$router.currentRoute.value.path
    const list = window.currentChartTabList
    if (list && this.router !== 'noRouter') {
      if (list[1]) {
        // 去其他界面，清除状态
        if (path !== list[0].path && path !== list[1].path) {
          window.currentChartTabList = null
        }
      } else if (path !== list[0].path) {
        // 避免刷新页面之后又点击菜单栏进入该界面，还保留上次点击状态
        window.currentChartTabList = null
      }
    }
  }
}
</script>
