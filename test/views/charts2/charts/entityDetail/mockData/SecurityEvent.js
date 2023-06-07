const mockData = {
  // 空
  empty: {
    data: {
      status: 200,
      code: 200,
      data: {
        resultType: 'object',
        result: []
      }
    }
  },
  bytes: {
    // 边界
    boundary: {
      data: {
        status: 200,
        code: 200,
        data: {
          resultType: 'object',
          result: []
        },
        msg: 'OK'
      }
    }
  },
  // 正常数据
  common: {
    data: {
      status: 200,
      code: 200,
      data: {
        resultType: 'object',
        result: [
          {
            eventId: '1298414830886991872',
            securityType: 'command and control',
            domain: null,
            offenderIp: '213.186.33.5',
            victimIp: '116.178.217.92',
            offenderDomain: 'baidu.com',
            victimDomain: 'mi.com',
            eventSeverity: 'critical',
            malwareName: 'NetWire RC',
            cryptominingPool: null,
            startTime: 1683186600,
            durationMs: 300000,
            endTime: 1683186900
          },
          {
            eventId: '1298414830886991873',
            securityType: 'command and control',
            domain: null,
            offenderIp: '213.186.33.5',
            victimIp: '116.178.217.93',
            offenderDomain: 'baidu.com',
            victimDomain: 'mi.com',
            eventSeverity: 'low',
            malwareName: 'NetWire RC',
            cryptominingPool: null,
            startTime: 1683186600,
            durationMs: 300000,
            endTime: 1683186900
          },
          {
            eventId: '1298414830886991873',
            securityType: 'command and control',
            domain: null,
            offenderIp: '213.186.33.5',
            victimIp: '116.178.217.93',
            offenderDomain: 'baidu.com',
            victimDomain: 'mi.com',
            eventSeverity: 'low',
            malwareName: 'NetWire RC',
            cryptominingPool: null,
            startTime: 1683186600,
            durationMs: 300000,
            endTime: 1683186900
          }
        ]
      },
      msg: 'OK'
    }
  }
}

export default mockData
