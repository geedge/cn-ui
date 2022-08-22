<template>
  <div class="npm-tabs">
    <div class="npm-tabs__active-bar"></div>
    <el-tabs v-model="currentTab" ref="elTabs" type="border-card">
      <el-tab-pane v-for="tab in tabs" :key="tab.i18n">
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
    this.toggleLoading(false)
    if (this.chart.params && this.chart.params.tabs) {
      this.tabs = this.chart.params.tabs
    }
    setTimeout(() => {
      this.handleActiveBar(0)
    }, 200)
  }
}
</script>
