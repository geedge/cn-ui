<template>
  <el-input
      class="advanced-search"
      :class="{'advanced-search--show-list': showList}"
      v-model="searchContent"
  >
    <template #suffix>
      <div class="search__suffixes" v-if="!showList">
        <div class="search__suffix">
          <i class="cn-icon cn-icon-search-advance"></i>
        </div>
        <div class="search__suffix">
          <i class="el-icon-search"></i>
        </div>
      </div>
      <div class="search__suffixes--show-list" v-else>
        <div class="search__suffix">
          <i class="cn-icon cn-icon-search-advance"></i>
        </div>
        <div class="search__suffix">
          <i class="el-icon-search"></i>
        </div>
      </div>
    </template>
  </el-input>
<!--  <div class="advanced-search"></div>-->
</template>

<script>
export default {
  name: 'AdvancedSearch',
  props: {
    showList: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      searchContent: ''
    }
  }
}
</script>
