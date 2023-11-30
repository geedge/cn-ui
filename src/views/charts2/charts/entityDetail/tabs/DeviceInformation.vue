<template>
  <div>
    <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
    <chart-no-data v-if="isNoData && !showError"></chart-no-data>

    <div v-if="!showError && !isNoData && initFlag" class="type-data__column">
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark"></span>
          <span class="type-title-word">{{ $t('entities.tab.device') }}</span>({{ deviceList.length }})
        </div>
        <div class="type-content">
          <div v-for="(device, index) in deviceList.slice(0,showDeviceListInfo.num)" :key="index" class="data-item">
            {{ device }}
          </div>
        </div>
        <div class="more" v-if="deviceList.length > entityDetailRelatedEntitiesShowSize">
          <span class="button" :style="{'opacity': deviceList.length > showDeviceListInfo.num ? 1 : 0.6}"  @click="showMore(showDeviceListInfo,deviceList)">{{ $t('overall.more') }} > </span>
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
  name: 'DeviceInformation',
  mixins: [chartMixin],
  props: {
  },
  data () {
    return {
      deviceList: [],
      showDeviceListInfo: {
        num: 0
      },
      showError: false,
      errorMsg: '',
      url: api.entity.deviceInformation,
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
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.deviceInformation
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
      axios.get(this.url, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          this.isNoData = res.data.result.length === 0
          this.$emit('checkTag', entityDetailTabsName.deviceInformation, res.data.result.length)
          this.showError = false
          if (!this.isNoData) {
            this.deviceList = res.data.result
            this.handleShowDataNum(this.showDeviceListInfo, this.deviceList)
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        this.httpError(e)
      }).finally(() => {
        // 测试代码----------------
        this.deviceList = [
          'Huawei mate20',
          'Iphone 14pro max',
          'Xiaomi 12'
        ]
        this.handleShowDataNum(this.showDeviceListInfo, this.deviceList)
        this.isNoData = false
        this.showError = false
        // ----------------------
        this.initFlag = true
        this.toggleLoading(false)
      })
    },
    httpError (e) {
      this.$emit('checkTag', entityDetailTabsName.deviceInformation, 0)
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    }
  }
}
</script>
