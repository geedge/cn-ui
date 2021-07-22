import i18n from '@/i18n'
export const allTableTitle = {
  tableTitles10: [
    {
      label: i18n.global.t('overall.clientIp'),
      prop: 'clientIp'
    },
    {
      label: i18n.global.t('overall.sessions'),
      prop: 'sessions'
    },
    {
      label: i18n.global.t('overall.bytes'),
      prop: 'bytes'
    },
    {
      label: i18n.global.t('overall.packets'),
      prop: 'packets'
    }
  ],
  tableTitles13: [
    {
      label: i18n.global.t('overall.serverIp'),
      prop: 'serverIp'
    },
    {
      label: i18n.global.t('overall.sessions'),
      prop: 'sessions'
    },
    {
      label: i18n.global.t('overall.bytes'),
      prop: 'bytes'
    },
    {
      label: i18n.global.t('overall.packets'),
      prop: 'packets'
    }
  ],
  tableTitles14: [
    {
      label: i18n.global.t('overall.domain'),
      prop: 'domain'
    },
    {
      label: i18n.global.t('overall.sessions'),
      prop: 'sessions'
    },
    {
      label: i18n.global.t('overall.bytes'),
      prop: 'bytes'
    },
    {
      label: i18n.global.t('overall.packets'),
      prop: 'packets'
    }
  ],
  tableTitles15: [
    {
      label: i18n.global.t('overall.appName'),
      prop: 'appName'
    },
    {
      label: i18n.global.t('overall.sessions'),
      prop: 'sessions'
    },
    {
      label: i18n.global.t('overall.bytes'),
      prop: 'bytes'
    },
    {
      label: i18n.global.t('overall.packets'),
      prop: 'packets'
    }
  ]
}
export const legendMapping = {
  bytes_received_rate: i18n.global.t('trafficSummary.throughputPerSecondC2s'),
  bytes_sent_rate: i18n.global.t('trafficSummary.throughputPerSecondS2c'),
  bytes_rate: i18n.global.t('trafficSummary.throughputPerSecond'),
  session_rate: i18n.global.t('trafficSummary.sessionsPerSecond'),
  packets_rate: i18n.global.t('trafficSummary.packetsPerSecond'),
  packets_received_rate: i18n.global.t('trafficSummary.packetsPerSecondC2s'),
  packets_sent_rate: i18n.global.t('trafficSummary.packetsPerSecondS2c')
}
