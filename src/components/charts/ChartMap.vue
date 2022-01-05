<template>
  <div class="cn-chart cn-chart__map">
    <div class="cn-chart__header chart-header-position" >
      <slot name="chartErrorInfo"></slot>
      <div class="header__title" v-if="!hideHeader">
        <slot name="title"></slot>
      </div>
      <div class="header__operations" v-if="!hideHeader">
        <slot name="operations"></slot>
      </div>
    </div>
    <div class="cn-chart__body">
      <slot></slot>
    </div>
    <div class="chart__loading" v-show="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div class="cn-chart__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ChartMap',
  props: {
    loading: Boolean,
    hideHeader: Boolean
  },
  data () {
    return {
      errorContent: '出错了。。。',
      isError: true
    }
  }
}
</script>
