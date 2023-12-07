import sqlHint from './sql-hint.js'
import showHint from './show-hint.js'
import manualShowHint from './manual-show-hint'
import 'codemirror/addon/hint/show-hint.css'

export default function createHint (hitType = 'default', CodeMirror, {
  dataset,
  hinthook,
  keywordshook,
  callback,
  keyboardUp,
  keyboardDown,
  keyboardEnter
}) {
  hitType === 'default' ? showHint(CodeMirror) : manualShowHint(CodeMirror, {
    cb: callback,
    keyboardUp,
    keyboardDown,
    keyboardEnter
  })
  sqlHint(CodeMirror, { dataset, hinthook, keywordshook })
}
