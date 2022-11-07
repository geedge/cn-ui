<template>
  <div class="npm-tabs">
    12345678
    <div class="npm-tabs__active-bar"></div>
    <el-tabs v-model="currentTab" ref="elTabs" type="border-card" @tab-click="jumpPage">
      <el-tab-pane
          v-for="(tab,index) in tabs"
          :key="tab.i18n"
          :name="index"
          :disabled="tab.disable">
        <template #label>
          <div class="npm-tab__label">
            <i :class="tab.icon"></i>
            <span>{{ $t(tab.i18n) }}</span>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { useRoute } from 'vue-router'
import { ref } from 'vue'

export default {
  name: 'DetectionTabs',
  data () {
    return {
      leftOffset: 27
    }
  },
  mixins: [chartMixin],
  setup (props) {
    const tabs = ref([])
    if (props.chart) {
      tabs.value = [...props.chart]
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
    },
    jumpPage (item) {
      this.$router.push({
        path: this.tabs[item.index].path,
        query: {
          t: +new Date(),
          tabIndex: this.currentTab
        }
      })
    }
  },
  mounted () {
    // setTimeout(() => {
    this.$nextTick(() => {
      this.handleActiveBar(this.currentTab)
    })
    // }, 120)
  }
}
</script>
