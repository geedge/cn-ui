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
      name: _this.$t('network.total'),
      show: true,
      positioning: 0,
      data: [],
      unitType: 'number'
    },
    {
      name: _this.$t('network.inbound'),
      show: true,
      positioning: 1,
      data: [],
      unitType: 'number'
    },
    {
      name: _this.$t('network.outbound'),
      show: true,
      positioning: 2,
      data: [],
      unitType: 'number'
    },
    {
      name: _this.$t('network.internal'),
      show: true,
      positioning: 3,
      data: [],
      unitType: 'number'
    },
    {
      name: _this.$t('network.through'),
      show: true,
      positioning: 4,
      data: [],
      unitType: 'number'
    },
    {
      name: _this.$t('network.other'),
      show: true,
      positioning: 5,
      data: [],
      unitType: 'number'
    }
  ],
  npmQuantity: [
    { name: _this.$t('networkAppPerformance.tcpConnectionEstablishLatency'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 0 },
    { name: _this.$t('networkAppPerformance.httpResponse'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 1 },
    { name: _this.$t('networkAppPerformance.sslResponseLatency'), show: true, positioning: 0, data: [], unitType: unitTypes.time, index: 2 },
    { name: _this.$t('networkAppPerformance.packetLoss'), show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 3 },
    { name: _this.$t('overall.packetRetrans'), show: true, positioning: 0, data: [], unitType: unitTypes.percent, index: 4 }
  ],
  metricOptions: [
    /* { value: 'Bits/s', label: 'Bits/s' },
    { value: 'Packets/s', label: 'Packets/s' },
    { value: 'Sessions/s', label: 'Sessions/s' }, */
    { value: 'establishLatencyMs', label: _this.$t('networkAppPerformance.tcpConnectionEstablishLatency') },
    { value: 'httpResponseLatency', label: _this.$t('networkAppPerformance.httpResponse') },
    { value: 'sslConLatency', label: _this.$t('networkAppPerformance.sslResponseLatency') },
    { value: 'tcpLostlenPercent', label: _this.$t('networkAppPerformance.packetLoss') },
    { value: 'pktRetransPercent', label: _this.$t('overall.packetRetrans') }
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
    { legend: _this.$t('network.total'), index: 0, invertTab: true, show: false, color: '#749F4D' },
    { legend: _this.$t('network.inbound'), index: 1, invertTab: true, show: false, color: '#98709B' },
    { legend: _this.$t('network.outbound'), index: 2, invertTab: true, show: false, color: '#E5A219' }
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

let schemaEntityExplore = localStorage.getItem(storageKey.schemaEntityExplore)
schemaEntityExplore = schemaEntityExplore ? JSON.parse(schemaEntityExplore).entityMetadata.searchColumns : columnList1
export const columnList = schemaEntityExplore

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
