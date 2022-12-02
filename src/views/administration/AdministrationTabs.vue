<template>
  <div class="npm-tabs">
    <div class="npm-tabs__active-bar"></div>
    <el-tabs v-model="currentTab" ref="elTabs" type="border-card" @tab-click="jumpPage">
      <el-tab-pane
          v-for="(tab, index) in tabsData"
          :key="tab.i18n"
          :name="index">
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
import { storageKey } from '@/utils/constants'
import { ref } from 'vue'

export default {
  name: 'DetectionTabs',
  props: {
    tabsData: Array
  },
  data () {
    return {
      leftOffset: 27,
      currentTab: ref(0)
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
    jumpPage (tab) {
      localStorage.setItem(storageKey.currentTab, tab.index)
      this.$router.push({
        path: this.tabsData[tab.index].path,
        query: {
          t: +new Date()
        }
      })
    }
  },
  mounted () {
    const index = localStorage.getItem(storageKey.currentTab)
    if (index) {
      this.currentTab = parseFloat(index)
    }
    this.$nextTick(() => {
      this.handleActiveBar(this.currentTab)
    })
  }
}
</script>
