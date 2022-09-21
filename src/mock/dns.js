import Mock from 'mockjs'

const openMock = true
if (openMock) {
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/dnsInsight/recentEvents.*'), 'get', function (requestObj) {
    const data = []
    for (let i = 0; i < 8; i++) {
      data.push({ type: 'performance', event: '22.33.44.55 dns error', severity: 'critical' })
    }
    data[3].severity = 'high'
    data[4].severity = 'medium'
    data[5].severity = 'low'
    data[6].severity = 'info'
    data[7].severity = 'info'
    return {
      msg: 'success',
      code: 200,
      data: {
        result: data
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/dnsInsight/activeMaliciousDomain.*'), 'get', function (requestObj) {
    const data = []
    for (let i = 0; i < 8; i++) {
      data.push({ domain: `baidu${i}.com`, ips: '192.168.2.3', queries: 14 - i, firstSeenTime: 1663208997, lastSeenTime: 1663228997 })
    }
    data[0].ips += ',192.168.2.4,192.168.2.5,192.168.2.6,192.168.2.7,192.168.2.8,192.168.2.10,192.168.2.9'
    data[2].ips += ',192.168.2.4'
    data[4].ips += ',192.168.2.4,192.168.2.5,192.168.2.6,192.168.2.7,192.168.2.8,192.168.2.10,192.168.2.9'
    return {
      msg: 'success',
      code: 200,
      data: {
        result: data
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/dnsInsight/eventChart.*'), 'get', function (requestObj) {
    const data = []
    for (let i = 0; i < 2; i++) {
      data.push({
        type: '',
        analysis: {
          sum: 0
        },
        values: []
      })
    }
    data[0].type = 'performanceEvent'
    data[1].type = 'securityEvent'

    let num = 1435781430781
    for (let i = 0; i < 16; i++) {
      num += 5 * 60 * 1000
      data[0].values.push([
        num, Math.floor(Math.random() * 50) + 10
      ])
      data[1].values.push([
        num, Math.floor(Math.random() * 10) + 2
      ])
    }

    data[0].analysis.sum = Math.floor(Math.random() * 800) + 160
    data[1].analysis.sum = Math.floor(Math.random() * 160) + 32

    return {
      msg: 'success',
      code: 200,
      data: {
        result: data
      }
    }
  })
}
