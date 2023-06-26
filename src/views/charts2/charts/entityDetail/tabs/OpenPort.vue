<template>
  <div>
    <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
    <chart-no-data v-if="isNoData && !showError"></chart-no-data>

    <div v-if="!showError && !isNoData && initFlag" class="type-data__column">
      <div class="type-data">
        <div class="type-title">
          <span class="title-mark"></span>
          <span class="type-title-word">{{ $t('entities.tab.currentDevelopmentPortsAndServices') }}</span>({{ openPortList.length }})
        </div>
        <div class="type-content">
          <div v-for="(openPort, index) in openPortList" :key="index" class="data-item">
            {{ openPort.port }}/{{ openPort.l7Protocol }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import chartMixin from '@/views/charts2/chart-mixin'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import chartNoData from '@/views/charts/charts/ChartNoData'
import { entityDetailTabsName } from '@/utils/constants'

export default {
  name: 'OpenPort',
  mixins: [chartMixin],
  props: {
  },
  data () {
    return {
      openPortList: [],
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
  setup () {
  },
  methods: {
    initData () {
      const params = {
        resource: this.entity.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)
      const url = this.getUrlByEntityType(this.entity.entityType)
      axios.get(url, { params: params }).then(response => {
        const res = response.data
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.$emit('checkTag', entityDetailTabsName.openPort, res.data.result.length)
          this.showError = false
          if (!this.isNoData) {
            this.openPortList = res.data.result
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
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    },
    getUrlByEntityType (type) {
      switch (type) {
        case 'ip': return api.entity.openPortOfIp
        case 'domain': return api.entity.openPortOfDomain
        case 'app': return api.entity.openPortOfApp
      }
    }
  }
}
</script>
