export const mockData = {
  common: {
    data1: {
      data: { status: 200, code: 200, queryKey: '68d8aa5867b08b926b5bd38c36add9e5', success: true, message: null, statistics: { elapsed: 0, rows_read: 2, result_size: 550, result_rows: 5 }, job: null, formatType: 'json', meta: [{ name: 'event_id', type: 'long', category: 'Metric' }, { name: 'event_severity', type: 'string', category: 'Metric' }, { name: 'event_key', type: 'string', category: 'Metric' }, { name: 'event_type', type: 'string', category: 'Metric' }], data: { resultType: 'table', result: [{ eventId: 1173511643475208200, eventSeverity: 'critical', eventKey: '114.114.114.114 dns error', eventType: 'dns error' }, { eventId: 1173504415263352800, eventSeverity: 'high', eventKey: '116.178.78.241 http error', eventType: 'http error' }, { eventId: 1173492761289025500, eventSeverity: 'medium', eventKey: '223.6.6.6 dns error', eventType: 'dns error' }, { eventId: 1173489002890651600, eventSeverity: 'low', eventKey: '114.114.114.114 dns error', eventType: 'dns error' }, { eventId: 1173482380537620500, eventSeverity: 'info', eventKey: '1.1.1.2 dns error', eventType: 'http error' }, { eventId: 1173482380537620500, eventSeverity: 'critical', eventKey: '1.1.1.2 dns error', eventType: 'dns error' }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20event_id%20AS%20event_id%2Cevent_severity%20AS%20event_severity%2C%20event_key%20AS%20event_key%2C%20event_type%20AS%20event_type%20FROM%20performance_event%20WHERE%20start_time%20%3E%3D%201675227528%20AND%20end_time%20%3C%201675231128%20ORDER%20BY%20start_time%20DESC%20%20LIMIT%208%20&format=json&option=real-time', msg: 'OK' }
    },
    data2: {
      data: { status: 200, code: 200, queryKey: 'fc0bd92bf3b48a37310d5c004d8b7a7b', success: true, message: null, statistics: { elapsed: 0, rows_read: 2, result_size: 689, result_rows: 7 }, job: null, formatType: 'json', meta: [{ name: 'event_id', type: 'long', category: 'Metric' }, { name: 'event_severity', type: 'string', category: 'Metric' }, { name: 'event_type', type: 'string', category: 'Metric' }, { name: 'start_time', type: 'long', category: 'Metric' }], data: { resultType: 'table', result: [{ eventId: 1132790825086844900, eventSeverity: 'critical', eventType: 'http error', startTime: 1672802700 }, { eventId: 1132132403379142700, eventSeverity: 'high', eventType: 'dns error', startTime: 1672763400 }, { eventId: 1131441760155689000, eventSeverity: 'low', eventType: 'dns error', startTime: 1672722300 }, { eventId: 1131411523384598500, eventSeverity: 'medium', eventType: 'http error', startTime: 1672720500 }, { eventId: 1131390214323789800, eventSeverity: 'info', eventType: 'dns error', startTime: 1672719300 }, { eventId: 1131306200132968400, eventSeverity: 'critical', eventType: 'http error', startTime: 1672714200 }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20event_id%20AS%20event_id%2Cevent_severity%20AS%20event_severity%2C%20event_type%20AS%20event_type%2C%20start_time%20AS%20start_time%20FROM%20performance_event%20WHERE%20start_time%20%3E%3D%201672675200%20AND%20start_time%20%3C%201677513600%20AND%20server_ip%20%3D%20%27116.178.236.216%27%20ORDER%20BY%20start_time%20DESC&format=json&option=real-time', msg: 'OK' }
    },
    query: {
      curTab: 'country',
      dimensionType: 'ip',
      fourthMenu: '116.178.214.84',
      fourthPanel: '8',
      networkOverviewBeforeTab: 'ip',
      panelName: '116.178.214.84',
      queryCondition: "common_client_ip='116.178.214.84' OR common_server_ip='116.178.214.84'",
      t: '1675236779453',
      tabIndex: '1',
      tabOperationBeforeType: '',
      tabOperationType: '4',
      thirdMenu: 'network.ips',
      thirdPanel: '12'
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
  },
  boundary: {
    data: {
      data: {
        status: 200,
        code: 200,
        data: {
          resultType: 'table',
          result: [
            {
              eventSeverity: 'critical',
              count: 0
            }, {
              eventSeverity: 'high',
              count: 0
            }, {
              eventSeverity: 'info',
              count: 1222225432456789
            }, {
              eventSeverity: 'low',
              count: 14456678
            }, {
              eventSeverity: 'medium',
              count: 0
            }]
        }
      }
    }
  }
}
