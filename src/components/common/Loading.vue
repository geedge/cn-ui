<template>
  <div class="chart__loading" v-show="loading">
<!--    <img :class="className" :src="path" alt="" :style="innerStyle">-->
    <div class="cn-loading" :class="className">
      <div class="cn-loading__inner">
      <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: {
    loading: Boolean,
    size: {
      type: String,
      default: 'default' // large default small
    },
    innerStyle: String
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
    let className = ''
    switch (props.size) {
      case 'large': {
        className = 'cn-loading--large'
        break
      }
      case 'small': {
        className = 'cn-loading--small'
        break
      }
      default: {
        className = 'cn-loading--default'
        break
      }
    }
    return {
      className
    }
  }
}
</script>
