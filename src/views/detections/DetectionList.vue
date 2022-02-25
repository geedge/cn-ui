<template>
  <div class="detection-list" id="detectionList">
    <div class="detection__loading" style="background: #eff2f5;opacity: .6;" v-show="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div class="detection-list__content">
      <div class="detection-list--list">
        <div class="no-data" v-if="noData">No data</div>
        <div v-if="!isCollapse" @click="collapse" class="cn-detection__shadow"></div>
        <detection-row
            v-for="(data, index) in listData"
            :detection="data"
            :page-type="pageType"
            :timeFilter="timeFilter"
            :key="index"
            :ref="`detectionRow${index}`"
            :index="index"
            @switchCollapse="switchCollapse"
        ></detection-row>
      </div>
    </div>
  </div>
</template>

<script>
import DetectionRow from '@/views/detections/DetectionRow'
export default {
  name: 'DetectionList',
  components: {
    DetectionRow
  },
  props: {
    listData: Array,
    from: String,
    pageObj: Object,
    loading: Boolean,
    timeFilter: Object,
    pageType: String // 安全事件、服务质量
  },
  data () {
    return {
      showDetail: false,
      typeName: '',
      detectionList: [],
      isCollapse: true,
      collapseIndex: 0,
      tableId: 'detectionList',
      listDataCopy: [],
      noData: false
    }
  },
  methods: {
    switchCollapse (isCollapse, index) {
      this.isCollapse = isCollapse
      this.collapseIndex = index
    },
    collapse () {
      this.isCollapse = true
      this.$refs[`detectionRow${this.collapseIndex}`].collapse()
    }
  },
  watch: {
    listData: {
      deep: true,
      handler (n) {
        if (!n || n.length === 0) {
          this.timeout = setTimeout(() => {
            this.noData = true
          }, 500)
        } else {
          clearTimeout(this.timeout)
          this.noData = false
        }
      }
    }
  }
}
</script>
