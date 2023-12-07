//正则 向前去找关键字
/* 用于匹配关系数据  */
function matchOperator(CodeMirror, hintParams = {}) {
  var editor = hintParams.editor;
  var Pos = CodeMirror.Pos
  var cur = hintParams.cur;
  var token = hintParams.token;
  if (!editor) {
    return
  }


  var start = token.start;
  var cont = true;
  var leftTokenGroup = [];
  while (cont) {
    start = token.start;
    leftTokenGroup.unshift(token);
    token = editor.getTokenAt(Pos(cur.line, token.start));
    cont = !(token.string.match(/^[ ]*$/) || start === 0);  //只用空格做终止条件
  }

  var cursorLeftString = editor.getRange(Pos(cur.line, leftTokenGroup[0].start), Pos(cur.line, leftTokenGroup[leftTokenGroup.length - 1].end))

  //判断是不是满足 运算符 表达式的正则
  //test 如果是ig 会改变正则指针:  https://my.oschina.net/jamesview/blog/5460753
  var reg = /^(.*?)(=|!=|>|<|>=|<=)([^ ]*?)$/;
  if (reg.test(cursorLeftString)) {
    var execArr = reg.exec(cursorLeftString) || []
    return {
      leftTokenGroup,
      cursorLeftString,
      label: execArr[1],
      sign: execArr[2],
      value: execArr[3],
    }
  }
  return null
}

function matchCommon(CodeMirror, hintParams = {}) {
  //通用情况   QUANTILE(expr,level)  左括号右侧第一个就是  关键字
  var editor = hintParams.editor;
  var Pos = CodeMirror.Pos
  var cur = hintParams.cur;
  var token = hintParams.token;
  if (!editor) {
    return
  }


  var start = token.start;
  var cont = true;
  var leftTokenGroup = [];
  while (cont) {
    start = token.start;
    leftTokenGroup.unshift(token);
    token = editor.getTokenAt(Pos(cur.line, token.start));
    cont = !(token.string.match(/^[ (]*$/) || start === 0);  //括号或者空格为终止条件

    //括号补上
    if (token.string === '(') {
      leftTokenGroup.unshift(token);
    }
  }

  var cursorLeftString = editor.getRange(Pos(cur.line, leftTokenGroup[0].start), Pos(cur.line, leftTokenGroup[leftTokenGroup.length - 1].end))

  //判断是不是满足 运算符 表达式的正则
  var reg = /^\((.*?),([^ ]*)$/;
  if (reg.test(cursorLeftString)) {
    var execArr = reg.exec(cursorLeftString) || []
    return {
      leftTokenGroup,
      cursorLeftString,
      label: execArr[1],
      sign: 'unknown',  //没必要判断
      value: execArr[2],
    }
  }
  return null
}

function matchIn(CodeMirror, hintParams = {}) {
  //in 的情况比较特殊
  //通用情况  expr not in (values)   expr in (values)
  var editor = hintParams.editor;
  var Pos = CodeMirror.Pos
  var cur = hintParams.cur;
  var token = hintParams.token;
  if (!editor) {
    return
  }


  var start = token.start;
  var cont = true;
  var leftTokenGroup = [];

  //找到左括号
  while (cont) {
    start = token.start;
    leftTokenGroup.unshift(token);
    token = editor.getTokenAt(Pos(cur.line, token.start));
    cont = !(token.string.match(/^[ (]*$/) || start === 0);  //括号或者空格为终止条件
    //左括号补上
    if (token.string === '(') {
      leftTokenGroup.unshift(token);
    }
  }

  //左括号继续向右找
  cont = true
  while (cont) {
    start = token.start;
    leftTokenGroup.unshift(token);
    token = editor.getTokenAt(Pos(cur.line, token.start));
    cont = !(!token.string.match(/^(in|not| )/g) || start === 0);  //括号或者空格为终止条件

    //string-2
    if (token.type === 'string-2') {
      leftTokenGroup.unshift(token);
    }
  }
  var cursorLeftString = editor.getRange(Pos(cur.line, leftTokenGroup[0].start), Pos(cur.line, leftTokenGroup[leftTokenGroup.length - 1].end))

  //判断是不是满足 运算符 表达式的正则
  var reg = /^(.*?)[ ]+((?:not[ ]+)?in)[ ]*\(([^ ]*?)$/i;
  if (reg.test(cursorLeftString)) {
    var execArr = reg.exec(cursorLeftString) || []
    return {
      leftTokenGroup,
      cursorLeftString,
      label: execArr[1],
      sign: execArr[2],
      value: execArr[3],
    }
  }
  return null
}

function matchLike(CodeMirror, hintParams = {}) {
  //like 的情况比较特殊  expr like value , expr not like value
  var editor = hintParams.editor;
  var Pos = CodeMirror.Pos
  var cur = hintParams.cur;
  var token = hintParams.token;
  if (!editor) {
    return
  }


  var start = token.start;
  var cont = true;
  var leftTokenGroup = [];

  //找到左括号
  while (cont) {
    start = token.start;
    leftTokenGroup.unshift(token);
    token = editor.getTokenAt(Pos(cur.line, token.start));
    cont = !(token.string.match(/^[ ]*$/) || start === 0);  //括号或者空格为终止条件
  }

  //左括号继续向右找
  cont = true
  while (cont) {
    start = token.start;
    leftTokenGroup.unshift(token);
    token = editor.getTokenAt(Pos(cur.line, token.start));
    cont = !(!token.string.match(/^(like|not| )/g) || start === 0);  //括号或者空格为终止条件

    //string-2
    if (token.type === 'string-2') {
      leftTokenGroup.unshift(token);
    }
  }
  var cursorLeftString = editor.getRange(Pos(cur.line, leftTokenGroup[0].start), Pos(cur.line, leftTokenGroup[leftTokenGroup.length - 1].end))

  //判断是不是满足 运算符 表达式的正则
  var reg = /^(.*?)[ ]+((?:not[ ]+)?like)[ ]*([^ ]*?)$/i;
  if (reg.test(cursorLeftString)) {
    var execArr = reg.exec(cursorLeftString) || []
    return {
      leftTokenGroup,
      cursorLeftString,
      label: execArr[1],
      sign: execArr[2],
      value: execArr[3],
    }
  }
  return null

}

export const matchMain = (CodeMirror, params, manualParams = {}) => {
  var matchRes = null
  //匹配 运算符表达式
  matchRes = matchOperator(CodeMirror, manualParams)
  if (matchRes) {
    return matchRes
  }

  //匹配 in表达式
  matchRes = matchIn(CodeMirror, manualParams)
  if (matchRes) {
    return matchRes
  }

  //匹配 like表达式
  matchRes = matchLike(CodeMirror, manualParams)
  if (matchRes) {
    return matchRes
  }

  //这里缺少一个对 count(distinct expr) 模式的匹配, 感觉大数据涉及存在缺陷, 先暂时不写


  //匹配 其他表达式  (expr,value1,value2....) 模式的匹配
  matchRes = matchCommon(CodeMirror, manualParams)
  if (matchRes) {
    // 说明这是一个 运算符表达式
    return matchRes
  }

  return matchRes
}
