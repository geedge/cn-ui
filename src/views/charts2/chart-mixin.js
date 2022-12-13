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
  emits: ['toggleLoading'],
  methods: {
    toggleLoading (loading) {
      this.$emit('toggleLoading', loading)
    }
  }
}
