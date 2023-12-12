<template>
  <div class="explorer-search explorer-search--show-list">
    <div class="explorer-search__input-case explorer-search__input-case--question-mark-in-line" style="position: relative">
      <div class="explorer-search__input entity__search">
        <advanced-search
            ref="search"
            :column-list="columnList[pageType]"
            :connection-list="connectionList"
            :default-mode="defaultMode"
            class="advanced-search--show-list"
            :full-text="true"
            :show-list="showList"
            showHint
            @search="search"
        ></advanced-search>
      </div>
      <div class="explorer-search__foot-list" v-ele-click-outside="esc">
        <div class="explorer-search__block" @click="triggerHistory">
          <i class="cn-icon cn-icon-time"></i>
          <div class="search-dividing-line"></div>
        </div>
        <transition name="el-zoom-in-top">
          <div class="search__history" v-if="showHistory">
            <div class="history__items-new">
              <el-table
                  :data="history"
                  scrollbar-always-on="false"
                  @row-click="selectHistory"
                  style="overflow-x: unset"
                  empty-text=" "
              >
                <el-table-column prop="str" :label="$t('overall.expression')" min-width="560" />
                <el-table-column prop="date" :label="$t('overall.time')" sortable width="200">
                  <template #default="scope">
                    <span>{{ changeTimeByDate(scope.row.date) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="clear-all">
              <span @click="clearHistory" v-if="!$_.isEmpty(history)">{{$t('entity.clearAll')}}</span>
              <div v-else>{{$t('overall.noRecords')}}</div>
            </div>
          </div>
        </transition>
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
import { storageKey } from '@/utils/constants'
import _ from 'lodash'
import { changeTimeByDate } from '@/utils/tools'
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
      showList: true,
      showHistory: false,
      history: []
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
    changeTimeByDate,
    search ({ str, q, metaList }) {
      if (str) {
        // 加入搜索记录，将记录数量控制在30以内
        const oldHistory = localStorage.getItem(storageKey.detectionSearchHistory)
        let arr = []
        const newItem = { str, date: this.dateFormatByAppearance(new Date()) }
        if (!_.isEmpty(oldHistory)) {
          const oldArr = JSON.parse(oldHistory)
          if (str === oldArr[0].str) {
            oldArr[0].date = this.dateFormatByAppearance(new Date())
          } else {
            oldArr.unshift(newItem)
          }
          arr = [...oldArr]
          if (arr.length > 30) {
            arr = arr.slice(0, 30)
          }
        } else {
          arr.push(newItem)
        }
        localStorage.setItem(storageKey.detectionSearchHistory, JSON.stringify(arr))
      }
      this.$emit('search', { q, metaList, str })
    },
    changeParams (params) {
      this.$refs.search.addParams(params)
    },
    selectHistory (row) {
      this.$refs.search.setStr(row.str)
      this.showHistory = false
      this.$nextTick(() => {
        if (this.$refs.search.$refs.textMode) {
          this.$refs.search.$refs.textMode.focus()
        }
      })
      if (this.showList) {
        this.$nextTick(() => {
          this.emitter.emit('advanced-search')
        })
      }
    },
    clearHistory () {
      localStorage.setItem(storageKey.detectionSearchHistory, '')
      this.history = []
    },
    triggerHistory () {
      this.showHistory = !this.showHistory
      if (this.showHistory) {
        const history = localStorage.getItem(storageKey.detectionSearchHistory)
        if (!_.isEmpty(history)) {
          this.history = JSON.parse(history)
        }
      }
    },
    esc () {
      const timer = setTimeout(() => {
        this.showHistory = false
        clearTimeout(timer)
      }, 100)
    }
  }
}
</script>
