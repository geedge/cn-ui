<template>
  <div v-if="showDefault" class="error-component" :style="style" :class="class">
    <div class="error-block" :style="{'max-width': localMaxWidth, 'width': localWidth}">
      <svg class="icon error-icon-default" aria-hidden="true">
        <use xlink:href="#cn-icon-baocuo"></use>
      </svg>
      {{ content }}
    </div>
  </div>

  <div id="error-com">
    <div v-if="tooltip !== undefined">
      <el-popover
          :width="localPopoverWidth"
          placement="top-start"
          trigger="hover"
          :visible-arrow="false"
          popper-class="error-popover"
          :content="content">
        <template #reference>
          <span>
            <svg class="icon error-icon-tooltip" aria-hidden="true">
              <use xlink:href="#cn-icon-baocuo"></use>
            </svg>
<!--            为后续自定义icon插槽做预备-->
<!--            <i v-if="icon" :class="`icon cn-icon-${icon}`"></i>-->
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

    <div class="error-block-info" v-if="info !== undefined">
      <div>
        <svg class="icon error-icon-default" aria-hidden="true">
          <use xlink:href="#cn-icon-baocuo"></use>
        </svg>
        {{ content }}
      </div>
    </div>
  </div>
</template>

<!--  start----------------调用方式----------------start  -->
<!--
   组件在全局注册了，调用时: <chart-error :content="content"></chart-error>
-->
<!--
   目前有三种形式，分别是default、tooltip、info
   默认，即红框展示：<chart-error :content="content" />
   在标题之后显示，需要鼠标移动到图标上显示弹窗：<chart-error tooltip :content="content" />
   文字提示：<chart-error info :content="content" />
 -->
<!--
  自定义宽度：<chart-error width="300" :content="content" />
  自定义弹窗宽度：<chart-error tooltip width="300" :content="content" />
  注意：info模式不支持宽度设置
-->
<!--
  自定义icon图标：<chart-error tooltip icon="baocuo" :content="content" />，此时icon全称为'cn-icon-baocuo'
-->
<!--  end----------------调用方式----------------end  -->
<script>
export default {
  name: 'Error',
  props: {
    // 工具栏提示类型
    tooltip: {
      type: String
    },
    // 文字提示类型
    info: {
      type: String
    },
    // 报错信息内容，如果不传，默认为"Error"
    content: {
      type: String,
      default: 'Error！'
    },
    // 报错信息模块宽度，如果类型选择tooltip，则为弹窗宽度，info模式没有宽度设置
    width: {
      type: String
    },
    // 报错信息模块最大宽度
    maxWidth: {
      type: String
      // default: '350'
    },
    // 自定义icon图标
    icon: {
      type: String
    },
    // 自定义svg图标
    svg: {
      type: String
    },
    style: {
      type: String
    },
    class: {
      type: String
    }
  },
  data () {
    return {
      showDefault: false, // 是否显示default，分别是default、tooltip、info
      showSmall: false, // 显示错误的类型，true为图表模块内显示报错，false为标题后显示报错
      localWidth: '',
      localMaxWidth: '',
      localPopoverWidth: ''
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      if (this.tooltip !== undefined) {
        this.showDefault = false
        this.localPopoverWidth = this.width !== undefined
      }

      // 默认default模式
      this.showDefault = this.tooltip === undefined && this.info === undefined

      if (this.width) {
        // 避免宽度出现负数的情况
        this.localWidth = Math.abs(parseFloat(this.width)) + 'px'
      }

      if (this.maxWidth) {
        // 避免宽度出现负数的情况
        this.localMaxWidth = Math.abs(parseFloat(this.maxWidth)) + 'px'
      }
    },
    /**
     * 鼠标移入事件，用于获取弹窗dom，修改距离父元素的top
     */
    hoverError (e) {
      // const dom = document.getElementById('error-content')
      // if (dom) {
      // }
    }
  }
}
</script>
