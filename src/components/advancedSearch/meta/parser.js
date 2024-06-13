import Meta, { columnType, condition, connection } from './meta'
import Token, { types } from './token'
import ParserError, { errorDesc, errorTypes } from '@/components/advancedSearch/meta/error'
import _ from 'lodash'
import { ElMessage } from 'element-plus'
import i18n from '@/i18n'
import store from '@/store'

const strReg = {
  // 需要不限制语言，正则过滤中英日俄语出错实现语言都通过。留个记录观察，后续校验
  all: /^[\da-zA-Z\u4E00-\u9FA5\u3040-\u309F\u0800-\u4e00\u0400-\u04FF\u2000-\u206F\s.'><!=-_(),%]$/,
  key: /^(?![\d])[\da-zA-Z\s.'-_]$/,
  value: /^[\da-zA-Z\u4E00-\u9FA5\u3040-\u309F\u0800-\u4e00\u0400-\u04FF\u2000-\u206F\s.'-_%]$/
}
const operatorList = ['=', ' in ', ' IN ', ' like ', ' LIKE ', 'HAS(', 'has(']
const enumList = ['status', 'eventType', 'severity']

// ipv4校验
const regexIPv4 = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
// ipv6校验
const regexIPv6 = /^(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,5}(?::[0-9A-Fa-f]{1,4}){1,2}|(?:[0-9A-Fa-f]{1,4}:){1,4}(?::[0-9A-Fa-f]{1,4}){1,3}|(?:[0-9A-Fa-f]{1,4}:){1,3}(?::[0-9A-Fa-f]{1,4}){1,4}|(?:[0-9A-Fa-f]{1,4}:){1,2}(?::[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|:(?:(?::[0-9A-Fa-f]{1,4}){1,7}|:)|fe80:(?::[0-9A-Fa-f]{0,4}){0,4}%\w+|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:2[0-4]|1\d|[1-9])?\d|25[0-5])\.(?:(?:2[0-4]|1\d|[1-9])?\d|25[0-5])\.(?:(?:2[0-4]|1\d|[1-9])?\d|25[0-5])\.(?:(?:2[0-4]|1\d|[1-9])?\d|25[0-5])|(?:[0-9A-Fa-f]{1,4}:){1,4}:192\.88\.99\.(\d{1,3})|(?:[0-9A-Fa-f]{1,4}:){1,4}:192\.0\.2\.(\d{1,3})|(?:[0-9A-Fa-f]{1,4}:){1,4}:(?:[0-9A-Fa-f]{1,4}:){0,1}192\.0\.0\.(\d{1,3})|ff00:(?::[0-9A-Fa-f]{0,4}){0,4}|(?:[0-9A-Fa-f]{1,4}:){1,4}:255\.255\.255\.255)$/
// domain校验
const regexDomain = /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*$/

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
            str += this.isSingleQuoteWrapping(meta.column.label) ? `${meta.column.label} ` : `'${meta.column.label}' `
          } else if (meta.column.type === columnType.array) {
            str += `${meta.column.label} ${meta.operator.value} (`
            meta.value.value.forEach((s, j) => {
              str += `'${s}'`
              if (j < meta.value.value.length) {
                str += ','
              }
            })
            str = str.substring(0, str.length - 1)
            str += ') '
          } else if (meta.column.type === columnType.string) {
            // 此处show为false，即tag模式下模糊搜索的值，str不进行转换，q会进行转换，str用于回显
            if (!meta.column.show) {
              str += this.isSingleQuoteWrapping(meta.value.value) ? `${meta.value.value} ` : `'${meta.value.value}' `
            } else {
              if (meta.operator.value.toLowerCase().indexOf('like') > -1 || meta.operator.value.toLowerCase().indexOf('in') > -1) {
                const isWrapped = this.isSingleQuoteWrapping(meta.value.value)
                if (isWrapped || meta.value.value.indexOf("''") > -1) {
                  // 如xi''an这种情况，不需要再添加单引号
                  str += `${meta.column.label} ${meta.operator.value} ${meta.value.value} `
                } else {
                  str += `${meta.column.label} ${meta.operator.value} '${meta.value.value}' `
                }
              } else if (meta.operator.value.toLowerCase().indexOf('has') > -1) {
                const isWrapped = this.isSingleQuoteWrapping(meta.value.value)
                // 如果值被单引号包裹，则不需要再添加单引号包裹，true为单引号包裹
                if (isWrapped) {
                  // 操作符为has时，has函数需要提前，格式为has(label,value)
                  str += `${meta.operator.value}(${meta.column.label},${meta.value.value}) `
                } else {
                  str += `${meta.operator.value}(${meta.column.label},'${meta.value.value}') `
                }
              } else {
                const isWrapped = this.isSingleQuoteWrapping(meta.value.value)
                // 如果值被单引号包裹，则不需要再添加单引号包裹，true为单引号包裹
                if (isWrapped || meta.value.value.indexOf("''") > -1) {
                  str += `${meta.column.label}${meta.operator.value}${meta.value.value} `
                } else {
                  str += `${meta.column.label}${meta.operator.value}'${meta.value.value}' `
                }
              }
            }
          } else if (meta.column.type === columnType.number) {
            if (_.isNumber(Number(meta.value.value))) {
              str += `${meta.column.label}${meta.operator.value}${meta.value.value} `
            } else {
              this.errorList.push(new ParserError(i, errorTypes.typeError, errorDesc.typeError.number))
              return
            }
          }
        }
      }
    }
    if (str) {
      if (str[str.length - 1] === ',' || str[str.length - 1] === ' ') {
        str = str.substring(0, str.length - 1)
      }
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
          // str += "QUERY('"
          // this.columnList.forEach(column => {
          //   str += `${column.label}:${meta.column.label} `
          // })
          // str += "') "
          str = this.comparedEntityKey(this.handleEntityTypeByStr(meta.column.label)).key
        } else if (meta.column.type === columnType.array) {
          str += `${meta.column.label} ${meta.operator.value} (`
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
            const isWrapped = this.isSingleQuoteWrapping(meta.value.value)
            if (isWrapped || meta.value.value.indexOf("''") > -1) {
              // 如xi''an这种情况，不需要再添加单引号
              str += `${meta.column.label} ${meta.operator.value} ${meta.value.value} `
            } else {
              str += `${meta.column.label} ${meta.operator.value} '${meta.value.value}' `
            }
          } else if (meta.operator.value.toLowerCase().indexOf('has') > -1) {
            const isWrapped = this.isSingleQuoteWrapping(meta.value.value)
            if (isWrapped) {
              // 操作符为has时，has函数需要提前，格式为has(label,value)
              str += `${meta.operator.value}(${meta.column.label},${meta.value.value}) `
            } else {
              str += `${meta.operator.value}(${meta.column.label},'${meta.value.value}') `
            }
          } else {
            const isWrapped = this.isSingleQuoteWrapping(meta.value.value)
            if (isWrapped || meta.value.value.indexOf("''") > -1) {
              // 如xi''an这种情况，不需要再添加单引号
              str += `${meta.column.label}${meta.operator.value}${meta.value.value} `
            } else {
              str += `${meta.column.label}${meta.operator.value}'${meta.value.value}' `
            }
          }
        } else if (meta.column.type === columnType.number) {
          if (_.isNumber(Number(meta.value.value))) {
            str += `${meta.column.label}${meta.operator.value}${meta.value.value} `
          }
        }
      }
    }

    if (str[str.length - 1] === ',' || str[str.length - 1] === ' ') {
      str = str.substring(0, str.length - 1)
    }
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
        // 预留
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
          // } else if (['o', 'a'].indexOf(s.toLowerCase()) > -1) {
          } else if (['a'].indexOf(s.toLowerCase()) > -1) {
            // 前一位是否是空格，否则视为普通字符串
            // 处理连接符为or的情况
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
        // if ([',', ')'].indexOf(strArr[j]) > -1) {
        // 目前有ip in ('1.1.1.1,2.2.2.2')该情况，后续待验证
        if ([')'].indexOf(strArr[j]) > -1) {
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
              if (meta.column.label) {
                // meta.value.value = token.value
                meta.value.value = this.isSingleQuoteWrapping(token.value) ? token.value : `'${token.value}'`
                meta.column.type = columnType.string
              } else {
                meta.column.type = columnType.fullText
                meta.column.label = this.isSingleQuoteWrapping(token.value) ? token.value : `'${token.value}'`
              }
            } else {
              let isColumn = true
              if (nextToken) {
                if (prevToken) {
                  if (prevToken.type === types.connection && [types.commonOperator, types.letterOperator].indexOf(nextToken.type) > -1) {
                    meta.column.type = columnType.string
                    meta.column.label = token.value
                  } else if (token.value.toLowerCase().indexOf('has(') > -1) {
                    meta.column.type = columnType.string
                    // 目前token.value为has(Tag，但避免以后使用has函数的实体不限于Tag，故截取has(后的内容
                    meta.column.label = token.value.substring(4)
                    meta.operator.value = 'has'
                  } else {
                    isColumn = false
                  }
                } else {
                  if ([types.commonOperator, types.letterOperator].indexOf(nextToken.type) > -1) {
                    meta.column.type = columnType.string
                    meta.column.label = token.value
                  } else if (token.value.toLowerCase().indexOf('has(') > -1) {
                    meta.column.type = columnType.string
                    // 目前token.value为has(Tag，但避免以后使用has函数的实体不限于Tag，故截取has(后的内容
                    meta.column.label = token.value.substring(4)
                    meta.operator.value = 'has'
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
                    meta.column.type = columnType.string
                  } else if (prevToken && (!prevToken.prevToken || prevToken.prevToken.type === types.connection)) {
                    meta.column.type = columnType.fullText
                    meta.column.label = token.value
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
                        // 大于、小于号限制为number
                        if (['>', '<', '>=', '<='].indexOf(prevToken.value) > -1) {
                          if (_.isNumber(Number(token.value))) {
                            meta.column.type = columnType.number
                            meta.value.value = Number(token.value)
                          } else {
                            errorList.push(new ParserError(token.end, errorTypes.typeError, errorDesc.typeError.number))
                            break
                          }
                        } else {
                          meta.column.type = columnType.string
                          meta.value.value = token.value
                        }
                      } else if (prevToken.type === types.connection) {
                        meta.column.label = token.value
                        meta.column.type = columnType.fullText
                      } else {
                        errorList.push(new ParserError(token.end, errorTypes.syntaxError, errorDesc.syntaxError.unexpectedString))
                        break
                      }
                    } else {
                      meta.column.label = token.value
                      meta.column.type = columnType.fullText
                    }
                  } else if (nextToken.type === types.rightBracket) {
                    // 此处操作为ip='1,2' and has(tag,'222')中 ,'222')的情况
                    if (prevToken) {
                      if (prevToken.type === types.comma && token.type === types.commonStr && nextToken.type === types.rightBracket) {
                        meta.value.value = token.value
                      }
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
            // meta.column.label = meta.column.name
            metaList.push(meta)
          } else {
            const column = this.columnList.find(c => c.label === meta.column.label)
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
              } else if (meta.column.type === columnType.string) {
                if (meta.value.value.indexOf("''") > -1) {
                  meta.value.label = meta.value.value
                } else {
                  meta.value.label = this.isSingleQuoteWrapping(meta.value.value) ? meta.value.value : `'${meta.value.value}'`
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

  /**
   * 将metaList转为字符串
   * @param metaList
   * @returns {string|*}
   */
  handleMetaListToStr (metaList) {
    // 将模糊搜索的值，转换为对应类型，如1.1.1.1，则添加操作符，类型等，以便于后面的操作
    metaList.forEach(item => {
      if (item.column && item.column.type === 'fullText') {
        item.operator.value = '='
        item.operator.show = false
        item.column.show = false
        const label = JSON.parse(JSON.stringify(item.column.label))
        item.column.label = this.getEntityTypeByValue(item.column.label)
        item.value.value = label
        item.value.label = label
        const isWrapped = this.isSingleQuoteWrapping(label)
        if (item.column.label === 'domain') {
          item.operator.value = 'like'
          item.value.value = isWrapped ? `'${this.delSingleQuote(label)}'` : `${this.delSingleQuote(label)}`
          item.value.label = isWrapped ? `'${this.delSingleQuote(label)}'` : `${this.delSingleQuote(label)}`
          item.value.label1 = isWrapped ? `'%${this.delSingleQuote(label)}'` : `%${this.delSingleQuote(label)}`
        } else if (item.column.label === 'app') {
          item.operator.value = 'like'
          item.value.value = isWrapped ? `'${this.delSingleQuote(label)}'` : `${this.delSingleQuote(label)}`
          item.value.label = isWrapped ? `'${this.delSingleQuote(label)}'` : `${this.delSingleQuote(label)}`
          item.value.label1 = isWrapped ? `'%${this.delSingleQuote(label)}%'` : `%${this.delSingleQuote(label)}%`
        }
        item.column.type = columnType.string
      }
    })
    // 长度为1时，即模糊搜索，例如搜索框值为1.1.1.1，则直接返回1.1.1.1
    // 如果为IP='1.1.1.1'的情况，则从metaList拼接成IP='1.1.1.1'返回出去
    if (metaList && metaList.length === 1) {
      const arr = []
      this.columnList.forEach(item => {
        arr.push(item.label.toLowerCase())
      })
      let label = metaList[0].column.label
      let newStr = JSON.parse(JSON.stringify(label.toLowerCase()))
      // 将str中的IP、Domain等替换为数组arr中的元素
      for (let i = 0; i < arr.length; i++) {
        newStr = newStr.replace(new RegExp(arr[i], 'g'), arr[i])
      }
      // 检查str字段在arr中是否出现,true为出现过
      const result = arr.some(item => newStr.includes(item))
      if (result) {
        if (metaList[0].operator.value.toLowerCase() === 'has') {
          const isWrapped = this.isSingleQuoteWrapping(metaList[0].value.label)
          // 如果值被单引号包裹，则不需要再添加单引号包裹，true为单引号包裹
          if (isWrapped) {
            // 操作符为has时，has函数需要提前，格式为has(label,value)
            return `${metaList[0].operator.value}(${metaList[0].column.label},${metaList[0].value.label})`
          } else {
            return `${metaList[0].operator.value}(${metaList[0].column.label},'${metaList[0].value.label}')`
          }
        } else if (metaList[0].value.label.indexOf('(') > -1) {
          // 避免如IN后面带()的，不添加单引号
          return `${metaList[0].column.label} ${metaList[0].operator.value} ${metaList[0].value.label}`
        } else if (metaList[0].value.label.indexOf("''") > -1) {
          // 如xi''an这种情况，直接返回
          return `${metaList[0].column.label} ${metaList[0].operator.value} ${metaList[0].value.label}`
        } else if (!metaList[0].column.show) {
          // 即模糊搜索
          const isWrapped = this.isSingleQuoteWrapping(metaList[0].value.label)
          if (isWrapped) {
            // 操作符为has时，has函数需要提前，格式为has(label,value)
            return {
              str: `${metaList[0].column.label} ${metaList[0].operator.value} ${metaList[0].value.label}`,
              str2: `'${this.delPercent(this.delSingleQuote(metaList[0].value.label))}'`
            }
          } else {
            return {
              str: `${metaList[0].column.label} ${metaList[0].operator.value} '${metaList[0].value.label}'`,
              str2: this.delPercent(metaList[0].value.label)
            }
          }
        } else {
          const isWrapped = this.isSingleQuoteWrapping(metaList[0].value.label)
          // 如果值被单引号包裹，则不需要再添加单引号包裹，true为单引号包裹
          if (isWrapped) {
            // 操作符为has时，has函数需要提前，格式为has(label,value)
            return `${metaList[0].column.label} ${metaList[0].operator.value} ${metaList[0].value.label}`
          } else {
            return `${metaList[0].column.label} ${metaList[0].operator.value} '${metaList[0].value.label}'`
          }
        }
      } else {
        const regex = /^["']|["']$/
        // 去除两侧引号，如'1.1.1.1',避免校验时被当作app
        if (regex.test(label)) {
          label = label.replace(/^['"]+|['"]+$/g, '')
        }
        return label
      }
    } else if (metaList && metaList.length > 1) {
      // 此为按语法搜索，将metaList转为字符串
      const newMetaList = []
      let hasStr = ''
      let likeStr = ''
      let fullTextStr = ''
      let fullTextStr2 = ''
      // 去除metaList的AND项
      metaList.forEach(item => {
        if (item.value !== 'AND') {
          if (item.column.label.toLowerCase() === 'tag') {
            hasStr += `${item.operator.value}(${item.column.label},${item.value.value}) AND `
          } else if (!item.column.show && item.operator.value.toLowerCase() === 'like') {
            if (item.value.label1) {
              fullTextStr += `${item.column.label} ${item.operator.value} ${item.value.label1} AND `
            } else {
              fullTextStr += `${item.column.label} ${item.operator.value} ${item.value.value} AND `
            }
            const isWrapped = this.isSingleQuoteWrapping(item.value.value)
            fullTextStr2 += isWrapped ? `'${this.delPercent(this.delSingleQuote(item.value.value))}' AND ` : `${this.delPercent(this.delSingleQuote(item.value.value))} AND `
          } else if (item.column.show && item.operator.value.toLowerCase() === 'like') {
            likeStr += `${item.column.label} ${item.operator.value} ${item.value.value} AND `
          } else {
            newMetaList.push(item)
          }
        }
      })

      const newObj = this.combineLabel(newMetaList) // 合并相同的label
      const lastObj = this.mergeSameEntityType(newObj) // 合并相同的实体类型，用in包裹
      let str = ''

      for (const i in lastObj) {
        str += lastObj[i] + ' AND '
      }
      if (hasStr !== '') {
        str = str + hasStr
      }
      if (likeStr !== '') {
        str = str + likeStr
      }
      let str2 = str
      if (fullTextStr !== '') {
        str = str + fullTextStr
        str2 = str2 + fullTextStr2
      }
      str = str.slice(0, -5)
      str2 = str2.slice(0, -5)

      return { str: str, str2: str2 }
    }
  }

  /**
   * 将相同属性的label组合到一起，即IP='1.1.1.1' AND IP='2.2.2.2'组合成IP: '1.1.1.1,2.2.2.2'
   * @param list
   * @returns {*}
   */
  combineLabel (list) {
    return list.reduce((acc, cur) => {
      if (acc[cur.column.label]) {
        acc[cur.column.label] += `,${cur.value.label}`
      } else {
        acc[cur.column.label] = cur.value.label
      }
      return acc
    }, {})
  }

  /**
   * 判断字符串是否为单引号包裹
   */
  isSingleQuoteWrapping (str) {
    const regex = /^'[^']*'$/
    return regex.test(str)
  }

  /**
   * 合并相同的实体类型，转为in包裹的数据
   * @param obj
   * @returns {{}}
   */
  mergeSameEntityType (obj) {
    const lastObj = {}
    if (obj) {
      for (const i in obj) {
        if (obj[i].indexOf('(') > -1) {
          // 原来为IN ()格式的直接保留
          lastObj[i] = `${i} IN ${obj[i]}`
          if (obj[i].indexOf('),') > -1) {
            // 此时为ip；"('1.1.1.1','2.2.2.2'), '3.3.3.3'",in后面还有同类型数据，也放到in里
            lastObj[i] = lastObj[i].replace('),', ',') + ')'
          }
        } else if (obj[i].indexOf(',') > -1) {
          // 格式为IP: '1.1.1.1,2.2.2.2'的，改成IP: "'1.1.1.1','2.2.2.2'"，然后再（）括号包裹
          let str = obj[i]
          str = str.replace(/(\d+\.\d+\.\d+\.\d+),(\d+\.\d+\.\d+\.\d+)/g, "'$1','$2'")
          lastObj[i] = `${i} IN (${str})`
        } else if (i.toLowerCase() === 'tag') {
          lastObj[i] = `has(${i},${obj[i]})`
        } else {
          const isWrapped = this.isSingleQuoteWrapping(obj[i])
          // 如果值被单引号包裹，则不需要再添加单引号包裹，true为单引号包裹
          if (isWrapped || obj[i].indexOf("''") > -1) {
            // 操作符为has时，has函数需要提前，格式为has(label,value)
            lastObj[i] = `${i} = ${obj[i]}`
          } else {
            lastObj[i] = `${i} = '${obj[i]}'`
          }
        }
      }
    }
    return lastObj
  }

  delSingleQuote (str) {
    if (str) {
      if (str[0] === "'" && str[str.length - 1] === "'") {
        str = str.substring(1, str.length)
        str = str.substring(0, str.length - 1)
      }
    }

    return str
  }

  delPercent (str) {
    if (str) {
      if (str[0] === '%') {
        str = str.substring(1, str.length)
      }
      if (str[str.length - 1] === '%') {
        str = str.substring(0, str.length - 1)
      }
    }

    return str
  }

  /**
   * 将str传过来的值进行columnList规范化
   * 步骤：将key与columnList的label都进行转小写进行对比
   *      如果一致，返回columnList的label，不一致则返回false，并弹窗提示
   * @param str
   */
  comparedEntityKey (str) {
    let q = JSON.parse(JSON.stringify(str))
    if (q && q.indexOf('=') > -1) {
      // =周围有空格，则去除空格
      const regex = /\ = | =|= /g
      q = q.replace(regex, '=')

      if (q.indexOf(' AND ') > -1 || q.indexOf(' and ') > -1) {
        if (this.checkStrIncludeAnd(q)) {
          q = q.replace(/ and /g, ' AND ')
        }
        const arr = q.split(' AND ')
        const returnObj = { key: '', isKey: true }
        arr.forEach(item => {
          let label = ''
          let key = ''
          if (item.indexOf('=') > -1) {
            label = item.substring(0, item.indexOf('='))
            key = '='
          } else if (item.toLowerCase().indexOf(' like ') > -1) {
            label = item.substring(0, item.toLowerCase().indexOf(' like '))
            key = 'like'
          } else if (item.toLowerCase().indexOf(' in ') > -1) {
            label = item.substring(0, item.toLowerCase().indexOf(' in '))
            key = 'in'
          } else if (item.toLowerCase().indexOf('has(') > -1) {
            label = item.substring(item.toLowerCase().indexOf('(') + 1, item.indexOf(','))
            key = 'has'
          } else if (this.columnList.some(ite => ite.label.toLowerCase() === item.toLowerCase())) {
            label = 'item'
            key = item
          }

          const obj = this.columnList.find(t => t.label.toLowerCase() === label.toLowerCase())
          if (obj && returnObj.isKey) {
            returnObj.isKey = true
            if (key === 'has') {
              returnObj.key += 'has(' + obj.label + item.substring(item.indexOf(','), item.length) + ' AND '
            } else {
              returnObj.key += obj.label + ' ' + item.substring(obj.label.length, item.length) + ' AND '
            }
          } else if (returnObj.isKey) {
            returnObj.key = '[' + key + ']'
            if (key === item) {
              returnObj.key = key
            }
            returnObj.isKey = false
          }
        })
        if (returnObj.isKey) {
          returnObj.key = returnObj.key.substring(0, returnObj.key.length - 5)
        }

        return returnObj
      } else if (q.toLowerCase().indexOf(' like ') > -1) {
        return {
          key: q,
          isKey: true
        }
      } else if (q.toLowerCase().indexOf(' in ') > -1) {
        return {
          key: q,
          isKey: true
        }
      } else {
        const key = q.substring(0, q.indexOf('='))
        const obj = this.columnList.find(t => t.label.toLowerCase() === key.toLowerCase())
        if (obj) {
          return { key: obj.label + q.substring(q.indexOf('='), q.length), isKey: true }
        } else {
          return { key: '[' + key + ']', isKey: false }
        }
      }
    } else if (q && (q.toLowerCase().indexOf(' in ') > -1 || q.toLowerCase().indexOf(' like ') > -1 || q.toLowerCase().indexOf('has(') > -1)) {
      const lowerQ = q.toLowerCase()
      if (lowerQ.indexOf(' and ') > -1) {
        if (this.checkStrIncludeAnd(q)) {
          q = q.replace(/ and /g, ' AND ')
        }
        const arr = q.split(' AND ')

        for (let i = 0; i < arr.length; i++) {
          const item = arr[i].toLowerCase()
          if (item.indexOf(' like ') > -1) {
            const key = item.substring(0, item.indexOf(' like '))
            const obj = this.columnList.find(t => t.label.toLowerCase() === key.toLowerCase())
            if (!obj) {
              return { key: '[' + key + ']', isKey: false }
            }
          } else if (item.indexOf(' in ') > -1) {
            const key = q.substring(0, item.indexOf(' in '))
            const obj = this.columnList.find(t => t.label.toLowerCase() === key.toLowerCase())
            if (!obj) {
              return { key: '[' + key + ']', isKey: false }
            }
          } else if (item.indexOf('has(') > -1) {
            const key = item.substring(0, 4)
            if (key === 'has(') {
              const label = item.substring(4, item.indexOf(','))
              if (label) {
                const obj = this.columnList.find(t => t.label.toLowerCase() === label.toLowerCase())
                if (!obj) {
                  return { key: '[' + label + ']', isKey: false }
                }
              } else {
                return { key: 'in index ' + q.indexOf('has('), isKey: false }
              }
            } else {
              return { key: 'in index ' + q.indexOf('has('), isKey: false }
            }
          }
        }
        return { key: q, isKey: true }
      } else if (lowerQ.indexOf(' like ') > -1) {
        const key = q.substring(0, lowerQ.indexOf(' like '))
        const obj = this.columnList.find(t => t.label.toLowerCase() === key.toLowerCase())
        if (obj) {
          return { key: obj.label + q.substring(lowerQ.indexOf(' like '), q.length), isKey: true }
        } else {
          return { key: '[' + key + ']', isKey: false }
        }
      } else if (lowerQ.indexOf(' in ') > -1) {
        const key = lowerQ.substring(0, lowerQ.indexOf(' in '))
        const obj = this.columnList.find(t => t.label.toLowerCase() === key.toLowerCase())
        if (obj) {
          return { key: obj.label + q.substring(lowerQ.indexOf(' in '), q.length), isKey: true }
        } else {
          return { key: '[' + key + ']', isKey: false }
        }
      } else if (lowerQ.indexOf('has(') > -1) {
        const key = lowerQ.substring(0, 4)
        if (key === 'has(') {
          const label = lowerQ.substring(4, lowerQ.indexOf(','))
          if (label) {
            const obj = this.columnList.find(t => t.label.toLowerCase() === label.toLowerCase())
            if (obj) {
              return { key: 'has(' + obj.label + q.substring(lowerQ.indexOf(','), lowerQ.length), isKey: true }
            } else {
              return { key: '[' + label + ']', isKey: false }
            }
          } else {
            return { key: 'in index 5', isKey: false }
          }
        } else {
          return { key: 'in index 5', isKey: false }
        }
      }
    } else {
      return {
        key: '[' + q + ']',
        isKey: false
      }
    }
  }

  /**
   * 将模糊查询传过来的str转换为对应的实体类型，不满足ip和domain格式的当成app
   * @param str
   * @returns {string}
   */
  handleEntityTypeByStr (str) {
    if (str) {
      const arr = []
      // 如果出现this.columnList中的字段，如IP\Domain\App\Country等，则不进行模糊搜索，将str返回出去
      this.columnList.forEach(item => {
        // todo 取消了大小写校验，后续观察是否出现问题
        // arr.push(item.label.toLowerCase())
        arr.push(item.label)
      })

      // 因为手动输入时可能会输入and，所以将操作符的AND转换为and，统一处理
      let newStr = str.replace(/ AND /g, ' and ')
      // 将str中的IP、Domain等替换为数组arr中的元素
      for (let i = 0; i < arr.length; i++) {
        newStr = newStr.replace(new RegExp(arr[i], 'g'), arr[i])
      }
      // 检查str字段在arr中是否出现,true为出现过
      // todo 取消了大小写校验，后续观察是否出现问题
      // const result = arr.some(item => newStr.toLowerCase().includes(item))
      const result = arr.some(item => newStr.includes(item))
      if (newStr.indexOf(' and ') > -1) {
        // 将单引号包裹的and拿出来放到数组tempList里，原来的单引号包裹内容用temp即'it is test keyword{键值}'代替
        // 再将字符串用and转换为数组，遍历数组，发现值为temp的，获取键值，根据键值获取tempList的值组合起来，
        // 最后将键值删除，后续再多次测试验证
        const tempList = []
        const regex = /'([^']*?)'/g
        let match

        // 将单引号包裹的and内容集合起来
        while ((match = regex.exec(newStr)) !== null) {
          if (match[1].includes(' and ')) {
            tempList.push(match[1])
          }
        }

        // 将单引号包裹的and内容用特殊值代替
        tempList.forEach((item, index) => {
          const regex = new RegExp(item, 'g')
          newStr = newStr.replace(regex, `it is test keyword${index}`)
        })

        newStr = newStr.replace(/ and /g, ' AND ')
        const noAndList = newStr.split(' AND ')
        noAndList.forEach((item, index) => {
          // 发现插入的特殊值，获取键值，根据键值替换成原来内容，删除键值
          if (item.indexOf('it is test keyword') > -1) {
            const regex = /\d+/g
            const result1 = item.match(regex)
            result1.forEach((r, i) => {
              noAndList[index] = noAndList[index].replace('it is test keyword' + r, tempList[result1[i]])
            })
          }
        })

        const newArr = noAndList
        newArr.forEach((item, index) => {
          if (!arr.some(ite => item.includes(ite))) {
            newArr[index] = this.checkFormatByStr(item, 'list')
          }
          if (arr.some(ite => item.includes(ite)) && !operatorList.some(ite => item.includes(ite)) && !arr.some(ite => item.toLowerCase() === ite.toLowerCase())) {
            newArr[index] = this.checkFormatByStr(item, 'list')
          }
        })

        newStr = newArr.join(' AND ')
        newStr = this.handleStrToUniteStr(newStr)
        return newStr
      } else if (result) {
        // 不区分大小写，用this.columnList里的label
        arr.forEach(item => {
          if (str.toLowerCase().indexOf(item.toLowerCase()) > -1) {
            // todo 记录一下此处取消了转小写转换，后续搜索验证
            // str = str.replace(new RegExp(item, 'gi'), item)
            const isSpace = /\s/.test(str)
            if (!operatorList.some(ite => str.includes(ite)) && str.toLowerCase() !== item.toLowerCase() && !isSpace) {
              str = this.checkFormatByStr(str)
            }
          }
        })
        return str
      } else if (!result) {
        // 此处为不能识别的字段，不能当成app处理
        if (str.indexOf('=') > -1 || str.toLowerCase().indexOf(' in ') > -1 || str.toLowerCase().indexOf(' like ') > -1 || str.toLowerCase().indexOf('has(') > -1) {
          return str
        }
        const regex = /^["']|["']$/
        // 去除两侧引号，如'1.1.1.1',避免校验时被当作app
        if (regex.test(str)) {
          str = str.replace(/^['"]+|['"]+$/g, '')
        }
      }

      return this.checkFormatByStr(str)
    }
  }

  /**
   * 校验字符串格式，如ip、domain、app
   */
  checkFormatByStr (str, flag) {
    if (str[0] === "'" && str[str.length - 1] === "'") {
      str = str.substring(1, str.length)
      str = str.substring(0, str.length - 1)
    }
    if (str[0] === '%' && str[str.length - 1] === '%') {
      str = str.substring(1, str.length)
      str = str.substring(0, str.length - 1)
    }
    if (str[0] === '%' && str[str.length - 1] !== '%') {
      str = str.substring(1, str.length)
    }

    if (regexIPv4.test(str) || regexIPv6.test(str)) {
      const obj = this.columnList.find(t => t.label.toLowerCase() === 'ip' || t.label.toLowerCase() === 'ip.addr')
      if (obj) {
        return `${obj.label}='${str}'`
      } else {
        if (flag) {
          ElMessage.error(i18n.global.t('entity.fullTextSearchIsNotSupported'))
        }
        return str
      }
    } else if (regexDomain.test(str)) {
      // 只写作domain即可，schema字段更改几次，避免后续再更改，直接拿this.columnList的label进行替换
      const obj = this.columnList.find(t => t.label.toLowerCase() === 'domain' || t.label.toLowerCase() === 'domain.name')
      if (obj) {
        return `${obj.label} LIKE '%${str}'`
      } else {
        if (flag) {
          ElMessage.error(i18n.global.t('entity.fullTextSearchIsNotSupported'))
        }
        return str
      }
    } else {
      const obj = this.columnList.find(t => t.label.toLowerCase() === 'app' || t.label.toLowerCase() === 'app.name')
      if (obj) {
        return `${obj.label} LIKE '%${str}%'`
      } else {
        if (flag) {
          ElMessage.error(i18n.global.t('entity.fullTextSearchIsNotSupported'))
        }
        return str
      }
    }
  }

  /**
   * 判断传过来值的实体类型，仅限于ip、domain、app
   */
  getEntityTypeByValue (str) {
    if (str[0] === "'" && str[str.length - 1] === "'") {
      str = str.substring(1, str.length)
      str = str.substring(0, str.length - 1)
    }
    if (regexIPv4.test(str) || regexIPv6.test(str)) {
      const obj = this.columnList.find(t => t.label.toLowerCase() === 'ip')
      if (obj) {
        return obj.label
      } else {
        return str
      }
    } else if (regexDomain.test(str)) {
      const obj = this.columnList.find(t => t.label.toLowerCase() === 'domain')
      if (obj) {
        return obj.label
      } else {
        return str
      }
    } else {
      const obj = this.columnList.find(t => t.label.toLowerCase() === 'app')
      if (obj) {
        return obj.label
      } else {
        return str
      }
    }
  }

  /**
   * 将字符串的同属性字段合并在一起
   * @param str
   * @returns {string}
   */
  handleStrToUniteStr (str) {
    // 若str = "IP='1.1.1.1' AND Domain IN ('baidu.com','jd.com') AND IP='2.2.2.2'"
    // 则将转换为 str = "IP IN ('1.1.1.1','2.2.2.2') AND Domain IN ('baidu.com','jd.com')"
    const arr = str.split(' AND ')
    const repeatArr = [] // 判断label是否重复的数组

    // 如果字符串不存在相同字段，则直接返回str，如IP = '1' AND has(Tag,'1')
    arr.forEach(item => {
      if (item.indexOf('=') > -1) {
        const label = item.substring(0, item.indexOf('='))
        repeatArr.push(label)
      } else if (item.indexOf(' IN ') > -1) {
        const label = item.substring(0, item.indexOf(' IN '))
        repeatArr.push(label)
      }
    })

    const set = new Set(repeatArr)
    if (set.size === repeatArr.length) {
      return str
    } else {
      const hasArr = [] // has函数的操作不必合并在一起，继续用and连接，单独放一边
      const commonArr = [] // 普通连接符数组，如连接符为=、in等，

      // 仿造成metaList形式如 [{ label: 'IP', value: '1.1.1.1' } ... ]
      // 从而根据label判断是否是同一属性，如是IP的话，则将value进行拼接，然后再使用in ()包裹
      arr.forEach(item => {
        if (item.indexOf('=') > -1) {
          const label = item.substring(0, item.indexOf('='))
          const value = item.substring(item.indexOf('=') + 1)
          // 去除单引号
          commonArr.push({ label: label, value: value })
        } else if (item.indexOf(' IN ') > -1) {
          const label = item.substring(0, item.indexOf(' IN '))
          let value = item.substring(item.indexOf(' IN ') + 4) // 去除（）
          value = value.replace(/[\(\)]/g, '')
          commonArr.push({ label: label, value: value })
        } else if (item.toLowerCase().indexOf('has(') > -1) {
          hasArr.push(item)
        }
      })

      const commonObj = this.combineLabel1(commonArr)
      const lastObj = {}
      for (const i in commonObj) {
        if (commonObj[i].indexOf('(') > -1) {
          // 原来为IN ()格式的直接保留
          lastObj[i] = `${i} IN ${commonObj[i]}`
          if (commonObj[i].indexOf('),') > -1) {
            // 此时为ip；"('1.1.1.1','2.2.2.2'), '3.3.3.3'",in后面还有同类型数据，也放到in里
            lastObj[i] = lastObj[i].replace('),', ',') + ')'
          }
        } else if (commonObj[i].indexOf(',') > -1) {
          let str = commonObj[i]
          str = str.replace(/(\d+\.\d+\.\d+\.\d+),(\d+\.\d+\.\d+\.\d+)/g, "'$1','$2'")
          lastObj[i] = `${i} IN (${str})`
        } else if (i.toLowerCase() === 'tag') {
          lastObj[i] = `has(${i},${commonObj[i]})`
        } else {
          // 单独存在的,直接保留
          lastObj[i] = `${i}=${commonObj[i]}`
        }
      }

      let lastStr = ''
      for (const i in lastObj) {
        lastStr += lastObj[i] + ' AND '
      }
      const hasStr = hasArr.join(' AND ')
      if (hasStr !== '') {
        lastStr = lastStr + hasStr
      } else {
        lastStr = lastStr.slice(0, -5)
      }

      return lastStr
    }
  }

  /**
   * 根据label判断是否是同一属性，是的话，则将value进行拼接，否则按原形式返回
   */
  combineLabel1 (list) {
    return list.reduce((acc, cur) => {
      if (acc[cur.label]) {
        acc[cur.label] += `,${cur.value}`
      } else {
        acc[cur.label] = cur.value
      }
      return acc
    }, {})
  }

  /**
   * 检测传过来的字符串是否包含and，
   * 例如 app='Computer and Internet'这种情况，需要单独甄别
   * @param str
   */
  checkStrIncludeAnd (str) {
    let arr = []
    if (str.indexOf(' and ')) {
      arr = str.split(' and ')
    }
    let label = ''

    arr.forEach((item, index) => {
      // and前后的语句，前面一段不需要甄别，因为前一段可能是app='Computer，但后一段肯定不属于this.columnList
      // 如果后面一段属于this.columnList的关键字，整段字符串具有and的连接效果
      if (index % 2 !== 0) {
        if (item.indexOf('=') > -1) {
          label = item.substring(0, item.indexOf('='))
        } else if (item.toLowerCase().indexOf(' in ') > -1) {
          label = item.substring(0, item.toLowerCase().indexOf(' in '))
        } else if (item.indexOf('has(') > -1) {
          label = item.substring(4, item.indexOf(','))
        }
      }
    })

    return this.columnList.find(t => t.label.toLowerCase() === label.toLowerCase())
  }

  /**
   * 检测str是否包含枚举字段，包含的话，进行替换
   * @param str
   * @returns {string|*}
   */
  conversionEnum (str) {
    if (str) {
      let enumFlag = false // 判断字符串是否包含枚举类型的key，不包含则直接返回
      enumList.forEach(item => {
        if (str.toLocaleLowerCase().indexOf(item.toLocaleLowerCase()) > -1) {
          enumFlag = true
        }
      })
      if (enumFlag) {
        let key = _.cloneDeep(str)
        let searchList = [] // 将字符串按AND分割成单独的搜索条件
        if (key.indexOf(' AND ') > -1) {
          searchList = key.split(' AND ')
        } else {
          searchList = [key]
        }
        searchList.forEach((item, index) => {
          const obj = this.columnList.find(d => item.indexOf(d.label) > -1)
          if (obj && obj.doc.data) {
            for (let i = 0; i < obj.doc.data.length; i++) {
              const item1 = obj.doc.data[i]
              if (item.indexOf(item1.code) > -1) {
                searchList[index] = searchList[index].replace(new RegExp(item1.code, 'g'), item1.value)
                // 匹配到code，终止匹配
                break
              } else {
                // 该操作是避免中文参数切换到英文环境时，code经i18n转为英文，匹配不到中文参数的情况
                Object.keys(store.state.i18nObj).forEach(lang => {
                  const i18nCode = store.state.i18nObj[lang][item1.code1]
                  if (item.indexOf(i18nCode) > -1) {
                    searchList[index] = searchList[index].replace(new RegExp(i18nCode, 'g'), item1.value)
                  }
                })
              }
            }
          }
        })
        key = searchList.join(' AND ')
        return key
      } else {
        return str
      }
    } else {
      return str
    }
  }

  /**
   * 获取关键字列表，即高亮字段
   * @param metaList
   * @returns {*[]}
   */
  getKeywordList (metaList) {
    const keywordList = []
    if (metaList && metaList.length > 0) {
      metaList.forEach(item => {
        if (item.column && item.column.isFullText) {
          keywordList.push({ type: 'fullText', value: item.value.value })
        } else if (item.column && !item.column.isFullText) {
          keywordList.push({ type: item.column.type, value: item.value.value || item.column.label })
        }
      })
    }

    return keywordList
  }
}

// 使用单引号包裹
export function stringInQuot (value) {
  if (value.indexOf("'") > -1) {
    value = value.split("'").join("''") // 如xi'an，多添加一个单引号，处理为xi''an
  }

  const match = `${value}`.match(/^'.+?'$/)
  return match ? value : `'${value}'`
}

// IN和LIKE前后加空格
export function handleOperatorSpace (operator) {
  return ['IN', 'NOT IN', 'LIKE', 'NOT LIKE'].indexOf(operator) > -1 ? ` ${operator} ` : operator
}
