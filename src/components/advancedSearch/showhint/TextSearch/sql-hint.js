import { cloneDeep } from 'lodash'
import { matchMain } from './matchRelatedInfo'

export default function (CodeMirror,
  {
    dataset,
    hinthook, // 生成提示的hook 拦截
    keywordshook // 关键字hook  在关键字里面
  }
) {
  // "use strict";

  let tables
  let defaultTable
  let keywords
  let identifierQuote
  const CONS = {
    QUERY_DIV: ';',
    ALIAS_KEYWORD: 'AS'
  }
  const Pos = CodeMirror.Pos; const cmpPos = CodeMirror.cmpPos

  function isArray (val) {
    return Object.prototype.toString.call(val) == '[object Array]'
  }

  function getKeywords (editor) {
    let mode = editor.doc.modeOption
    if (mode === 'sql') mode = 'text/x-sql'
    keywords = CodeMirror.resolveMode(mode).keywords
    if (keywordshook) {
      keywords = keywordshook(keywords, CodeMirror.resolveMode(mode)) || keywords
    }
    return keywords
  }

  function getIdentifierQuote (editor) {
    let mode = editor.doc.modeOption
    if (mode === 'sql') mode = 'text/x-sql'
    return CodeMirror.resolveMode(mode).identifierQuote || '`'
  }

  function getText (item) {
    return typeof item == 'string' ? item : item.text
  }

  function wrapTable (name, value) {
    if (isArray(value)) value = { columns: value }
    if (!value.text) value.text = name
    return value
  }

  function parseTables (input) {
    // table 名称变大写 统一变成对象格式 columns text
    const result = {}
    if (isArray(input)) {
      for (let i = input.length - 1; i >= 0; i--) {
        const item = input[i]
        result[getText(item).toUpperCase()] = wrapTable(getText(item), item)
      }
    } else if (input) {
      for (const name in input) { result[name.toUpperCase()] = wrapTable(name, input[name]) }
    }
    return result
  }

  function getTable (name) {
    return tables[name.toUpperCase()]
  }

  function shallowClone (object) {
    const result = {}
    for (const key in object) {
      if (object.hasOwnProperty(key)) { result[key] = object[key] } 
    }
    return result
  }

  function match (string, word) {
    const len = string.length
    const sub = getText(word).substr(0, len)
    return string.toUpperCase() === sub.toUpperCase()
  }

  function addMatches (result, search, wordlist, formatter) {
    if (isArray(wordlist)) {
      for (let i = 0; i < wordlist.length; i++) { if (match(search, wordlist[i])) result.push(formatter(wordlist[i])) }
    } else {
      for (const word in wordlist) {
        if (wordlist.hasOwnProperty(word)) {
          let val = wordlist[word]
          if (!val || val === true) { val = word } else { val = val.displayText ? { text: val.text, displayText: val.displayText } : val.text }
          if (match(search, val)) result.push(formatter(val))
        } 
      }
    }
  }

  function cleanName (name) {
    // Get rid name from identifierQuote and preceding dot(.)
    if (name.charAt(0) == '.') {
      name = name.substr(1)
    }
    // replace duplicated identifierQuotes with single identifierQuotes
    // and remove single identifierQuotes
    const nameParts = name.split(identifierQuote + identifierQuote)
    for (let i = 0; i < nameParts.length; i++) { nameParts[i] = nameParts[i].replace(new RegExp(identifierQuote, 'g'), '') }
    return nameParts.join(identifierQuote)
  }

  function insertIdentifierQuotes (name) {
    const nameParts = getText(name).split('.')
    for (let i = 0; i < nameParts.length; i++) {
      nameParts[i] = identifierQuote +
        // duplicate identifierQuotes
        nameParts[i].replace(new RegExp(identifierQuote, 'g'), identifierQuote + identifierQuote) +
        identifierQuote 
    }
    const escaped = nameParts.join('.')
    if (typeof name == 'string') return escaped
    name = shallowClone(name)
    name.text = escaped
    return name
  }

  function getLeftpart (cur, token, result, editor) {
    const nameParts = []
    let start = token.start
    let cont = true
    while (cont) {
      // 全是空格  或者  是操作符 就接着往前找
      cont = ((token.type === 'operator' || token.string.match(/^[ ]*$/)) && start !== 0)
      start = token.start
      nameParts.unshift(token.string)
      token = editor.getTokenAt(Pos(cur.line, token.start))
      if (token.type === 'operator') {
        cont = true
        token = editor.getTokenAt(Pos(cur.line, token.start))
      }
    }

    return nameParts[0]
  }

  function isRightpart (cur, token, result, editor) {
    token = editor.getTokenAt(Pos(cur.line, token.start))
    return token.type === 'operator'
  }

  function nameCompletion (cur, token, result, editor) {
    // Try to complete table, column names and return start position of completion
    let useIdentifierQuotes = false
    const nameParts = []
    let start = token.start
    let cont = true
    while (cont) {
      cont = (token.string.charAt(0) == '.')
      useIdentifierQuotes = useIdentifierQuotes || (token.string.charAt(0) == identifierQuote)

      start = token.start
      nameParts.unshift(cleanName(token.string))

      token = editor.getTokenAt(Pos(cur.line, token.start))
      if (token.string == '.') {
        cont = true
        token = editor.getTokenAt(Pos(cur.line, token.start))
      }
    }

    // Try to complete table names
    let string = nameParts.join('.')
    addMatches(result, string, tables, function (w) {
      return useIdentifierQuotes ? insertIdentifierQuotes(w) : w
    })

    // Try to complete columns from defaultTable
    addMatches(result, string, defaultTable, function (w) {
      return useIdentifierQuotes ? insertIdentifierQuotes(w) : w
    })

    // Try to complete columns
    string = nameParts.pop()
    let table = nameParts.join('.')

    let alias = false
    const aliasTable = table
    // Check if table is available. If not, find table by Alias
    if (!getTable(table)) {
      const oldTable = table
      table = findTableByAlias(table, editor)
      if (table !== oldTable) alias = true
    }

    let columns = getTable(table)
    if (columns && columns.columns) { columns = columns.columns }

    if (columns) {
      addMatches(result, string, columns, function (w) {
        let tableInsert = table
        if (alias == true) tableInsert = aliasTable
        if (typeof w == 'string') {
          w = tableInsert + '.' + w
        } else {
          w = shallowClone(w)
          w.text = tableInsert + '.' + w.text
        }
        return useIdentifierQuotes ? insertIdentifierQuotes(w) : w
      })
    }
    return start
  }

  function eachWord (lineText, f) {
    const words = lineText.split(/\s+/)
    for (let i = 0; i < words.length; i++) { if (words[i]) f(words[i].replace(/[`,;]/g, '')) }
  }

  function findTableByAlias (alias, editor) {
    const doc = editor.doc
    const fullQuery = doc.getValue()
    const aliasUpperCase = alias.toUpperCase()
    let previousWord = ''
    let table = ''
    const separator = []
    let validRange = {
      start: Pos(0, 0),
      end: Pos(editor.lastLine(), editor.getLineHandle(editor.lastLine()).length)
    }

    // add separator
    let indexOfSeparator = fullQuery.indexOf(CONS.QUERY_DIV)
    while (indexOfSeparator != -1) {
      separator.push(doc.posFromIndex(indexOfSeparator))
      indexOfSeparator = fullQuery.indexOf(CONS.QUERY_DIV, indexOfSeparator + 1)
    }
    separator.unshift(Pos(0, 0))
    separator.push(Pos(editor.lastLine(), editor.getLineHandle(editor.lastLine()).text.length))

    // find valid range
    let prevItem = null
    const current = editor.getCursor()
    for (var i = 0; i < separator.length; i++) {
      if ((prevItem == null || cmpPos(current, prevItem) > 0) && cmpPos(current, separator[i]) <= 0) {
        validRange = { start: prevItem, end: separator[i] }
        break
      }
      prevItem = separator[i]
    }

    if (validRange.start) {
      const query = doc.getRange(validRange.start, validRange.end, false)

      for (var i = 0; i < query.length; i++) {
        const lineText = query[i]
        eachWord(lineText, function (word) {
          const wordUpperCase = word.toUpperCase()
          if (wordUpperCase === aliasUpperCase && getTable(previousWord)) { table = previousWord }
          if (wordUpperCase !== CONS.ALIAS_KEYWORD) { previousWord = word }
        })
        if (table) break
      }
    }
    return table
  }

  CodeMirror.registerHelper('hint', 'sql', function (editor, options) {
    tables = parseTables(options && options.tables)
    const defaultTableName = options && options.defaultTable // 默认table 名称
    const disableKeywords = options && options.disableKeywords // 禁用的keyword
    defaultTable = defaultTableName && getTable(defaultTableName)
    keywords = getKeywords(editor) // 获取 定义defineMIME 时候的关键字参数
    identifierQuote = getIdentifierQuote(editor) // 获取 引用标识符

    if (defaultTableName && !defaultTable) { defaultTable = findTableByAlias(defaultTableName, editor) }

    defaultTable = defaultTable || []

    if (defaultTable.columns) { defaultTable = defaultTable.columns }

    const cur = editor.getCursor() // line  当前行 ch 索引 sticky ??
    let result = []
    const token = editor.getTokenAt(cur); let start; let end; let search
    if (token.end > cur.ch) {
      token.end = cur.ch
      token.string = token.string.slice(0, cur.ch - token.start)
    }

    // start end search 赋值
    // todo 此处允许字符串包含 .
    // if (token.string.match(/^[.`"'\w@][\w$#]*/g)) {
    if (token.string.match(/^[.`"'\w@][\w#]*/g)) {
      search = token.string
      start = token.start
      end = token.end
    } else {
      start = end = cur.ch
      search = ''
    }

    // 对引用标识符 . 的使用,关联table 列
    if (search.charAt(0) == '.' || search.charAt(0) == identifierQuote) {
      start = nameCompletion(cur, token, result, editor)
    } else {
      const objectOrClass = function (w, className) {
        if (typeof w === 'object') {
          w.className = className
        } else {
          w = { text: w, className: className }
        }
        return w
      }
      addMatches(result, search, defaultTable, function (w) {
        return objectOrClass(w, 'CodeMirror-hint-table CodeMirror-hint-default-table')
      })
      addMatches(
        result,
        search,
        tables, function (w) {
          return objectOrClass(w, 'CodeMirror-hint-table')
        }
      )
      if (!disableKeywords) {
        addMatches(result, search, keywords, function (w) {
          return objectOrClass(w.toUpperCase(), 'CodeMirror-hint-keyword')
        }) 
      }
    }
    // 写入一个 钩子,在这里决定提示的内容
    if (hinthook) {
      const params = {
        search, // 搜索 关键字
        keywords // 关键字列表
      }
      if (token.type === 'operator') {
        params.leftpart = getLeftpart(cur, token, result, editor) || ''
      }
      if (isRightpart(cur, token, result, editor)) {
        params.rightpart = token.string
      }

      /* 之后的参数 是为manualHinthook 预备的 */

      const manualParams = {
        search, // 搜索 关键字
        // keywords, //关键字列表  没啥用
        from: Pos(cur.line, start),
        to: Pos(cur.line, end),
        leftpart: getLeftpart(cur, token, result, editor) || '',
        rightpart: params.rightpart,
        list: cloneDeep(result),
        editor,
        token,
        cur
      }

      const refField = matchMain(CodeMirror, params, manualParams)
      manualParams.refField = refField
      manualParams.leftpart = refField?.label || manualParams.leftpart
      params.leftpart = refField?.label || params.leftpart

      result = hinthook(result, params, manualParams) || result
    }
    return { list: result, from: Pos(cur.line, start), to: Pos(cur.line, end) }
  })
}
