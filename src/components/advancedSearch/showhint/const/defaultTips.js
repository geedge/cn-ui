export default {

  default: {
    description () {
      const code = `SELECT aggregate_function(field) [as field] … (5)
FROM [db.]table|$log_type(1)
WHERE $filter [and <expression-list> ](2)
GROUP BY <field-list>(3)
[HAVING <expression-list>](4)
[ORDER BY <sort-field> [ASC|DESC]](6)
[LIMIT [n, ]m ](7)`
      return (<div className='default-tips'>
        <h2>How To Search</h2>
        <p> You can write a query to retieve logs from an log type, use group by aggregation keywords to calculate
          metrics
          and generate statistical results , search for specific conditions within a rolling time window, predict future
          trends, and so on. </p>

        <h3> 1. Filter Mode</h3>
        <p> A query in SQL ( also known as a "Where clause") has three basic parts: fields, operators, and values. Where
          clause can be combined with AND , OR and NOT keywords. </p>
        <code>[Field + operator + value] keyword [operator(Field)]</code>

        <ul>
          <li>Field - Fields are different types of traffic attributes int the system. Fields include server_ip,
            server_port, ssl_sni , and so on.
          </li>
          <li>Operator - Operators are the foundation of the query. They relate the field to the value and build a query
            condition. Common operators include equals(=), IN, Like, etc.
          </li>
          <li>
            <span>Value - Values are the actual data in the query.</span>
            <ul class="sub-url">
              <li>Use the percent (%) wildcard substitutes for one or more characters in a string. Such as ssl_sni like
                '%google.com' .
              </li>
              <li>Use underscore (_) wildcard substitutes for exactly one character in a string. Such as
                client_ip like '192.168.10.1_'.
              </li>
              <li>String requires single quotes (') around text values. Such as client_ip='192.168.10.53'.</li>
            </ul>
          </li>
          <li>Keyword - Keywords are specific words in the SQL. You can specify the AND and OR in the WHERE clause to
            create more complex query conditions.
          </li>
        </ul>
        <h3> 2. Statistics Mode </h3>
        <p>More advanced searches use the SQL keywords WHERE, GROUP BY to build aggregated query and return aggregated
          results.</p>
        <i class='ref-txt'>All clauses are optional , except for the required list of expressions after SELECT, WHERE and GROUP BY .</i>
        <pre class="code">
          {code}
        </pre>
      </div>)
    }
  }
}
