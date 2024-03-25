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
        eventSeverity: 'critical',
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
        eventSeverity: 'info',
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
      psiphon3Ip: {
        type: 1
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
      data: result
    }
  })
  Mock.mock(new RegExp(`${BASE_CONFIG.baseUrl}${BASE_CONFIG.apiVersion}/entity/detail/kb/intelligence/list.*`), 'get', function (requestObj) {
    const result = [
      {
        location: {
          isp: 'dba Omsoft',
          updateTime: 1685696510,
          createTime: 1685696510,
          isValid: 1
        }
      },
      {
        malware: {
          threatType: 'command and control',
          malwareName: 'IcedID',
          malwareAlias: 'BokBot,IceID',
          updateTime: 1685696510,
          createTime: 1685696510,
          isValid: 1
        }
      },
      {
        darkweb: {
          nodeType: 'i2p',
          updateTime: 1685696510,
          createTime: 1685696510,
          isValid: 1
        }
      },
      {
        psiphon3Ip: {
          type: 1
        }
      },
      {
        userDefinedTag: {
          id: 1,
          tagValue: '门户网站',
          updateTime: 1685696500,
          createTime: 1685696500,
          isValid: 1
        }
      },
      {
        userDefinedTag: {
          id: 1,
          tagValue: '用户tag',
          updateTime: 1685696500,
          createTime: 1685696500,
          isValid: 1
        }
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
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/ip/relate/ports.*'), 'get', function (requestObj) {
    const result = [
      {
        port: 80,
        l7Protocol: 'HTTP'
      },
      {
        port: 443,
        l7Protocol: 'HTTPS'
      },
      {
        port: 53,
        l7Protocol: 'DNS'
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
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/ip/relate/apps.*'), 'get', function (requestObj) {
    const result = ['Wechat', 'baidu', 'Wechat', 'baidu', 'Wechat', 'baidu', 'Wechat']

    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/ip/relate/domains.*'), 'get', function (requestObj) {
    const result = ['-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com']

    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/app/relate/ips.*'), 'get', function (requestObj) {
    const result = ['116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242']
    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/app/relate/domains.*'), 'get', function (requestObj) {
    const result = ['-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com']

    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/domain/relate/ips.*'), 'get', function (requestObj) {
    const result = ['116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242']
    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/domain/relate/apps.*'), 'get', function (requestObj) {
    const result = ['Wechat', 'baidu', 'Wechat', 'baidu', 'Wechat', 'baidu', 'Wechat']

    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/entity/detail/domain/relate/fqdns.*'), 'get', function (requestObj) {
    const result = ['-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com']

    return {
      msg: 'success',
      code: 200,
      data: {
        result: result
      }
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/query/list.*`), 'get', function (requestObj) {
    const result = {
      pageNo: 1,
      pageSize: 10,
      total: 4,
      list: [
        { entityValue: 'test123987', entityType: 'subscriber_id' },
        { entityValue: '172.217.24.66', entityType: 'ip' },
        { entityValue: 'gdbzkz.com', entityType: 'domain' },
        { entityValue: 'qqvideo', entityType: 'app' }
      ]
    }
    return {
      msg: 'success',
      code: 200,
      data: result
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/detail/basic.*`), 'get', function (requestObj) {
    const entityType = getEntityType(requestObj.url)
    let result = {}
    switch (entityType) {
      case ('domain'): {
        result = {
          whois: {
            registrarName: 'Beijing Baidu Company',
            registrantOrg: 'Beijing Baidu Netcom Science Technology Co., Ltd.',
            registrantCountry: 'China',
            email: '信息已设置隐私保护',
            createDate: 1685329698,
            expireDate: 1685329698
          },
          icp: {
            icpSiteLicense: '京ICP证030173号',
            icpCompanyName: '北京百度网讯科技有限公司',
            icpCompanyType: '企业'
          },
          category: {
            name: '门户网站',
            group: '互联网',
            reputationLevel: 'Trustworthy'
          }
        }
        break
      }
      case ('ip'): {
        result = {
          asn: { id: 2, asn: '14061', organization: 'DIGITALOCEAN-ASN - DigitalOcean, LLC, US' },
          location: {
            continent: 'North America',
            country: 'United States',
            province: 'New York',
            city: '',
            lngwgs: '-74.006',
            latwgs: '40.713',
            isp: 'dba Omsoft',
            owner: 'tie net'
          }
        }
        break
      }
      case ('app'): {
        result = {
          category: {
            appName: 'QQ',
            appId: 333,
            appCategory: '娱乐',
            appSubcategory: '聊天',
            appRisk: '1',
            appDescription: '聊天社交软件',
            appLongname: 'Tencent qq',
            appTechnology: 'socket',
            appCompany: 'tencent',
            appCompanyCategory: '互联网'
          }
        }
        break
      }
      case ('subscriber_id'): {
        result = {
          phone_number: '1568912455',
          imei: 'r45ty5454fh',
          imsi: 'eere2545t',
          apn: 'xxx站点',
          subscriber_longitude: 116.370042,
          subscriber_latitude: 39.944283
        }
        break
      }
    }

    return {
      msg: 'success',
      code: 200,
      data: result
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/detail/kb/intelligence/tag.*`), 'get', function (requestObj) {
    const entityType = getEntityType(requestObj.url)
    let result = {}
    switch (entityType) {
      case ('domain'): {
        result = {
          malware: {
            threatType: 'command and control',
            malwareName: '情报攻击',
            malwareAlias: '攻击'
          },
          darkweb: {
            nodeType: 'mtproxy'
          },
          userDefinedTags: [
            {
              id: 1,
              tagValue: '门户网站'
            }
          ]
        }
        break
      }
      case ('ip'): {
        result = {
          malware: {
            threatType: 'command and control',
            malwareName: 'IcedID',
            malwareAlias: 'BokBot,IceID'
          },
          darkweb: {
            nodeType: '12p'
          },
          psiphon3Ip: {
            type: 'high',
            method: 'passive_ml',
            confidence: 88,
            confidenceLevel: 'confirmed'
          },
          userDefinedTags: [
            {
              id: 1,
              tagValue: '门户网站'
            }
          ]
        }
        break
      }
      case ('app'): {
        result = {
          userDefinedTags: [
            {
              id: 1,
              tagValue: '门户网站'
            },
            {
              id: 2,
              tagValue: '新闻软件'
            }
          ]
        }
        break
      }
    }

    return {
      msg: 'success',
      code: 200,
      data: result
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/detail/domain/relate.*`), 'get', function (requestObj) {
    const relateType = getRelateType(requestObj.url)
    let result = {}
    switch (relateType) {
      case ('ip'): {
        result = {
          total: 5,
          result: ['bittorrent', 'qq_web', 'wechat', 'tencent', 'outlook']
        }
        break
      }
      case ('app'): {
        result = {
          total: 5,
          result: ['192.107.175.180', '192.107.175.180', '192.107.175.180', '192.107.175.180', '192.107.175.180']
        }
        break
      }
    }

    return {
      msg: 'success',
      code: 200,
      data: result
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/detail/ip/relate.*`), 'get', function (requestObj) {
    const relateType = getRelateType(requestObj.url)
    let result = {}
    switch (relateType) {
      case ('domain'): {
        result = {
          total: 5,
          result: ['bittorrent', 'qq_web', 'wechat', 'tencent', 'outlook']
        }
        break
      }
      case ('app'): {
        result = {
          total: 5,
          result: ['gdbzkz.com', 'gdbzkz.com', 'gdbzkz.com', 'gdbzkz.com', 'gdbzkz.com']
        }
        break
      }
    }

    return {
      msg: 'success',
      code: 200,
      data: result
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/detail/app/relate.*`), 'get', function (requestObj) {
    const relateType = getRelateType(requestObj.url)
    let result = {}
    switch (relateType) {
      case ('ip'): {
        result = {
          total: 5,
          result: ['gdbzkz.com', 'gdbzkz.com', 'gdbzkz.com', 'gdbzkz.com', 'gdbzkz.com']
        }
        break
      }
      case ('domain'): {
        result = {
          total: 5,
          result: ['192.107.175.180', '192.107.175.180', '192.107.175.180', '192.107.175.180', '192.107.175.180']
        }
        break
      }
    }

    return {
      msg: 'success',
      code: 200,
      data: result
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/detail/traffic/performance.*`), 'get', function (requestObj) {
    const result = {
      resultType: 'object',
      result: {
        httpResponseLatencyValue: null,
        httpResponseLatencyP50: null,
        httpResponseLatencyP90: null,
        httpResponseLatencyP99: null,
        sslConLatencyValue: 191,
        sslConLatencyP50: 137,
        sslConLatencyP90: 311,
        sslConLatencyP99: 1610,
        establishLatencyValue: 42,
        establishLatencyP50: 33,
        establishLatencyP90: 54,
        establishLatencyP99: 177,
        sequenceGapLossPercentValue: 0.001,
        sequenceGapLossPercentP50: 0,
        sequenceGapLossPercentP90: 0.0038,
        sequenceGapLossPercentP99: 0.0087,
        pktRetransPercentValue: 0.0124,
        pktRetransPercentP50: 0.0096,
        pktRetransPercentP90: 0.0183,
        pktRetransPercentP99: 0.0769
      }
    }

    return {
      msg: 'success',
      code: 200,
      data: result
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/overview/active.*`), 'get', function (requestObj) {
    const data = { domainCount: 755, ipCount: 8373, appCount: 263, subscriberCount: 263 }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/overview/new.*`), 'get', function (requestObj) {
    const data = { domainCount: 262, ipCount: 4201, appCount: 43 }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/overview/total.*`), 'get', function (requestObj) {
    const data = { domainCount: 7686274, ipCount: 2169957, appCount: 856, subscriberCount: 856 }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/detail/traffic/throughput/subscriber.*`), 'get', function (requestObj) {
    const arr = [{ legend: 'sentRate' }, { legend: 'rate' }, { legend: 'receivedRate' }]

    const endTime = JSON.parse(getQuery(requestObj.url).endTime)
    let step = 0
    arr.forEach(item => {
      let startTime = JSON.parse(getQuery(requestObj.url).startTime)
      step = (endTime - startTime) / 60 // 每条数据的时间间隔
      const max = 2975
      const min = 0
      const values = []
      for (let i = 0; i < step; i++) {
        const random = Math.floor(Math.random() * (max - min) + min)
        values.push([startTime, random])
        startTime += step
      }
      item.values = values
      item.aggregation = { first: 0, last: 0, avg: '602.64', p50: '0.0', p90: '1852.0', max: '5256.0' }
    })

    const data = {
      result: arr,
      resultType: 'matrix'
    }

    return {
      msg: 'success',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(`${urlAndVersion}/entity/explorer/detail/subscriber/relate.*`), 'get', function (requestObj) {
    const result = {
      total: 5,
      result: ['appName1', 'appName2', 'appName3', 'appName4', 'appName5', 'appName6', 'appName7', 'appName1', 'appName2', 'appName3', 'appName4', 'appName5', 'appName6', 'appName7']
    }

    return {
      msg: 'success',
      code: 200,
      data: result
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

const getEntityType = (url) => {
  let entityType = ''
  if (url.indexOf('/domain?') > -1) {
    entityType = 'domain'
  }
  if (url.indexOf('/ip?') > -1) {
    entityType = 'ip'
  }
  if (url.indexOf('/app?') > -1) {
    entityType = 'app'
  }
  if (url.indexOf('/subscriber_id?') > -1) {
    entityType = 'subscriber_id'
  }
  return entityType
}

const getRelateType = (url) => {
  let entityType = ''
  if (url.indexOf('/domains?') > -1) {
    entityType = 'domain'
  }
  if (url.indexOf('/ips?') > -1) {
    entityType = 'ip'
  }
  if (url.indexOf('/apps?') > -1) {
    entityType = 'app'
  }
  if (url.indexOf('/subscriber_id?') > -1) {
    entityType = 'subscriber_id'
  }
  return entityType
}
