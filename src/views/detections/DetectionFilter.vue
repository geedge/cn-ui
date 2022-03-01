<template>
  <div class="detection-filter-case">
    <div class="no-data" v-if="isNoData">No data</div>
    <template v-for="(filter, index) in filterData" :key="index">
      <div class="detection-filter" v-show="filter.data.length > 0">
        <div class="filter__header" @click="filter.collapse = !filter.collapse">
          <i class="el-icon-arrow-right" :class="{ 'arrow-rotate': !filter.collapse }"></i>
          <span>{{filter.title}}</span>
        </div>
        <el-collapse-transition>
          <div class="filter__body" v-show="!filter.collapse">
            <el-checkbox-group v-model="filter.value">
              <template v-for="(d, i) in filter.data" :key="i">
                <el-checkbox :label="d.value" v-if="!filter.showIndex || filter.showIndex >= i">
                  <div class="filter__checkbox-label">
                    <div style="display: flex">
                      <span class="severity-color-block" v-if="filter.column === 'eventSeverity'" :style="`background-color: ${eventSeverityColor[d.value]}`"></span>
                      <span :style="filter.column === 'eventSeverity' ? 'padding-left: 10px' : ''">{{d.label}}</span>
                    </div>
                    <div v-if="d.count || d.count === 0">{{d.count}}</div>
                  </div>
                </el-checkbox>
              </template>
            </el-checkbox-group>
            <div class="filter__more" v-if="filter.showMore" @click="showMore(filter)">{{$t('overall.showMore')}}</div>
          </div>
        </el-collapse-transition>
      </div>
    </template>
  </div>
</template>

<script>
import { eventSeverityColor } from '@/utils/constants'
export default {
  name: 'DetectionFilter',
  props: {
    filterData: Array,
    q: String,
    timeFilter: Object
  },
  data () {
    return {
      eventSeverityColor
    }
  },
  methods: {
    /* filterChange (value, filter) {
      this.$emit('filter', filter.column)
    }, */
    showMore (filter) {
      filter.showIndex && (filter.showIndex += 10)
      filter.showIndex >= (filter.data.length - 1) && (filter.showMore = false)
    }
  },
  computed: {
    isNoData () {
      let isNoData = true
      this.filterData.forEach(filter => {
        if (!this.$_.isEmpty(filter.data)) {
          isNoData = false
        }
      })
      return isNoData
    }
  }
}
</script>
