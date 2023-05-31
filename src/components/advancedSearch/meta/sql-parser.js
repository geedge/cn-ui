// import { GenericSQL, SqlParserVisitor } from 'dt-sql-parser'
import Meta, { connection, condition, columnType, cloneMeta } from '@/components/advancedSearch/meta/meta'
import { riskLevelMapping } from '@/utils/constants'
import _ from 'lodash'
// 补全语句，用于解析
const sqlPrev = 'select a from b where '
export default class SqlParser/* extends SqlParserVisitor */ {
  constructor (init, columnList) {
    // super()
    this.tempMeta = null
    this.originalSql = ''
    this.metaList = []
    this.columnList = columnList
    // 原始数据
    if (_.isArray(init)) {
      this.metaList = init
    } else {
      this.originalSql = init
    }
    // 工具类实例
    this.dtSqlParser = new GenericSQL()
  }

  // 返回的数组是错误信息，为空即校验通过
  validate () {
    return this.dtSqlParser.validate(sqlPrev + this.originalSql)
  }

  // 规范化原始语句
  formatSql () {
    // 先使用originalSql走一遍parse，获取metaList，再将metaList转为sql
    const tree = this.dtSqlParser.parse(sqlPrev + this.originalSql)
    this.visit(tree)
    if (this.metaList.length === 0 && this.tempMeta.column.name) {
      this.tempMeta.column.type = columnType.fullText
      this.tempMeta.column.label = this.tempMeta.column.name
      this.metaList.push(cloneMeta(this.tempMeta))
    }
    this.tempMeta = null
    return {
      metaList: this.metaList,
      formatSql: this.parseMetaToSql(this.metaList)
    }
  }

  formatMetaList () {
    const tempMetaList = cloneMeta(this.metaList)
    this.metaList = []
    tempMetaList.forEach(meta => {
      if (meta.meta === condition) {
        if (meta.column.type === columnType.fullText) {
          const m = cloneMeta(meta)
          m.column.name = meta.column.name
          m.column.label = m.column.name
          this.metaList.push(m)
        } else {
          if (_.isArray(meta.value.value)) {
            const tempArr = meta.value.value.map(v => {
              return meta.column.type === columnType.string ? stringInQuot(v.trim()) : v.trim()
            })
            meta.value.value = `(${tempArr.join(',')})`
            meta.value.label = meta.value.value
          } else {
            const isArray = ['IN', 'NOT IN'].indexOf(meta.operator.value) > -1
            if (isArray) {
              const leftBracketIndex = meta.value.value.indexOf('(')
              const rightBracketIndex = meta.value.value.lastIndexOf(')')
              let temp = meta.value.value.substring(0, rightBracketIndex)
              temp = meta.value.value.substring(leftBracketIndex + 1, temp.length)
              let tempArr = temp.split(',')
              tempArr = tempArr.map(t => meta.column.type === columnType.string ? stringInQuot(t.trim()) : t.trim())
              meta.value.value = `(${tempArr.join(',')})`
            } else {
              meta.value.value = meta.column.type === columnType.string ? stringInQuot(meta.value.value.trim()) : meta.value.value.trim()
            }
            meta.value.label = meta.value.value
          }
          this.metaList.push(meta)
        }
      } else {
        this.metaList.push(meta)
      }
    })
    return {
      metaList: this.metaList,
      formatSql: this.parseMetaToSql(this.metaList)
    }
  }

  parseMetaToSql (metaList, isFullText) {
    let sql = ''
    metaList.forEach(meta => {
      if (isFullText) {
        if (meta.meta === condition) {
          if (meta.column.type !== columnType.fullText) {
            sql += `${meta.column.name}${handleOperatorSpace(meta.operator.value)}${meta.value.value} `
          } else {
            sql += "QUERY('"
            this.columnList.forEach(column => {
              sql += `${column.name}:${meta.column.name.replace(/'/g, '')} `
            })
            sql += "') "
          }
        }
      } else {
        if (meta.meta === condition) {
          sql += (meta.column.name)
          if (meta.column.type !== columnType.fullText) {
            sql += `${handleOperatorSpace(meta.operator.value)}${meta.value.value} `
          } else {
            sql += ' '
          }
        }
      }
      if (meta.meta === connection) {
        sql += `${meta.value} `
      }
    })
    return sql
  }

