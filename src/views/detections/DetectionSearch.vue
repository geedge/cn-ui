<template>
  <div class="explorer-search explorer-search--show-list">
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
      columnList: [
        {
          name: 'event_severity',
          type: 'string',
          label: 'Event severity'
        },
        {
          name: 'security_type',
          type: 'string',
          label: 'Security type'
        }
      ],
      operatorList: ['=', '!=', '>', '<', '>=', '<='/*, 'IN', 'NOT IN', 'LIKE', 'NOT LIKE'*/],
      connectionList: [
        {
          value: 'AND',
          label: 'AND'
        },
        {
          value: 'OR',
          label: 'OR'
        }
      ]
    }
  },
  methods: {
    search () {

    }
  }
}
</script>
