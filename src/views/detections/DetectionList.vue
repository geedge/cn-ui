<template>
  <div class="detection-list" id="detectionList">
    <loading :loading="loading"></loading>
    <div class="detection-list__content">
      <div class="detection-list--list">
        <div class="no-data" v-if="noData">No data</div>
        <div v-if="!isCollapse" @click="collapse" class="cn-detection__shadow"></div>
        <detection-row
            style="margin-bottom: 10px"
            class="detection-border"
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
import Loading from '@/components/common/Loading'
export default {
  name: 'DetectionList',
  components: {
    Loading,
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
  mounted () {
    // 监听⿏标滚动事件
    window.addEventListener('mousewheel', this.handleScroll)
  },
  unmounted () {
    window.removeEventListener('mousewheel', this.handleScroll)
  },
  methods: {
    switchCollapse (isCollapse, index) {
      this.isCollapse = isCollapse
      this.collapseIndex = index
      if (isCollapse) {
        this.emitter.emit('switch-collapse')
      }
    },
    collapse () {
      this.isCollapse = true
      if (this.$refs[`detectionRow${this.collapseIndex}`] && this.$refs[`detectionRow${this.collapseIndex}`].collapse) {
        this.$refs[`detectionRow${this.collapseIndex}`].collapse()
      } else {
        this.$refs[`detectionRow${this.collapseIndex}`][0].collapse()
      }
    },
    handleScroll (e) {
      if (e.target.className === 'cn-detection__shadow') {
        const container = document.getElementById('cnContainer')
        container.scrollTop += e.deltaY / 2
      }
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
