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
  bytes_sent_rate: i18n.global.t('trafficSummary.throughputPerSecondS2c'),
  bytes_rate: i18n.global.t('trafficSummary.throughputPerSecond'),
  ip_bytes_received_rate: i18n.global.t('trafficSummary.receivedPerSecond'),
  ip_bytes_sent_rate: i18n.global.t('trafficSummary.sentPerSecond'),
  ip_bytes_rate: i18n.global.t('trafficSummary.throughputPerSecond'),
  session_rate: i18n.global.t('trafficSummary.sessionsPerSecond'),
  packets_rate: i18n.global.t('trafficSummary.packetsPerSecond'),
  packets_received_rate: i18n.global.t('trafficSummary.packetsPerSecondC2s'),
  packets_sent_rate: i18n.global.t('trafficSummary.packetsPerSecondS2c'),
  ip_packets_rate: i18n.global.t('trafficSummary.packetsPerSecond'),
  ip_packets_received_rate: i18n.global.t('trafficSummary.packetsPerSecondC2s'),
  ip_packets_sent_rate: i18n.global.t('trafficSummary.packetsPerSecondS2c')
}
