<template>
  <div class="npm-tabs">
    <div class="npm-tabs__active-bar"></div>
    <el-tabs v-model="currentTab" ref="elTabs" type="border-card">
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
      currentTab: 0,
      leftOffset: 27
    }
  },
  watch: {
    currentTab (n) {
      this.$nextTick(() => {
        this.handleActiveBar(n)
      })
      this.$emit('tabChange', n)
    }
  },
  methods: {
    handleActiveBar (index) {
      const { offsetLeft, clientWidth, clientLeft } = document.querySelector('.npm-tabs .el-tabs__item.is-active')
      const activeBar = document.querySelector('.npm-tabs .npm-tabs__active-bar')
      activeBar.style.cssText += `width: ${clientWidth + 2}px; left: ${offsetLeft + this.leftOffset + clientLeft - 1}px;`
    }
  },
  mounted () {
    setTimeout(() => {
      this.handleActiveBar(0)
    }, 200)
  }
}
</script>
