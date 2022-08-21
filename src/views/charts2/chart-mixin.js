export default {
  props: {
    chart: Object,
    timeFilter: Object
  },
  data () {
    return {
      isNoData: false
    }
  },
  methods: {
    toggleLoading (loading) {
      this.$emit('toggleLoading', loading)
    }
  }
}
