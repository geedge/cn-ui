import i18n from '@/i18n'
export function fieldRender (h, { fieldInfo = {}, funcReference = [], operatorReference = [], operates = [], funs = [] }) {
  return (<div className='field-tips'>
    <div class='default-tips-header'>{fieldInfo.label}</div>
    <p class='show-hint-tips__p'> {i18n.global.t('overall.name')}: {fieldInfo.name}</p>
    <p class='show-hint-tips__p'> {i18n.global.t('overall.type')}: {typeof fieldInfo.type === 'object' ? fieldInfo.type.type : fieldInfo.type} </p>
    <p class='show-hint-tips__p'> {i18n.global.t('overall.operators')}: {operates.join(',')} </p>
    {/* <p> Function: {funs.join(',')} </p> */}
    <p> {fieldInfo.options && (
      'Options: ' + fieldInfo.options.map(item => {
        return `${item.displayText}(${item.text})`
      }).join(',')
    )} </p>

    <div class='default-tips-header'>{i18n.global.t('overall.enableOperators')}</div>
    {/* 提示超过一屏幕  明显不合理 --- 换成简单形式  */}
    <ul style="padding-left: 0;margin: 12px 0;">
      {operatorReference.map(item => {
        return <li>
          <span>{item.name}</span>
          <code> {item.function} </code>
        </li>
      })}
    </ul>
  </div>)
}
