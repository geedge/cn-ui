/**
 * @name: 静态数据模板
 * @description: 用于存放引用到的静态数据，如表格列名称、echarts的legend名称等
 * 如有使用 this 的，js文件里不识别 this，需要引入对应方法，如this.$t引入i18n，this.$route 引入route
 * @author: newhome
 * @date: 2023-03-16 17:26:49
 */
// 如有使用this的
import i18n from '@/i18n'
import { storageKey, unitTypes } from '@/utils/constants'
const _this = i18n.global
_this.$t = _this.t

// NpmTrafficLine折线图数据
export const dataForNpmTrafficLine = {
  tabs: [
    {
      name: 'network.total',
      show: true,
      positioning: 0,
      data: [],
      unitType: 'number'
    },
    {
      name: 'network.inbound',
      show: true,
      positioning: 1,
      data: [],
      unitType: 'number'
    },
    {
      name: 'network.outbound',
      show: true,
      positioning: 2,
      data: [],
      unitType: 'number'
    },
    {
      name: 'network.internal',
      show: true,
      positioning: 3,
      data: [],
      unitType: 'number'
    },
    {
      name: 'network.through',
      show: true,
      positioning: 4,
      data: [],
      unitType: 'number'
    },
    {
      name: 'network.other',
      show: true,
      positioning: 5,
      data: [],
      unitType: 'number'
    }
  ],
  npmQuantity: [
    { name: 'networkAppPerformance.tcpConnectionEstablishLatency', show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 0 },
    { name: 'networkAppPerformance.httpResponse', show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 1 },
    { name: 'networkAppPerformance.sslResponseLatency', show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 2 },
    { name: 'networkAppPerformance.packetLoss', show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 3 },
    { name: 'overall.packetRetrans', show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 4 }
  ],
  metricOptions: [
    /* { value: 'Bits/s', label: 'Bits/s' },
    { value: 'Packets/s', label: 'Packets/s' },
    { value: 'Sessions/s', label: 'Sessions/s' }, */
    { value: 'establishLatencyMs', label: 'networkAppPerformance.tcpConnectionEstablishLatency' },
    { value: 'httpResponseLatency', label: 'networkAppPerformance.httpResponse' },
    { value: 'sslConLatency', label: 'networkAppPerformance.sslResponseLatency' },
    { value: 'tcpLostlenPercent', label: 'networkAppPerformance.packetLoss' },
    { value: 'pktRetransPercent', label: 'overall.packetRetrans' }
  ]
}

export const dataForNetworkOverviewLine = {
  options2: [
    {
      value: 'Average',
      label: 'Average'
    },
    {
      value: '95th Percentile',
      label: '95th Percentile'
    },
    {
      value: 'Maximum',
      label: 'Maximum'
    }
  ],
  tabsTemplate: [
    {
      analysis: {},
      name: 'network.total',
      class: 'total',
      show: true,
      invertTab: true,
      positioning: 0,
      data: [],
      unitType: ''
    },
    {
      analysis: {},
      name: 'network.inbound',
      class: 'inbound',
      show: true,
      invertTab: true,
      positioning: 1,
      data: [],
      unitType: ''
    },
    {
      analysis: {},
      name: 'network.outbound',
      class: 'outbound',
      show: true,
      invertTab: true,
      positioning: 2,
      data: [],
      unitType: ''
    },
    {
      analysis: {},
      name: 'network.internal',
      class: 'internal',
      show: true,
      invertTab: true,
      positioning: 3,
      data: [],
      unitType: ''
    },
    {
      analysis: {},
      name: 'network.through',
      class: 'through',
      show: true,
      invertTab: true,
      positioning: 4,
      data: [],
      unitType: ''
    },
    {
      analysis: {},
      name: 'network.other',
      class: 'other',
      show: true,
      invertTab: true,
      positioning: 5,
      data: [],
      unitType: ''
    }
  ]
}

