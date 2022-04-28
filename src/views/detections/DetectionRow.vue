<template>
  <div class="cn-detection--list" :style="{zIndex: !isCollapse ? 1 : 'unset'}">
    <!-- 左侧下拉按钮 -->
    <div class="cn-detection__collapse">
      <span @click="switchCollapse" :class="{'reg-down': !isCollapse}"><i class="cn-icon cn-icon-arrow-right"></i></span>
    </div>
    <div class="cn-detection__case">
      <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor[detection.eventSecurity]}`"></div>
      <div class="cn-detection__row">
        <div class="cn-detection__header" v-if="pageType === detectionPageType.securityEvent">
          <i class="cn-icon cn-icon-attacker" ></i>{{detection.offenderIp || '-'}}
          <div v-if="detection.domain" class="domain">{{detection.domain}}</div>
          <span class="line">-------</span>
          <span class="circle"></span>
          <i class="cn-icon cn-icon-attacked" ></i>{{detection.victimIp || '-'}}
        </div>
        <div class="cn-detection__header" v-else-if="pageType === detectionPageType.performanceEvent">
          <div class="cn-entity__icon"><i :class="iconClass"></i></div>
          <div style="padding-left: 3px;">{{detection.serverIp || detection.domain || detection.appName || 'Unknown'}}</div>
        </div>
        <div class="cn-detection__body">
          <div class="body__basic-info">
            <div class="basic-info">
              <div class="basic-info__item" v-if="detection.eventSecurity">
                <i class="cn-icon cn-icon-severity-level"></i>
                <span>{{$t('detection.list.eventSecurity')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.eventSecurity || '-'}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.eventSeverity">
                <i class="cn-icon cn-icon-severity-level"></i>
                <span>{{$t('detections.eventSeverity')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.eventSeverity || '-'}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.securityType">
                <i class="cn-icon cn-icon-event-type"></i>
                <span>{{$t('detection.list.securityType')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.securityType || '-'}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.eventType">
                <i class="cn-icon cn-icon-event-type"></i>
                <span>{{$t('detections.eventType')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.eventType || '-'}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.malwareName">
                <i class="cn-icon cn-icon-trojan"></i>
                <span>{{$t('detection.list.malwareName')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.malwareName || '-'}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.cryptominingPool">
                <i class="cn-icon cn-icon-mining-pool"></i>
                <span>{{$t('detection.list.cryptominingPool')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.cryptominingPool || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-time2"></i>
                <span>{{$t('detection.list.startTime')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{dateFormatByAppearance(detection.startTime) || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-time2"></i>
                <span>{{$t('overall.duration')}}&nbsp;:&nbsp;&nbsp;</span>
                <span style="display: inline-block;height: 6px;width: 6px;border-radius: 50%;margin-right: 8px;"
                      :style="pointColor(detection)"></span>
                <span>{{unitConvert(detection.durationMs, 'time', null, null, 0).join(' ') || '-'}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-collapse-transition>
        <div class="cn-detection__detail-overview" v-if="!isCollapse">
          <el-divider></el-divider>
          <detection-security-event-overview
              v-if="pageType === detectionPageType.securityEvent"
              :detection="detection"
              :time-filter="timeFilter"
          ></detection-security-event-overview>
          <template v-else>
            <detection-performance-event-ip-overview
                v-if="detection.entityType === entityType.ip.toLowerCase()"
                :detection="detection"
                :time-filter="timeFilter"
            ></detection-performance-event-ip-overview>
            <detection-performance-event-domain-overview
                v-else-if="detection.entityType === entityType.domain.toLowerCase()"
                :detection="detection"
                :time-filter="timeFilter"
            ></detection-performance-event-domain-overview>
            <detection-performance-event-app-overview
                v-else-if="detection.entityType === entityType.app.toLowerCase()"
                :detection="detection"
                :time-filter="timeFilter"
            ></detection-performance-event-app-overview>
          </template>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import { eventSeverityColor, detectionPageType, entityType } from '@/utils/constants'
import { getMillisecond } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
import DetectionSecurityEventOverview from '@/views/detections/overview/DetectionSecurityEventOverview'
import DetectionPerformanceEventIpOverview from '@/views/detections/overview/DetectionPerformanceEventIpOverview'
import DetectionPerformanceEventAppOverview from '@/views/detections/overview/DetectionPerformanceEventAppOverview'
import DetectionPerformanceEventDomainOverview from '@/views/detections/overview/DetectionPerformanceEventDomainOverview'
export default {
  name: 'DetectionRow',
  components: {
    DetectionSecurityEventOverview,
    DetectionPerformanceEventIpOverview,
    DetectionPerformanceEventAppOverview,
    DetectionPerformanceEventDomainOverview
  },
  props: {
    index: Number,
    timeFilter: Object,
    detection: Object,
    pageType: String // 安全事件、服务质量
  },
  data () {
    return {
      entityType,
      detectionPageType,
      isCollapse: true, // 是否是折叠状态
      eventSeverityColor
    }
  },
  computed: {
    iconClass () {
      let className
      switch (this.detection.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip2'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain2'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app2'
          break
        }
        default:
          break
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
  methods: {
    unitConvert,
    getMillisecond,
    /* 切换折叠状态 */
    switchCollapse () {
      this.isCollapse = !this.isCollapse
      this.$emit('switchCollapse', this.isCollapse, this.index)
    },
    /* 设为折叠状态 */
    collapse () {
      this.isCollapse = true
    }
  }
}
</script>
