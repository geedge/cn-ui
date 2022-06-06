import Meta, { connection, condition, columnType } from './meta'
import Token, { types } from './token'
import ParserError, { errorTypes, errorDesc } from '@/components/advancedSearch/meta/error'

const strReg = {
  all: /^[\da-zA-Z\s.'><!=-_(),%]$/,
  key: /^(?![\d])[\da-zA-Z\s.'-_]$/,
  value: /^[\da-zA-Z\s.'-_%]$/
}

export default class Parser {
  constructor (columnList) {
    this.columnList = columnList
    this.tokenList = []
    this.metaList = []
    this.errorList = []
    this.str = ''
    this.q = ''
  }

  validateStr (str) {
    this.reset()
    this._parseStr(str)
    return this.errorList
  }

  validateMeta (metaList) {
    this.reset()
    this._parseMeta(metaList)
    return this.errorList
  }

  reset () {
    this.q = ''
    this.str = ''
    this.metaList = []
    this.tokenList = []
    this.errorList = []
  }

  /*
  * str转为metaList
  * */
  parseStr (str) {
    this.reset()
    this._parseStr(str)
    return {
      str: this.str,
      q: this.q,
      metaList: this.metaList
    }
  }

  parseMeta (metaList) {
    this.reset()
    this._parseMeta(metaList)
    return {
      str: this.str,
      q: this.q,
      metaList: this.metaList
    }
  }

  _parseMeta (metaList) {
    let isMeta = true
    metaList.forEach(meta => {
      if (!(meta instanceof Meta)) {
        isMeta = false
      }
    })
    let str = ''
    if (!isMeta) {
      this.errorList.push(new ParserError(0, errorTypes.typeError, errorDesc.typeError.meta))
    } else {
      this.metaList = metaList
      for (let i = 0; i < metaList.length; i++) {
        const meta = metaList[i]
        if (meta.meta === connection) {
          str += `${meta.value.toUpperCase()} `
        } else if (meta.meta === condition) {
          if (meta.column.type === columnType.fullText) {
            str += `'${meta.column.name}' `
          } else if (meta.column.type === columnType.array) {
            str += `${meta.column.name} ${meta.operator.value} (`
            meta.value.value.forEach((s, j) => {
              str += `'${s}'`
              if (j < meta.value.value.length) {
                str += ','
              }
            })
            str = str.substring(0, str.length - 1)
            str += ') '
          } else if (meta.column.type === columnType.string) {
            if (meta.operator.value.toLowerCase().indexOf('like') > -1 || meta.operator.value.toLowerCase().indexOf('in') > -1) {
              str += `${meta.column.name} ${meta.operator.value} '${meta.value.value}' `
            } else {
              str += `${meta.column.name}${meta.operator.value}'${meta.value.value}' `
            }
          }
        }
      }
    }
    if (str) {
      str = str.substring(0, str.length - 1)
      this.str = str
      this.parseMetaToQ(metaList)
    }
  }

  parseMetaToQ (metaList) {
    let str = ''
    for (let i = 0; i < metaList.length; i++) {
      const meta = metaList[i]
      if (meta.meta === connection) {
        str += `${meta.value.toUpperCase()} `
      } else if (meta.meta === condition) {
        if (meta.column.type === columnType.fullText) {
          str += "QUERY('"
          this.columnList.forEach(column => {
            str += `${column.name}:${meta.column.name} `
          })
          str += "') "
        } else if (meta.column.type === columnType.array) {
          str += `${meta.column.name} ${meta.operator.value} (`
          meta.value.value.forEach((s, j) => {
            str += `'${s}'`
            if (j < meta.value.value.length) {
              str += ','
            }
          })
          str = str.substring(0, str.length - 1)
          str += ') '
        } else if (meta.column.type === columnType.string) {
          if (meta.operator.value.toLowerCase().indexOf('like') > -1 || meta.operator.value.toLowerCase().indexOf('in') > -1) {
            str += `${meta.column.name} ${meta.operator.value} '${meta.value.value}' `
          } else {
            str += `${meta.column.name}${meta.operator.value}'${meta.value.value}' `
          }
        }
      }
    }
    str = str.substring(0, str.length - 1)
    this.q = str
  }

  _parseStr (str) {
    if (typeof str !== 'string') {
      this.errorList.push(new ParserError(0, errorTypes.typeError, errorDesc.typeError.str))
    } else {
      str = str.trim()
      if (!str) {
        return
      }
      this.str = str
      const { tokenList, errorList } = this.parseStrToTokenList(str)
      if (errorList.length === 0) {
        if (tokenList.length > 0) {
          this.tokenList = tokenList
          const { metaList, errorList } = this.parseTokenListToMetaList()
          if (errorList.length === 0) {
            this.metaList = metaList
            this.parseMetaToQ(metaList)
          } else {
            this.errorList = errorList
          }
        }
      } else {
        this.errorList = errorList
      }
    }
  }

  parseStrToTokenList (str) {
    const tokenList = []
    const errorList = []
    const strArr = str.split('')
    let token
    let isInApostrophe = false
    let isInBracket = false
    for (let i = 0; i < strArr.length; i++) {
      const s = strArr[i]
      if (!strReg.all.test(s)) {
        errorList.push(new ParserError(i, errorTypes.illegalChar, s))
        break
      }
      if (s === "'") {
        // 第一次遇到单引号，isInApostrophe=true，如果紧接着也是单引号，视为字符串结束，isInApostrophe=end；；
        // 连续三个单引号报错
        let count = 1
        for (let j = i + 1; j < strArr.length; j++) {
          if (strArr[j] === "'") {
            count++
          } else {
            break
          }
        }
        if (count === 1) {
          token = new Token(types.apostrophe, s)
          token.setStart(i)
          token.setEnd(i + 1)
          tokenList.push(token)
          isInApostrophe = !isInApostrophe
          // 如果单引号结束后，紧跟着不是逗号、右括号、空格的话，报错
          if (!isInApostrophe && strArr[i + 1] && [',', ')', ' '].indexOf(strArr[i + 1]) === -1) {
            errorList.push(new ParserError(i, errorTypes.syntaxError, strArr[i] + strArr[i + 1]))
            break
          }
        } else if (count === 2) {
          isInApostrophe = false
          token = new Token(types.apostrophe, s)
          token.setStart(i)
          token.setEnd(i + 1)
          tokenList.push(token)
          token = new Token(types.apostrophe, s)
          token.setStart(i + 1)
          token.setEnd(i + 2)
          tokenList.push(token)
          i++
        } else {
          errorList.push(new ParserError(i, errorTypes.syntaxError, errorDesc.syntaxError.moreThan2Apostrophe))
          break
        }
      } else if (s === ' ') {
      } else if (s === '(') {
        token = new Token(types.leftBracket, s)
        token.setStart(i)
        token.setEnd(i + 1)
        tokenList.push(token)
        isInBracket = true
      } else if (s === ')') {
        token = new Token(types.rightBracket, s)
        token.setStart(i)
        token.setEnd(i + 1)
        tokenList.push(token)
        isInBracket = false
      } else if (s === ',') {
        token = new Token(types.comma, s)
        token.setStart(i)
        token.setEnd(i + 1)
        tokenList.push(token)
      } else if (['=', '>', '<', '!'].indexOf(s) > -1) {
        if (['>', '<', '!'].indexOf(s) > -1) {
          if (strArr[i + 1] && strArr[i + 1] === '=') {
            token = new Token(types.commonOperator, s + '=')
            token.setStart(i)
            token.setEnd(i + 2)
            tokenList.push(token)
            i++
          } else if (['>', '<'].indexOf(s) > -1) {
            token = new Token(types.commonOperator, s)
            token.setStart(i)
            token.setEnd(i + 1)
            tokenList.push(token)
          }
        } else {
          token = new Token(types.commonOperator, s)
          token.setStart(i)
          token.setEnd(i + 1)
          tokenList.push(token)
        }
      } else if (strReg.value.test(s)) {
        if (!isInApostrophe) {
          if (['i', 'n', 'l'].indexOf(s.toLowerCase()) > -1) {
            // 前一位是否是空格，否则视为普通字符串
            if (s.toLowerCase() === 'i') {
              if (strArr[i + 1] && strArr[i + 1].toLowerCase() === 'n' && strArr[i + 2] && strArr[i + 2] === ' ') {
                token = new Token(types.letterOperator, 'in')
                token.setStart(i)
                token.setEnd(i + 2)
                tokenList.push(token)
                i++
              } else {
                // 普通str，直到遇到空格、操作符；连续2个单引号视为普通字符，例如xi''an
                const t = this.commonStr(i, strArr, [' ', '=', '>', '<', '!', ',', ')'], isInApostrophe, isInBracket, errorList)
                if (t) {
                  tokenList.push(t)
                  i = t.end - 1
                }
              }
            } else if (s.toLowerCase() === 'n') {
              if (strArr[i + 1] && strArr[i + 1].toLowerCase() === 'o' &&
                strArr[i + 2] && strArr[i + 2].toLowerCase() === 't' &&
                strArr[i + 3] && strArr[i + 3] === ' ') {
                let nextSpaceCount = 1
                for (let j = i + 4; j < strArr.length; j++) {
                  if (strArr[j] && strArr[j] === ' ') {
                    nextSpaceCount++
                  } else {
                    break
                  }
                }
                if (strArr[i + 3 + nextSpaceCount] && strArr[i + 3 + nextSpaceCount].toLowerCase() === 'l' &&
                  strArr[i + 3 + nextSpaceCount + 1] && strArr[i + 3 + nextSpaceCount + 1].toLowerCase() === 'i' &&
                  strArr[i + 3 + nextSpaceCount + 2] && strArr[i + 3 + nextSpaceCount + 2].toLowerCase() === 'k' &&
                  strArr[i + 3 + nextSpaceCount + 3] && strArr[i + 3 + nextSpaceCount + 3].toLowerCase() === 'e' &&
                  strArr[i + 3 + nextSpaceCount + 4] && strArr[i + 3 + nextSpaceCount + 4] === ' ') {
                  token = new Token(types.letterOperator, 'not like')
                  token.setStart(i)
                  token.setEnd(i + 3 + nextSpaceCount + 3)
                  tokenList.push(token)
                  i = i + 3 + nextSpaceCount + 3
                } else if (strArr[i + 3 + nextSpaceCount] && strArr[i + 3 + nextSpaceCount].toLowerCase() === 'i' &&
                  strArr[i + 3 + nextSpaceCount + 1] && strArr[i + 3 + nextSpaceCount + 1].toLowerCase() === 'n' &&
                  strArr[i + 3 + nextSpaceCount + 2] && strArr[i + 3 + nextSpaceCount + 2] === ' ') {
                  token = new Token(types.letterOperator, 'not in')
                  token.setStart(i)
                  token.setEnd(i + 3 + nextSpaceCount + 1)
                  tokenList.push(token)
                  i = i + 3 + nextSpaceCount + 1
                }
              } else {
                // 普通str，直到遇到空格、操作符；连续2个单引号视为普通字符，例如xi''an
                const t = this.commonStr(i, strArr, [' ', '=', '>', '<', '!', ',', ')'], isInApostrophe, isInBracket, errorList)
                if (t) {
                  tokenList.push(t)
                  i = t.end - 1
                }
              }
            } else if (s.toLowerCase() === 'l') {
              if (strArr[i + 1] && strArr[i + 1].toLowerCase() === 'i' &&
                strArr[i + 2] && strArr[i + 2].toLowerCase() === 'k' &&
                strArr[i + 3] && strArr[i + 3].toLowerCase() === 'e' &&
                strArr[i + 4] && strArr[i + 4] === ' ') {
                token = new Token(types.letterOperator, 'like')
                token.setStart(i)
                token.setEnd(i + 3)
                tokenList.push(token)
                i += 3
              } else {
                // 普通str，直到遇到空格、操作符；连续2个单引号视为普通字符，例如xi''an
                const t = this.commonStr(i, strArr, [' ', '=', '>', '<', '!', ',', ')'], isInApostrophe, isInBracket, errorList)
                if (t) {
                  tokenList.push(t)
                  i = t.end - 1
                }
              }
            }
          } else if (['o', 'a'].indexOf(s.toLowerCase()) > -1) {
            // 前一位是否是空格，否则视为普通字符串
            if (s.toLowerCase() === 'o') {
              if (strArr[i + 1] && strArr[i + 1].toLowerCase() === 'r' && strArr[i + 2] && strArr[i + 2] === ' ') {
                token = new Token(types.connection, 'OR')
                token.setStart(i)
                token.setEnd(i + 2)
                tokenList.push(token)
                i++
              } else {
                // 普通str，直到遇到空格、操作符；连续2个单引号视为普通字符，例如xi''an
                const t = this.commonStr(i, strArr, [' ', '=', '>', '<', '!', ',', ')'], isInApostrophe, isInBracket, errorList)
                if (t) {
                  tokenList.push(t)
                  i = t.end - 1
                }
              }
            } else if (s.toLowerCase() === 'a') {
              if (strArr[i + 1] && strArr[i + 1].toLowerCase() === 'n' &&
                strArr[i + 2] && strArr[i + 2].toLowerCase() === 'd' &&
                strArr[i + 3] && strArr[i + 3] === ' ') {
                token = new Token(types.connection, 'AND')
                token.setStart(i)
                token.setEnd(i + 3)
                tokenList.push(token)
                i += 2
              } else {
                // 普通str，直到遇到空格、操作符；连续2个单引号视为普通字符，例如xi''an
                const t = this.commonStr(i, strArr, [' ', '=', '>', '<', '!', ',', ')'], isInApostrophe, isInBracket, errorList)
                if (t) {
                  tokenList.push(t)
                  i = t.end - 1
                }
              }
            } else {
              // 普通str，直到遇到空格、操作符；连续2个单引号视为普通字符，例如xi''an
              const t = this.commonStr(i, strArr, [' ', '=', '>', '<', '!', ',', ')'], isInApostrophe, isInBracket, errorList)
              if (t) {
                tokenList.push(t)
                i = t.end - 1
              }
            }
          } else {
            // 普通str，直到遇到空格、操作符；连续2个单引号视为普通字符，例如xi''an
            const t = this.commonStr(i, strArr, [' ', '=', '>', '<', '!', ',', ')'], isInApostrophe, isInBracket, errorList)
            if (t) {
              tokenList.push(t)
              i = t.end - 1
            }
          }
        } else {
          // 在单引号里，视为普通str，直到遇到下个单引号
          const t = this.commonStr(i, strArr, ["'"], isInApostrophe, isInBracket, errorList)
          if (t) {
            tokenList.push(t)
            i = t.end - 1
          }
        }
      }
    }
    if (isInApostrophe) {
      errorList.push(new ParserError(strArr.length - 1, errorTypes.syntaxError, errorDesc.syntaxError.unclosedApostrophe))
    }
    if (isInBracket) {
      errorList.push(new ParserError(strArr.length - 1, errorTypes.syntaxError, errorDesc.syntaxError.unclosedBracket))
    }
    tokenList.forEach((token, i) => {
      if (token[i - 1]) {
        token.setPrev(tokenList[i - 1])
      }
      if (token[i + 1]) {
        token.setNext(tokenList[i + 1])
      }
    })
    console.info('token:', tokenList)
    return {
      tokenList,
      errorList
    }
  }

  commonStr (i, strArr, endSign, isInApostrophe, isInBracket, errorList) {
    let j = i
    for (; j < strArr.length; j++) {
      if (strArr[j] && strArr[j] === "'") {
        let count = 1
        for (let k = j + 1; k < strArr.length; k++) {
          if (strArr[k] === "'") {
            count++
          } else {
            break
          }
        }
        // 若在单引号里，遇到1个单引号，字符串结束，返回；遇到2个单引号继续；超过2个报错；
        if (isInApostrophe) {
          if (count === 1) {
            const token = new Token(types.commonStr, strArr.slice(i, j).join(''))
            token.setStart(i)
            token.setEnd(j)
            return token
          } else if (count === 2) {
            j++
            continue
          } else {
            errorList.push(new ParserError(j, errorTypes.syntaxError, errorDesc.syntaxError.moreThan2Apostrophe))
            break
          }
        } else {
          // 否则，遇到1个单引号报错；遇到2个单引号继续；超过2个报错；
          if (count === 1) {
            errorList.push(new ParserError(j, errorTypes.syntaxError, "'"))
            break
          } else if (count === 2) {
            j++
            continue
          } else {
            errorList.push(new ParserError(j, errorTypes.syntaxError, errorDesc.syntaxError.moreThan2Apostrophe))
            break
          }
        }
      }
      // 在单引号里，又在括号里，则遇到逗号、右括号就报错
      if (isInBracket && isInApostrophe) {
        if ([',', ')'].indexOf(strArr[j]) > -1) {
          errorList.push(new ParserError(j, errorTypes.syntaxError, errorDesc.syntaxError.unclosedApostrophe))
          break
        }
      }
      if (!strArr[j] || endSign.indexOf(strArr[j]) > -1) {
        break
      }
    }
    if (errorList.length > 0) {
      return null
    }
    if (j > i) {
      const token = new Token(types.commonStr, strArr.slice(i, j).join(''))
      token.setStart(i)
      token.setEnd(j)
      return token
    }
    return null
  }

  parseTokenListToMetaList () {
    const metaList = []
    const errorList = []
    let meta
    let isInApostrophe = false
    let isInBracket = false
    let bracketArr = []
    for (let i = 0; i < this.tokenList.length; i++) {
      // 当前token、前一个token、后一个token
      const token = this.tokenList[i]
      const prevToken = (i - 1 < 0) ? null : this.tokenList[i - 1]
      const nextToken = (i + 1 > this.tokenList.length) ? null : this.tokenList[i + 1]

      if (!meta || meta.isCompleteCondition()) {
        if (token.type === types.connection) {
          meta = new Meta(connection)
        } else {
          meta = new Meta(condition)
        }
      }
      switch (token.type) {
        case types.apostrophe: {
          isInApostrophe = !isInApostrophe
          break
        }
        case types.leftBracket: {
          isInBracket = true
          meta.column.type = columnType.array
          break
        }
        case types.rightBracket: {
          meta.value.value = bracketArr.map(b => b.value)
          bracketArr = []
          isInBracket = false
          break
        }
        case types.comma: {
          // 接的不是单引号或value，报错
          if (nextToken) {
            if ([types.apostrophe, types.commonStr].indexOf(nextToken.type) === -1) {
              errorList.push(new ParserError(token.end, errorTypes.syntaxError, ','))
            }
          }
          break
        }
        case types.commonStr: {
          // 如果在括号里，是in或not in的value之一
          if (isInBracket) {
            // 在单引号里，若下个不是单引号就报错，是单引号继续
            // 不在单引号里，若下个不是逗号或者右括号就报错，是就继续
            if (isInApostrophe) {
              if (this.tokenList[i + 1] && this.tokenList[i + 1].type === types.apostrophe) {
                bracketArr.push(token)
              } else {
                errorList.push(new ParserError(token.end, errorTypes.syntaxError, errorDesc.syntaxError.unclosedApostrophe))
                break
              }
            } else {
              if (nextToken) {
                if ([types.comma, types.rightBracket].indexOf(nextToken.type) === -1) {
                  errorList.push(new ParserError(this.tokenList[i + 1].end, errorTypes.syntaxError, nextToken.value))
                  break
                } else {
                  bracketArr.push(token)
                }
              } else {
                errorList.push(new ParserError(token.end, errorTypes.syntaxError, errorDesc.syntaxError.unclosedBracket))
                break
              }
            }
          } else {
            // 不在括号里，是key或者value
            // 前面是连接符或空，后面是操作符，不在单引号内，则是key
            // 前面是连接符或操作符或空后面是连接符或空，或在单引号内，是value
            if (isInApostrophe) {
              if (meta.column.name) {
                meta.value.value = token.value
                meta.value.type = columnType.string
                meta.column.type = columnType.string
              } else {
                meta.column.type = columnType.fullText
                meta.column.name = token.value
              }
            } else {
              let isColumn = true
              if (nextToken) {
                if (prevToken) {
                  if (prevToken.type === types.connection && [types.commonOperator, types.letterOperator].indexOf(nextToken.type) > -1) {
                    meta.column.type = columnType.string
                    meta.column.name = token.value
                  } else {
                    isColumn = false
                  }
                } else {
                  if ([types.commonOperator, types.letterOperator].indexOf(nextToken.type) > -1) {
                    meta.column.type = columnType.string
                    meta.column.name = token.value
                  } else {
                    isColumn = false
                  }
                }
              } else {
                isColumn = false
              }

              // 不是key，判断是否是value
              if (!isColumn) {
                // 在引号内，引号前面是操作符，则是普通value；前面是连接符或空，则是全文搜索；
                if (isInApostrophe) {
                  if (prevToken && prevToken.prevToken && [types.commonOperator, types.letterOperator].indexOf(prevToken.prevToken.type) > -1) {
                    meta.value.value = token.value
                    meta.value.type = columnType.string
                    meta.column.type = columnType.string
                  } else if (prevToken && (!prevToken.prevToken || prevToken.prevToken.type === types.connection)) {
                    meta.column.type = columnType.fullText
                    meta.column.name = token.value
                  } else {
                    errorList.push(new ParserError(token.end, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedString))
                    break
                  }
                } else {
                  // 前面是连接符或操作符或空后面是连接符或空
                  // 后面是连接符或空
                  if (!nextToken || nextToken.type === types.connection) {
                    // 前面是连接符或操作符或空
                    if (prevToken) {
                      // 前面是操作符，则是普通value；前面是连接符，是全文搜索
                      if ([types.commonOperator, types.letterOperator].indexOf(prevToken.type) > -1) {
                        meta.value.value = token.value
                        meta.value.type = columnType.string
                        meta.column.type = columnType.string
                      } else if (prevToken.type === types.connection) {
                        meta.column.name = token.value
                        meta.column.type = columnType.fullText
                      } else {
                        errorList.push(new ParserError(token.end, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedString))
                        break
                      }
                    } else {
                      meta.column.name = token.value
                      meta.column.type = columnType.fullText
                    }
                  } else {
                    errorList.push(new ParserError(token.end, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedString))
                    break
                  }
                }
              }
            }
          }
          break
        }
        case types.commonOperator:
        case types.letterOperator: {
          // 操作符，前面是key，后面是value或左括号或单引号
          if (nextToken && prevToken) {
            // 前面必须有且是key
            if (prevToken) {
              if (prevToken.type === types.commonStr) {
                if (nextToken.type === types.leftBracket) {
                  if (['in', 'not in'].indexOf(token.value.toLowerCase()) > -1) {
                    meta.operator.value = token.value.toUpperCase()
                    break
                  } else {
                    errorList.push(new ParserError(nextToken.start, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedBracket))
                    break
                  }
                } else if ([types.commonStr, types.apostrophe].indexOf(nextToken.type) > -1) {
                  meta.operator.value = token.value
                  break
                } else {
                  errorList.push(new ParserError(token.start, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedOperator))
                  break
                }
              } else {
                errorList.push(new ParserError(token.start, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedOperator))
                break
              }
            } else {
              errorList.push(new ParserError(token.start, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedOperator))
              break
            }
          } else {
            errorList.push(new ParserError(token.start, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedOperator))
            break
          }
        }
        case types.connection: {
          // 前一个是引号或右括号或value，后一个是引号或key或者value，前后必须都有内容
          if (prevToken && nextToken) {
            if ([types.apostrophe, types.rightBracket, types.commonStr].indexOf(prevToken.type) > -1 && [types.apostrophe, types.commonStr].indexOf(nextToken.type) > -1) {
              meta = new Meta(connection)
              meta.value = token.value.toUpperCase()
            } else {
              errorList.push(new ParserError(token.start, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedConnection))
              break
            }
          } else {
            errorList.push(new ParserError(token.start, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedConnection))
            break
          }
        }
      }
      if (meta.isCompleteCondition()) {
        if (meta.meta === condition) {
          if (meta.column.type === columnType.fullText) {
            meta.operator.show = false
            meta.value.show = false
            meta.column.label = meta.column.name
            metaList.push(meta)
          } else {
            const column = this.columnList.find(c => c.name === meta.column.name)
            if (column) {
              meta.operator.show = true
              meta.value.show = true
              meta.column.label = column.label
              if (meta.column.type === columnType.array) {
                if (meta.value.value.length > 0) {
                  let label = '('
                  meta.value.value.forEach(v => {
                    label += `'${v}',`
                  })
                  label = label.substring(0, label.length - 1)
                  label += ')'
                  meta.value.label = label
                } else {
                  meta.value.label = '()'
                }
              } else {
                meta.value.label = meta.value.value
              }
              metaList.push(meta)
            } else {
              if (metaList.length > 0) {
                metaList.splice(metaList.length - 1, 1)
              }
            }
          }
        } else {
          metaList.push(meta)
        }
      }
    }
    return {
      metaList,
      errorList
    }
  }
}

// 使用单引号包裹
export function stringInQuot (value) {
  const match = `${value}`.match(/^'.+?'$/)
  return match ? value : `'${value}'`
}

// IN和LIKE前后加空格
export function handleOperatorSpace (operator) {
  return ['IN', 'NOT IN', 'LIKE', 'NOT LIKE'].indexOf(operator) > -1 ? ` ${operator} ` : operator
}
