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
