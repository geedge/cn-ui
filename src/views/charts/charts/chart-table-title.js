import i18n from '@/i18n'
export const tableTitleMapping = {
  clientIp: {
    label: i18n.global.t('overall.clientIp'),
    prop: 'clientIp'
  },
  serverIp: {
    label: i18n.global.t('overall.serverIp'),
    prop: 'serverIp'
  },
  ip: {
    label: 'IP',
    prop: 'ip'
  },
  appId: {
    label: 'APP',
    prop: 'appId'
  },
  app: {
    label: 'APP',
    prop: 'app'
  },
  appName: {
    label: 'APP',
    prop: 'appName'
  },
  sessions: {
    label: i18n.global.t('overall.sessions'),
    prop: 'sessions'
  },
  bytes: {
    label: i18n.global.t('overall.bytes'),
    prop: 'bytes'
  },
  packets: {
    label: i18n.global.t('overall.packets'),
    prop: 'packets'
  },
  domain: {
    label: i18n.global.t('overall.domain'),
    prop: 'domain'
  }
}
export const legendMapping = {
  bytes_received_rate: i18n.global.t('trafficSummary.throughputPerSecondC2s'),
  bytesReceivedRate: i18n.global.t('trafficSummary.throughputPerSecondC2s'),
  bytes_sent_rate: i18n.global.t('trafficSummary.throughputPerSecondS2c'),
  bytesSentRate: i18n.global.t('trafficSummary.throughputPerSecondS2c'),
  bytes_rate: i18n.global.t('trafficSummary.throughputPerSecond'),
  bytesRate: i18n.global.t('trafficSummary.throughputPerSecond'),
  ip_bytes_received_rate: i18n.global.t('trafficSummary.receivedPerSecond'),
  ip_bytes_sent_rate: i18n.global.t('trafficSummary.sentPerSecond'),
  ip_bytes_rate: i18n.global.t('trafficSummary.throughputPerSecond'),
  session_rate: i18n.global.t('trafficSummary.sessionsPerSecond'),
  sessionRate: i18n.global.t('trafficSummary.sessionsPerSecond'),
  packets_rate: i18n.global.t('trafficSummary.packetsPerSecond'),
  packetsRate: i18n.global.t('trafficSummary.packetsPerSecond'),
  packets_received_rate: i18n.global.t('trafficSummary.packetsPerSecondC2s'),
  packetsReceivedRate: i18n.global.t('trafficSummary.packetsPerSecondC2s'),
  packets_sent_rate: i18n.global.t('trafficSummary.packetsPerSecondS2c'),
  packetsSentRate: i18n.global.t('trafficSummary.packetsPerSecondS2c'),
  ip_packets_rate: i18n.global.t('trafficSummary.packetsPerSecond'),
  ip_packets_received_rate: i18n.global.t('trafficSummary.packetsPerSecondC2s'),
  ip_packets_sent_rate: i18n.global.t('trafficSummary.packetsPerSecondS2c'),
  dnsLatency: i18n.global.t('dns.latency'),
  queryRate: i18n.global.t('dns.query.rate'),
  formatErrorRate: i18n.global.t('dns.formatErrorRate'),
  serverFailureRate: i18n.global.t('dns.serverFailureRate'),
  nonExistentDomainRate: i18n.global.t('dns.nonExistentDomainRate'),
  notImplementedRate: i18n.global.t('dns.notImplementedRate'),
  queryRefusedRate: i18n.global.t('dns.queryRefusedRate'),
  sequenceGapLossPercent: i18n.global.t('entity.ip.sequenceGapLossPercent'),
  establishLatency: i18n.global.t('entity.ip.establishLatency'),
  httpResponseLatency: i18n.global.t('entity.ip.httpResponseLatency'),
  sslConLatency: i18n.global.t('entity.ip.sslConLatency'),
  pktRetransPercent: i18n.global.t('entity.ip.pktRetransPercent'),
  time: i18n.global.t('entity.ip.time'),
  clientIpCount: i18n.global.t('entity.ip.clientIpCount'),
  serverIpCount: i18n.global.t('entity.ip.serverIpCount'),
  appCount: i18n.global.t('entity.ip.appCount'),
  domainCount: i18n.global.t('entity.ip.domainCount'),
  network_total: i18n.global.t('network.total'),
  network_inbound: i18n.global.t('network.inbound'),
  network_outbound: i18n.global.t('network.outbound'),
  network_internal: i18n.global.t('network.internal'),
  network_other: i18n.global.t('network.other')
}