export const dataForLinkTrafficLine = {
  options: [
    {
      value: 'Bits/s',
      label: 'Bits/s'
    },
    {
      value: 'Packets/s',
      label: 'Packets/s'
    }
  ],
  tabs: [
    { analysis: {}, name: 'network.total', class: 'total', label: 'total', show: true, invertTab: true, positioning: 0, data: [], unitType: '' },
    { analysis: {}, name: 'linkMonitor.ingress', class: 'ingress', label: 'in', show: true, invertTab: true, positioning: 1, data: [], unitType: '' },
    { analysis: {}, name: 'linkMonitor.egress', class: 'egress', label: 'out', show: true, invertTab: true, positioning: 2, data: [], unitType: '' }
  ]
}

export const dataForNpmLine = {
  chartOptionLineData: [
    { legend: 'network.total', index: 0, invertTab: true, show: false, color: '#749F4D' },
    { legend: 'network.inbound', index: 1, invertTab: true, show: false, color: '#98709B' },
    { legend: 'network.outbound', index: 2, invertTab: true, show: false, color: '#E5A219' }
  ],
  npmLineColor: [
    { legend: '', color: '#749F4D' },
    { legend: '', color: '#98709B' },
    { legend: '', color: '#E5A219' }
  ]
}

export const dataForDnsTrafficLine = {
  options1: [
    {
      value: 'Bits/s',
      label: 'Bits/s'
    },
    {
      value: 'Queries/s',
      label: 'Queries/s'
    }
  ],
  options2: [
    {
      value: 'Average',
      label: 'Average'
    },
    {
      value: '95th Percentile',
      label: '95th Percentile'
    },
    {
      value: 'Maximum',
      label: 'Maximum'
    }
  ],
  tabs: [
    { analysis: {}, name: 'network.total', class: 'total', show: true, invertTab: true, positioning: 0, data: [], unitType: '' },
    { analysis: {}, name: 'network.inbound', class: 'inbound', show: true, invertTab: true, positioning: 1, data: [], unitType: '' },
    { analysis: {}, name: 'network.outbound', class: 'outbound', show: true, invertTab: true, positioning: 2, data: [], unitType: '' }
  ]
}

export const dataForNpmEventsHeader = {
  chartData: [
    {
      eventSeverity: 'critical',
      count: '-',
      index: 0
    },
    {
      eventSeverity: 'high',
      count: '-',
      index: 1
    },
    {
      eventSeverity: 'medium',
      count: '-',
      index: 2
    },
    {
      eventSeverity: 'low',
      count: '-',
      index: 3
    },
    {
      eventSeverity: 'info',
      count: '-',
      index: 4
    }
  ]
}

export const dataForNpmRecentEvents = {
  customTableTitles: [
    { label: 'network.severity', prop: 'eventSeverity' },
    { label: 'network.entity', prop: 'eventKey' },
    { label: 'detections.eventType', prop: 'eventType' }
  ],
  // 下钻后
  customTableTitles1: [
    { label: 'network.severity', prop: 'eventSeverity' },
    { label: 'detections.eventType', prop: 'eventType' },
    { label: 'detection.list.startTime', prop: 'startTime' }
  ]
}
export const dataForNpmNetworkQuantity = {
  npmNetworkName: [
    { name: 'networkAppPerformance.tcpConnectionEstablishLatency' },
    { name: 'networkAppPerformance.httpResponse' },
    { name: 'networkAppPerformance.sslResponseLatency' },
    { name: 'networkAppPerformance.packetLoss' },
    { name: 'overall.packetRetrans' }
  ]
}
export const columnList1 = [
  {
    name: 'ip',
    type: 'string',
    label: 'IP',
    doc: {
      constraints: {
        type: 'ip',
        operator_functions: '=,in'
      }
    }
  },
  {
    name: 'fqdn',
    type: 'string',
    label: 'Domain',
    doc: {
      constraints: {
        type: 'domain',
        operator_functions: '=,in'
      }
    }
  },
  {
    name: 'app_name',
    type: 'string',
    label: 'App',
    doc: {
      constraints: {
        operator_functions: '=,in'
      }
    }
  },
  {
    name: 'region',
    type: 'string',
    label: 'City',
    doc: {
      constraints: {
        operator_functions: '=,in'
      }
    }
  },
  {
    name: 'country',
    type: 'string',
    label: 'Country',
    doc: {
      constraints: {
        operator_functions: '=,in'
      }
    }
  },
  {
    name: 'asn',
    type: 'string',
    label: 'ASN',
    doc: {
      constraints: {
        operator_functions: '=,in'
      }
    }
  }
]
const securityEvent = [
  {
    name: 'event_type',
    type: 'string',
    label: 'event_type',
    doc: {
      constraints: {
        operator_functions: '=,in,like'
      }
    }
  },
  {
    name: 'event_name',
    type: 'string',
    label: 'event_name',
    doc: {
      constraints: {
        operator_functions: '=,in,like'
      }
    }
  },
  {
    name: 'severity',
    type: 'string',
    label: 'severity',
    doc: {
      constraints: {
        operator_functions: '=,in,like'
      }
    }
  },
  {
    name: 'offender_ip',
    type: 'string',
    label: 'offender Ip',
    doc: {
      constraints: {
        operator_functions: '=,in,like'
      }
    }
  },
  {
    name: 'victim_ip',
    type: 'string',
    label: 'victim Ip',
    doc: {
      constraints: {
        operator_functions: '=,in,like'
      }
    }
  },
  {
    name: 'domain',
    type: 'string',
    label: 'domain',
    doc: {
      constraints: {
        operator_functions: '=,in,like'
      }
    }
  },
  {
    name: 'app',
    type: 'string',
    label: 'app',
    doc: {
      constraints: {
        operator_functions: '=,in,like'
      }
    }
  }
]

