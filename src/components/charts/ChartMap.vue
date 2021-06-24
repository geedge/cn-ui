<template>
  <div class="cn-chart cn-chart__map">
    <div class="cn-chart__header">
      <div class="header__title">
        <slot name="title"></slot>
      </div>
      <div class="header__operations">
        <slot name="operations"></slot>
      </div>
    </div>
    <div class="cn-chart__body">
      <slot></slot>
    </div>
    <div class="cn-chart__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ChartMap'
}
</script>

<style>

</style>
