import Mock from 'mockjs'

const urlAndVersion = BASE_CONFIG.baseUrl + BASE_CONFIG.apiVersion
const openMock = true
if (openMock) {
  Mock.mock(new RegExp(urlAndVersion + '/rule/detection/list.*'), 'get', function (requestObj) {
    const list = []
    for (let i = 0; i < 20; i++) {
      const obj = {
        ruleId: 163 + i,
        ruleType: 'indicator_match',
        status: 1,
        name: 'name123',
        category: 'Security Event',
        eventType: 'C&C',
        description: 'Built-in darkweb IoC',
        ruleConfig: {
          knowledge: {
            name: 'VPN Server IP',
            category: 'user_defined'
          }
        }
      }
      if (i % 2 === 0) {
        obj.ruleType = 'threshold'
        obj.ruleConfig = {
          dimensions: 'Destination IP/CIDR'
        }
        obj.description = 'abuse.ch is providing community driven threat intelligence on \n' +
          'cyber threats. It is the home of a couple of projects that are \n' +
          'helping internet service providers and network operators protect …'
      } else {
        obj.status = 0
      }
      list.push(obj)
    }
    const data = {
      total: list.length,
      pageSize: 20,
      pageNo: 1,
      list: list
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/statistics.*'), 'get', function (requestObj) {
    const data = {
      statusList: [
        { status: 1, count: 34 },
        { status: 0, count: 28 }
      ],
      categoryList: [
        { name: 'Security Event', count: 32 },
        { name: 'Performance Event', count: 28 }
      ],
      eventTypeList: [
        { name: 'DDos', count: 15 },
        { name: 'Lateral movement', count: 17 },
        { name: 'Brute force', count: 12 }
      ]
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/topKeys.*'), 'get', function (requestObj) {
    const list = [
      { keyId: '10000001', keys: '192.168.40.54', last: 1690266188, metric: 181440000000 },
      { keyId: '10000002', keys: '192.168.40.55', last: 1690266188, metric: 161440000000 },
      { keyId: '10000003', keys: '192.168.40.56', last: 1690266188, metric: 181440000000 },
      { keyId: '10000004', keys: '192.168.40.57', last: 1690266188, metric: 171440000000 },
      { keyId: '10000005', keys: '192.168.40.58', last: 1690266188, metric: 171440000000 },
      { keyId: '10000006', keys: '192.168.40.59', last: 1690266188, metric: 187440000000 },
      { keyId: '10000007', keys: '192.168.40.60', last: 1690266188, metric: 181440000000 }
    ]
    const data = {
      list: list,
      total: list.length
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/rule/detection.*'), 'get', function (requestObj) {
    const ruleId = getLastValue(requestObj.url)
    const data = {
      name: 'name123',
      category: 'security_event',
      ruleType: 'indicator_match',
      eventType: 'C&C',
      description: 'Built-in darkweb IoC',
      status: 1,
      ruleConfig: {
        dataSource: 'VPN Server IP',
        knowledgeBase: {
          knowledgeId: 10,
          name: 'cn_ioc_darkweb',
          category: 'websketch',
          source: 'cn_ioc_darkweb'
        },
        level: 'critical'
      },
      ruleConfigObj: {
        dataSource: 'VPN Server IP',
        knowledgeBase: {
          knowledgeId: '101',
          name: 'cn_ioc_darkweb',
          category: 'websketch',
          source: 'cn_ioc_darkweb'
        },
        level: 'critical'
      },
      ruleTrigger: {
        atLeast: 1,
        interval: 'PT5M',
        resetInterval: 'PT10M'
      },
      ruleTriggerObj: {
        atLeast: 1,
        interval: 'PT5M',
        resetInterval: 'PT10M'
      }
    }
    data.ruleConfig = JSON.stringify(data.ruleConfig)
    data.trigger = JSON.stringify(data.trigger)

    if (ruleId % 2 === 0) {
      data.ruleType = 'threshold'
      data.status = 0
    } else {
      data.status = 1
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/event/keyFields/statistics.*'), 'get', function (requestObj) {
    const data = {
      resultType: 'table',
      result: [
        { key: '192.168.1.1, test.com', count: 25 },
        { key: 'baidu.com,app', count: 23 },
        { key: '192.168.2.33, app', count: 15 },
        { key: '192.168.8.8, test.com', count: 12 },
        { key: 'baidu.com, test.com', count: 8 },
        { key: '192.168.1.101, test.cn', count: 5 },
        { key: 'jd.com, app', count: 25 }
      ]
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/event/list.*'), 'get', function (requestObj) {
    const data = {
      resultType: 'table',
      result: [
        {
          eventId: 1212,
          eventType: 'Anonymity',
          eventName: 'Tor',
          matchIds: '1, 2',
          keyFields: 'ip, domain',
          keyValues: '192.168.1.1, test.com',
          ruleId: 2,
          ruleVersion: '1',
          ruleType: 'indicator_match',
          isBuiltin: 1,
          status: 1,
          startTime: 1697092617,
          endTime: 1697092777,
          durationS: 30
        },
        {
          eventId: 1213,
          eventType: 'Anonymity',
          eventName: 'Tor',
          matchIds: '3, 4',
          keyFields: 'ip, domain',
          keyValues: '192.168.1.1, test.com',
          ruleId: 3,
          ruleVersion: '1',
          ruleType: 'threshold',
          isBuiltin: 1,
          status: 1,
          startTime: 1697092617,
          endTime: 1697092777,
          durationS: 30
        },
        {
          eventId: 1214,
          eventType: 'Anonymity',
          eventName: 'Tor',
          matchIds: '5, 6',
          keyFields: 'ip, domain',
          keyValues: '192.168.1.1, test.com',
          ruleId: 3,
          ruleVersion: '1',
          ruleType: 'sequence/unordered_sequence',
          isBuiltin: 1,
          status: 0,
          startTime: 1697092617,
          endTime: 1697092777,
          durationS: 30
        }
      ]
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/event/name/statistics.*'), 'get', function (requestObj) {
    const data = {
      resultType: 'table',
      result: [
        {
          eventName: 'event1',
          count: 25
        },
        {
          eventName: 'event2',
          count: 23
        },
        {
          eventName: 'event3',
          count: 15
        },
        {
          eventName: 'event4',
          count: 12
        }
      ]
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/event/count.*'), 'get', function (requestObj) {
    const data = {
      resultType: 'single',
      result: 3
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/event/timedistribution.*'), 'get', function (requestObj) {
    const data = {
      resultType: 'table',
      result: [
        {
          statTime: 1722565322,
          severity: 'critical',
          count: 25
        },
        {
          statTime: 1722565502,
          severity: 'info',
          count: 25
        },
        {
          statTime: 1722566702,
          severity: 'critical',
          count: 25
        },
        {
          statTime: 1722568322,
          severity: 'critical',
          count: 25
        }
      ]
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/event/detail.*'), 'get', function (requestObj) {
    const data = {
      eventIds: [1, 2, 3, 4, 5],
      indicatorMatchs: [],
      thresholdMatchs: [
        {
          matchId: 2,
          ruleId: 2,
          ruleType: 'threshold',
          eventType: 'Command and Control',
          eventName: 'event2',
          severity: 'high',
          keyFields: 'domain',
          keyValues: 'test.com',
          thresholdNum: 3,
          recordsNum: 5,
          reset: 60,
          startTime: 169780543432,
          endTime: 169790486213
        }
      ],
      sequenceMatchs: [
        {
          matchId: 3,
          ruleId: 3,
          ruleType: 'sequence/unordered_sequence',
          eventType: 'Command and Control',
          eventName: 'event3',
          severity: 'low',
          eventInfo: '[{"stage_id":"A","recv_time":10000000,"client_ip":"192.168.1.1"},{"stage_id":"B","recv_time":10000001,"client_ip":"192.168.1.2",...}]'
        }
      ]
    }
    const indicatorMatchObj = {
      matchId: 1,
      ruleId: 1,
      ruleType: 'indicator_match',
      eventType: 'Anonymity',
      eventName: 'event1',
      severity: 'critical',
      matchNum: 20,
      indicatorFields: 'ip,domain',
      indicatorValues: '192.168.1.1,test.com',
      reset: 60,
      clientIp: '192.168.1.1',
      client_country_region: 'china',
      client_super_admin_area: 'beijing',
      client_admin_area: 'beijing',
      client_longitude: '116.30',
      client_latitude: '40.50',
      serverIp: '192.168.1.2',
      server_country_region: 'china',
      server_super_admin_area: 'beijing',
      server_admin_area: 'beijing',
      server_longitude: '116.30',
      server_latitude: '40.50',
      domain: 'test.com',
      app: 'test',
      matchTime: 1722503700000
    }

    for (let i = 0; i < 10; i++) {
      data.indicatorMatchs.push(JSON.parse(JSON.stringify(indicatorMatchObj)))
      indicatorMatchObj.matchId += 1
      indicatorMatchObj.ruleId += 2
      indicatorMatchObj.matchTime += 900000
      indicatorMatchObj.matchNum = Math.floor((Math.random() * 100) + 1)
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/event/status/statistics.*'), 'get', function (requestObj) {
    const data = {
      resultType: 'table',
      result: [
        {
          status: 1,
          count: 25
        },
        {
          status: 0,
          count: 23
        }
      ]
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/event/type/statistics.*'), 'get', function (requestObj) {
    const data = {
      resultType: 'table',
      result: [
        { eventType: 'Anonymity', count: 25 },
        { eventType: 'Command and Control', count: 13 }
      ]
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
}

const getLastValue = (url) => {
  const index = url.lastIndexOf('/')
  return url.substring(index + 1)
}
