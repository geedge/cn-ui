export const dataTemplate = {
  doc: {
    functions: {
      aggregation: [
        {
          name: 'COUNT',
          function: 'count(expr)',
          label: 'COUNT'
        }, {
          name: 'COUNT_DISTINCT',
          function: 'count(distinct expr)',
          label: 'COUNT_DISTINCT'
        }, {
          name: 'AVG',
          function: 'avg(expr)',
          label: 'AVG'
        }, {
          name: 'SUM',
          function: 'sum(expr)',
          label: 'SUM'
        }, {
          name: 'MAX',
          function: 'max(expr)',
          label: 'MAX'
        }, {
          name: 'MIN',
          function: 'min(expr)',
          label: 'MIN'
        }],
      operator: [
        {
          name: '=',
          function: 'expr = value',
          label: '='
        }, {
          name: '!=',
          function: 'expr != value',
          label: '!='
        }, {
          name: '>',
          function: 'expr > value',
          label: '>'
        }, {
          name: '<',
          function: 'expr < value',
          label: '<'
        }, {
          name: '>=',
          function: 'expr >= value',
          label: '>='
        }, {
          name: '<=',
          function: 'expr <= value',
          label: '<='
        }, {
          name: 'has',
          function: 'has(expr, value)',
          label: 'HAS'
        }, {
          name: 'in',
          function: 'expr in (values)',
          label: 'IN'
        }, {
          name: 'not in',
          function: 'expr not in (values)',
          label: 'NOT IN'
        }, {
          name: 'like',
          function: 'expr like value',
          label: 'LIKE'
        }, {
          name: 'not like',
          function: 'expr not like value',
          label: 'NOT LIKE'
        }, {
          name: 'notEmpty',
          function: 'notEmpty(expr)',
          label: 'NOT EMPTY'
        }, {
          name: 'empty',
          function: 'empty(expr)',
          label: 'EMPTY'
        }]
    },
    schema_query: {
      references: {
        aggregation: [
          {
            type: 'int',
            functions: 'COUNT,COUNT_DISTINCT,AVG,SUM,MAX,MIN'
          }, {
            type: 'long',
            functions: 'COUNT,COUNT_DISTINCT,AVG,SUM,MAX,MIN'
          }, {
            type: 'float',
            functions: 'COUNT,COUNT_DISTINCT,AVG,SUM,MAX,MIN'
          }, {
            type: 'double',
            functions: 'COUNT,COUNT_DISTINCT,AVG,SUM,MAX,MIN'
          }, {
            type: 'string',
            functions: 'COUNT,COUNT_DISTINCT'
          }, {
            type: 'date',
            functions: 'COUNT,COUNT_DISTINCT,MAX,MIN'
          }, {
            type: 'timestamp',
            functions: 'COUNT,COUNT_DISTINCT,MAX,MIN'
          }
        ],
        operator: [
          {
            type: 'int',
            functions: '=,!=,>,<,>=,<=,in,not in'
          }, {
            type: 'long',
            functions: '=,!=,>,<,>=,<=,in,not in'
          }, {
            type: 'float',
            functions: '=,!=,>,<,>=,<='
          }, {
            type: 'double',
            functions: '=,!=,>,<,>=,<='
          }, {
            type: 'string',
            functions: '=,!=,in,not in,like,not like,notEmpty,empty'
          }, {
            type: 'date',
            functions: '=,!=,>,<,>=,<='
          }, {
            type: 'timestamp',
            functions: '=,!=,>,<,>=,<='
          }, {
            type: 'array',
            functions: 'has'
          }]
      }
    }
  },
  fields: []
}

export const fieldTemplate = {
  name: '',
  label: '',
  doc: {
    allow_query: 'true',
    visibility: null,
    constraints: {
      type: 'tag',
      operator_functions: 'in,not in'
    },
    data: []
  },
  type: 'Array'
}
