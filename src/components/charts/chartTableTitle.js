import i18n from '@/i18n'
export const allTableTitle = {
  tableTitles10: [
    {
      label: i18n.global.t('common.clientIp'),
      prop: 'clientIp'
    },
    {
      label: i18n.global.t('common.sessions'),
      prop: 'sessions'
    },
    {
      label: i18n.global.t('common.bytes'),
      prop: 'bytes'
    },
    {
      label: i18n.global.t('common.packets'),
      prop: 'packets'
    }
  ],
  tableTitles13: [
    {
      label: i18n.global.t('common.serverIp'),
      prop: 'serverIp'
    },
    {
      label: i18n.global.t('common.sessions'),
      prop: 'sessions'
    },
    {
      label: i18n.global.t('common.bytes'),
      prop: 'bytes'
    },
    {
      label: i18n.global.t('common.packets'),
      prop: 'packets'
    }
  ],
  tableTitles14: [
    {
      label: i18n.global.t('common.domain'),
      prop: 'domain'
    },
    {
      label: i18n.global.t('common.sessions'),
      prop: 'sessions'
    },
    {
      label: i18n.global.t('common.bytes'),
      prop: 'bytes'
    },
    {
      label: i18n.global.t('common.packets'),
      prop: 'packets'
    }
  ],
  tableTitles15: [
    {
      label: i18n.global.t('common.appName'),
      prop: 'appName'
    },
    {
      label: i18n.global.t('common.sessions'),
      prop: 'sessions'
    },
    {
      label: i18n.global.t('common.bytes'),
      prop: 'bytes'
    },
    {
      label: i18n.global.t('common.packets'),
      prop: 'packets'
    }
  ]
}
export const legendMapping = {
  bytes_received_rate: 'Bytes Received Rate',
  bytes_sent_rate: 'Bytes Sent Rate',
  bytes_rate: 'Bytes Rate',
  session_rate: 'Session Rate'
}
