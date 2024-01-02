<template>
  <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
  <chart-no-data v-if="isNoData && !showError" test-id="no-data"></chart-no-data>

  <div v-if="!isNoData && !showError" class="entity-detail-event-block">
    <div
        class="entity-detail-event-border"
        v-for="(item, index) in eventList"
        :key="item.eventId">
      <div class="cn-detection--list">
        <div class="cn-detection__case entity-detail-security">
          <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor[item.eventSecurity]}`"></div>
          <div class="cn-detection__row">
            <div class="cn-detection__header">
              <span
                  :test-id="`severity-color-block${index}`"
                  class="detection-event-severity-color-block"
                  :style="`background-color: ${eventSeverityColor[item.eventSeverity]}`">
              </span>
              <span class="detection-event-severity-block">{{ item.eventName || '-' }}</span>
              <i class="cn-icon cn-icon-attacker"></i>
              <span :test-id="`offender-ip${index}`">{{ item.offenderIp || '-' }}</span>
              <div class="domain">{{ item.offenderDomain }}</div>
              <span class="line">-------</span>
              <span class="circle"></span>
              <i class="cn-icon cn-icon-attacked"></i>
              <span :test-id="`victim-ip${index}`">{{ item.victimIp || '-' }}</span>
              <div class="domain">{{ item.domain }}</div>
            </div>
            <div class="cn-detection__body">
              <div class="body__basic-info">
                <div class="basic-info">
                  <div class="basic-info__item" v-if="item.eventSecurity">
                    <i class="cn-icon cn-icon-severity-level"></i>
                    <span>{{ $t('detection.list.eventSecurity') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.eventSecurity || '-' }}</span>
                  </div>
                  <div class="basic-info__item" v-if="item.eventSeverity">
                    <i class="cn-icon cn-icon-severity-level"></i>
                    <span>{{ $t('network.severity') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ toUpperCaseByString(item.eventSeverity) || '-' }}</span>
                  </div>
                  <div class="basic-info__item" v-if="item.eventType">
                    <i class="cn-icon cn-icon-event-type"></i>
                    <span>{{ $t('detections.eventType') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.eventType || '-' }}</span>
                  </div>
                  <div class="basic-info__item" v-if="item.malwareName">
                    <i class="cn-icon cn-icon-trojan"></i>
                    <span>{{ $t('detection.list.malwareName') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.malwareName || '-' }}</span>
                  </div>
                  <div class="basic-info__item" v-if="item.cryptominingPool">
                    <i class="cn-icon cn-icon-mining-pool"></i>
                    <span>{{ $t('detection.list.cryptominingPool') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ item.cryptominingPool || '-' }}</span>
                  </div>
                  <div class="basic-info__item">
                    <i class="cn-icon cn-icon-time2"></i>
                    <span>{{ $t('detection.list.startTime') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ dateFormatByAppearance(parseFloat(item.startTime)) || '-' }}</span>
                  </div>
                  <div class="basic-info__item">
                    <i class="cn-icon cn-icon-duration"></i>
                    <span>{{ $t('overall.duration') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span>{{ unitConvert(item.durationMs, 'time', null, null, 0).join(' ') || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dateFormatByAppearance } from '@/utils/date-util'
import { eventSeverityColor, entityDetailTabsName } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import axios from 'axios'
import { api } from '@/utils/api'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'
import { toUpperCaseByString } from '@/utils/tools'
import chartNoData from '@/views/charts/charts/ChartNoData'

export default {
  name: 'SecurityEvent',
  mixins: [chartMixin],
  data () {
    return {
      eventList: [],
      showError: false,
      eventSeverityColor,
      errorMsg: ''
    }
  },
  components: { chartNoData },
  setup () {
    const { query } = useRoute()
    const entityType = query.entityType
    const entityName = query.entityName

    return {
      entityType,
      entityName
    }
  },
  mounted () {
    this.initData()
    /*this.isNoData = true
    this.$emit('checkTag', entityDetailTabsName.securityEvent, 0)
    this.toggleLoading(true)
    const timer = setTimeout(() => {
      this.toggleLoading(false)
      clearInterval(timer)
    }, 200)*/
  },
  methods: {
    unitConvert,
    toUpperCaseByString,
    dateFormatByAppearance,
    initData () {
      const params = {
        resource: this.entityName
        // startTime: getSecond(this.timeFilter.startTime),
        // endTime: getSecond(this.timeFilter.endTime)
      }

      this.toggleLoading(true)
      if (this.entityName === 'hqzc.wssp.hainan.gov.cn' || this.entityName === '218.77.183.150') {
        setTimeout(() => {
          this.toggleLoading(false)
          this.isNoData = false
          this.eventList = [
            {
              eventId: '1717034000326447105',
              eventType: 'Command and Control',
              eventName: 'Mirai',
              eventKey: '5,26.26.26.1,192.168.38.73',
              ruleId: '5',
              ruleType: 'indicator_match',
              isBuiltin: '1',
              eventSeverity: 'critical',
              offenderIp: '119.102.149.177',
              victimIp: '218.77.183.150',
              domain: 'hqzc.wssp.hainan.gov.cn',
              app: '',
              startTime: new Date().getTime() - 3600 * 1000,
              endTime: '1698207720',
              durationMs: 1613000,
              matchTimes: '1',
              status: '1',
              eventInfo: '{\"knowledge_id\":\"8\",\"name\":\"built_in_ioc_darkweb\",\"ioc_type\":\"ip\",\"ioc_value\":\"26.26.26.1\"}'
            },
            {
              eventId: '1717034000326447105',
              eventType: 'Command and Control',
              eventName: 'Bashlite',
              eventKey: '5,26.26.26.1,192.168.38.73',
              ruleId: '5',
              ruleType: 'indicator_match',
              isBuiltin: '1',
              eventSeverity: 'critical',
              offenderIp: '142.4.196.195',
              victimIp: '218.77.183.150',
              domain: 'hqzc.wssp.hainan.gov.cn',
              app: '',
              startTime: new Date().getTime() - 1600 * 1000,
              endTime: '1698207720',
              durationMs: 1285000,
              matchTimes: '1',
              status: '1',
              eventInfo: '{\"knowledge_id\":\"8\",\"name\":\"built_in_ioc_darkweb\",\"ioc_type\":\"ip\",\"ioc_value\":\"26.26.26.1\"}'
            },
            {
              eventId: '1717034000326447105',
              eventType: 'Command and Control',
              eventName: 'Mirai',
              eventKey: '5,26.26.26.1,192.168.38.73',
              ruleId: '5',
              ruleType: 'indicator_match',
              isBuiltin: '1',
              eventSeverity: 'critical',
              offenderIp: '103.119.112.54',
              victimIp: '218.77.183.150',
              domain: 'hqzc.wssp.hainan.gov.cn',
              app: '',
              startTime: new Date().getTime() - 2600 * 1000,
              endTime: '1698207720',
              durationMs: 2280000,
              matchTimes: '1',
              status: '1',
              eventInfo: '{\"knowledge_id\":\"8\",\"name\":\"built_in_ioc_darkweb\",\"ioc_type\":\"ip\",\"ioc_value\":\"26.26.26.1\"}'
            }
          ]
          this.$emit('checkTag', entityDetailTabsName.securityEvent, 3)
        }, 200)
      } else {
        setTimeout(() => {
          this.isNoData = true
          this.toggleLoading(false)
          this.eventList = []
          this.$emit('checkTag', entityDetailTabsName.securityEvent, 0)
        }, 200)
        /*axios.get(`${api.entity.security}/${this.entityType}`, { params: params }).then(response => {
          const res = response.data

          if (response.status === 200) {
            this.isNoData = res.data.result.length === 0
            this.$emit('checkTag', entityDetailTabsName.securityEvent, res.data.result.length)
            this.showError = false
            if (!this.isNoData) {
              this.eventList = res.data.result
            }
          } else {
            this.httpError(res)
          }
        }).catch(e => {
          console.error(e)
          this.httpError(e)
        }).finally(() => {
          this.toggleLoading(false)
        })*/
      }
    },
    httpError (e) {
      this.$emit('checkTag', entityDetailTabsName.securityEvent, 0)
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    }
  }
}
</script>
