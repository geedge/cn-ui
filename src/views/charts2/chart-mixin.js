export default {
  props: {
    chart: Object,
    timeFilter: Object,
    entity: Object
  },
  data () {
    return {
      isNoData: false,
      showError: false,
      errorMsg: ''
    }
  },
  emits: ['toggleLoading'],
  methods: {
    toggleLoading (loading) {
      this.$emit('toggleLoading', loading)
    }
  }
}
