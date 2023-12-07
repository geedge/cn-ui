<template>
  <div class="HintInfo">
    <ul class="CodeMirror-hints-manual eclipse" style="padding-left: 0">
      <template v-for="(item,index) in hintList" :key="index">
        <li :ref="'hint_'+index" class="relative-item CodeMirror-hint"
            @click="handleSelect(item,index,hintList)"
            :class="{'CodeMirror-hint-active':index === activeIndex,[item.className]:true}"
        >{{ item.displayText }}</li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HintInfo',
  props: {
    hintList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      active: true,
      activeIndex: null
    }
  },
  mounted () {
    // this.handleFocus()
    this.$emit('load', {
      name: this.name,
      label: this.name,
      vm: this
    })
  },
  methods: {
    scrollToView (index = 0) {
      // 移动到可视区域
      const li = this.$refs['hint_' + index][0]
      li && li.scrollIntoView(false)
    },
    handleDown () {
      if (!this.active) {
        this.hintActive()
        return
      }
      let nextIndex = this.activeIndex + 1
      let nextItem = this.hintList[nextIndex]

      if (nextItem?.type === 'abstract') {
        nextIndex++
        nextItem = this.hintList[nextIndex]
      }

      if (nextItem?.type === 'abstract') {
        nextIndex++
      }
      nextIndex >= this.hintList.length ? this.activeIndex = 1 : this.activeIndex = nextIndex
      this.scrollToView(this.activeIndex)
    },
    handleUp () {
      if (!this.active) {
        this.hintActive()
        return
      }
      let preIndex = this.activeIndex - 1
      let preItem = this.hintList[preIndex]

      if (preItem?.type === 'abstract') {
        preIndex--
        preItem = this.hintList[preIndex]
      }
      if (preItem?.type === 'abstract') {
        preIndex--
      }
      preIndex > 0 ? this.activeIndex = preIndex : this.activeIndex = this.hintList.length - 1
      this.scrollToView(this.activeIndex)
    },
    hintActive () {
      this.active = true
      this.activeIndex = 1
      this.scrollToView(this.activeIndex)
    },
    hintDeactive () {
      this.active = false
      this.activeIndex = null
    },
    handleSelect (item, index) {
      this.$emit('select', item, index, this.hintList)
    },
    triggerSelect () {
      const index = this.activeIndex || 0
      const item = this.hintList[index]
      this.$emit('select', item, index, this.hintList)
    }
  }
}
</script>

<style scoped>
  .HintInfo {
    height: 302px;
    overflow: auto;
    background: #fff;
  }
  ul {
    min-width: 300px;
    height:auto;
    width: fit-content;
    box-sizing: border-box;
    padding-bottom: 10px;
  }
  .hint-title{
    margin: 10px !important;
    margin-left: 4px !important;
    font-size: 14px;
  }
  .el-dropdown-menu__item{
    text-indent: 1em;
  }
  .hint-clear{
    text-indent: 1em;
  }
</style>
