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
import SqlParser, { stringInQuot, handleOperatorSpace } from '@/components/advancedSearch/meta/sql-parser'
import CodeMirror from 'codemirror'
import { toRaw } from 'vue'
import { columnType } from '@/components/advancedSearch/meta/meta'
import { ElMessage } from 'element-plus'

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
          ElMessage.error(this.$t('tip.invalidExpression'))
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
    // 处理value，例如转换IN的值
    handleValue (value, column, operator) {
      const isArray = ['IN', 'NOT IN'].indexOf(operator) > -1
      if (isArray) {
        if (this.$_.isArray(value)) {
          value = value.map(v => column.type === columnType.string ? stringInQuot(v) : v)
          return `(${value.join(',')})`
        } else {
          return value
        }
      } else {
        return column.type === columnType.string ? stringInQuot(value) : value
      }
    },
    addParams (params) {
      let current = this.codeMirror.getValue()
      params.forEach(param => {
        const column = this.columnList.find(c => c.name === param.column)
        current = `${current ? current + ' AND ' : ''}${param.column}${handleOperatorSpace(param.operator)}${this.handleValue(param.value, column, param.operator)}`
      })
      toRaw(this.codeMirror).setValue(current)
    },
    removeParams (params) {
      let current = this.codeMirror.getValue()
      params.forEach(param => {
        const column = this.columnList.find(c => c.name === param.column)
        // 将对应内容替换为空串
        const sqlPiece = `${param.column}${handleOperatorSpace(param.operator)}${this.handleValue(param.value, column, param.operator)}`.trim()
        const sqlPieceWithConnection = [` AND ${sqlPiece}`, ` OR ${sqlPiece}`, `${sqlPiece} AND `, `${sqlPiece} OR `, sqlPiece]
        sqlPieceWithConnection.forEach(piece => {
          current = current.replace(piece, '')
        })
      })
      toRaw(this.codeMirror).setValue(current)
    },
    changeParams (params) {
      let current = this.codeMirror.getValue()
      params.forEach(param => {
        const oldColumn = this.columnList.find(c => c.name === param.oldParam.column)
        const newColumn = this.columnList.find(c => c.name === param.newParam.column)
        // 将oldParam内容替换为newParam
        const oldSqlPiece = `${param.oldParam.column}${handleOperatorSpace(param.oldParam.operator)}${this.handleValue(param.oldParam.value, oldColumn, param.oldParam.operator)}`.trim()
        const newSqlPiece = `${param.newParam.column}${handleOperatorSpace(param.newParam.operator)}${this.handleValue(param.newParam.value, newColumn, param.newParam.operator)}`.trim()
        current = current.replace(oldSqlPiece, newSqlPiece)
      })
      toRaw(this.codeMirror).setValue(current)
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
