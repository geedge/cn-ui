export const mockData = {
  common: {
    status: 200,
    data: { status: 200, code: 200, queryKey: 'dec6723e173e8fa2b00917dc597bfb27', success: true, message: null, statistics: { elapsed: 0, rows_read: 2, result_size: 58, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'attack_event_count', type: 'long', category: 'Metric' }, { name: 'attacker_count', type: 'long', category: 'Metric' }, { name: 'victim_count', type: 'long', category: 'Metric' }], data: { resultType: 'object', result: [{ attackEventCount: 1200000, attackerCount: 2687878, victimCount: 36676767 }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20COUNT%28*%29%20AS%20attack_event_count%2C%20COUNT%28DISTINCT%28offender_ip%29%29%20AS%20attacker_count%2C%20COUNT%28DISTINCT%28victim_ip%29%29%20AS%20victim_count%20FROM%20security_event%20WHERE%20start_time%20%3E%3D%201675043912%20AND%20start_time%20%3C%201675047512%20AND%20security_type%20%3D%20%27ddos%27&format=json&option=real-time', msg: 'OK' }
  },
  empty: {
    status: 200,
    data: {
      status: 200,
      code: 200,
      data: {
        resultType: 'table',
        result: []
      },
      msg: 'OK'
    }
  },
  boundary: {
    status: 200,
    data: {
      status: 200,
      code: 200,
      data: {
        resultType: 'object',
        result: [
          {
            attackEventCount: 120000077777,
            attackerCount: 0,
            victimCount: 3667676700000
          }
        ]
      }
    }
  }
}
