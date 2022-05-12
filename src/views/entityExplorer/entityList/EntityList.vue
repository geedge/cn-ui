<template>
  <div class="entity-list" id="entityList">
    <div class="entity__loading" style="background: #eff2f5;opacity: .6;" v-show="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div class="entity-list__content">
      <!-- 列表式 -->
      <template v-if="listMode === 'list'">
        <div class="entity-list--list">
          <div class="no-data" v-if="noData">No data</div>
          <div v-if="!isCollapse" @click="collapse" class="cn-entity__shadow"></div>
          <entity-row
              v-for="(data, index) in listData"
              :entity="data"
              :listMode="listMode"
              :timeFilter="timeFilter"
              :key="index"
              :ref="`entityRow${index}`"
              :index="index"
              @switchCollapse="switchCollapse"
          ></entity-row>
        </div>
      </template>
      <!-- 卡片式 -->
      <template v-else-if="listMode === 'block'">
        <div class="entity-list--block">
          <div class="no-data" v-if="noData">No data</div>
          <entity-card
              v-for="(data, index) in listData"
              :entity="data"
              :index="index"
              :listMode="listMode"
              :timeFilter="timeFilter"
              :key="index"
          ></entity-card>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Card from '@/views/entityExplorer/entityList/Card'
import Row from '@/views/entityExplorer/entityList/Row'
import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'

export default {
  name: 'EntityList',
  props: {
    listData: Array,
    from: String,
    pageObj: Object,
    loading: Boolean,
    listMode: String
  },
  components: {
    'entity-card': Card,
    'entity-row': Row
  },
  data () {
    return {
      showDetail: false,
      typeName: '',
      entityList: [],
      isCollapse: true,
      collapseIndex: 0,
      tableId: 'entityList',
      listDataCopy: [],
      noData: false
    }
  },
  methods: {
    entityDetail (params) {
      this.$emit('showDetail', { ...params, icon: this.iconClass })
    },
    switchCollapse (isCollapse, index) {
      this.isCollapse = isCollapse
      this.collapseIndex = index
    },
    collapse () {
      this.isCollapse = true
      this.$refs[`entityRow${this.collapseIndex}`].collapse()
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
  },
  setup () {
    // date
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      timeFilter
    }
  }
}
</script>
