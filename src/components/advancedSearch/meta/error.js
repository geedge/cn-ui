import i18n from '@/i18n'
export const errorTypes = {
  illegalChar: 'parse.errorTip.illegalChar', // 非法字符
  syntaxError: 'parse.errorTip.syntaxError', // 语法错误，此i18n内容有占位符
  typeError: 'parse.errorTip.typeError' // 类型错误
}
export const errorDesc = {
  syntaxError: {
    moreThan2Apostrophe: 'parse.errorTip.syntaxError.moreThan2Apostrophe', // 语法错误，连续2个以上的单引号
    unclosedApostrophe: 'parse.errorTip.syntaxError.unclosedApostrophe', // 语法错误，引号未闭合
    unclosedBracket: 'parse.errorTip.syntaxError.unclosedBracket', // 语法错误，括号未闭合
    unexpectedString: 'parse.errorTip.syntaxError.unexpectedString', // 期望之外的字符串
    unexpectedOperator: 'parse.errorTip.syntaxError.unexpectedOperator',
    unexpectedBracket: 'parse.errorTip.syntaxError.unexpectedBracket',
    unexpectedConnection: 'parse.errorTip.syntaxError.unexpectedConnection'
  },
  typeError: {
    str: 'parse.errorTip.typeError.expectString', // Expected parameter type is string
    number: 'parse.errorTip.typeError.expectNumber', // Expected parameter type is number
    meta: 'parse.errorTip.typeError.expectMetaArray' // Expected parameter type is Meta array
  }
}
export function handleErrorTip (error) {
  return i18n.global.t(error.type) + ': ' + i18n.global.t(error.desc) + ', at index ' + error.index
}
export default class ParserError {
  constructor (index, type, desc) {
    this.index = index
    this.type = type
    this.desc = desc
  }
}
