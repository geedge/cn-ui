<template>
  <div>
    <div v-if="showSmall">
      <el-popover
          :width="localPopoverWidth"
          placement="top-start"
          trigger="hover"
          :visible-arrow="false"
          class="error-popover"
          popper-class="error-hover"
          style="background: #1b2e3b !important;"
          :content="content">
        <template #reference>
          <span>
            <svg class="icon error-icon" aria-hidden="true">
              <use xlink:href="#cn-icon-baocuo"></use>
            </svg>
<!--            <i v-if="icon" :class="`one-icon-${icon}`"></i>-->
          </span>
        </template>
      </el-popover>
<!--      不使用popover实现hover，后续考虑替换为该方案-->
<!--      <span class="new-error-icon" @mouseenter="hoverError">-->
<!--        <svg class="icon item-popover-up" aria-hidden="true">-->
<!--          <use xlink:href="#cn-icon-baocuo"></use>-->
<!--        </svg>-->
<!--        <div id="error-content" class="error-content">-->
<!--          rview/appCompanyCyclrview/appCompanyCycleTrafficTotal?startTime=getSecond(this.timeFilter.startTime)&endTime=getSecond(this.timeFilter.endTime)&appCompanies=%27Tencent%27,%27Jingdong%27,%27Akamai%27,%27Bytedance%27,%27Baidu%27,%27Huawei%27,%27Beike%27,%27Aiqiyi%27,%27Ctrip%27,%27Meituan%27-->
<!--        </div>-->
<!--      </span>-->
    </div>

    <div v-else class="error-block">
      <div class="error-block-tooltip" :style="{'max-width': localMaxWidth, 'width': localWidth}">
        <svg class="icon item-popover-up error-icon1" aria-hidden="true">
          <use xlink:href="#cn-icon-baocuo"></use>
        </svg>
        {{ content }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error',
  props: {
    small: {
      type: String
    },
    content: {
      type: String,
      default: 'Error！'
    },
    width: {
      type: String
    },
    maxWidth: {
      type: String,
      default: '350'
    },
    icon: {
      type: String
    },
    svg: {
      type: String
    }
  },
  data () {
    return {
      showSmall: false, // 显示错误的类型，true为图表模块内显示报错，false为标题后显示报错
      localWidth: '',
      localMaxWidth: '',
      localPopoverWidth: '350'
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      if (this.small !== undefined) {
        this.showSmall = true
        this.localPopoverWidth = this.width !== undefined
      } else {
        this.showSmall = false
      }

      if (this.width) {
        this.localWidth = Math.abs(parseFloat(this.width)) + 'px'
      }

      if (this.maxWidth) {
        this.localMaxWidth = Math.abs(parseFloat(this.maxWidth)) + 'px'
      }
    },
    /**
     * 鼠标移入事件，用于获取弹窗dom，修改距离父元素的top
     */
    hoverError (e) {
      // const dom = document.getElementById('error-content')
      // if (dom) {
      //   console.log('---', dom.clientHeight)
      // }
    }
  }
}
</script>

<style scoped>

</style>
