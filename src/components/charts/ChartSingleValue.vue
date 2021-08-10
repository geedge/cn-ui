<template>
  <div class="cn-chart cn-chart__single-value" :class="singleValueClass(type)">
    <div class="single-value-icon__box">
      <div class="single-value__icon"><i :class="icon"></i></div>
    </div>
    <div class="single-value__content" v-if="type === 51">
      <div class="content__data">
        <slot name="data"></slot>
      </div>
      <div class="content__title">
        <slot name="title"></slot>
      </div>
    </div>
    <div class="single-value__content" v-if="type === 52" style="width: 100%;height: 100%;display: flex;flex-direction: column;justify-content: center;padding: 0px 10px">
      <div class="content__title" style="height: 20%;">
        <slot name="title"></slot>
      </div>
      <div class="content__data" style="height: 20%;">
        <slot name="data"></slot>
      </div>
      <div class="content__chart" style="width: 90%;height: 40%;">
        <slot name="chart"></slot>
      </div>
    </div>
    <div class="single-value__content" v-if="type === 53">
      <div class="content__title"></div>
      <div class="content__data"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartSingleValue',
  props: {
    type: Number,
    icon: String
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
          case 52: {
            c = 'cn-chart__single-value--chart'
            break
          }
          case 53: {
            c = 'cn-chart__single-value--icon-right'
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

<style>

</style>
