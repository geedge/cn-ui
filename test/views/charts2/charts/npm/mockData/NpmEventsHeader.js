export const mockData = {
  common: {
    data: {
      status: 200,
      data: { code: 200, queryKey: '6480498979f7501d822572ebeb9e9665', success: true, message: null, statistics: { elapsed: 0, rows_read: 3, result_size: 167, result_rows: 5 }, job: null, formatType: 'json', meta: [{ name: 'event_severity', type: 'string', category: 'Dimension' }, { name: 'count', type: 'long', category: 'Metric' }], data: { resultType: 'table', result: [{ eventSeverity: 'critical', count: 322334 }, { eventSeverity: 'high', count: 1111 }, { eventSeverity: 'info', count: 122222 }, { eventSeverity: 'low', count: 14456678 }, { eventSeverity: 'medium', count: 2000000 }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20event_severity%20AS%20event_severity%2C%20COUNT%28*%29%20AS%20count%20FROM%20performance_event%20WHERE%20start_time%20%3E%3D%201675026686%20AND%20end_time%20%3C%201675048286%20GROUP%20BY%20event_severity&format=json&option=real-time', msg: 'OK' }
    }
  },
  empty: {
    data: {
      status: 200,
      data: {
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
      status: 200,
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
