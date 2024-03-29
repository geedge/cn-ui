<template>
  <div>
    <chart-error v-if="showError" :content="errorMsg"></chart-error>
    <chart-no-data v-if="isNoData && !showError"></chart-no-data>

    <div v-if="!showError && !isNoData && initFlag" class="type-data__column">
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark"></span>
          <span class="type-title-word">{{ $t('entities.tab.currentOpenPortsAndServices') }}</span>({{ openPortList.length }})
        </div>
        <div class="type-content">
          <div v-for="(openPort, index) in openPortList.slice(0,showOpenPortListInfo.num)" :key="index" class="data-item">
            {{ openPort.port }}/{{ openPort.l7Protocol }}
          </div>
        </div>
        <div class="more" v-if="openPortList.length > entityDetailRelatedEntitiesShowSize">
          <span
              class="button"
              :style="{'opacity': openPortList.length > showOpenPortListInfo.num ? 1 : 0.6}"
              @click="showMore(showOpenPortListInfo,openPortList)">
            {{ $t('overall.more') }} >
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import chartMixin from '@/views/charts2/chart-mixin'
import { api } from '@/utils/api'
import chartNoData from '@/views/charts/charts/ChartNoData'
import { entityDetailTabsName } from '@/utils/constants'
import { ref } from 'vue'
import { getNowTime } from '@/utils/date-util'

export default {
  name: 'OpenPort',
  mixins: [chartMixin],
  props: {},
  data () {
    return {
      openPortList: [],
      showOpenPortListInfo: {
        num: 0
      },
      showError: false,
      errorMsg: '',
      initFlag: false // 初始化标识，请求接口之后再显示，避免标题初始化会闪一下
    }
  },
  components: {
    chartNoData
  },
  mounted () {
    this.initData()
  },
  setup (props) {
    // range取 config.js 中配置的值
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.openPort
    const timeFilter = ref({ dateRangeValue })
    const { startTime, endTime } = getNowTime(dateRangeValue)
    timeFilter.value.startTime = startTime
    timeFilter.value.endTime = endTime

    return {
      timeFilter
    }
  },
  methods: {
    initData () {
      const params = this.getParams()
      this.toggleLoading(true)
      const url = this.getUrlByEntityType(this.entity.entityType)
      axios.get(url, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          this.isNoData = res.data.result.length === 0
          this.$emit('checkTag', entityDetailTabsName.openPort, res.data.result.length)
          this.showError = false
          if (!this.isNoData) {
            this.openPortList = res.data.result
            this.handleShowDataNum(this.showOpenPortListInfo, this.openPortList)
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        // console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.initFlag = true
        this.toggleLoading(false)
      })
    },
    httpError (e) {
      this.$emit('checkTag', entityDetailTabsName.openPort, 0)
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    },
    getUrlByEntityType (type) {
      switch (type) {
        case 'ip':
          return api.entity.openPortOfIp
        case 'domain':
          return api.entity.openPortOfDomain
        case 'app':
          return api.entity.openPortOfApp
      }
    }
  }
}
</script>
