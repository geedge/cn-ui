import Mock from 'mockjs'
const urlAndVersion = BASE_CONFIG.baseUrl + BASE_CONFIG.apiVersion
const openMock = true
if (openMock) {
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/traffic/throughput.*'), 'get', function (requestObj) {
    const titleList = ['totalBitsRate', 'inboundBitsRate', 'outboundBitsRate', 'internalBitsRate', 'throughBitsRate', 'other']
    const arr = [{ type: 'Bits/s' }, { type: 'Packets/s' }, { type: 'Sessions/s' }]

    const endTime = JSON.parse(getQuery(requestObj.url).endTime)
    let step = 0
    for (let i = 0; i < arr.length; i++) {
      for (const j in titleList) {
        let startTime = JSON.parse(getQuery(requestObj.url).startTime)
        step = (endTime - startTime) / 100 // 每条数据的时间间隔

        const values = []
        let max = 2975
        let min = 0
        if (titleList[j] === 'totalBitsRate') {
          max = 4462975
          min = 1162975
        }
        for (let i = 0; i < 101; i++) {
          const random = Math.floor(Math.random() * (max - min) + min)
          values.push([startTime, random])
          startTime += step
        }

        const newValues = JSON.parse(JSON.stringify(values))
        const sortArr = newValues.sort((a, b) => a[1] - b[1])
        const maxAnalysis = Math.floor(sortArr[sortArr.length - 1][1])
        let avg = 0
        let sum = 0
        newValues.forEach((item) => {
          sum += item[1]
        })
        avg = JSON.parse(sum / newValues.length)

        const analysis = {
          avg: avg,
          max: maxAnalysis,
          min: Math.floor(sortArr[0][1]),
          p95: maxAnalysis * 0.95 // 模拟值，p95并未最大值的95%
        }

        // Metric为Packets/s时，没有other的tab选项
        if (arr[i].type === 'Packets/s' && titleList[j] === 'other') {
          analysis.avg = 0
        }

        if (arr[i].type === 'Sessions/s') {
          // Metric为Sessions/s时，只有total选项，故total填充数据完毕终止循环，节省性能
          arr[i].totalBitsRate = { values: values, analysis: analysis }
          break
        } else {
          arr[i][titleList[j]] = { values: values, analysis: analysis }
        }
      }
    }

    return {
      msg: 'success',
      code: 200,
      data: {
        result: arr
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/event/security.*'), 'get', function (requestObj) {
    const result = [
      {
        eventId: '1298414830886991872',
        securityType: 'command and control',
        domain: null,
        offenderIp: '213.186.33.5',
        victimIp: '116.178.217.92',
        offenderDomain: 'baidu.com',
        victimDomain: 'mi.com',
        eventSeverity: 'Critical',
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
        eventSeverity: 'Low',
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
        eventSeverity: 'Low',
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
        eventSeverity: 'Low',
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
        eventSeverity: 'Low',
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
        eventSeverity: 'Low',
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
        eventSeverity: 'Low',
        malwareName: 'NetWire RC',
        cryptominingPool: null,
        startTime: 1683186600,
        durationMs: 300000,
        endTime: 1683186900
      }
    ]

    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/event/performance.*'), 'get', function (requestObj) {
    const result = [
      {
        eventId: '1308078720390412288',
        entityType: 'ip',
        serverIp: '116.178.78.180',
        domain: null,
        appName: null,
        eventSeverity: 'Critical',
        eventType: 'Http error',
        startTime: 1683250500,
        durationMs: 900000,
        endTime: 1683251400
      },
      {
        eventId: '1308078720390412289',
        entityType: 'ip',
        serverIp: '116.178.78.180',
        domain: null,
        appName: null,
        eventSeverity: 'Info',
        eventType: 'Http error',
        startTime: 1683250500,
        durationMs: 900000,
        endTime: 1683251400
      }
    ]

    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(`${BASE_CONFIG.baseUrl}${BASE_CONFIG.apiVersion}/entity/detail/basic.*`), 'get', function (requestObj) {
    const result = {
      asn: {
        asn: 'ASN',
        organization: 'AS org'
      },
      location: {
        country: 'China',
        province: 'Hebei',
        city: 'Langfang',
        isp: 'an ISP'
      },
      categories: {
        categoryName: '类别1',
        categoryGroup: '类别组1',
        reputationLevel: '1',
        appCategory: '类别1',
        appSubcategory: '子类别1',
        appTechnology: '技术1',
        appName: '名称1',
        appRisk: '风险等级1',
        appLongname: '全称1',
        appDescription: '这是描述'
      },
      whois: {
        expireDate: '23-12',
        registrarName: '注册商',
        registrantOrg: '注册机构',
        registrantCountry: 'China',
        createDate: '22-12',
        email: '1@2.3'
      }
    }
    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(`${BASE_CONFIG.baseUrl}${BASE_CONFIG.apiVersion}/entity/detail/kb/intelligence/tag.*`), 'get', function (requestObj) {
    const result = {
      malware: {
        malwareName: 'malware'
      },
      darkweb: {
        nodeType: 'nodeType'
      },
      userDefinedTags: [
        {
          id: 1,
          tagValue: 'userTag1'
        },
        {
          id: 2,
          tagValue: 'userTag2'
        },
        {
          id: 3,
          tagValue: 'userTag3'
        }
      ]
    }
    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
}

const getQuery = (url) => {
  // str为？之后的参数部分字符串
  const str = url.substr(url.indexOf('?') + 1)
  // arr每个元素都是完整的参数键值
  const arr = str.split('&')
  // result为存储参数键值的集合
  const result = {}
  for (let i = 0; i < arr.length; i++) {
    // item的两个元素分别为参数名和参数值
    const item = arr[i].split('=')
    result[item[0]] = item[1]
  }
  return result
}
