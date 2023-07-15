import { entityDetailRelatedEntitiesShowSize } from '@/utils/constants'

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
      errorMsg: '',
      entityDetailRelatedEntitiesShowSize: entityDetailRelatedEntitiesShowSize
    }
  },
  emits: ['toggleLoading'],
  methods: {
    toggleLoading (loading) {
      this.$emit('toggleLoading', loading)
    },
    showMore (showListInfo, allList) {
      const showNum = showListInfo.num
      if (showNum < allList.length) {
        showListInfo.num = showNum + entityDetailRelatedEntitiesShowSize
        if (showNum > allList.length) {
          showListInfo.num = allList.length
        }
      }
    },
    handleShowDataNum (showListInfo, allList) {
      if (allList.length <= entityDetailRelatedEntitiesShowSize) {
        showListInfo.num = allList.length
      } else {
        showListInfo.num = entityDetailRelatedEntitiesShowSize
      }
    }
  }
}
