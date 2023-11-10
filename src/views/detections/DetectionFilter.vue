<template>
  <div class="detection-filter-case">
    <div class="filter-case__header">{{$t('detections.filters')}}</div>
    <div class="no-data" v-if="isNoData">{{ $t('npm.noData') }}</div>
    <template v-for="(filter, index) in filterData" :key="index">
      <div class="detection-filter" v-show="filter.data.length > 0">
        <div class="filter__header">{{filter.title}}</div>

        <div class="filter__body" style="position: relative">
          <loading :loading="loadingLeft" style="top: -5px;"></loading>

          <div class="filter__body-item"
               v-for="(data, i) in filter.data.slice(0, filter.showIndex)"
               :key="i"
               @click="clickFilterItem(data.label, filter.column, index)">
            <div class="filter__body-item-left">
              <div class="filter__body-item-left-index">{{ i+1 }}</div>
              <div class="filter__body-item-left-label">
                <el-tooltip :content="data.label" placement="top" effect="light" :disabled="disabledLabel">
                    <span @mouseenter="handleMouse(`filter${index}${i}`)" :id="`filter${index}${i}`">
                      <span>{{ data.label }}</span>
                    </span>
                </el-tooltip>
              </div>
            </div>
            <div class="filter__body-item-right">{{ data.count }}</div>
          </div>
        </div>
        <div v-show="filter.showMore"  @click="showMore(filter)"
             :class="filter.showDisabled? 'filter-no-show-more' : 'filter-show-more'">
          {{ $t('overall.showMore') }}
        </div>
        <div class="filter-hr"></div>
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
      eventSeverityColor,
      disabledLabel: true
    }
  },
  methods: {
    showMore (filter) {
      filter.showIndex && (filter.showIndex += 5)
      filter.showIndex >= (filter.data.length - 1) && (filter.showDisabled = true)
    },
    clickFilterItem (name, data, index) {
      if (index === 0) {
        let status = 0
        if (name === this.$t('detections.active')) {
          status = '0'
        } else if (name === this.$t('detections.ended')) {
          status = '1'
        }
        this.$emit('filter', status, data)
      } else {
        this.$emit('filter', name, data)
      }
    },
    handleMouse (id) {
      const dom = document.getElementById(id)
      if (dom) {
        const width = document.getElementById(id).offsetWidth
        this.disabledLabel = width < 180
      } else {
        this.disabledLabel = true
      }
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
