<template>
  <div class="HintInfo" id="myHint" @mouseenter="onMouseenter">
    <ul style="padding-left: 0;margin: -10px 0 0 0;min-width: calc(100% - 12px)">
      <template v-for="(item,index) in hintList" :key="index">
        <li :ref="'hint_'+index" class="relative-item CodeMirror-hint"
            style="margin-bottom: 2px"
            @click="handleSelect(item,index,hintList)"
            :id="'filterItem'+index"
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
    },
    columnList: {
      type: Array
    }
  },
  data () {
    return {
      active: true,
      activeIndex: null,
      currentIndex: -1
    }
  },
  mounted () {
    // this.handleFocus()
    this.$emit('load', {
      name: this.name,
      label: this.name,
      vm: this
    })
    document.addEventListener('keydown', this.initKeyDown)
  },
  methods: {
    initKeyDown (event) {
      const dom = document.getElementById('myHint')
      const vm = this
      if (dom) {
        // 检测方向键
        switch (event.key) {
          case 'Enter':
            // eslint-disable-next-line no-case-declarations
            const item = vm.hintList[vm.currentIndex]
            if (item) {
              this.$emit('keydownEnter', 'Enter')
              const obj = vm.columnList.find(d => d.label === item.displayText)
              // 如果选中label，数组更新，光标处在第一行。如果选择操作符，光标位置不变
              if (obj) {
                vm.handleSelect(item, vm.currentIndex, vm.hintList)
                const itemDom = document.getElementById('filterItem' + vm.currentIndex)
                if (itemDom) {
                  itemDom.style.backgroundColor = ''
                }
                vm.$nextTick(() => {
                  vm.currentIndex = 1
                  const itemDom1 = document.getElementById('filterItem1')
                  if (itemDom1) {
                    itemDom1.style.backgroundColor = 'var(--el-fill-color-dark)'
                  }
                })
              } else {
                vm.handleSelect(item, vm.currentIndex, vm.hintList)
              }
            } else {
              this.$emit('keydownEnter', null)
            }
            break
          case 'ArrowUp': // 上方向键
            // 上方向键被按下时的操作
            if ((vm.currentIndex <= vm.hintList.length - 1) && vm.currentIndex > 0) {
              vm.currentIndex -= 1
            } else {
              vm.currentIndex = vm.hintList.length - 1
            }
            vm.hintList.forEach((e, index) => {
              if (index === vm.currentIndex) {
                let realIndex = index
                if (e.type === 'abstract') {
                  realIndex -= 1
                  vm.currentIndex -= 1
                }
                const itemDom = document.getElementById('filterItem' + realIndex)
                if (itemDom) {
                  itemDom.style.backgroundColor = 'var(--el-fill-color-dark)'
                  itemDom.scrollIntoView(false)
                }
              } else {
                const itemDom = document.getElementById('filterItem' + index)
                if (itemDom) {
                  itemDom.style.backgroundColor = ''
                }
              }
            })
            break
          case 'ArrowDown': // 下方向键
            if (vm.currentIndex < vm.hintList.length - 1) {
              vm.currentIndex += 1
            } else {
              vm.currentIndex = 0
            }
            vm.hintList.forEach((e, index) => {
              if (index === vm.currentIndex) {
                let realIndex = index
                if (e.type === 'abstract') {
                  realIndex += 1
                  vm.currentIndex += 1
                }
                const itemDom = document.getElementById('filterItem' + realIndex)
                if (itemDom) {
                  itemDom.style.backgroundColor = 'var(--el-fill-color-dark)'
                  itemDom.scrollIntoView(false)
                }
              } else {
                const itemDom = document.getElementById('filterItem' + index)
                if (itemDom) {
                  itemDom.style.backgroundColor = ''
                }
              }
            })
            break
          default:
            // 其他按键的操作
            break
        }
      }
    },
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
    },
    onMouseenter () {
      const itemDom = document.getElementById('filterItem' + this.currentIndex)
      if (itemDom) {
        itemDom.style.backgroundColor = ''
        this.currentIndex = -1
      }
    }
  },
  unmounted () {
    document.removeEventListener('keydown', this.initKeyDown)
  }
}
</script>
