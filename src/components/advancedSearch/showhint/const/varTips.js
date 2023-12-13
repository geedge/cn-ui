var renderData = [
  {
    name: '$LOG_TYPE',
    description: 'A variable is a symbolic representation of data that enables you to access a value without having to enter it manually wherever you need it. You can use $ to reference variables throughout Advanced Search. ',
    details () {
      // 支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>
        $log_type: The table name of logs.
      </div>
    }
  },
  {
    name: '$FILTER',
    description: 'A variable is a symbolic representation of data that enables you to access a value without having to enter it manually wherever you need it. You can use $ to reference variables throughout Advanced Search. ',
    details () {
      // 支持jsx 嵌套写法,万一测试要关键字加重呢
      return <div>
        $filter: The default filter clauses. such as time period, Vsys ID, and other default expressions, etc.
      </div>
    }
  }
]

function main () {
  const varTips = {}
  renderData.forEach((item, index) => {
    const data = item // 这是个闭包
    varTips[item.name] = {
      name: item.name,
      type: 'Variables',
      description () {
        return (<div className="var-tips">
          <h2>{data.name}</h2>
          <h3> Description: </h3>
          <p> {data.description}</p>
          <h3> Details: </h3>
          {Object.prototype.toString.call(data.details) === '[object Function]' ?
            <renderer renderFun={data.details}></renderer> : <p>{data.details} </p>}
        </div>)
      }
    }
  })
  return varTips
}

export const varList = renderData
const varTips = main()
export default varTips
