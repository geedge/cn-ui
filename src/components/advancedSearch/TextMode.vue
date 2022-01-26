<template>
  <textarea
      ref="textSearch"
  ></textarea>
  <div class="search__suffixes search__suffixes--text-mode">
    <div class="search__suffix" @click="changeMode">
      <i class="cn-icon cn-icon-search-advance"></i>
    </div>
    <div class="search__suffix" @click="search">
      <i class="el-icon-search"></i>
    </div>
  </div>
</template>

<script>
import 'codemirror/theme/ambiance.css'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/display/placeholder'
import 'codemirror/mode/sql/sql'
import SqlParser, { stringInQuot } from '@/components/advancedSearch/meta/sql-parser'
import CodeMirror from 'codemirror'
import { toRaw } from 'vue'
import { columnType } from '@/components/advancedSearch/meta/meta'

export default {
  name: 'TextMode',
  props: {
    columnList: Array,
    sql: String
  },
  data () {
    return {
      codeMirror: null
    }
  },
  methods: {
    initCodeMirror () {
      this.codeMirror = CodeMirror.fromTextArea(this.$refs.textSearch, {
        mode: {
          name: 'sql'
        },
        placeholder: 'Enter...',
        lineNumbers: false
      })
      this.codeMirror.setOption('extraKeys', {
        Enter: (cm) => {
          this.search()
        }
      })
    },
    search () {
      let originalSql = this.codeMirror.getValue()
      if (originalSql) {
        originalSql = originalSql.replace(/"/g, '')
        const parser = new SqlParser(originalSql, this.columnList)
        const errorList = parser.validate()
        if (this.$_.isEmpty(errorList)) {
          const { metaList, formatSql } = parser.formatSql()
          toRaw(this.codeMirror).setValue(formatSql)
          this.$emit('search', metaList, formatSql)
        } else {
          console.info(errorList)
        }
      } else {
        this.$emit('search')
      }
    },
    focus () {
      this.codeMirror.focus()
    },
    changeMode () {
      const originalSql = this.codeMirror.getValue()
      const parser = new SqlParser(originalSql, this.columnList)
      const errorList = parser.validate()
      if (this.$_.isEmpty(errorList)) {
        const { metaList, formatSql } = parser.formatSql()
        toRaw(this.codeMirror).setValue(formatSql)
        this.$emit('changeMode', 'tag', metaList)
      } else {
        this.$emit('changeMode', 'tag', [])
      }
    },
    addParams (params) {
      Object.keys(params).forEach(key => {
        const column = this.columnList.find(column => {
          return column.name === key
        })
        let current = this.codeMirror.getValue()
        current = `${key}=${(column.type === columnType.string ? stringInQuot(params[key]) : params[key])} ${current ? 'AND' : ''}`
        toRaw(this.codeMirror).setValue(current)
      })
    }
  },
  watch: {
    sql: {
      immediate: true,
      handler (n) {
        if (n) {
          setTimeout(() => {
            toRaw(this.codeMirror).setValue(n)
          })
        }
      }
    }
  },
  mounted () {
    this.initCodeMirror()
  }
}
</script>
