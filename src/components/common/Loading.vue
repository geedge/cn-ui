<template>
  <div class="chart__loading" v-show="showLoading">
    <i class="el-icon-loading"></i>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: {
    loading: Boolean
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
  }
}
</script>
