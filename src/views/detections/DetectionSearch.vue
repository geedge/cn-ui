<template>
  <div class="explorer-search explorer-search--show-list">
    <div class="explorer-search__input-case explorer-search__input-case--question-mark-in-line">
      <div class="explorer-search__input">
        <advanced-search
            ref="search"
            :column-list="columnList[pageType]"
            :connection-list="connectionList"
            class="advanced-search--show-list"
            :full-text="true"
            :show-list="showList"
            @search="search"
        ></advanced-search>
      </div>
<!--      <div class="search-symbol-inline">-->
<!--        <i class="cn-icon cn-icon-help"></i>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script>
import AdvancedSearch from '@/components/advancedSearch/Index'
import { humpToLine } from '@/utils/tools'
import { schemaDetectionSecurity } from '@/utils/static-data'
export default {
  name: 'DetectionSearch',
  props: {
    pageType: String
  },
  components: {
    AdvancedSearch
  },
  data () {
    return {
      columnList: {
        securityEvent: schemaDetectionSecurity,
        performanceEvent: [
          {
            name: 'event_severity',
            type: 'string',
            // label: 'Event severity'
            label: 'event_severity',
            doc: {
              constraints: {
                operator_functions: '=,in'
              }
            }
          },
          {
            name: 'app_name',
            type: 'string',
            // label: 'APP name'
            label: 'app_name',
            doc: {
              constraints: {
                operator_functions: '=,in'
              }
            }
          },
          {
            name: 'domain',
            type: 'string',
            // label: 'Domain'
            label: 'domain',
            doc: {
              constraints: {
                operator_functions: '=,in'
              }
            }
          },
          {
            name: 'server_ip',
            type: 'string',
            // label: 'IP'
            label: 'server_ip',
            doc: {
              constraints: {
                operator_functions: '=,in'
              }
            }
          }
        ]
      },
      operatorList: ['=', '!=', /* '>', '<', '>=', '<=', */'IN', 'NOT IN', 'LIKE', 'NOT LIKE'],
      connectionList: [
        {
          value: 'AND',
          label: 'AND'
        },
        {
          value: 'OR',
          label: 'OR'
        }
      ],
      showList: true
    }
  },
  emits: ['search'],
  methods: {
    /* search (metaList, formatSql) {
      let sql = formatSql
      // 全文搜索处理
      if (metaList && this.$_.isArray(metaList)) {
        const hasFullText = metaList.some(meta => {
          return meta.column && meta.column.type === columnType.fullText
        })
        if (hasFullText) {
          const parser = new SqlParser(metaList, this.columnList[this.pageType])
          sql = parser.parseMetaToSql(metaList, true)
        }
      }
      this.$emit('search', metaList, sql)
    }, */
    search ({ q, metaList }) {
      this.$emit('search', { q, metaList })
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
          value: params.oldValue
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
        this.$refs.search.changeParams([{ newParam, oldParam }])
      } else if (params.oldValue.length === 1 && params.newValue.length === 2) {
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
        this.$refs.search.changeParams([{ newParam, oldParam }])
      } else {
        // 5.参数值数量从多到多，加1或者减1
        const oldParam = {
          column: humpToLine(params.column),
          operator: 'IN',
          value: params.oldValue
        }
        const newParam = {
          column: humpToLine(params.column),
          operator: 'IN',
          value: params.newValue
        }
        this.$refs.search.changeParams([{ newParam, oldParam }])
      }
      this.$nextTick(() => {
        this.emitter.emit('advanced-search')
      })
    }
  }
}
</script>
