<template>
  <div class="cn-chart cn-chart__single-value chart-header-position" :class="singleValueClass(type)" :style="{backgroundColor:color}">
    <slot name="chartErrorInfo"></slot>
    <div class="single-value-icon__box"  v-if="type != 54">
      <div class="single-value__icon"><i :class="icon"></i></div>
    </div>
    <div class="chart__loading" v-show="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div class="single-value__content" v-if="type === 51">
      <div class="content__data">
        <slot name="data"></slot>
      </div>
      <div class="content__title">
        <slot name="title"></slot>
      </div>
    </div>
    <div class="single-value__content single-value__content--with-chart" v-if="type === 52 || type === 55">
      <div class="content__title">
        <slot name="title"></slot>
      </div>
      <div class="content__data">
        <slot name="data"></slot>
      </div>
      <div class="content__chart">
        <slot name="chart"></slot>
      </div>
    </div>
    <div class="single-value__content" v-if="type === 53">
      <div class="content__title"></div>
      <div class="content__data"></div>
    </div>
    <div class="single-value__content" v-if="type === 54"  >
      <div class="single-value-icon__box"  >
        <div class="single-value__icon">
          <!-- 使用图标-->
          <svg class="cn-icon-svg" aria-hidden="true">
            <use :xlink:href="icon"></use>
          </svg>
        </div>
      </div>
      <div class="single-value__data">
        <div class="content__title">
          <slot name="title"></slot>
        </div>
        <div class="content__data">
          <slot name="data"></slot>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import '@/assets/css/font/iconfont.js'

export default {
  name: 'ChartSingleValue',
  props: {
    type: Number,
    icon: String,
    loading: Boolean,
    color: String
  },
  computed: {
    singleValueClass () {
      return function (type) {
        let c
        switch (type) {
          case 51: {
            c = 'cn-chart__single-value--icon-left'
            break
          }
          case 55:
          case 52: {
            c = 'cn-chart__single-value--chart'
            break
          }
          case 53: {
            c = 'cn-chart__single-value--icon-right'
            break
          }
          case 54: {
            c = 'cn-chart__single-value--icon-right--color'
            break
          }
          default: break
        }
        return c
      }
    }
  }
}
</script>
