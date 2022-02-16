<template>
  <div class="detection-filter-case">
    <template v-for="(filter, index) in filterData" :key="index">
      <div class="detection-filter">
        <div class="filter__header" @click="filter.collapse = !filter.collapse">
          <i class="el-icon-arrow-right" :class="{ 'arrow-rotate': !filter.collapse }"></i>
          <span>{{filter.title}}</span>
        </div>
        <el-collapse-transition>
          <div class="filter__body" v-show="!filter.collapse">
            <el-checkbox-group v-model="filter.value">
              <template v-for="d in filter.data" :key="d.value">
                <el-checkbox :label="d.value">
                  <div class="filter__checkbox-label">
                    <span class="severity-color-block" v-if="filter.column === 'eventSeverity'" :style="`background-color: ${eventSeverityColor[d.value]}`"></span>
                    <span :style="filter.column === 'eventSeverity' ? 'padding-left: 10px' : ''">{{d.label}}</span>
                  </div>
                </el-checkbox>
              </template>
            </el-checkbox-group>
          </div>
        </el-collapse-transition>
      </div>

    </template>
  </div>
</template>

<script>
export default {
  name: 'DetectionFilter',
  props: {
    filterData: Array,
    q: String,
    timeFilter: Object
  },
  data () {
    return {
      eventSeverityColor: {
        critical: '#D84C4C',
        high: '#FE845D',
        medium: '#FFB65A',
        low: '#FFD82D',
        info: '#D1BD50'
      }
    }
  }
}
</script>
