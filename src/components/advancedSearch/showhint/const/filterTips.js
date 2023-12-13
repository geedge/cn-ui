import i18n from '@/i18n'
import { EN, storageKey, ZH } from '@/utils/constants'

export const helpInfo = [
  {
    operator: 'AND',
    zhDescribe: '搜索包含所有搜索字段的实体。',
    enDescribe: 'Search entities that contain all the search fields. ',
    example: [
      "ip = '192.168.10.53' AND domain = 'google.com'",
      "domain = 'google.com' AND app = 'google'"
    ]
  }
  // {
  //   // operator: '= , !=',
  //   operator: ' = ',
  //   describe: 'Search logs that do EQUALS or NOT EQUALS the search value. ',
  //   example: [
  //     "Client IP = '192.168.10.53'  "
  //     // 'Server Port != 443'
  //   ]
  // },
  // {
  //   operator: '> , < , >= , <=',
  //   describe: 'Search logs greater than and equal or less than and equal a value , or whtin a range. This operator can‘t be used with string fields.  ',
  //   example: [
  //     'Bytes Sent >= 751',
  //     'Bytes Sent >= 751 and  Bytes Sent <= 1024'
  //   ]
  // },
  // {
  //   operator: ' LIKE ',
  //   // operator: 'LIKE , NOT LIKE',
  //   describe: 'You can use wildcard searches for value that contain or not contain search fields. Using percent (%) wildcard substitutes for one or more characters in a string. Using underscore (_) wildcard substitutes for exactly one character in a string. ',
  //   example: [
  //     "SSL.SNI LIKE  '%google.com' ",
  //     "Client IP LIKE '192.168.10.1_'"
  //     // "SSL.SNI NOT LIKE '%google.com'",
  //     // "Client IP NOT LIKE '192.168%'"
  //   ]
  // },
  // {
  //   operator: ' IN ',
  //   // operator: 'IN , NOT IN',
  //   describe: 'Specify or exclude multiple values for search fields. IN IN condition you can use when you need to use multiple OR condition. ',
  //   example: [
  //     "l7 Protocol IN ('HTTP', 'HTTPS')"
  //     // 'Server Port NOT IN (443,80)'
  //   ]
  // },
  // {
  //   operator: 'EMPTY , NOT EMPTY',
  //   describe: 'Specify or exclude empty value for search fields. A string or array is considered non-empty if it contains at least one byte, even if this is a space or a null byte. ',
  //   example: [
  //     'NOT EMPTY(SSL.SNI)',
  //     'EMPTY(Application Label)'
  //   ]
  // },
  // {
  //   operator: 'HAS',
  //   describe: 'Search logs that has element value for array type. Example:',
  //   example: [
  //     'HAS(FQDN Category, music)'
  //   ]
  // }
  // {
  //   operator: 'bitAnd',
  //   describe: 'A bitwise And(&) is a binary operation that compares each bit of the first operand to the corresponding bit of the second operand. Both expressions must have integral types. Examples:',
  //   example: [
  //     'bitAnd(Flags, Asymmetric|Download) = Asymmetric|Download',
  //     'bitAnd(Flags, Asymmetric|Download) >0'
  //   ]
  // }
]
const renderData = [
  helpInfo[0]
]
export const filterList = renderData
function main () {
  const sqlTips = {}
  const language = localStorage.getItem(storageKey.language) || EN
  renderData.forEach((item, index) => {
    const data = item // 这是个闭包
    sqlTips[item.operator] = {
      name: item.operator,
      // syntax: item.syntax,
      type: 'filter',
      description () {
        return (<div className='filter-tips'>
          <div class='default-tips-header'>{data.operator}</div>
          <div class='default-tips-title'> {i18n.global.t('overall.remark')}: </div>
          <p class='show-hint-tips__p'> {language === ZH ? data.zhDescribe : data.enDescribe}</p>
          <div class='default-tips-title'>{i18n.global.t('overall.examples')}:</div>
          <ul style="padding-left: 0;">
            {item.example.map(v => {
              return <li>
                <code>{v}</code>
              </li>
            })}
          </ul>
        </div>)
      }
    }
  })
  return sqlTips
}

const filterTips = main()
export default filterTips
