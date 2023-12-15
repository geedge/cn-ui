export default {
  enDefault: {
    description () {
      return (<div className='default-tips'>
        <div class='default-tips-header'>How To Search</div>
        <p class='show-hint-tips__p'> You can write queries to retrieve entities, including their basic information, activity levels, network performance, threat events, relationships with other entities, and so on. A query has three basic parts: fields, operators, and values.</p>
        <code>[Field + operator + value] keyword [operator(Field)]</code>
        <ul style="padding: 0">
          <li className='show-hint-tips__p'>Field - Fields are different types of traffic attributes in the system.
            Fields include ip, domain, app, and so on.
          </li>
          <li className='show-hint-tips__p'>Operator - Operators are the foundation of the query. They relate the field
            to the value and build a query condition. Common operators include =, IN, Like, and so on.
          </li>
          <li className='show-hint-tips__p'>Value - Values are the actual data in the query.</li>
          <p className='show-hint-tips__p'>Use the percent(%) wildcard substitutes for one or more characters in a
            string. Such as: </p>
          <code>domain like '%google.com'</code>
          <p className='show-hint-tips__p'>Strings containing spaces must be enclosed in single quotes ('). Such as:</p>
          <code>ip=192.168.10.53</code>
          <code>ip.country='United States'</code>
          <li className='show-hint-tips__p'>Keyword - Keywords are specific words in the query. You can specify the AND
            and OR to create more complex query conditions.
          </li>
          <p className='show-hint-tips__p'>Currently only support AND.</p>
        </ul>
        <p class='show-hint-tips__p'>There are two input modes, which can be switched by clicking the button on the right side of the input box.</p>

        <div class='default-tips-title'> 1. Text Mode</div>
        <p class='show-hint-tips__p'>In text mode, you will write your query with the help of input suggestions.</p>

        <div class='default-tips-title'> 2. Tag Mode </div>
        <p class='show-hint-tips__p'>In tag mode, you will be guided through preset steps to write a query.</p>
      </div>)
    }
  },
  zhDefault: {
    description () {
      return (<div className='default-tips'>
        <div class='default-tips-header'>如何搜索</div>
        <p class='show-hint-tips__p'>您可以编写查询来检索实体。查询具有三个基本部分：字段、运算符和值。</p>
        <code>[字段 + 运算符 + 值]  关键字  [运算符(字段)]</code>
        <ul style="padding: 0">
          <li className='show-hint-tips__p'>字段 - 字段是系统中不同类型的属性。字段包括 ip、domain、app 等。</li>
          <li className='show-hint-tips__p'>运算符 - 运算符是查询的基础。他们将字段与值相关联并构建查询条件。常见的运算符包括
            =、IN、Like 等。
          </li>
          <li className='show-hint-tips__p'>值 - 值是查询中的实际数据。</li>
          <p className='show-hint-tips__p'>使用百分号(%)通配符替换字符串中的一个或多个字符。例如：</p>
          <code>domain like '%google.com'</code>
          <p className='show-hint-tips__p'>包含空格的字符串必须用单引号(')括住。例如：</p>
          <code>ip=192.168.10.53</code>
          <code>ip.country='United States'</code>
          <li className='show-hint-tips__p'>关键字 - 关键字是查询中的特定单词。您可以指定 AND 和 OR
            来创建更复杂的查询条件。
          </li>
          <p className='show-hint-tips__p'>暂时只支持AND。</p>
        </ul>

        <p class='show-hint-tips__p'>有两种输入模式，通过点击输入框右侧的按钮进行切换。</p>

        <div class='default-tips-title'> 1. 文本模式</div>
        <p class='show-hint-tips__p'>文本模式中，您将在输入建议的帮助下编写查询语句。</p>

        <div class='default-tips-title'> 2. 标签模式 </div>
        <p class='show-hint-tips__p'>标签模式中，您将在引导下按预设好的步骤编写查询。</p>
      </div>)
    }
  }
}
