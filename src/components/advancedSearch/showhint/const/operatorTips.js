var renderData=[
  {
    name:"EQUALS",
    syntax:"=",
    primaryKey:"=",
    description:"Search for logs where the value of a specified field exactly matches a specified value.",
    example:[
      {
        purpose:"Search all logs that are sent by 192.168.10.53:",
        code:"client_ip='192.168.10.53'"
      },
      {
        purpose:"Search all logs that are communication  destination port by 443：",
        code:"server_port=443"
      },
    ],
    details(){
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>If you want search for logs where the value of a specified field is one of multiple specified values. Use multiple <b>EQUALS(=)</b> statements with the OR keyword, or use IN operator.</div>
    }
  },
  {
    name:"NOT EQUALS",
    syntax:"!=",
    primaryKey:"!=",
    description:"Search for logs where the value of a specified field doesn't match a specified value.",
    example:[
      {
        purpose:"Search all logs that are sent to any Client IP except 192.168.10.53:",
        code:"client_ip!='192.168.10.53'"
      },
      {
        purpose:"Search all logs that are not communication port to 443：",
        code:"server_port!=443"
      },
    ],
    details:`If you want search for logs where the value of a specified field is one of multiple specified values. Use multiple NOT EQUALS(!=) statements with the AND keyword, or use NOT IN operator.`
  },
  {
    name:"GREATER THAN",
    syntax:">",
    primaryKey:">",
    description:"Search logs greater than a value . This operator can't be used with string fields. ",
    example:[
      {
        purpose:"Search all logs more than 751 Bytes ",
        code:"sent_bytes > 751"
      },
      {
        purpose:"Search all logs where bandwidth is higher than 751 Bytes:",
        code:"received_bytes + sent_bytes > 751"
      },
    ],
    details:`The GREATER THAN(>) condition is usally used with LESS THAN(<) as a range query. `
  },
  {
    name:"GREATER THAN EQUALS",
    syntax:">=",
    primaryKey:">=",
    description:"Search logs greater than and equal a value. This operator can't be used with string fields.  ",
    example:[
      {
        purpose:"Search all logs with 751 or more Bytes",
        code:"sent_bytes >= 751"
      },
      {
        purpose:"Search all logs where bandwidth is equal or higher than 751 Bytes:",
        code:"received_bytes + sent_bytes >= 751"
      },
    ],
    details:`The GREATER THAN EQUALS(>=) condition is usally used with LESS THAN EQUALS(<=) as a range query.`
  },
  {
    name:"LESS THAN",
    syntax:"<",
    primaryKey:"<",
    description:"Search logs less than a value. This operator can't be used with string fields.",
    example:[
      {
        purpose:"Search all logs less than 751 Bytes :",
        code:"sent_bytes < 751"
      },
      {
        purpose:"Search all logs where bandwidth is less than 751 Bytes:",
        code:"received_bytes + sent_bytes < 751"
      },
    ],
    details:`The LESS THAN(<) condition is usally used with GREATER THAN(>) as a range query.`
  },
  {
    name:"LESS THAN EQUALS",
    syntax:"<=",
    primaryKey:"<=",
    description:"Search logs less than and equal a value. This operator can't be used with string fields.  ",
    example:[
      {
        purpose:"Search all logs with 751 or fewer Bytes",
        code:"sent_bytes <= 751"
      },
      {
        purpose:"Search all logs where bandwidth is equal or fewer than 751 Bytes:",
        code:"received_bytes + sent_bytes <= 751"
      },
    ],
    details:`LESS THAN EQUALS(<=) condition is usally used with GREATER THAN EQUALS(>=) as a range query. `
  },
  {
    name:"IN",
    syntax:"in",
    primaryKey:"IN",
    description:"Search for logs where the value of  a specified field is one of multiple specified values.",
    example:[
      {
        purpose:"Search all logs in communication destination port  443 or 80：",
        code:"server_port in (443, 80)"
      },
      {
        purpose:"Search all logs where the Server IP or Client IP is either 8.8.8.8 or 192.168.10.53:",
        code:"client_ip in ('8.8.8.8', '192.168.50.53') or server_ip in ('8.8.8.8', '192.168.10.53')"
      },
    ],
    details:`The IN condition you can use when you need to use multiple OR condition. The values are specified as a comma-separated(,) list,surrouded by parentheses. Using IN  is  equivalent to using multiple EQUALS(=)statements with OR expression. That is  server_port in (443,80) is the same as (server_port=443 OR server_port=80).`
  },
  {
    name:"NOT IN",
    syntax:"not in",
    primaryKey:"NOT IN",
    description:"Search for logs where the value of  a specified field isn't one of multiple specified values.",
    example:[
      {
        purpose:"Search all logs not in communication destination port  443 or 80：",
        code:"server_port not in (443, 80)"
      },
      {
        purpose:"Search all logs where the Server IP and  Client IP isn't  8.8.8.8  or 192.168.10.53:",
        code:"client_ip not in ('8.8.8.8', '192.168.10.53') and server_ip not in ('8.8.8.8', '192.168.10.53')"
      },
    ],
    details:`The NOT IN condition you can use when you need to use multiple OR condition. The values are specified as a comma-separated(,) list,surrouded by parentheses. Using  NOT IN  is  equivalent to using multiple NOT EQUALS(!=)statements with AND expression. That is , server_port not in (443,80) is the same as (server_port !=443 AND server_port !=80).`
  },
  {
    name:"LIKE",
    syntax:"like",
    primaryKey:"LIKE",
    description:"Search for logs where use wildcard searches for value that contain search fields. This operator can be used with string fields.  ",
    example:[
      {
        purpose:`Search all logs where the SSL SNI  end with( suffix match) "google.com":`,
        code:"ssl_sni like  '%google.com'"
      },
      {
        purpose:"Search all logs where the Client IP  start with(prefix match)  '192.168':",
        code:"client_ip like '192.168%'"
      },
      {
        purpose:`Search all logs where the Client IP contains "192.168.1"  , between 192.168.10.10 and 192.168.10.19：`,
        code:"client_ip like '192.168.10.1_'"
      },
    ],
    details:`The LIKE  condition supports single and multiple character searches.Using percent (%) wildcard substitutes for one or more characters in a string. Using underscore (_) wildcard substitutes for exactly one character in a string. This operator can be used for searval purposes : checking a substring  , checking the start or end of a string.`
  },
  {
    name:"NOT LIKE",
    syntax:"not like",
    primaryKey:"NOT LIKE",
    description:"Search for logs where use wildcard searches for value that not contain search fields. This operator can be used with string fields.",
    example:[
      {
        purpose:`Search all logs where the SSL SNI not contain  end with( suffix match) "google.com":`,
        code:"ssl_sni not like '%google.com'"
      },
      {
        purpose:"Search all logs where the Client IP  not contain start with(prefix match)  '192.168':",
        code:"client_ip not like '192.168%'"
      },
      {
        purpose:`Search all logs where the Client IP not contains "192.168.1"  , between 192.168.10.10 and 192.168.10.19：`,
        code:"client_ip not like '192.168.10.1_'"
      },
    ],
    details:`The NOT LIKE  condition supports single and multiple character searches. Using percent (%) wildcard substitutes for one or more characters in a string. Using underscore (_) wildcard substitutes for exactly one character in a string. This operator can be used for searval purposes : checking a substring , checking the start or end of a string.`
  },
  {
    name:"HAS",
    syntax:"has",
    primaryKey:"HAS",
    description:"Search for logs where the values of a specified field is one of specified value.This operator can be used with array fields.",
    example:[
      {
        purpose:`Search all logs where the FQDN Category has the music(60):`,
        code:"has(service_category,60)"
      }
    ],
    details:`The HAS condition checks whether the "expr" array has the "value" element. The syntax has(expr, value).`
  },
  {
    name:"EMPTY",
    syntax:"empty",
    primaryKey:"EMPTY",
    description:"Search for logs where the specified field has empty value. This operator can be used with string and array fields.",
    example:[
      {
        purpose:`Search all logs where Application is not identified.`,
        code:"empty(common_app_label)"
      }
    ],
    details:`An empty string is a string of zero length. However , a NULL has no value at all. An empty string is useful when the data comes from multiple resources. NULL is used when some fields are optional, and the data is unknown.`
  },
  {
    name:"NOT EMPTY",
    syntax:"notEmpty",
    primaryKey:"NOTEMPTY",
    description:"Search for logs where the specified field has a value. This operator can be used with string and array fields.",
    example:[
      {
        purpose:`Search all logs that have one or more SNIs.`,
        code:"notEmpty(ssl_sni)"
      }
    ],
    details:`A not empty string is considered at least one byte, even if this a space.`
  },
  {
    name:"Bitwise AND",
    syntax:"bitAnd",
    primaryKey:"BITAND",
    description:`A bitwise And(&) is a binary operation that compares each bit of the first operand to the corresponding bit of the second operand. Both expressions must have integral types.`,
    example:[
      {
        purpose:`Search all logs where the Flags has the Asymmetric(524288) and Download(134217728):`,
        code:"bitAnd(Flags, 134742016) = 134742016"
      },
      {
        purpose:`Search all logs where the flags has either Asymmetric(524288) or Download(134217728):`,
        code:"bitAnd(Flags, 134742016)>0"
      }
    ],
    details:`The operands are converted to 64-bit integers and expressed by a series of bits (zeroes and ones). Sets each bit to 1 if both bits are 1.`
  },
]
export const operatorList=renderData
function main(){
  var  operatorTips={}
  renderData.forEach((item,index)=>{
    var data=item // 这是个闭包
    operatorTips[item.primaryKey]={
      name: item.name,
      syntax: item.syntax,
      type: "Operators",
      description() {
        return (<div className='operator-tips'>
          <h2>{data.name}</h2>
          <h3>Syntax:<span>{data.syntax}</span></h3>
          <h3> Description: </h3>
          <p> {data.description}</p>
          <h3>Examples:</h3>
          <ul>
            {item.example.map(v=>{
              return  <li>
                <span>{v.purpose}</span>
                <code>{v.code}</code>
              </li>
            })}
          </ul>
          <h3> Details: </h3>
          {Object.prototype.toString.call(data.details) === '[object Function]' ? <renderer renderFun={data.details}></renderer> :  <p>{data.details} </p>}
        </div>)
      }
    };
  })
  return operatorTips
}

var operatorTips=main();
export default operatorTips
