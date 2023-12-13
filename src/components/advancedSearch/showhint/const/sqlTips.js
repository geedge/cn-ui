var renderData = [
  {
    name: 'FROM',
    syntax: `FROM [db.]table |$log_type`,
    description: {
      title: `The table name of logs. If you type $log_type, the variable value is the current table name of logs.`
    }
  },
  {
    name: 'SELECT',
    syntax: `Optional. The selected columns(also known as dimensions and metrics).`,
    description: {
      title: '可选，获取列',
      list: [
        `aggregate_function(field) - Aggregate functions, default is count.`,
        `as field - Use as to specify a aliases for a field or expression.`
      ]
    }
  },
  {
    name: 'GROUP BY',
    syntax: `GROUP BY <field-list>`,
    description: {
      title: 'Aggregate data. GROUP BY clause switches the SELECT query into an aggregation mode：',
      list: [
        `The list of fields known as "grouping key", while each individual expression be referred to as a "key expression".`,
        `All the expressions in the SELECT, HAVING and ORDER BY , must be "key expression" or on aggregate functions.`,
        `The result of aggregating SELECT query will return unique values of  "grouping key" in log type.`
      ]
    }
  },
  {
    name: 'HAVING',
    syntax: `HAVING <expression-list>`,
    description: {
      title: `Optional. HAVING clause filtering the aggregation results retrieved by GROUP BY. It is difference is that WHERE is performed before aggregation, while HAVING is performed after it.
      Note: HAVING can't be performed if GROUP BY is not performed.`
    }
  },
  {
    name: 'LIMIT',
    syntax: `LIMIT [n, ]m`,
    description: {
      title: `Select the m rows from the aggregate results after skipping the first n rows. Default is 10 rows.`
    }
  },
  {
    name: 'ORDER BY',
    syntax: `ORDER BY <sort-field> [ASC|DESC]`,
    description: {
      title: `Sort all of the results by the specified fields.`
    }
  },
  {
    name: 'WHERE',
    syntax: `where  $filter [and <expression-list>]`,
    description: {
      title: `Filter the data.`,
      list: [
        `$filter - Default global filter clause. Include Time period, Vsys ID, and other expressions, etc`,
        `and <expression-list> - filter clauses`
      ]
    }
  }
]
export const sqlList = renderData

function main () {
  var sqlTips = {}
  renderData.forEach((item, index) => {
    var data = item // 这是个闭包
    sqlTips[item.name] = {
      name: item.name,
      syntax: item.syntax,
      type: 'sql',
      description () {
        return (<div className="sql-tips">
          <h2>{data.name}</h2>
          <h3>Syntax: <span>{data.syntax}</span></h3>
          <h3> Description: </h3>
          <p> {data.description.title}</p>
          {
            data.description.list && <ul>
              {data.description.list.map(v => {
                return <li>{v} </li>
              })}
            </ul>
          }
        </div>)
      }
    }
  })
  return sqlTips
}

var sqlTips = main()
export default sqlTips