  buildMeta (type, value) {
    switch (type) {
      case 'expression': {
        // 如果tempMeta是空或已是完整的condition，新建meta
        if (!this.tempMeta || this.tempMeta.isCompleteCondition()) {
          this.tempMeta = new Meta(condition)
        }
        // 如果column.name为空，则参数值是column，否则是value
        if (!this.tempMeta.column.name) {
          // 在columnList中的，按columnList；不在则为全文检索
          const column = this.columnList.find(column => {
            return column.name === value
          })
          this.tempMeta.column.name = value
          this.tempMeta.column.label = column ? column.label : value
          this.tempMeta.column.type = column ? column.type : columnType.fullText
          if (this.tempMeta.column.type === columnType.fullText) {
            this.tempMeta.value.show = false
            this.tempMeta.operator.show = false
            this.metaList.push(cloneMeta(this.tempMeta))
          }
        } else {
          if (_.isArray(value)) {
            const tempArr = value.map(v => {
              return this.tempMeta.column.type === columnType.string ? stringInQuot(v.trim()) : v.trim()
            })
            this.tempMeta.value.value = `(${tempArr.join(',')})`
            this.tempMeta.value.label = this.tempMeta.value.value
          } else {
            const isArray = ['IN', 'NOT IN'].indexOf(this.tempMeta.operator.value) > -1
            if (isArray) {
              const leftBracketIndex = value.indexOf('(')
              const rightBracketIndex = value.lastIndexOf(')')
              let temp = value.substring(0, rightBracketIndex)
              temp = value.substring(leftBracketIndex + 1, temp.length)
              let tempArr = temp.split(',')
              tempArr = tempArr.map(t => this.tempMeta.column.type === columnType.string ? stringInQuot(t.trim()) : t.trim())
              this.tempMeta.value.value = `(${tempArr.join(',')})`
            } else {
              this.tempMeta.value.value = this.tempMeta.column.type === columnType.string ? stringInQuot(value.trim()) : value.trim()
            }
            this.tempMeta.value.label = this.tempMeta.value.value
          }
          this.tempMeta.value.show = true
          this.metaList.push(cloneMeta(this.tempMeta))
        }
        break
      }
      case 'operator': {
        this.tempMeta.operator.value = value
        this.tempMeta.operator.label = value
        this.tempMeta.operator.show = true
        break
      }
      // (not)in和(not)like特殊处理
      case 'like':
      case 'in': {
        const { column, operator, handleValue } = handleInOrLike(value, type)
        this.buildMeta('expression', column)
        this.buildMeta('operator', operator)
        this.buildMeta('expression', handleValue)
        break
      }
      case 'connection': {
        // tempMeta的value为空，则上个条件是全文搜索
        if (!this.tempMeta.column.type && !this.tempMeta.value.value) {
          this.tempMeta.column.type = columnType.fullText
          this.tempMeta.column.label = this.tempMeta.column.name
          this.metaList.push(cloneMeta(this.tempMeta))
          this.tempMeta = null
        }
        const meta = new Meta(connection)
        meta.value = value
        this.metaList.push(meta)
        break
      }
    }
  }

  // 字段或值
  visitExpressionAtomPredicate (ctx) {
    const constant = ctx.getText().toLowerCase()
    this.buildMeta('expression', constant)
  }

  // 操作符
  visitComparisonOperator (ctx) {
    const comparisonOperator = ctx.getText().toLowerCase()
    this.buildMeta('operator', comparisonOperator)
  }

  // 连接符
  visitLogicalOperator (ctx) {
    const logicalOperator = ctx.getText().toUpperCase()
    this.buildMeta('connection', logicalOperator)
  }

  // in语句
  visitInPredicate (ctx) {
    const inPredicate = ctx.getText().toLowerCase()
    this.buildMeta('in', inPredicate)
  }

  // like语句
  visitLikePredicate (ctx) {
    const likePredicate = ctx.getText().toLowerCase()
    this.buildMeta('like', likePredicate)
  }
}

function handleType (value) {
  if (_.isInteger(value)) {
    return columnType.long
  } else if (_.isNumber(value)) {
    return columnType.number
  } else if (_.isString(value)) {
    return columnType.string
  } else if (_.isArray(value)) {
    const arr = value.split(',')
    const hasString = arr.some(v => {
      return handleType(v) === columnType.string
    })
    return hasString ? columnType.string : columnType.number
  }/* else if (isStringInQuot(value)) {
    return columnType.string
  } */
  return null
}

// 使用单引号包裹
export function stringInQuot (value) {
  if (value.indexOf("'") > -1) {
    value = value.split("'").join("''") // 如xi'an，多添加一个单引号，处理为xi''an
  }

  const match = `${value}`.match(/^'.+?'$/)
  // return match ? value : `'${value}'`
  return match ? value : `${value}`
}
// IN和LIKE前后加空格
export function handleOperatorSpace (operator) {
  return ['IN', 'NOT IN', 'LIKE', 'NOT LIKE'].indexOf(operator) > -1 ? ` ${operator} ` : operator
}
// in、like拆分方法；解析后内容挤一堆，如：a in ('b')解析结果是ain('b')，需要拆分
function handleInOrLike (value, type) {
  let sep
  if (type === 'in') {
    sep = `${type}(`
  } else if (type === 'like') {
    sep = `${type}'`
  }
  const notSep = `not${sep}`
  let arr
  let operator
  if (value.split(notSep).length === 2) {
    arr = value.split(notSep)
    operator = `NOT ${type.toUpperCase()}`
  } else {
    arr = value.split(sep)
    operator = type.toUpperCase()
  }
  const columnName = arr[0]

  let v
  if (type === 'in') {
    v = `(${arr[1]}`
  } else if (type === 'like') {
    v = `'${arr[1]}`
  }
  return {
    column: columnName,
    operator,
    handleValue: v
  }
}

function valueHandle (value, columnName) {
  if (value === "'unknown'") {
    return "''"
  } else {
    if (columnName) {
      if (columnName === 'app_risk') {
        const m = riskLevelMapping.find(mapping => {
          return `'${mapping.name}'`.toLowerCase() === value.toLowerCase() || `'${mapping.value}'` === value
        })
        return (m && m.value) || value
      }
    }
    return value
  }
}
