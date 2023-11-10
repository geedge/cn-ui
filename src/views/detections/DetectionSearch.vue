<template>
  <div class="explorer-search explorer-search--show-list">
    <div class="explorer-search__input-case explorer-search__input-case--question-mark-in-line">
      <div class="explorer-search__input">
        <advanced-search
            ref="search"
            :column-list="columnList[pageType]"
            :connection-list="connectionList"
            :default-mode="defaultMode"
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
import { schemaDetectionSecurity } from '@/utils/static-data'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
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
  setup () {
    // 根据地址栏添加mode，即text和tag模式，默认text
    const { query } = useRoute()
    const defaultMode = ref(query.mode || 'text')
    return {
      defaultMode
    }
  },
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
    changeParams (params) {
      this.$refs.search.addParams(params)
    }
  }
}
</script>
