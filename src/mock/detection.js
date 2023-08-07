import Mock from 'mockjs'

const urlAndVersion = BASE_CONFIG.baseUrl + BASE_CONFIG.apiVersion
const openMock = true
if (openMock) {
  Mock.mock(new RegExp(urlAndVersion + '/rule/detection/list.*'), 'get', function (requestObj) {
    const list = []
    for (let i = 0; i < 20; i++) {
      const obj = {
        ruleId: 100000 + i,
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
        { status: 1 },
        { status: 0 }
      ],
      categoryList: [
        { value: 'security', label: 'Security Event' },
        { value: 'performance', label: 'Performance Event' },
        { value: 'regulatory_risk', label: 'Regulatory Risk Event' }
      ],
      typeList: [
        { value: 'c&c', label: 'C&C' },
        { value: 'ddos', label: 'DDos' },
        { value: 'lateral_movement', label: 'Lateral movement' },
        { value: 'brute_force', label: 'Brute force' }
      ],
      sourceList: [
        { value: 'ip_metric', label: 'IP metric' },
        { value: 'performance_event', label: 'performance event' }
      ],
      levelList: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
        { value: 'info', label: 'Info' }
      ],
      metricList: [
        { value: 'tcp_lostlen_ratio', label: 'Bits/second' },
        { value: 's2c_byte_retrans_ratio', label: 'Packets/second' },
        { value: 's2c_byte_retrans_ratio1', label: 'Sessions/second' }
      ],
      conditionList: [
        { value: 'than', label: 'Greater Than' },
        { value: 'less', label: 'Greater Less' },
        { value: 'equal', label: 'Greater Equal' }
      ],
      libraryList: [
        { value: 'library name2', knowledgeId: '101', label: 'Library name' },
        { value: 'library name1', knowledgeId: '102', label: 'Library name1' },
        { value: 'library name2', knowledgeId: '103', label: 'Library name2' }
      ],
      intervalList: [
        { value: 'minutes', label: 'minutes' },
        { value: 'hours', label: 'hours' },
        { value: 'days', label: 'days' },
        { value: 'weeks', label: 'weeks' }
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
      category: 'Security Event',
      ruleType: 'indicator_match',
      eventType: 'C&C',
      description: 'Built-in darkweb IoC',
      status: 1,
      ruleConfig: {
        dataSource: 'VPN Server IP',
        knowledgeId: 10,
        level: 10
      },
      trigger: {
        atLeast: 1,
        interval: 'PT5M',
        resetInterval: 'PT10M'
      }
    }

    if (ruleId % 2 === 0) {
      data.ruleType = 'threshold'
      data.status = 1
    } else {
      data.status = 0
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
