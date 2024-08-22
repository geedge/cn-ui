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
      <div class="cn-detection__row">
        <div class="cn-detection__header">
          <span class="detection-event-severity-block margin-l-16">{{ detection.eventName || '-' }}</span>
          <div v-for="(item, index) in myDetection.keyList" :key="item.key">
            <span class="detection-event-name">{{item.key}}</span>
            <span class="detection-event-key">({{ item.type }})</span>
            <span v-if="index < myDetection.keyList.length - 1" class="detection-event-line"></span>
          </div>
        </div>

        <div class="cn-detection__body">
          <div class="body__basic-info">
            <div class="basic-info">
              <div class="basic-info__item margin-l-16" v-if="detection.eventType">
                <i class="cn-icon cn-icon-event-type"></i>
                <span>{{$t('detections.eventType')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.eventType || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-time2"></i>
                <span>{{$t('detection.list.startTime')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{dateFormatByAppearance(detection.startTime) || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-time2"></i>
                <span>{{$t('detection.list.endTime')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{dateFormatByAppearance(detection.endTime) || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-duration"></i>
                <span>{{$t('overall.duration')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>
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
          <indicator-match-overview
              v-if="detection.ruleType===detectionRuleType.indicator.key"
              :detection="detection"
              :time-filter="timeFilter"
              :pageObj="pageObj"
              :q="q"
          ></indicator-match-overview>
          <threshold-overview
              v-if="detection.ruleType===detectionRuleType.threshold.key"
              :detection="detection"
              :time-filter="timeFilter"
              :pageObj="pageObj"
              :q="q"
          ></threshold-overview>
          <sequence-overview
              v-if="detection.ruleType===detectionRuleType.sequence.key || detection.ruleType===detectionRuleType.unordered.key"
              :detection="detection"
              :time-filter="timeFilter"
              :pageObj="pageObj"
              :q="q"
          ></sequence-overview>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import { eventSeverityColor, detectionPageType, entityType, detectionRuleType } from '@/utils/constants'
import { getMillisecond, dateFormatByAppearance } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
import { overwriteUrl, urlParamsHandler, changeI18nOfSeverity } from '@/utils/tools'
import IndicatorMatchOverview from '@/views/detections/overview/IndicatorMatchOverview'
import ThresholdOverview from '@/views/detections/overview/ThresholdOverview'
import SequenceOverview from '@/views/detections/overview/SequenceOverview'

export default {
  name: 'DetectionRow',
  components: {
    IndicatorMatchOverview,
    ThresholdOverview,
    SequenceOverview
  },
  props: {
    index: Number,
    timeFilter: Object,
    detection: Object,
    pageType: String, // 安全事件、服务质量
    pageObj: Object,
    q: String
  },
  data () {
    return {
      entityType,
      detectionPageType,
      isCollapse: true, // 是否是折叠状态, true为折叠，false为展开
      eventSeverityColor,
      detectionRuleType,
      myDetection: {}
    }
  },
  mounted () {
    this.initKeyInfo()
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
            color = 'var(--cn-color-critical)'
          }
        }
        return { backgroundColor: color }
      }
    }
  },
  watch: {
    isCollapse (newVal) {
      const newQuery = this.$route.query
      if (newVal && newQuery.eventId) {
        delete newQuery.eventId
        this.reloadUrl(newQuery, 'cleanOldParams')
      }
    }
  },
  methods: {
    unitConvert,
    getMillisecond,
    dateFormatByAppearance,
    changeI18nOfSeverity,
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
    },
    initKeyInfo () {
      let keyValues = this.detection.keyValues
      let keyFields = this.detection.keyFields
      keyValues = keyValues.split(',')
      keyFields = keyFields.split(',')
      const keyList = []
      keyValues.forEach((item, index) => {
        keyList.push({ key: item, type: keyFields[index] })
      })
      this.myDetection.keyList = keyList
    }
  }
}
</script>
