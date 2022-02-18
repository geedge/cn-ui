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
import { humpToLine } from '@/utils/tools'
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
        },
        {
          name: 'victim_ip',
          type: 'string',
          label: 'Victim IP'
        },
        {
          name: 'victim_location_country',
          type: 'string',
          label: 'Victim location'
        },
        {
          name: 'offender_ip',
          type: 'string',
          label: 'Offender IP'
        },
        {
          name: 'offender_location_country',
          type: 'string',
          label: 'Offender location'
        }
      ],
      operatorList: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'LIKE', 'NOT LIKE'],
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

    },
    changeParams (params) { // params: { column: columnName, oldValue: [...], newValue: [...] }
      // 向下传递时需要再转换一次param格式为[{column, operator, value}, ...]
      if (params.oldValue.length === 0 && params.newValue.length === 1) {
        // 1.参数值数量从0到1，直接addParams
        const p = {
          column: humpToLine(params.column),
          operator: '=',
          value: params.newValue
        }
        this.$refs.search.addParams([p])
      } else if (params.oldValue.length === 1 && params.newValue.length === 0) {
        // 2.参数值数量从1到0，直接removeParams
        const p = {
          column: humpToLine(params.column),
          operator: '=',
          value: params.newValue
        }
        this.$refs.search.removeParams([p])
      } else if (params.oldValue.length === 2 && params.newValue.length === 1) {
        // 3.参数值数量从多到1，operator由'in'改为'='
        const oldParam = {
          column: humpToLine(params.column),
          operator: 'IN',
          value: params.oldValue
        }
        const newParam = {
          column: humpToLine(params.column),
          operator: '=',
          value: params.newValue
        }
        this.$refs.search.changeParams(newParam, oldParam)
      } else if (params.oldValue.length === 1 && params.newArray.length === 2) {
        // 4.参数值数量从1到多, operator由'='改为'in'
        const oldParam = {
          column: humpToLine(params.column),
          operator: '=',
          value: params.oldValue
        }
        const newParam = {
          column: humpToLine(params.column),
          operator: 'IN',
          value: params.newValue
        }
        this.$refs.search.changeParams(newParam, oldParam)
      }
    }
  }
}
</script>
