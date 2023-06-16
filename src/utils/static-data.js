/**
 * @name: 静态数据模板
 * @description: 用于存放引用到的静态数据，如表格列名称、echarts的legend名称等
 * 如有使用 this 的，js文件里不识别 this，需要引入对应方法，如this.$t引入i18n，this.$route 引入route
 * @author: newhome
 * @date: 2023-03-16 17:26:49
 */
// 如有使用this的
import i18n from '@/i18n'
import { unitTypes } from '@/utils/constants'
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
    { value: 'Bits/s', label: 'Bits/s' },
    { value: 'Packets/s', label: 'Packets/s' },
    { value: 'Sessions/s', label: 'Sessions/s' },
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
    { analysis: {}, name: 'network.total', class: 'total', show: true, invertTab: true, positioning: 0, data: [], unitType: '' },
    { analysis: {}, name: 'linkMonitor.ingress', class: 'ingress', show: true, invertTab: true, positioning: 1, data: [], unitType: '' },
    { analysis: {}, name: 'linkMonitor.egress', class: 'egress', show: true, invertTab: true, positioning: 2, data: [], unitType: '' }
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
export const columnList = [
  {
    name: 'entity_type',
    type: 'string',
    label: 'Entity type'
  },
  {
    name: 'ip_addr',
    type: 'string',
    label: 'IP.Address'
  },
  {
    name: 'ip_location_country',
    type: 'string',
    label: 'IP.Country'
  },
  {
    name: 'ip_location_province',
    type: 'string',
    label: 'IP.Province'
  },
  {
    name: 'ip_location_city',
    type: 'string',
    label: 'IP.City'
  },
  {
    name: 'ip_asn',
    type: 'string',
    label: 'IP.ASN'
  },
  {
    name: 'dns_server_role',
    type: 'string',
    label: 'IP.DNS server role'
  },
  {
    name: 'dns_server_org',
    type: 'string',
    label: 'IP.DNS server organization'
  },
  {
    name: 'dns_server_os',
    type: 'string',
    label: 'IP.Operating system'
  },
  {
    name: 'dns_server_software',
    type: 'string',
    label: 'IP.DNS server software'
  },
  {
    name: 'domain_name',
    type: 'string',
    label: 'Domain.Name'
  },
  {
    name: 'domain_category',
    type: 'string',
    label: 'Domain.Category'
  },
  {
    name: 'domain_category_group',
    type: 'string',
    label: 'Domain.Category group'
  },
  {
    name: 'domain_reputation_level',
    type: 'string',
    label: 'Domain.Reputation'
  },
  {
    name: 'domain_whois_email',
    type: 'string',
    label: 'Domain.Whois email'
  },
  {
    name: 'domain_whois_name_servers',
    type: 'string',
    label: 'Domain.Whois nameserver'
  },
  {
    name: 'domain_whois_registrar',
    type: 'string',
    label: 'Domain.Whois registrar'
  },
  {
    name: 'domain_whois_org',
    type: 'string',
    label: 'Domain.Whois organization'
  },
  {
    name: 'domain_whois_address',
    type: 'string',
    label: 'Domain.Whois address'
  },
  {
    name: 'domain_whois_city',
    type: 'string',
    label: 'Domain.Whois city'
  },
  {
    name: 'domain_whois_state',
    type: 'string',
    label: 'Domain.Whois state'
  },
  {
    name: 'domain_whois_country',
    type: 'string',
    label: 'Domain.Whois country'
  },
  {
    name: 'domain_icp_owner',
    type: 'string',
    label: 'Domain.ICP owner'
  },
  {
    name: 'domain_icp_company_name',
    type: 'string',
    label: 'Domain.ICP company'
  },
  {
    name: 'domain_icp_company_type',
    type: 'string',
    label: 'Domain.ICP company type'
  },
  {
    name: 'domain_icp_site_license',
    type: 'string',
    label: 'Domain.ICP site license'
  },
  {
    name: 'domain_icp_site_name',
    type: 'string',
    label: 'Domain.ICP site'
  },
  {
    name: 'app_name',
    type: 'string',
    label: 'APP.Name'
  },
  {
    name: 'app_id',
    type: 'string',
    label: 'APP.ID'
  },
  {
    name: 'app_category',
    type: 'string',
    label: 'APP.Category'
  },
  {
    name: 'app_subcategory',
    type: 'string',
    label: 'APP.Subcategory'
  },
  {
    name: 'app_risk',
    type: 'string',
    label: 'APP.Risk'
  },
  {
    name: 'app_description',
    type: 'string',
    label: 'APP.Description'
  },
  {
    name: 'app_longname',
    type: 'string',
    label: 'APP.Long name'
  },
  {
    name: 'app_technology',
    type: 'string',
    label: 'APP.Technology'
  }
]
export const operatorList = ['=', '!=', /* '>', '<', '>=', '<=', */'IN', 'NOT IN', 'LIKE', 'NOT LIKE']
export const connectionList = [
  {
    value: 'AND',
    label: 'AND'
  },
  {
    value: 'OR',
    label: 'OR'
  }
]
