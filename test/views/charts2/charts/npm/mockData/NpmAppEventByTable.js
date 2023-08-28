export const mockData = {
  common: {
    data: {
      status: 200,
      data: { code: 200, queryKey: '88eeb92e0ddb40c0327db494cfe5c74c', success: true, message: null, statistics: { elapsed: 0, rows_read: 2, result_size: 752, result_rows: 10 }, job: null, formatType: 'json', meta: [{ name: 'app_name', type: 'string', category: 'Dimension' }, { name: 'event_severity', type: 'string', category: 'Dimension' }, { name: 'event_type', type: 'string', category: 'Dimension' }, { name: 'count', type: 'long', category: 'Metric' }], data: { resultType: 'table', result: [{ appName: 'youku', eventSeverity: 'info', eventType: 'http error', count: 6 }, { appName: 'uplive', eventSeverity: 'critical', eventType: 'http error', count: 5 }, { appName: 'youku', eventSeverity: 'low', eventType: 'http error', count: 4 }, { appName: 'apple_hls', eventSeverity: 'info', eventType: 'http error', count: 3 }, { appName: 'apple_hls', eventSeverity: 'low', eventType: 'http error', count: 3 }, { appName: 'apple_hls', eventSeverity: 'medium', eventType: 'http error', count: 2 }, { appName: 'uplive', eventSeverity: 'high', eventType: 'http error', count: 2 }, { appName: 'windows_update', eventSeverity: 'medium', eventType: 'http error', count: 2 }, { appName: 'apple_hls', eventSeverity: 'critical', eventType: 'http error', count: 1 }, { appName: 'cloudflare', eventSeverity: 'info', eventType: 'http error', count: 1 }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20app_name%20AS%20app_name%2C%20event_severity%20AS%20event_severity%2C%20event_type%20AS%20event_type%2C%20COUNT%28*%29%20AS%20count%20FROM%20performance_event%20WHERE%20start_time%20%3E%3D%201675580110%20AND%20end_time%20%3C%201675752910%20AND%20entity_type%20%3D%20%27app%27%20GROUP%20BY%20app_name%2Cevent_severity%2Cevent_type%20ORDER%20BY%20count%20DESC%20%20LIMIT%2010%20&format=json&option=real-time', msg: 'OK' }
    }
  },
  empty: {
    data: {
      data: {
        status: 200,
        code: 200,
        data: {
          resultType: 'table',
          result: []
        },
        msg: 'OK'
      }
    }
  }
}
