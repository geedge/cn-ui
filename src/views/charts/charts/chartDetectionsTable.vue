<template>
  <div class="cn-detection__case">
    <div class="cn-detection__case-severity"><i :class="iconClass" class="cn-icon cn-icon-alert-level"></i></div>
    <div class="cn-detection__row">
      <div v-if="security" class="cn-detection__header">
        <span>
          <i :class="{ 'critical': detection.offenderIp === name}" class="cn-icon cn-icon-attacker"></i>
          <span :class="{ 'critical': detection.offenderIp === name}">{{detection.offenderIp || '-'}}</span>
        </span>
        <div :class="{ 'critical': detection.offenderIp === name}" class="domain cn-detection-domain" v-if="detection.domain">{{detection.domain}}</div>
        <span class="line">-------</span>
        <span class="circle"></span>
        <span>
          <i :class="{ 'critical': detection.victimIp === name}" class="cn-icon cn-icon-attacked" ></i>
          <soan :class="{ 'critical': detection.victimIp === name}">{{detection.victimIp || '-'}}</soan>
        </span>

      </div>
      <div v-if="service" class="cn-detection__header">
        <span v-if="detection.entityType === 'app'">
          <i :class="{ 'critical': detection.appName === name}" class="cn-icon cn-icon-app2"></i>
          <span :class="{ 'critical': detection.appName === name}">{{detection.appName || '-'}}</span>
        </span>
        <span v-else-if="detection.entityType === 'ip'">
          <i :class="{ 'critical': detection.serverIp === name}" class="cn-icon cn-icon-ip2"></i>
          <span :class="{ 'critical': detection.serverIp === name}">{{detection.serverIp || '-'}}</span>
        </span>
        <span v-else-if="detection.entityType === 'domain'">
          <i :class="{ 'critical': detection.domain === name}" class="cn-icon cn-icon-domain2"></i>
          <span :class="{ 'critical': detection.domain === name}">{{detection.domain || '-'}}</span>
        </span>
      </div>
      <div class="cn-detection__body">
        <div class="body__basic-info">
          <div class="basic-info">
            <div class="basic-info__item" v-if="detection.eventSecurity">
              <i class="cn-icon cn-icon-severity-level"></i>
              <span>{{$t('detection.list.eventSecurity')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.eventSecurity || '-'}}</span>
            </div>
            <div class="basic-info__item" v-else-if="detection.eventSeverity">
              <i class="cn-icon cn-icon-severity-level"></i>
              <span>{{$t('detections.eventSeverity')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.eventSeverity || '-'}}</span>
            </div>
            <div class="basic-info__item" v-if="security">
              <i class="cn-icon cn-icon-event-type"></i>
              <span>{{$t('detection.list.securityType')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.securityType || '-'}}</span>
            </div>
            <div class="basic-info__item" v-else-if="service">
              <i class="cn-icon cn-icon-event-type"></i>
              <span>{{$t('detections.eventType')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.eventType || '-'}}</span>
            </div>
            <div class="basic-info__item" v-if="security">
              <i class="cn-icon cn-icon-trojan"></i>
              <span>{{$t('detection.list.malwareName')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.malwareName || '-'}}</span>
            </div>
<!--            <div class="basic-info__item" v-if="security">-->
<!--              <i class="cn-icon cn-icon-mining-pool"></i>-->
<!--              <span>{{$t('detection.list.cryptominingPool')}}&nbsp;:&nbsp;&nbsp;</span>-->
<!--              <span>{{detection.cryptominingPool || '-'}}</span>-->
<!--            </div>-->
            <div class="basic-info__item">
              <i class="cn-icon cn-icon-time2"></i>
              <span>{{$t('detection.list.startTime')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{dayJs.tz(getMillisecond(detection.startTime)).format('YYYY-MM-DD HH:mm:ss') || '-'}}</span>
            </div>
            <div class="basic-info__item">
              <i class="cn-icon cn-icon-time2"></i>
              <span>{{$t('overall.duration')}}&nbsp;:&nbsp;&nbsp;</span>
              <span style="display: inline-block;height: 6px;width: 6px;border-radius: 50%;margin-right: 8px;" :style="pointColor(detection)"></span>
              <span>{{unitConvert(detection.durationMs, 'time', null, null, 0).join(' ') || '-'}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMillisecond } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
export default {
  name: 'detectionsTable',
  props: {
    index: Number,
    timeFilter: Object,
    detection: Object,
    security: Boolean,
    service: Boolean,
    pageType: String // 安全事件、服务质量
  },
  data () {
    return {
      name: ''
    }
  },
  computed: {
    iconClass () {
      let className
      switch (this.detection.eventSecurity || this.detection.eventSeverity) {
        case ('critical'): {
          className = 'critical'
          break
        }
        case ('high'): {
          className = 'high'
          break
        }
        case ('info'): {
          className = 'info'
          break
        }
        case ('medium'): {
          className = 'medium'
          break
        }
        case ('low'): {
          className = 'low'
          break
        }
        default: break
      }
      return className
    },
    pointColor () {
      return function (detection) {
        let color = '#8FA1BE'
        if (detection.startTime && detection.endTime) {
          if (getMillisecond(detection.endTime) - getMillisecond(detection.startTime) < 5 * 60 * 1000) {
            color = '#D84C4C'
          }
        }
        return { backgroundColor: color }
      }
    }
  },
  mounted () {
    this.name = this.$route.query.name
  },
  methods: {
    unitConvert,
    getMillisecond
  }
}
</script>
