import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/mode/sql/sql'

import 'codemirror/theme/ambiance.css'
// import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/display/placeholder'

import 'codemirror/addon/hint/anyword-hint' // 关键字
import 'codemirror/addon/comment/comment'
import 'codemirror/keymap/sublime'
import 'codemirror/addon/edit/closebrackets'
import CodeMirror from 'codemirror'
import createMode from '@/components/advancedSearch/showhint/TextSearch/sql'
import createHint from '@/components/advancedSearch/showhint/TextSearch/createHint'
import { functionList } from '@/components/advancedSearch/showhint/const/functionTips'
import { cloneDeep } from 'lodash'

const codeMirrorMixins = {
  data () {
    return {
      CodeMirror,
      initData: {},
      hintSearch: '',
      hintList: [],
      hintParams: {},
      completion: null
    }
  },
  methods: {
    initShowHint () {
      const dataset = this.dataset
      createMode(CodeMirror, {
        dataset,
        modehook: this.modehook
      })

      const hintHook = this.manualHinthook
      const vm = this
      createHint('manual', CodeMirror, {
        dataset,
        hinthook: hintHook,
        callback (completion, defaultOptions) {
          vm.completion = completion.completion
        },
        keyboardUp () {
          // 键盘向上
          vm.hintVm?.handleUp()
        },
        keyboardDown () {
          // 键盘向下
          vm.hintVm?.handleDown()
        },
        keyboardEnter () {
          if (!vm.hintVisible) {
            return
          }
          // 回车  选中值
          vm.hintVm?.triggerSelect()
        }
      })
    },
    manualHinthook (result, params, manualParams) {
      this.hintParams = manualParams
      this.hintSearch = manualParams.search

      this.hintList = []
      const list = this.hinthook(result, params)
      this.hintList = cloneDeep(list)
      return list
    },
    hinthook (result, { search, keywords, leftpart, rightpart }) {
      if (leftpart) {
        const options = this.matchOptions(leftpart)
        if (options) {
          return options
        }
      }
      result = this.dataset.getHintList(search, null, null, this.value)
      return result
    },
    matchOptions (leftpart) {
      // 用于匹配下拉选

      const fieldInfo = this.dataset.getFieldInfo(leftpart)
      if (fieldInfo && fieldInfo.options) {
        const options = []
        options.push(
          {
            type: 'abstract',
            text: '',
            displayText: 'Options',
            className: 'divider hint-title'
          }
        )
        const fieldOptions = cloneDeep(fieldInfo.options)
        // eslint-disable-next-line no-return-assign
        fieldOptions.forEach(item => item.displayText = `${item.displayText}(${item.text})`)
        options.push(...fieldOptions)
        return options
      }
      return null
    },
    modehook (CodeMirror, set, { client, keywords, builtin, hookVar }) {
      // 自定义 过滤器类型
      const clientWords = this.dataset.getClientwords()
      let clientWordsStr = ''
      clientWordsStr = clientWords.join(' ')
      const dateFuns = functionList.map(v => v.name.toLowerCase())
      CodeMirror.defineMIME('text/x-filter', {
        name: 'sql',
        client: set(clientWordsStr + ' ' + client), // 客户端解析指令
        builtin: set(builtin + ' like in not empty notempty has bitand'),
        keywords: set(keywords + ' and or ' + dateFuns.join(' ')),

        atoms: set('false true null unknown'),
        operatorChars: /^[*+\-%<>!=&|^]/,
        dateSQL: set('date time timestamp '),
        support: set('ODBCdotTable doubleQuote binaryNumber hexNumber'), // 支持的数据编码  ODBC double 二进制  16进制
        hooks: {
          $: hookVar
        }
      })
    }
  }
}

export default codeMirrorMixins
