<template>
  <div class="cn-detection__case">
    <div class="cn-detection__case-severity"><i :class="iconClass" class="cn-icon cn-icon-alert-level"></i></div>
    <div class="cn-detection__row">
      <div class="cn-detection__header">
        <span :class="iconClass"><i :class="iconClass" class="cn-icon cn-icon-attacker"></i>{{detection.offenderIp || '-'}}</span>
        <div :class="iconClass" class="domain cn-detection-domain">{{detection.domain}}</div>
        <span class="line">-------</span>
        <span class="circle"></span>
        <i class="cn-icon cn-icon-attacked" ></i>{{detection.victimIp || '-'}}
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
            <div class="basic-info__item">
              <i class="cn-icon cn-icon-event-type"></i>
              <span>{{$t('detection.list.securityType')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.securityType || '-'}}</span>
            </div>
            <div class="basic-info__item">
              <i class="cn-icon cn-icon-event-type"></i>
              <span>{{$t('detections.eventType')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.eventType || '-'}}</span>
            </div>
            <div class="basic-info__item">
              <i class="cn-icon cn-icon-trojan"></i>
              <span>{{$t('detection.list.malwareName')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.malwareName || '-'}}</span>
            </div>
            <div class="basic-info__item">
              <i class="cn-icon cn-icon-mining-pool"></i>
              <span>{{$t('detection.list.cryptominingPool')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{detection.cryptominingPool || '-'}}</span>
            </div>
            <div class="basic-info__item">
              <i class="cn-icon cn-icon-time2"></i>
              <span>{{$t('detection.list.startTime')}}&nbsp;:&nbsp;&nbsp;</span>
              <span>{{dayJs.tz(getMillisecond(detection.startTime)).format('YYYY-MM-DD HH:mm:ss') || '-'}}</span>
            </div>
            <div class="basic-info__item">
              <i class="cn-icon cn-icon-time2"></i>
              <span>{{$t('overall.duration')}}&nbsp;:&nbsp;&nbsp;</span>
              <span style="display: inline-block;height: 6px;width: 6px;border-radius: 50%;margin-right: 8px;"></span>
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
    pageType: String // 安全事件、服务质量
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
    }
  },
  methods: {
    unitConvert,
    getMillisecond
  }
}
</script>
