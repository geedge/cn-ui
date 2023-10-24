<template>
  <div class="cn-detection--list" :style="{zIndex: !isCollapse ? 5 : 'unset'}">
    <!-- 左侧下拉按钮 -->
    <div class="cn-detection__collapse">
      <div class="cn-detection__collapse-block" @click="switchCollapse">
        <span :class="{'reg-down': !isCollapse}">
        <i class="cn-icon cn-icon-arrow-right"></i>
      </span>
      </div>
    </div>
    <div class="cn-detection__case">
      <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor[detection.severity]}`"></div>
      <div class="cn-detection__row">
        <div class="cn-detection__header" v-if="pageType === detectionPageType.securityEvent">
          <span
              class="detection-event-severity-color-block"
              :style="`background-color: ${eventSeverityColor[detection.eventSeverity]}`">
          </span>
          <span class="detection-event-severity-block">{{ detection.eventName || '-' }}</span>
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
              <div class="basic-info__item" v-if="detection.severity">
                <i class="cn-icon cn-icon-severity-level"></i>
                <span>{{$t('detection.list.security')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.severity || '-'}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.eventSeverity">
                <i class="cn-icon cn-icon-severity-level"></i>
                <span>{{$t('detections.severity')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.eventSeverity || '-'}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.eventType">
                <i class="cn-icon cn-icon-event-type"></i>
                <span>{{$t('detections.eventType')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.eventType || '-'}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.malware">
                <i class="cn-icon cn-icon-trojan"></i>
                <span>{{$t('detection.list.malwareName')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{ $_.get(detection, 'malware.malwareName', '-') || '-' }}</span>
              </div>
              <div class="basic-info__item" v-if="detection.darkweb">
                <i class="cn-icon cn-icon-trojan"></i>
                <span>{{$t('detection.nodeType')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{ $_.get(detection, 'darkweb.nodeType', '-') || '-' }}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-time2"></i>
                <span>{{$t('detection.list.startTime')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{dateFormatByAppearance(detection.startTime) || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-duration"></i>
                <span>{{$t('overall.duration')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>
                  {{ detection.matchTimes || '-'}} {{ $t('detection.list.times') }} /
                  {{unitConvert(parseInt(detection.durationS), 'time', 's', null, 0).join(' ') || '-'}}
                </span>
                <div v-if="parseInt(detection.status) === 0" class="margin-l-10 detection-row-active">{{$t('detections.active')}}</div>
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
              :pageObj="pageObj"
          ></detection-security-event-overview>
          <template v-else>
            <detection-performance-event-ip-overview
                v-if="detection.entityType === entityType.ip.toLowerCase()"
                :detection="detection"
                :time-filter="timeFilter"
                :pageObj="pageObj"
            ></detection-performance-event-ip-overview>
            <detection-performance-event-domain-overview
                v-else-if="detection.entityType === entityType.domain.toLowerCase()"
                :detection="detection"
                :time-filter="timeFilter"
                :pageObj="pageObj"
            ></detection-performance-event-domain-overview>
            <detection-performance-event-app-overview
                v-else-if="detection.entityType === entityType.app.toLowerCase()"
                :detection="detection"
                :time-filter="timeFilter"
                :pageObj="pageObj"
            ></detection-performance-event-app-overview>
          </template>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import { eventSeverityColor, detectionPageType, entityType } from '@/utils/constants'
import { getMillisecond, dateFormatByAppearance } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
import DetectionSecurityEventOverview from '@/views/detections/overview/DetectionSecurityEventOverview'
import DetectionPerformanceEventIpOverview from '@/views/detections/overview/DetectionPerformanceEventIpOverview'
import DetectionPerformanceEventAppOverview from '@/views/detections/overview/DetectionPerformanceEventAppOverview'
import DetectionPerformanceEventDomainOverview from '@/views/detections/overview/DetectionPerformanceEventDomainOverview'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
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
    pageType: String, // 安全事件、服务质量
    pageObj: Object
  },
  data () {
    return {
      entityType,
      detectionPageType,
      isCollapse: true, // 是否是折叠状态, true为折叠，false为展开
      eventSeverityColor
    }
  },
  mounted () {
    this.initExpendTab()
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
    dateFormatByAppearance,
    /* 切换折叠状态 */
    switchCollapse () {
      this.isCollapse = !this.isCollapse
      this.$emit('switchCollapse', this.isCollapse, this.index)

      if (this.isCollapse) {
        const newQuery = this.$route.query
        delete newQuery.eventId
        this.reloadUrl(newQuery, 'cleanOldParams')
      } else {
        this.reloadUrl({ eventId: this.detection.eventId })
      }
    },
    /* 设为折叠状态 */
    collapse () {
      this.isCollapse = true
    },
    /**
     * 向地址栏添加/删除参数
     */
    reloadUrl (newParam, clean) {
      const { query } = this.$route
      let newUrl = urlParamsHandler(window.location.href, query, newParam)
      if (clean) {
        newUrl = urlParamsHandler(window.location.href, query, newParam, clean)
      }
      overwriteUrl(newUrl)
    },
    /**
     * 初始化从npm跳转过来的id，并展开tab
     */
    initExpendTab () {
      if (this.$route.query.eventId) {
        if (this.$route.query.eventId === this.detection.eventId) {
          const container = document.getElementById('cnContainer')
          const dom = document.getElementsByClassName('cn-detection__case')
          // 未展开的item折叠块，高度67+下边距10+底部线高度1，兼容不同分辨率下的tab高度
          let itemHeight = 78
          if (dom && this.index > 0) {
            itemHeight = dom[0].clientHeight + 11
          }

          let topHeight = 554 + this.index * itemHeight
          // 经过测试对比，第7个以后的tab会往上移动，但是手动展开和自动展开tab的滚动条高度一致，为解决该问题，自动加上误差值
          if (this.index > 6) {
            topHeight = topHeight + 6
          }

          container.scrollTop = topHeight

          this.isCollapse = false
          this.$emit('switchCollapse', this.isCollapse, this.index)
        }
      }
    }
  }
}
</script>

<style>
.detection-row-active {
  height: 20px;
  line-height: 20px;
  padding: 0 7px;
  background: #E9EFE1;
  border-radius: 2px;
  font-family: NotoSansHans-Medium;
  font-size: 12px;
  color: #7E9F54;
  font-weight: 500;
}
</style>
