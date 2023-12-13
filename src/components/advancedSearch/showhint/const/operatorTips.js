import i18n from '@/i18n'
import { EN, storageKey, ZH } from '@/utils/constants'

const renderData = [
  {
    name: 'EQUALS',
    syntax: '=',
    primaryKey: '=',
    zhDescription: '搜索指定字段的值与指定值完全匹配的实体。',
    enDescription: 'Search for entities where the value of a specified field exactly matches a specified value.',
    example: [
      {
        zhPurpose: '通过192.168.10.53查询ip实体:',
        enPurpose: 'Search entity of ip by 192.168.10.53:',
        code: 'ip=\'192.168.10.53\''
      },
      {
        zhPurpose: '通过google.com查询domain实体：',
        enPurpose: 'Search entity of domain by google.com：',
        code: 'domain=\'google.com\''
      }
    ]
  },
  {
    name: 'IN',
    syntax: 'in',
    primaryKey: 'IN',
    zhDescription: '搜索指定字段的值是多个指定值之一的实体。',
    enDescription: 'Search for entities where the value of a specified field is one of multiple specified values.',
    example: [
      {
        zhPurpose: '通过192.168.10.53 或 192.168.10.54查询ip实体：',
        enPurpose: 'Search entity by 192.168.10.53 or 192.168.10.54：',
        code: 'ip in (\'192.168.10.53\', \'192.168.10.54\')'
      },
      {
        zhPurpose: '通过appName1 或 appName2查询app实体:',
        enPurpose: 'Search entity by appName1 or appName2:',
        code: 'app in (\'appName1\', \'appName2\')'
      }
    ]
  },
  {
    name: 'LIKE',
    syntax: 'like',
    primaryKey: 'LIKE',
    zhDescription: '搜索使用通配符搜索包含搜索字段的值的实体。此运算符与字符串字段一起使用。',
    enDescription: 'Search for entities where use wildcard searches for value that contain search fields. This operator is used with array fields.',
    example: [
      {
        zhPurpose: '通过google.com查询domain实体:',
        enPurpose: 'Search entity of domain by google.com:',
        code: 'domain like \'%google.com\''
      },
      {
        zhPurpose: '通过appName查询app实体:',
        enPurpose: 'Search entity of app by appName:',
        code: 'app like \'%appName%\''
      }
    ]
  },
  {
    name: 'HAS',
    syntax: 'has',
    primaryKey: 'HAS',
    zhDescription: '搜索指定字段的值是指定值之一的实体。此运算符与数组字段一起使用。',
    enDescription: 'Search for entities where the values of a specified field is one of specified value. This operator is used with array fields.',
    example: [
      {
        zhPurpose: '通过ADNS查询tag实体:',
        enPurpose: 'Search entity of tag by ADNS:',
        code: 'has(tag,\'ADNS\')'
      }
    ]
  }
]
export const operatorList = renderData

function main () {
  const operatorTips = {}
  const language = localStorage.getItem(storageKey.language) || EN
  renderData.forEach((item, index) => {
    const data = item // 这是个闭包
    operatorTips[item.primaryKey] = {
      name: item.name,
      syntax: item.syntax,
      type: 'Operators',
      description () {
        return (<div className="operator-tips">
          <div class='default-tips-header'>{data.name}</div>
          <div class='default-tips-title'>{i18n.global.t('overall.syntax')}: <span>{data.syntax}</span></div>
          <div class='default-tips-title'>{i18n.global.t('overall.remark')}: </div>
          <p class='show-hint-tips__p'> {language === ZH ? data.zhDescription : data.enDescription}</p>
          <div class='default-tips-title'>{i18n.global.t('overall.examples')}: </div>
          <ul style="padding-left: 0;">
            {item.example.map(v => {
              return <li>
                <span>{language === ZH ? v.zhPurpose : v.enPurpose}</span>
                <code>{v.code}</code>
              </li>
            })}
          </ul>
        </div>)
      }
    }
  })
  return operatorTips
}

const operatorTips = main()
export default operatorTips
