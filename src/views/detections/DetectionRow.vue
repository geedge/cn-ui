<template>
  <div class="cn-entity--list" :style="{zIndex: !isCollapse ? 1 : 'unset'}">
    <!-- 左侧下拉按钮 -->
    <div class="cn-entity__collapse">
      <span @click="switchCollapse" :class="{'reg-down': !isCollapse}"><i class="cn-icon cn-icon-arrow-right"></i></span>
    </div>
    <div class="cn-entity__case">
      <div class="cn-entity__icon"><i class="el-icon-search"></i></div>
      <div class="cn-entity__row">
        <div class="cn-entity__header">3.4.5.6</div>
        <div class="cn-entity__body">
          <div class="body__basic-info">
            <div class="basic-info">
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-country"></i>
                <span>{{$t('overall.country')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>hehe</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-position"></i>
                <span>{{$t('overall.region')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>xixi</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-cloud"></i>
                <span>{{$t('entities.asn')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>heihei</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-collapse-transition>
        <div class="cn-entity__detail-overview" v-if="!isCollapse">
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
    timeFilter: Object
  },
  data () {
    return {
      entityData: [],
      isCollapse: true // 是否是折叠状态
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
