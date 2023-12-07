export function fieldRender(h, {fieldInfo = {}, funcReference = [], operatorReference = [], operates = [], funs = []}) {
  return (<div className='field-tips'>
    <h2>{fieldInfo.label}</h2>
    <p> Name: {fieldInfo.name}</p>
    <p> Type:{fieldInfo.type} </p>
    <p> Operator: {operates.join(',')} </p>
    <p> Function: {funs.join(',')} </p>
    <p> {fieldInfo.options && (
      'Options: ' + fieldInfo.options.map(item => {
        return `${item.displayText}(${item.text})`
      }).join(',')
    )} </p>

    <h3>Enable Operators</h3>
    {/* 提示超过一屏幕  明显不合理 --- 换成简单形式  */}
    <ul style="padding-left: 20px;">
      {operatorReference.map(item => {
        return <li>
          <span>{item.name}</span>
          <code> {item.function} </code>
        </li>
      })}
    </ul>


    <h3>Enable Functions</h3>
    <ul style="padding-left: 20px;">
      {funcReference.map(item => {
        return <li>
          <span>{item.name}</span>
          <code> {item.function} </code>
        </li>
      })}
    </ul>
  </div>)
}
