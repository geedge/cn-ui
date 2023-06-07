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
          result: [
            {
              eventId: '1308078720390412288',
              entityType: 'ip',
              serverIp: '116.178.78.180',
              domain: null,
              appName: null,
              eventSeverity: 'critical',
              eventType: 'Http error',
              startTime: 1686100507,
              durationMs: 900,
              endTime: 1686104107
            },
            {
              eventId: '1308078720390412289',
              entityType: 'ip',
              serverIp: '116.178.78.180',
              domain: null,
              appName: null,
              eventSeverity: 'info',
              eventType: 'Http error',
              startTime: 1686100507,
              durationMs: 9000000000000,
              endTime: 1686104107
            }
          ]
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
            eventId: '1308078720390412288',
            entityType: 'ip',
            serverIp: '116.178.78.180',
            domain: null,
            appName: null,
            eventSeverity: 'critical',
            eventType: 'Http error',
            startTime: 1686100507,
            durationMs: 900000,
            endTime: 1686104107
          },
          {
            eventId: '1308078720390412289',
            entityType: 'ip',
            serverIp: '116.178.78.180',
            domain: null,
            appName: null,
            eventSeverity: 'info',
            eventType: 'Http error',
            startTime: 1686100507,
            durationMs: 900000,
            endTime: 1686104107
          }
        ]
      },
      msg: 'OK'
    }
  }
}

export default mockData
