import { entityDetailRelatedEntitiesShowSize, entityDetailTabsName } from '@/utils/constants'
import { getSecond } from '@/utils/date-util'

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
    getParamsByTabType (tabType) {
      let params = {
        resource: this.entity.entityName
      }
      let dataRangeValue = 60 * 24 * 7
      switch (tabType) {
        case entityDetailTabsName.relatedEntity:
          dataRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.relatedEntity
          break
        case entityDetailTabsName.performanceEvent:
          dataRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.performanceEvent
          break
        case entityDetailTabsName.securityEvent:
          dataRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.securityEvent
          params.pageSize = -1
          break
        case entityDetailTabsName.openPort:
          dataRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.openPort
          break
        case entityDetailTabsName.deviceInformation:
          dataRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.deviceInformation
          break
        case entityDetailTabsName.accountInformation:
          dataRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.accountInformation
          break
        case entityDetailTabsName.informationAggregation:
          dataRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.informationAggregation
          break
        case entityDetailTabsName.behaviorPattern:
          dataRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.behaviorPattern
          break
        default:
          dataRangeValue = 60 * 24 * 7
      }

      if (dataRangeValue !== 0) {
        const endTime = window.$dayJs.tz().valueOf()
        const startTime = endTime - dataRangeValue * 60 * 1000
        params = {
          ...params,
          startTime: getSecond(startTime),
          endTime: getSecond(endTime)
        }
      }
      return params
    },
    getParams () {
      const range = this.timeFilter.dateRangeValue
      let params = {
        resource: this.entity.entityName
      }
      if (range !== 0) {
        params = {
          ...params,
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime)
        }
      }
      return params
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
