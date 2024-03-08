<template>
  <div class="HintInfo">
    <ul style="padding-left: 0;margin: -10px 0 0 0;min-width: calc(100% - 12px)">
      <template v-for="(item,index) in hintList" :key="index">
        <li :ref="'hint_'+index" class="relative-item CodeMirror-hint"
            style="margin-bottom: 2px"
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
