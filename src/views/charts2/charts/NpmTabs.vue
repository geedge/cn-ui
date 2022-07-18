<template>
  <div class="npm-tabs">
    <el-tabs v-model="currentTab" ref="elTabs">
      <el-tab-pane>
        <template #label>
          <div class="npm-tab__label">
            <i class="cn-icon cn-icon-overview"></i>
            <span>{{$t('overall.overview')}}</span>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <div class="npm-tab__label">
            <i class="cn-icon cn-icon-location"></i>
            <span>{{$t('overall.location')}}</span>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <div class="npm-tab__label">
            <i class="cn-icon cn-icon-events"></i>
            <span>{{$t('overall.events')}}</span>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'NpmTabs',
  data () {
    return {
      currentTab: 0
    }
  },
  watch: {
    currentTab (n) {
      this.$emit('tabChange', n)
    }
  },
  mounted () {
    // 修正字体改变导致的active-bar宽度计算偏差
    setTimeout(() => {
      const activeTab = document.querySelector('.npm-tabs .el-tabs__item.is-active')
      const activeTabStyle = window.getComputedStyle(activeTab)
      const activeBar = document.querySelector('.npm-tabs .el-tabs__active-bar')
      activeBar.style.width = `${parseFloat(activeTabStyle.width) - parseFloat(activeTabStyle.paddingLeft)}px`
    }, 200)
  }
}
</script>
