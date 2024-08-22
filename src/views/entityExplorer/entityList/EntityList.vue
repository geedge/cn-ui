<template>
  <div class="entity-list" id="entityList">
    <loading :loading="loading"></loading>
    <div class="entity-list__content">
      <!-- 列表式 -->
      <template v-if="listMode === 'list'">
        <div class="entity-list--list">
          <div class="no-data" v-if="noData">{{ $t('npm.noData') }}</div>
          <div v-if="!isCollapse" @click="collapse" class="cn-entity__shadow"></div>
          <entity-row
              v-for="(data, index) in listData"
              :entity="data"
              :listMode="listMode"
              :keywordList="keywordList"
              :timeFilter="timeFilter"
              :key="data.entityValue"
              :ref="`entityRow${index}`"
              :index="index"
              @switchCollapse="switchCollapse"
          ></entity-row>
        </div>
      </template>
      <!-- 卡片式 -->
      <template v-else-if="listMode === 'block'">
        <div class="entity-list--block">
          <div class="no-data" v-if="noData">{{ $t('npm.noData') }}</div>
          <entity-card
              v-for="(data, index) in listData"
              :entity="data"
              :index="index"
              :listMode="listMode"
              :timeFilter="timeFilter"
              :key="data.entityValue"
          ></entity-card>
        </div>
      </template>

      <div class="entity__pagination" style="position: relative; bottom: 0; width: 100%;">
        <Pagination
                ref="pagination"
                :page-obj="pageObj"
                @pageNo='pageNo'
                @pageSize='pageSize'
                @size-change="pageSize"
                @prev-click="prev"
                @next-click="next"
        >
        </Pagination>
      </div>

    </div>
  </div>
</template>

<script>
import Card from '@/views/entityExplorer/entityList/Card'
import Row from '@/views/entityExplorer/entityList/Row'
import Loading from '@/components/common/Loading'
import Pagination from '@/components/common/Pagination'

export default {
  name: 'EntityList',
  props: {
    listData: Array,
    from: String,
    pageObj: Object,
    loading: Boolean,
    timeFilter: Object,
    listMode: String,
    keywordList: Array
  },
  components: {
    'entity-card': Card,
    'entity-row': Row,
    Loading,
    Pagination
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
      if (this.$refs[`entityRow${this.collapseIndex}`] && this.$refs[`entityRow${this.collapseIndex}`].collapse) {
        this.$refs[`entityRow${this.collapseIndex}`].collapse()
      } else {
        this.$refs[`entityRow${this.collapseIndex}`][0].collapse()
      }
    },
    pageNo (val) {
      this.$emit('pageNo', val)
    },
    pageSize (val) {
      this.$emit('pageSize', val)
    },
    // 点击上一页箭头
    prev () {
      this.$emit('prev')
    },
    // 点击下一页箭头
    next () {
      this.$emit('next')
    },
    // currentPage 改变时会触发
    current (val) {
      this.$emit('next', val)
    },
    handleScrollEntity (e) {
      if (e.target.className === 'cn-entity__shadow') {
        const container = document.getElementById('cnContainer')
        container.scrollTop += e.deltaY / 2
      }
    }
  },
  mounted () {
    // 监听⿏标滚动事件
    window.addEventListener('mousewheel', this.handleScrollEntity)
  },
  unmounted () {
    window.removeEventListener('mousewheel', this.handleScrollEntity)
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
