<template>
  <div class="cn-detection--list" :style="{zIndex: !isCollapse ? 1 : 'unset'}">
    <!-- 左侧下拉按钮 -->
    <div class="cn-detection__collapse">
      <span @click="switchCollapse" :class="{'reg-down': !isCollapse}"><i class="cn-icon cn-icon-arrow-right"></i></span>
    </div>
    <div class="cn-detection__case">
      <div class="cn-detection__icon" :style="`background-color: ${eventSeverityColor[detection.eventSecurity]}`">

      </div>
      <div class="cn-detection__row">
        <div class="cn-detection__header">
          <i class="cn-icon cn-icon-attacker" ></i>{{detection.offenderIp}}
          <span class="line">-------</span>
          <span class="circle"></span>
          <i class="cn-icon cn-icon-attacked" ></i>{{detection.victimIp}}
        </div>
          <div class="cn-detection__body">
          <div class="body__basic-info">
            <div class="basic-info">
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-severity-level"></i>
                <span>{{$t('detection.list.eventSecurity')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.eventSecurity}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-event-type"></i>
                <span>{{$t('detection.list.securityType')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.securityType}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.malwareName && detection.malwareName.length > 0 ">
                <i class="cn-icon cn-icon-trojan"></i>
                <span>{{$t('detection.list.malwareName')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.malwareName}}</span>
              </div>
              <div class="basic-info__item" v-if="detection.cryptominingPool && detection.cryptominingPool.length > 0 ">
                <i class="cn-icon cn-icon-mining-pool"></i>
                <span>{{$t('detection.list.cryptominingPool')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{detection.cryptominingPool}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-time2"></i>
                <span>{{$t('detection.list.startTime')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{ dayJs.tz(detection.startTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-collapse-transition>
        <div class="cn-detection__detail-overview" v-if="!isCollapse">
          <el-divider></el-divider>
          <detection-overview
              :entity="entityData"
              :time-filter="timeFilter"
          ></detection-overview>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import DetectionOverview from '@/views/detections/DetectionOverview'
export default {
  name: 'DetectionRow',
  components: {
    DetectionOverview
  },
  props: {
    index: Number,
    timeFilter: Object,
    detection: Object
  },
  data () {
    return {
      entityData: [],
      isCollapse: true, // 是否是折叠状态
      eventSeverityColor: {
        critical: '#D84C4C',
        high: '#FE845D',
        medium: '#FFB65A',
        low: '#FFD82D',
        info: '#D1BD50'
      }
    }
  },
  methods: {
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
