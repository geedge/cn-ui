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
}

const getLastValue = (url) => {
  const index = url.lastIndexOf('/')
  return url.substring(index + 1)
}
