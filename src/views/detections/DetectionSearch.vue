<template>
  <div class="explorer-search">
    <div class="explorer-search__input-case explorer-search__input-case--question-mark-in-line">
      <div class="explorer-search__input">
        <advanced-search
            ref="search"
            :column-list="columnList"
            :operator-list="operatorList"
            :connection-list="connectionList"
            :full-text="true"
            class="advanced-search--show-list"
            @search="search"
        ></advanced-search>
      </div>
      <div class="search-symbol-inline">
        <i class="cn-icon cn-icon-help"></i>
      </div>
    </div>
  </div>
</template>

<script>
import AdvancedSearch from '@/components/advancedSearch/Index'
export default {
  name: 'DetectionSearch',
  components: {
    AdvancedSearch
  },
  data () {
    return {
      columnList: [],
      operatorList: [],
      connectionList: []
    }
  },
  methods: {
    search () {

    }
  }
}
</script>
