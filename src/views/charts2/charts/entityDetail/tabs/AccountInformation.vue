<template>
  <div>
    <chart-error v-if="showError" :content="errorMsg" class="entity-subscriber-detail-error"></chart-error>
    <chart-no-data v-if="isNoData && !showError"></chart-no-data>

    <div v-if="!showError && !isNoData && initFlag" class="type-data__column">
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark"></span>
          <span class="type-title-word">{{ $t('entities.tab.email') }}</span>({{ mailList.length }})
        </div>
        <div class="type-content">
          <div v-for="(mail, index) in mailList.slice(0,showMailListInfo.num)" :key="index" class="data-item">
            {{ mail }}
          </div>
        </div>
        <div class="more" v-if="mailList.length > entityDetailRelatedEntitiesShowSize">
          <span class="button" :style="{'opacity': mailList.length > showMailListInfo.num ? 1 : 0.6}"  @click="showMore(showMailListInfo,mailList)">{{ $t('overall.more') }} > </span>
        </div>
      </div>
    </div>

    <div v-if="!showError && !isNoData && initFlag" class="type-data__column">
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark"></span>
          <span class="type-title-word">{{ $t('entities.tab.wetchat') }}</span>({{ wetchatList.length }})
        </div>
        <div class="type-content">
          <div v-for="(wetchat, index) in wetchatList.slice(0,showWetchatListInfo.num)" :key="index" class="data-item">
            {{ wetchat }}
          </div>
        </div>
        <div class="more" v-if="wetchatList.length > entityDetailRelatedEntitiesShowSize">
          <span class="button" :style="{'opacity': wetchatList.length > showWetchatListInfo.num ? 1 : 0.6}"  @click="showMore(showWetchatListInfo,wetchatList)">{{ $t('overall.more') }} > </span>
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
  name: 'AccountInformation',
  mixins: [chartMixin],
  props: {
  },
  data () {
    return {
      mailList: [],
      showMailListInfo: {
        num: 0
      },
      wetchatList: [],
      showWetchatListInfo: {
        num: 0
      },
      initFlag: false, // 初始化标识，请求接口之后再显示，避免标题初始化会闪一下
      showError2: false,
      errorMsg2: '',
      isNoData2: false
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
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.accountInformation
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
      /*
      axios.get(api.entity.accountInformation, { params: params }).then(response => {
        const res = response.data
        if (response.status === 200) {
          this.isNoData = res.data.result.length === 0
          this.$emit('checkTag', entityDetailTabsName.accountInformation, res.data.result.length)
          this.showError = false
          if (!this.isNoData) {
            this.mailList = res.data.result
            this.handleShowDataNum(this.showMailListInfo, this.mailList)
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        this.httpError(e)
      }).finally(() => {
        this.initFlag = true
        this.toggleLoading(false)
      }) */
      this.isNoData = true
      this.showError = false
      this.initFlag = true
      this.toggleLoading(false)
    },
    httpError (e) {
      this.$emit('checkTag', entityDetailTabsName.accountInformation, 0)
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    }
  }
}
</script>
