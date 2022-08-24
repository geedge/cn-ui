<template>
  <div class="chart__loading" v-show="showLoading">
<!--    <img :class="className" :src="path" alt="" :style="innerStyle">-->
    <div class="cn-loading">
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
  /*setup (props) {
    const path = window.location.protocol + '//' + window.location.host + '/images/loading.gif'
    let className = ''
    switch (props.size) {
      case 'large': {
        className = 'loading-img--large'
        break
      }
      case 'small': {
        className = 'loading-img--small'
        break
      }
      default: {
        className = 'loading-img--default'
        break
      }
    }
    return {
      path,
      className
    }
  }*/
}
</script>
