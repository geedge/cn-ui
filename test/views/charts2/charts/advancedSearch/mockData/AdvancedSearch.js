export const mockData = {
  empty: {},
  bytes: {},
  common: {},
  entityColumnList: [
    {
      name: 'ip',
      label: 'ip',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'ip',
          type: 'ip',
          operator_functions: '=,in,like'
        }
      }
    },
    {
      name: 'domain',
      label: 'domain',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'domain',
          type: 'domain',
          operator_functions: '=,in,like'
        }
      }
    },
    {
      name: 'app_name',
      label: 'app',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'app',
          operator_functions: '=,in,like'
        }
      }
    },
    {
      name: 'ip_country_region',
      label: 'ip.country',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'ip',
          operator_functions: '=,in'
        }
      }
    },
    {
      name: 'ip_super_admin_area',
      label: 'ip.region',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'ip',
          operator_functions: '=,in'
        }
      }
    },
    {
      name: 'ip_admin_area',
      label: 'ip.city',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'ip',
          operator_functions: '=,in'
        }
      }
    },
    {
      name: 'ip_asn',
      label: 'ip.asn',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'ip',
          operator_functions: '=,in'
        }
      }
    },
    {
      name: 'ip_isp',
      label: 'ip.isp',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'ip',
          operator_functions: '=,in'
        }
      }
    },
    {
      name: 'domain_category_name',
      label: 'domain.category',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'domain',
          operator_functions: '=,in'
        }
      }
    },
    {
      name: 'app_category',
      label: 'app.category',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'app',
          operator_functions: '=,in'
        }
      }
    },
    {
      name: 'entity_tags',
      label: 'tag',
      connector: {
        alias: 'e',
        table: 'cn_entity_relation',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: {
        type: 'array',
        items: 'string'
      },
      doc: {
        constraints: {
          primay: '',
          operator_functions: 'has'
        }
      }
    },
    {
      name: 'port',
      label: 'ip.port',
      connector: {
        alias: 'dr',
        table: 'cn_ip_dynamic_attribute',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'int',
      doc: {
        constraints: {
          primay: 'ip',
          operator_functions: '=,in'
        }
      }
    },
    {
      name: 'l7_protocol',
      label: 'ip.protocol',
      connector: {
        alias: 'dr',
        table: 'cn_ip_dynamic_attribute',
        schema: 'cyber_narrator_galaxy',
        catalog: 'clickhouse'
      },
      type: 'string',
      doc: {
        constraints: {
          primay: 'ip',
          operator_functions: '=,in'
        }
      }
    }
  ],
  entityDataset: {
    sourceData: {
      operatesList: [
        {
          name: 'AND',
          function: 'A AND B',
          type: 'abstract',
          label: 'AND'
        }
      ],
      filtersList: [
        {
          name: 'ip',
          label: 'ip',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              type: 'ip',
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'domain',
          label: 'domain',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'domain',
              type: 'domain',
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'app_name',
          label: 'app',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'app',
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'ip_country_region',
          label: 'ip.country',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'ip_super_admin_area',
          label: 'ip.region',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'ip_admin_area',
          label: 'ip.city',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'ip_asn',
          label: 'ip.asn',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'ip_isp',
          label: 'ip.isp',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'domain_category_name',
          label: 'domain.category',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'domain',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'app_category',
          label: 'app.category',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'app',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'entity_tags',
          label: 'tag',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: {
            type: 'array',
            items: 'string'
          },
          doc: {
            constraints: {
              primay: '',
              operator_functions: 'has'
            }
          }
        },
        {
          name: 'port',
          label: 'ip.port',
          connector: {
            alias: 'dr',
            table: 'cn_ip_dynamic_attribute',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'int',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'l7_protocol',
          label: 'ip.protocol',
          connector: {
            alias: 'dr',
            table: 'cn_ip_dynamic_attribute',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        }
      ],
      operatesDic: [
        {
          type: 'int',
          functions: '=,in,like,has'
        },
        {
          type: 'string',
          functions: '=,in,like,has'
        },
        {
          type: 'array',
          functions: '=,in,like,has'
        }
      ],
      operatorReference: [
        {
          name: '=',
          label: '=',
          function: 'expr = value'
        },
        {
          name: 'has',
          label: 'HAS',
          function: 'has(expr, value)'
        },
        {
          name: 'in',
          label: 'IN',
          function: 'expr in (values)'
        },
        {
          name: 'like',
          label: 'LIKE',
          function: 'expr like value'
        }
      ],
      operatorManual: [
        {
          name: '=',
          label: '=',
          function: 'expr = value'
        },
        {
          name: 'has',
          label: 'HAS',
          function: 'has(expr, value)'
        },
        {
          name: 'in',
          label: 'IN',
          function: 'expr in (values)'
        },
        {
          name: 'like',
          label: 'LIKE',
          function: 'expr like value'
        }
      ],
      fields: [
        {
          name: 'ip',
          label: 'ip',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              type: 'ip',
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'domain',
          label: 'domain',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'domain',
              type: 'domain',
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'app_name',
          label: 'app',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'app',
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'ip_country_region',
          label: 'ip.country',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'ip_super_admin_area',
          label: 'ip.region',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'ip_admin_area',
          label: 'ip.city',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'ip_asn',
          label: 'ip.asn',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'ip_isp',
          label: 'ip.isp',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'domain_category_name',
          label: 'domain.category',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'domain',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'app_category',
          label: 'app.category',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'app',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'entity_tags',
          label: 'tag',
          connector: {
            alias: 'e',
            table: 'cn_entity_relation',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: {
            type: 'array',
            items: 'string'
          },
          doc: {
            constraints: {
              primay: '',
              operator_functions: 'has'
            }
          }
        },
        {
          name: 'port',
          label: 'ip.port',
          connector: {
            alias: 'dr',
            table: 'cn_ip_dynamic_attribute',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'int',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        },
        {
          name: 'l7_protocol',
          label: 'ip.protocol',
          connector: {
            alias: 'dr',
            table: 'cn_ip_dynamic_attribute',
            schema: 'cyber_narrator_galaxy',
            catalog: 'clickhouse'
          },
          type: 'string',
          doc: {
            constraints: {
              primay: 'ip',
              operator_functions: '=,in'
            }
          }
        }
      ],
      doc: {
        functions: {
          aggregation: [],
          date: [],
          operator: [
            {
              name: '=',
              label: '=',
              function: 'expr = value'
            },
            {
              name: 'has',
              label: 'HAS',
              function: 'has(expr, value)'
            },
            {
              name: 'in',
              label: 'IN',
              function: 'expr in (values)'
            },
            {
              name: 'like',
              label: 'LIKE',
              function: 'expr like value'
            }
          ]
        },
        schema_query: {
          references: {
            aggregation: [
              {
                type: 'int',
                functions: ''
              },
              {
                type: 'string',
                functions: ''
              },
              {
                type: 'array',
                functions: ''
              }
            ],
            operator: [
              {
                type: 'int',
                functions: '=,in,like,has'
              },
              {
                type: 'string',
                functions: '=,in,like,has'
              },
              {
                type: 'array',
                functions: '=,in,like,has'
              }
            ]
          }
        }
      },
      funcDic: [
        {
          type: 'int',
          functions: ''
        },
        {
          type: 'string',
          functions: ''
        },
        {
          type: 'array',
          functions: ''
        }
      ],
      funcReference: []
    },
    hintData: {
      operatesList: [
        {
          type: 'abstract',
          text: '',
          displayText: 'Keyword',
          className: 'divider hint-title'
        },
        {
          text: 'AND',
          displayText: 'AND',
          className: 'operates-item el-dropdown-menu__item relative-item'
        }
      ],
      filtersList: [
        {
          type: 'abstract',
          text: '',
          displayText: 'Fields',
          className: 'divider hint-title'
        },
        {
          text: 'ip',
          displayText: 'ip',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'domain',
          displayText: 'domain',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'app',
          displayText: 'app',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'ip.country',
          displayText: 'ip.country',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'ip.region',
          displayText: 'ip.region',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'ip.city',
          displayText: 'ip.city',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'ip.asn',
          displayText: 'ip.asn',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'ip.isp',
          displayText: 'ip.isp',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'domain.category',
          displayText: 'domain.category',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'app.category',
          displayText: 'app.category',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'tag',
          displayText: 'tag',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'ip.port',
          displayText: 'ip.port',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'ip.protocol',
          displayText: 'ip.protocol',
          className: 'filter-item el-dropdown-menu__item relative-item'
        }
      ]
    }
  },
  detectionColumnList: [
    {
      name: 'event_type',
      label: 'eventType',
      type: 'string',
      doc: {
        constraints: {
          operator_functions: '=,in,like'
        },
        data: [
          {
            code: 'Initial Access',
            value: 'Initial Access'
          },
          {
            code: 'Command and Control',
            value: 'Command and Control'
          },
          {
            code: 'Credential Access',
            value: 'Credential Access'
          },
          {
            code: 'Lateral Movement',
            value: 'Lateral Movement'
          },
          {
            code: 'Collection',
            value: 'Collection'
          },
          {
            code: 'Impact',
            value: 'Impact'
          },
          {
            code: 'Anonymity',
            value: 'Anonymity'
          },
          {
            code: 'Regulatory Risk',
            value: 'Regulatory Risk'
          }
        ]
      }
    },
    {
      name: 'event_name',
      label: 'eventName',
      type: 'string',
      doc: {
        constraints: {
          operator_functions: '=,in,like'
        }
      }
    },
    {
      name: 'severity',
      label: 'severity',
      type: 'string',
      doc: {
        constraints: {
          operator_functions: '=,in,like'
        },
        data: [
          {
            code: 'Critical',
            code1: 'overall.critical',
            value: 'critical'
          },
          {
            code: 'High',
            code1: 'overall.high',
            value: 'high'
          },
          {
            code: 'Medium',
            code1: 'overall.medium',
            value: 'medium'
          },
          {
            code: 'Low',
            code1: 'overall.low',
            value: 'low'
          },
          {
            code: 'Info',
            code1: 'overall.info',
            value: 'info'
          }
        ]
      }
    },
    {
      name: 'offender_ip',
      label: 'offenderIP',
      type: 'string',
      doc: {
        constraints: {
          operator_functions: '=,in,like'
        }
      }
    },
    {
      name: 'victim_ip',
      label: 'victimIP',
      type: 'string',
      doc: {
        constraints: {
          operator_functions: '=,in,like'
        }
      }
    },
    {
      name: 'domain',
      label: 'domain',
      type: 'string',
      doc: {
        constraints: {
          operator_functions: '=,in,like'
        }
      }
    },
    {
      name: 'app',
      label: 'app',
      type: 'string',
      doc: {
        constraints: {
          operator_functions: '=,in,like'
        }
      }
    },
    {
      name: 'status',
      label: 'status',
      type: 'string',
      doc: {
        constraints: {
          operator_functions: '=,in'
        },
        data: [
          {
            code: 'Ended',
            code1: 'detections.ended',
            value: 1
          },
          {
            code: 'Active',
            code1: 'detections.active',
            value: 0
          }
        ]
      }
    }
  ],
  detectionDataset: {
    sourceData: {
      operatesList: [
        {
          name: 'AND',
          function: 'A AND B',
          type: 'abstract',
          label: 'AND'
        }
      ],
      filtersList: [
        {
          name: 'event_type',
          label: 'eventType',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            },
            data: [
              {
                code: 'Initial Access',
                value: 'Initial Access'
              },
              {
                code: 'Command and Control',
                value: 'Command and Control'
              },
              {
                code: 'Credential Access',
                value: 'Credential Access'
              },
              {
                code: 'Lateral Movement',
                value: 'Lateral Movement'
              },
              {
                code: 'Collection',
                value: 'Collection'
              },
              {
                code: 'Impact',
                value: 'Impact'
              },
              {
                code: 'Anonymity',
                value: 'Anonymity'
              },
              {
                code: 'Regulatory Risk',
                value: 'Regulatory Risk'
              }
            ]
          }
        },
        {
          name: 'event_name',
          label: 'eventName',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'severity',
          label: 'severity',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            },
            data: [
              {
                code: 'Critical',
                code1: 'overall.critical',
                value: 'critical'
              },
              {
                code: 'High',
                code1: 'overall.high',
                value: 'high'
              },
              {
                code: 'Medium',
                code1: 'overall.medium',
                value: 'medium'
              },
              {
                code: 'Low',
                code1: 'overall.low',
                value: 'low'
              },
              {
                code: 'Info',
                code1: 'overall.info',
                value: 'info'
              }
            ]
          }
        },
        {
          name: 'offender_ip',
          label: 'offenderIP',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'victim_ip',
          label: 'victimIP',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'domain',
          label: 'domain',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'app',
          label: 'app',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'status',
          label: 'status',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in'
            },
            data: [
              {
                code: 'Ended',
                code1: 'detections.ended',
                value: 1
              },
              {
                code: 'Active',
                code1: 'detections.active',
                value: 0
              }
            ]
          }
        }
      ],
      operatesDic: [
        {
          type: 'int',
          functions: '=,in,like,has'
        },
        {
          type: 'string',
          functions: '=,in,like,has'
        },
        {
          type: 'array',
          functions: '=,in,like,has'
        }
      ],
      operatorReference: [
        {
          name: '=',
          label: '=',
          function: 'expr = value'
        },
        {
          name: 'has',
          label: 'HAS',
          function: 'has(expr, value)'
        },
        {
          name: 'in',
          label: 'IN',
          function: 'expr in (values)'
        },
        {
          name: 'like',
          label: 'LIKE',
          function: 'expr like value'
        }
      ],
      operatorManual: [
        {
          name: '=',
          label: '=',
          function: 'expr = value'
        },
        {
          name: 'has',
          label: 'HAS',
          function: 'has(expr, value)'
        },
        {
          name: 'in',
          label: 'IN',
          function: 'expr in (values)'
        },
        {
          name: 'like',
          label: 'LIKE',
          function: 'expr like value'
        }
      ],
      fields: [
        {
          name: 'event_type',
          label: 'eventType',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            },
            data: [
              {
                code: 'Initial Access',
                value: 'Initial Access'
              },
              {
                code: 'Command and Control',
                value: 'Command and Control'
              },
              {
                code: 'Credential Access',
                value: 'Credential Access'
              },
              {
                code: 'Lateral Movement',
                value: 'Lateral Movement'
              },
              {
                code: 'Collection',
                value: 'Collection'
              },
              {
                code: 'Impact',
                value: 'Impact'
              },
              {
                code: 'Anonymity',
                value: 'Anonymity'
              },
              {
                code: 'Regulatory Risk',
                value: 'Regulatory Risk'
              }
            ]
          }
        },
        {
          name: 'event_name',
          label: 'eventName',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'severity',
          label: 'severity',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            },
            data: [
              {
                code: 'Critical',
                code1: 'overall.critical',
                value: 'critical'
              },
              {
                code: 'High',
                code1: 'overall.high',
                value: 'high'
              },
              {
                code: 'Medium',
                code1: 'overall.medium',
                value: 'medium'
              },
              {
                code: 'Low',
                code1: 'overall.low',
                value: 'low'
              },
              {
                code: 'Info',
                code1: 'overall.info',
                value: 'info'
              }
            ]
          }
        },
        {
          name: 'offender_ip',
          label: 'offenderIP',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'victim_ip',
          label: 'victimIP',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'domain',
          label: 'domain',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'app',
          label: 'app',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in,like'
            }
          }
        },
        {
          name: 'status',
          label: 'status',
          type: 'string',
          doc: {
            constraints: {
              operator_functions: '=,in'
            },
            data: [
              {
                code: 'Ended',
                code1: 'detections.ended',
                value: 1
              },
              {
                code: 'Active',
                code1: 'detections.active',
                value: 0
              }
            ]
          }
        }
      ],
      doc: {
        functions: {
          aggregation: [],
          date: [],
          operator: [
            {
              name: '=',
              label: '=',
              function: 'expr = value'
            },
            {
              name: 'has',
              label: 'HAS',
              function: 'has(expr, value)'
            },
            {
              name: 'in',
              label: 'IN',
              function: 'expr in (values)'
            },
            {
              name: 'like',
              label: 'LIKE',
              function: 'expr like value'
            }
          ]
        },
        schema_query: {
          references: {
            aggregation: [
              {
                type: 'int',
                functions: ''
              },
              {
                type: 'string',
                functions: ''
              },
              {
                type: 'array',
                functions: ''
              }
            ],
            operator: [
              {
                type: 'int',
                functions: '=,in,like,has'
              },
              {
                type: 'string',
                functions: '=,in,like,has'
              },
              {
                type: 'array',
                functions: '=,in,like,has'
              }
            ]
          }
        }
      },
      funcDic: [
        {
          type: 'int',
          functions: ''
        },
        {
          type: 'string',
          functions: ''
        },
        {
          type: 'array',
          functions: ''
        }
      ],
      funcReference: []
    },
    hintData: {
      operatesList: [
        {
          type: 'abstract',
          text: '',
          displayText: 'Keyword',
          className: 'divider hint-title'
        },
        {
          text: 'AND',
          displayText: 'AND',
          className: 'operates-item el-dropdown-menu__item relative-item'
        }
      ],
      filtersList: [
        {
          type: 'abstract',
          text: '',
          displayText: 'Fields',
          className: 'divider hint-title'
        },
        {
          text: 'eventType',
          displayText: 'eventType',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'eventName',
          displayText: 'eventName',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'severity',
          displayText: 'severity',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'offenderIP',
          displayText: 'offenderIP',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'victimIP',
          displayText: 'victimIP',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'domain',
          displayText: 'domain',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'app',
          displayText: 'app',
          className: 'filter-item el-dropdown-menu__item relative-item'
        },
        {
          text: 'status',
          displayText: 'status',
          className: 'filter-item el-dropdown-menu__item relative-item'
        }
      ]
    }
  }
}
