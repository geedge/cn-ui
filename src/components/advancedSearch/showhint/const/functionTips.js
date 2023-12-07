var renderData = [
  {
    name: "COUNT",
    syntax: "count(expr)",
    description: "Aggregate function is used to count the number of rows",
    example: [
      {
        purpose: "Total count of all logs :",
        code: "count(*)"
      },
      {
        purpose: "Counts  the occurrences of a  Client IP :",
        code: "count(client_ip)"
      },
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>
        You can use COUNT function by count(*), count(1) or count(field). But there are something difference:
        <ul>
          <li>count(*) and count(1) will count all the rows in the table, including NULL values.</li>
          <li>count(field) will count all the rows in the specified field while excluding NULL values.</li>
        </ul>
      </div>
    }
  },
  {
    name: "COUNT_DISTINCT",
    syntax: "count(distinct expr)",
    description: "Aggregate function is used to count only distinct(unique) rows in the specified field",
    example: [
      {
        purpose: "Counts the number of different Client IP :",
        code: "count(distinct client_ip)"
      },
      {
        purpose: `Counts  the number of different "Server IP" and "Server port" :`,
        code: "count(distinct server_ip, server_port)"
      },
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>The COUNT DISTINCT function returns the number of unique values in the field or multiple fields.
        System will uses an adaptive sampling algorithm to perform fast count distinct operations.</div>
    }
  },
  {
    name: "AVG",
    syntax: "avg(expr)",
    description: "Aggregate function is used to calculate the arithmetic mean in the specified field. EXPR must be Integer,Float or Decimal and returned value as Float.",
    example: [
      {
        purpose: `Calculates the average(mean) "Byte sent (sent_bytes)" field:`,
        code: "avg(sent_bytes)"
      },
      {
        purpose: `Calculates the average(mean) "Bytes" , rounded to 2 decimal points:`,
        code: "round(avg(sent_bytes+received_bytes),2)"
      },
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>You can use ROUND(expr[,decimal_places]) or FLOOR(expr[,decimal_places]) function that rounds or floors a value to a specified number of decimal places.</div>
    }
  },
  {
    name: "SUM",
    syntax: "sum(expr)",
    description: "Aggregate function is used to sum of the values of the specified field. EXPR must be Integer,Float or Decimal.",
    example: [
      {
        purpose: `The sum of the "Byte sent (sent_bytes)" field:`,
        code: "sum(sent_bytes)"
      },
      {
        purpose: `The sum of the "sent_bytes" and "received_bytes" fields , and rename as "Bytes ":`,
        code: "sum(sent_bytes+received_bytes) as Bytes"
      },
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>You can rename the field using the AS keyword.</div>
    }
  },
  {
    name: "MAX",
    syntax: "max(expr)",
    description: "Aggregate function is used to return the maximum value of the specified field.",
    example: [
      {
        purpose: `Returns the maximum value of  the  "Byte sent (sent_bytes)" field:`,
        code: "max(sent_bytes)"
      }
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>The <b>MAX</b> aggregate function can also be used with the DateTime data type, where it will sort the DateTime values and return the last value from the sorted logs.</div>
    }
  },
  {
    name: "MIN",
    syntax: "min(expr)",
    description: "Aggregate function is used to return the minimum value of the specified field.",
    example: [
      {
        purpose: `Returns the minimum value of  the  "Byte sent (sent_bytes)" field:`,
        code: "min(sent_bytes)"
      }
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>The MIN aggregate function can also be used with the DateTime data type, where it will sort the DateTime values and return the minimum value from the sorted logs.</div>
    }
  },
  {
    name: "TIME_FLOOR_WITH_FILL",
    syntax: "TIME_FLOOR_WITH_FILL(<timestamp_expr>, <period>[,<fill>])",
    description: "Rounds down a timestamp, returning it as a new timestamp,optionally from some reference fill, and fills time gaps and impute missing values.",
    example: [
      {
        purpose: `Round the recv_time  down to a 5 minutes increment and fill time gaps and impute zero value.`,
        code: "TIME_FLOOR_WITH_FILL(recv_time,'PT5M','zero')"
      }
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>
        <p>The TIME_FLOOR_WITH_FILL function as Timeseries granularity is used for time-based grouping.</p>
        <ul>
          <li> timestamp_expr - Unix Timestamp field</li>
          <li>period - can be any ISO8601 period, like P3M (quarters) or PT12H (half-days) </li>
          <li>
            <span>fill - optionnal. Includes none, null, zero, previous, next value.</span>
            <ul class="sub-url">
              <li>none: empty string ""</li>
              <li>null："NULL" expression</li>
              <li>zero：zero "0"</li>
              <li>previous：previous value</li>
              <li>next：next value</li>
            </ul>
          </li>
        </ul>
      </div>
    }
  },
  {
    name: "UNIX_TIMESTAMP",
    syntax: `UNIX_TIMESTAMP(date)`,
    description: `Returns a Unix timestamp the value of the argument as seconds since '1970-01-01 00:00:00' UTC.`,
    example: [
      {
        purpose: `Specify a datetime string "2019-06-06 19:11:12",  calculate the Unix timestamp:`,
        code: "UNIX_TIMESTAMP('2019-06-06 19:11:12')"
      },
      {
        purpose: `Specify a ISO8601 datetime string with time zone information  "2019-10-12T14:20:50+08:00",  calculate the Unix timestamp:`,
        code: "UNIX_TIMESTAMP('2019-10-12T14:20:50+08:00')"
      },
      {
        purpose: `Specify a ISO8601 datetime string with UTC+0 time zone information  "2019-10-12T14:20:50Z",  calculate the Unix timestamp:`,
        code: "UNIX_TIMESTAMP('2019-10-12T14:20:50Z')"
      },
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>
        <p>The date argument may be a DATE, DATETIME or TIMESTAMP string, or a number in YYMMDD, YYMMDDhhmmss, YYYYMMDD, or YYYYMMDDhhmmss format.</p>
        <ul>
          <li> Standard datetime string(UTC+0) : UNIX_TIMESTAMP('2019-06-06 19:11:12')</li>
          <li>ISO8601 datetime string：UNIX_TIMESTAMP('2019-10-12T14:20:50Z') or UNIX_TIMESTAMP('2019-10-12T14:20:50+08:00')</li>
          <li>Date: UNIX_TIMESTAMP(DATE('2019-06-06 19:11:12'))  </li>
        </ul>
      </div>
    }
  },
  {
    name: "FROM_UNIXTIME",
    syntax: `FROM_UNIXTIME(unix_timestamp)`,
    description: `Returns a representation of unix_timestamp as a datetime or character string value. The value returned is expressed using the UTC+0 time zone.`,
    example: [
      {
        purpose: `Specify a Unix Timestamp  "1570881546",  calculate the datetime string:`,
        code: "FROM_UNIXTIME(1570881546)"
      },
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>The unix_timestamp is an internal timestamp value representing seconds since '1970-01-01 00:00:00' UTC.</div>
    }
  },
  {
    name: "DATE_FORMAT",
    syntax: "DATE_FORMAT(date, format)",
    description: `Formats the date value according to the format string.`,
    example: [
      {
        purpose: `Specify a Unix Timestamp  "1570881546", calculate the datetime string with format "%Y-%m-%d %H:%i:%s":`,
        code: "DATE_FORMAT(FROM_UNIXTIME(1570881546), '%Y-%m-%d %H:%i:%s')"
      }
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>
        <p>The DATE_FORMAT function accepts two parameters as given below :</p>
        <ul>
          <li>date – Specified date to be formatted.</li>
          <li>
            <span>format – Specified format. This list of formats used in this function are listed below:</span>
            <ul class="sub-url">
              <li>%Y - Year, numeric, four digits</li>
              <li>%y - Year, numeric (two digits)</li>
              <li>%M - Month name (January..December)</li>
              <li>%m - Month, numeric (00..12)</li>
              <li>%D - Day of the month with English suffix (0th, 1st, 2nd, 3rd, …)</li>
              <li>%d - Day of the month, numeric (00..31)</li>
              <li>%H - Hour (00..23)</li>
              <li>%h - Hour (01..12)</li>
              <li>%i - Minutes, numeric (00..59)</li>
              <li>%s - Seconds (00..59)</li>
              <li>%w - Day of the week (0=Sunday..6=Saturday)</li>
            </ul>
          </li>
        </ul>
      </div>
    }
  },
  {
    name: "CONVERT_TZ",
    syntax:`CONVERT_TZ(dt, from_tz, to_tz)`,
    description: `Converts a datetime value dt from the time zone given by from_tz to the time zone given by to_tz and returns the resulting value.`,
    example: [
      {
        purpose: `Specify a datetime string "2021-11-11 00:00:00", converted from  GMT(Greenwich Mean Time) to Asia/Shanghai time zone:`,
        code: "CONVERT_TZ('2021-11-11 00:00:00','GMT','Asia/Shanghai')"
      },
      {
        purpose: `Specify a Unix timestamp "1636588800", converted from  GMT(Greenwich Mean Time) to Asia/Shanghai time zone:`,
        code: "CONVERT_TZ(FROM_UNIXTIME(1636588800),'GMT','Asia/Shanghai')"
      },
      {
        purpose: `Specify a Unix timestamp "1636588800", converted from  Europe/London to America/New_York time zone:`,
        code: "CONVERT_TZ(DATE_FORMAT(FROM_UNIXTIME(1636588800), '%Y-%m-%d %H:%i:%s'),'Europe/London','America/New_York')"
      },
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>
        <p>The CONVERT_TZ function accepts a three-parameter:</p>
        <ul>
          <li>dt - The given DateTime which we want to convert.</li>
          <li>from_tz - The time zone from which we want to convert DateTime.</li>
          <li>to_tz - The time zone in which we want to convert DateTime.</li>
        </ul>
      </div>
    }
  },
  {
    name: "MEDIAN",
    syntax:`MEDIAN(<expr>)`,
    description: `Aggregate function is used to calculate median value. expr must be Integer, Float or Decimal.`,
    example: [
      {
        purpose: `Calculates the median "TCP Handshake Latency (tcp_handshake_latency_ms)" field:`,
        code: "MEDIAN(tcp_handshake_latency_ms)"
      }
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>In Traffic logs analysis, the function can be useful in calculating the median of certain numbers, e.g. median SSL Handshake Latency  or TCP Handshake Latency.</div>
    }
  },
  {
    name: "QUANTILE",
    syntax:`QUANTILE(<expr>[, <level>])`,
    description: `Aggregate function is used to calculate an approximate quantile of a numeric data sequence.`,
    example: [
      {
        purpose: `Calculates the  90th percentile  "TCP Handshake Latency (tcp_handshake_latency_ms)" field:`,
        code: "QUANTILE(tcp_handshake_latency_ms, 0.9)"
      }
    ],
    details() {
      //支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>
        <p>The QUANTILE function accepts a two-parameter:</p>
        <ul>
          <li>expr - The column values resulting in integer, Flot or Decimal.</li>
          <li>level -  Level of quantile. Optional parameter. Constant floating-point number from 0 to 1. We recommend using a level value in the range of [0.01, 0.99]. Default value is 0.5. At level=0.5 the function calculates MEDIAN.</li>
        </ul>
      </div>
    }
  },
];

function main() {
  var functionTips = {}
  renderData.forEach((item, index) => {
    var data=item // 这是个闭包
    functionTips[item.name] = {
      name: item.name,
      syntax: item.syntax,
      type: "Function",
      description() {
        return (<div className='function-tips'>
          <h2>{data.name}</h2>
          <h3>Syntax:<span>{data.syntax}</span></h3>
          <h3> Description: </h3>
          <p> {data.description}</p>
          <h3>Examples:</h3>
          <ul>
            {item.example.map(v => {
              return <li>
                <span>{v.purpose}</span>
                <code>{v.code}</code>
              </li>
            })}
          </ul>
          <h3> Details: </h3>
          {Object.prototype.toString.call(data.details) === '[object Function]' ?
            <renderer renderFun={data.details}></renderer> : <p>{data.details} </p>}
        </div>)
      }
    };
  })
  return functionTips
}
export const functionList=renderData
var functionTips = main();
export default functionTips
