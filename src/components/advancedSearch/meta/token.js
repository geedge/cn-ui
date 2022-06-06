/**
 * 词法解析器的token
 * */

export const types = {
  apostrophe: 'apostrophe', // 单引号
  leftBracket: 'leftBracket', // 左括号
  rightBracket: 'rightBracket', // 右括号
  comma: 'comma', // 逗号
  commonOperator: 'commonOperator', // 普通操作符
  letterOperator: 'letterOperator', // 字母操作符，例如in like
  connection: 'connection', // 连接符 and和or
  commonStr: 'commonStr' // 字符串
}

export default class Token {
  constructor (type, value) {
    this.type = type
    this.value = value
    this.start = 0
    this.end = 0
    this.next = null
    this.prev = null
  }

  setStart (start) {
    this.start = start
  }

  setEnd (end) {
    this.end = end
  }

  setNext (token) {
    this.next = token
  }

  setPrev (token) {
    this.prev = token
  }
}
