<template>
  <div class="explorer-search">
    <div class="explorer-search__title" v-show="!showList">{{$t('search.title')}}</div>
    <div class="explorer-search__input-case" :class="{'explorer-search__input-case--question-mark-in-line': showList}">
      <div class="explorer-search__input">
        <advanced-search
          ref="search"
          :show-list="showList"
          @search="search"
        ></advanced-search>
      </div>
      <div class="search-symbol-inline" v-if="showList">
        <i class="cn-icon cn-icon-help"></i>
      </div>
      <div v-else class="explorer-search__foot">
        <div class="foot__item">
          <i class="el-icon-arrow-right" style="padding-right: 5px;"></i>
          <span>{{$t('search.searchHistory')}}</span>
        </div>
        <div class="foot__item">
          <span @click="search">{{$t('overall.explore')}}</span>
          <el-divider direction="vertical"></el-divider>
          <span>{{$t('overall.help')}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdvancedSearch from '@/components/advancedSearch/AdvancedSearch'
export default {
  name: 'CnSearch',
  components: {
    AdvancedSearch
  },
  props: {
    showList: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    search (params) {
      this.$emit('search', params)
    },
    addParams (params) {
      this.$refs.search.addParams(params)
    }
  }
}
</script>
