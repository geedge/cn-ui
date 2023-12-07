export const helpInfo=[
  {
    operator: "AND",
    describe: `Search logs that contain all the search fields. You can use parentheses "()" to control the order in which clauses are executed. `,
    example: [
      "Client IP = '192.168.10.53' AND Server IP = '8.8.8.8'",
      "Client IP = '192.168.10.53' AND SSL.SNI='google.com'",
    ]
  },
  // {
  //   operator: "OR",
  //   describe: `Search logs that contain any of the search fields. You can use parentheses  "()" to control the order in which clauses are executed. `,
  //   example: [
  //     "Client IP = '192.168.10.53' OR Server IP = '8.8.8.8'",
  //     "Client IP = '192.168.10.53' OR  Client IP = '192.168.10.54'",
  //   ]
  // },
  {
    operator: "= , !=",
    describe: `Search logs that do EQUALS or NOT EQUALS the search value. `,
    example: [
      "Client IP != '192.168.10.53'  ",
      "Server Port != 443",
    ]
  },
  {
    operator: "> , < , >= , <=",
    describe: `Search logs greater than and equal or less than and equal a value , or whtin a range. This operator can‘t be used with string fields.  `,
    example: [
      "Bytes Sent >= 751",
      "Bytes Sent >= 751 and  Bytes Sent <= 1024",
    ]
  },
  {
    operator: "LIKE , NOT LIKE",
    describe: `You can use wildcard searches for value that contain or not contain search fields. Using percent (%) wildcard substitutes for one or more characters in a string. Using underscore (_) wildcard substitutes for exactly one character in a string. `,
    example: [
      "SSL.SNI LIKE  '%google.com' ",
      "Client IP LIKE '192.168.10.1_'",
      "SSL.SNI NOT LIKE '%google.com'",
      "Client IP NOT LIKE '192.168%'",
    ]
  },
  {
    operator: "IN , NOT IN",
    describe: `Specify or exclude multiple values for search fields. IN/NOT IN condition you can use when you need to use multiple OR condition. `,
    example: [
      "l7 Protocol IN ('HTTP', 'HTTPS')",
      "Server Port NOT IN (443,80)"
    ]
  },
  {
    operator: "EMPTY , NOT EMPTY",
    describe: `Specify or exclude empty value for search fields. A string or array is considered non-empty if it contains at least one byte, even if this is a space or a null byte. `,
    example: [
      "NOT EMPTY(SSL.SNI)",
      "EMPTY(Application Label)"
    ]
  },
  {
    operator: "HAS",
    describe: `Search logs that has element value for array type. Example:`,
    example: [
      "HAS(FQDN Category, music)"
    ]
  },
  {
    operator: "bitAnd",
    describe: `A bitwise And(&) is a binary operation that compares each bit of the first operand to the corresponding bit of the second operand. Both expressions must have integral types. Examples:`,
    example: [
      "bitAnd(Flags, Asymmetric|Download) = Asymmetric|Download",
      "bitAnd(Flags, Asymmetric|Download) >0"
    ]
  },
]
var renderData=[
  helpInfo[0],
  helpInfo[1],
];
export const filterList=renderData
function main(){
  var  sqlTips={}
  renderData.forEach((item,index)=>{
    var data=item // 这是个闭包
    sqlTips[item.operator]={
      name: item.operator,
      // syntax: item.syntax,
      type: "filter",
      description() {
        return (<div className='filter-tips'>
          <h2>{data.operator}</h2>
          <h3> Description: </h3>
          <p> {data.describe}</p>
          <h3>Examples:</h3>
          <ul>
            {item.example.map(v => {
              return <li>
                <span>{v}</span>
              </li>
            })}
          </ul>
        </div>)
      }
    };
  })
  return sqlTips
}

var filterTips=main();
export default filterTips
