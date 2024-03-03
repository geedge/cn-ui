<template>
  <Transition name="fade">
    <div class="simple-loading" :class="placementClass" v-show="loading">
      <div class="simple-loading__box" :class="sizeClass">
        <div class="simple-loading__inner">
          <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'simpleLoading',
  props: {
    loading: Boolean,
    size: {
      type: String,
      default: 'default' // large default small
    },
    placement: {
      type: String,
      default: 'center' // top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end/center
    }
  },
  data () {
    return {
      showLoading: false
    }
  },
  methods: {
    startLoading () {
      this.showLoading = true
    },
    endLoading () {
      this.showLoading = false
    }
  },
  watch: {
    loading: {
      deep: true,
      immediate: true,
      handler (n) {
        this.showLoading = n
      }
    }
  },
  setup (props) {
    let sizeClass = ''
    switch (props.size) {
      case 'large': {
        sizeClass = 'simple-loading--large'
        break
      }
      case 'small': {
        sizeClass = 'simple-loading--small'
        break
      }
      default: {
        sizeClass = 'simple-loading--default'
        break
      }
    }
    let placementClass = ''
    const placements = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end', 'center']
    if (placements.indexOf(props.placement) > -1) {
      placementClass = `simple-loading--${props.placement}`
    }
    return {
      placementClass,
      sizeClass
    }
  }
}
</script>
<style lang="scss">
.simple-loading {
  position: absolute;
  z-index: 1;

  &.simple-loading--top, &.simple-loading--top-start, &.simple-loading--top-end, &.simple-loading--left-start, &.simple-loading--right-start {
    top: 2px
  }
  &.simple-loading--bottom, &.simple-loading--bottom-start, &.simple-loading--bottom-end, &.simple-loading--left-end, &.simple-loading--right-end {
    bottom: 2px;
  }
  &.simple-loading--left, &.simple-loading--top-start, &.simple-loading--bottom-start, &.simple-loading--left-start, &.simple-loading--left-end {
    left: 2px
  }
  &.simple-loading--right, &.simple-loading--top-end, &.simple-loading--bottom-end, &.simple-loading--right-start, &.simple-loading--right-end {
    right: 2px;
  }
  &.simple-loading--top, &.simple-loading--bottom {
    left: 50%;
  }
  &.simple-loading--left, &.simple-loading--right {
    top: 50%;
  }
  &.simple-loading--top {
    .simple-loading__box {
      transform: translateX(-50%);
    }
  }
  &.simple-loading--left {
    .simple-loading__box {
      transform: translateY(-50%);
    }
  }
  &.simple-loading--top-end, &.simple-loading--right-start {
    .simple-loading__box {
      transform: translateX(-100%);
    }
  }
  &.simple-loading--right {
    .simple-loading__box {
      transform: translate(-100%, -50%);
    }
  }
  &.simple-loading--bottom-start, &.simple-loading--left-end {
    .simple-loading__box {
      transform: translateY(-100%);
    }
  }
  &.simple-loading--bottom {
    .simple-loading__box {
      transform: translate(-50%, -100%);
    }
  }
  &.simple-loading--bottom-end, &.simple-loading--right-end {
    .simple-loading__box {
      transform: translate(-100%, -100%);
    }
  }
  &.simple-loading--center {
    left: 50%;
    top: 50%;

    .simple-loading__box {
      transform: translate(-50%, -50%);
    }
  }

  @keyframes simple-loading__inner {
    0% { opacity: 1 }
    100% { opacity: 0 }
  }

  .simple-loading__box {
    position: absolute;
    display: inline-block;
    overflow: hidden;
    background: transparent;

    &.simple-loading--default {
      width: 27px;
      height: 27px;

      .simple-loading__inner {
        div {
          width: 6px;
          height: 6px;
          border-radius: 3px / 3px;
          transform-origin: 3px 13px;
        }
      }
    }

    &.simple-loading--small {
      width: 20px;
      height: 20px;

      .simple-loading__inner {
        div {
          width: 5px;
          height: 5px;
          border-radius: 3px / 3px;
          transform-origin: 0 9px;
        }
      }
    }
    .simple-loading__inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform: translateZ(0) scale(1);
      backface-visibility: hidden;
      transform-origin: 0 0;

      div {
        left: 10px;
        top: 0;
        position: absolute;
        animation: simple-loading__inner linear 1s infinite;
        background: #3c76cc;
        box-sizing: content-box;
      }
      div:nth-child(1) {
        transform: rotate(0deg);
        animation-delay: -0.875s;
        background: #3c76cc;
      }
      div:nth-child(2) {
        transform: rotate(45deg);
        animation-delay: -0.75s;
        background: #3c76cc;
      }
      div:nth-child(3) {
        transform: rotate(90deg);
        animation-delay: -0.625s;
        background: #3c76cc;
      }
      div:nth-child(4) {
        transform: rotate(135deg);
        animation-delay: -0.5s;
        background: #3c76cc;
      }
      div:nth-child(5) {
        transform: rotate(180deg);
        animation-delay: -0.375s;
        background: #3c76cc;
      }
      div:nth-child(6) {
        transform: rotate(225deg);
        animation-delay: -0.25s;
        background: #3c76cc;
      }
      div:nth-child(7) {
        transform: rotate(270deg);
        animation-delay: -0.125s;
        background: #3c76cc;
      }
      div:nth-child(8) {
        transform: rotate(315deg);
        animation-delay: 0s;
        background: #3c76cc;
      }
    }
  }
}
</style>