const schema = localStorage.getItem(storageKey.schemaEntityExplore)
const schemaEntityExplore = schema ? JSON.parse(schema).entityMetadata.searchColumns : columnList1
export const columnList = schemaEntityExplore

let securityEventMetadata = securityEvent
if (schema) {
  if (JSON.parse(schema).securityEventMetadata) {
    securityEventMetadata = JSON.parse(schema).securityEventMetadata.searchColumns
  }
}
export const schemaDetectionSecurity = securityEventMetadata

export const operatorList = ['=', '!=', /* '>', '<', '>=', '<=', */'IN', 'NOT IN', 'LIKE', 'NOT LIKE']
export const connectionList = [
  {
    value: 'AND',
    label: 'AND'
  }
  // {
  //   value: 'OR',
  //   label: 'OR'
  // }
]

export const detectionUnitList = {
  statusList: [
    { status: 1 },
    { status: 0 }
  ],
  categoryList: [
    { value: 'security_event', label: 'Security Event' }/* ,
    { value: 'performance_event', label: 'Performance Event' } */
  ],
  eventTypeList: [
    { value: 'Initial Access', label: 'Initial Access' },
    { value: 'Command and Control', label: 'Command and Control' },
    { value: 'Credential Access', label: 'Credential Access' },
    { value: 'Lateral Movement', label: 'Lateral Movement' },
    { value: 'Collection', label: 'Collection' },
    { value: 'Impact', label: 'Impact' },
    { value: 'Anonymity', label: 'Anonymity' },
    { value: 'Regulatory Risk', label: 'Regulatory Risk' }
  ],
  sourceList: [
    { value: 'session_record', label: 'Session Record' }
  ],
  levelList: [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'info', label: 'Info' }
  ],
  metricList: [
    { value: 'tcp_lostlen_ratio', label: 'Bits/second' },
    { value: 's2c_byte_retrans_ratio', label: 'Packets/second' },
    { value: 's2c_byte_retrans_ratio1', label: 'Sessions/second' }
  ],
  conditionList: [
    { value: 'than', label: 'Greater Than' },
    { value: 'less', label: 'Greater Less' },
    { value: 'equal', label: 'Greater Equal' }
  ],
  libraryList: [
    { value: 'library name', knowledgeId: 7, label: 'Library name' },
    { value: 'library name1', knowledgeId: 8, label: 'Library name1' },
    { value: 'library name2', knowledgeId: 9, label: 'Library name2' }
  ],
  intervalList: [
    { value: 'hours', label: 'hours' },
    { value: 'minutes', label: 'minutes' },
    { value: 'seconds', label: 'seconds' }
  ],
  intervalListCN: [
    { value: 'hours', label: '小时' },
    { value: 'minutes', label: '分钟' },
    { value: 'seconds', label: '秒' }
  ]
}
