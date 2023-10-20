import Mock from 'mockjs'

const urlAndVersion = BASE_CONFIG.baseUrl + BASE_CONFIG.apiVersion
const openMock = true
if (openMock) {
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/list.*'), 'get', function (requestObj) {
    const result = []
    for (let i = 0; i < 20; i++) {
      const obj = {
        eventId: 1212,
        eventType: 'Anonymity',
        eventName: 'Tor',
        eventKey: '2,1.1.1,12.2.2.2',
        ruleId: 2,
        ruleType: 'indicator_match',
        isBuiltin: 1,
        severity: 'critical',
        offenderIp: '1.1.1.1',
        victimIp: '2.2.2.2',
        domain: '*.vioee.com',
        app: 'vio',
        startTime: 1697092617,
        endTime: 1697092777,
        durationS: 30000,
        matchTimes: 1,
        status: 1,
        eventInfo: "{\'knowledge_id\': 123, \'name\': \'example_ioc_malware\', \'ioc_type\': \'domain\', \'ioc_value\': \'iocentity.com\'}",
        eventInfoObj: {
          knowledge_id: 123,
          name: 'example_ioc_malware',
          ioc_type: 'domain',
          ioc_value: 'iocentity.com'
        }
      }
      if (i % 2 === 0) {
        obj.status = 0
      }
      result.push(obj)
    }
    const data = {
      resultType: 'table',
      result: result
    }

    return {
      msg: 'OK',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/severity/timedistribution.*'), 'get', function (requestObj) {
    const result = [
      {
        statTime: 1697523900,
        severity: 'critical',
        count: 25
      },
      {
        statTime: 1697524200,
        severity: 'high',
        count: 31
      },
      {
        statTime: 1697524500,
        severity: 'info',
        count: 21
      },
      {
        statTime: 1697524800,
        severity: 'low',
        count: 25
      },
      {
        statTime: 1697525100,
        severity: 'medium',
        count: 32
      },
      {
        statTime: 1697525400,
        severity: 'critical',
        count: 22
      },
      {
        statTime: 1697525700,
        severity: 'critical',
        count: 23
      },
      {
        statTime: 1697526000,
        severity: 'critical',
        count: 25
      },
      {
        statTime: 1697526300,
        severity: 'critical',
        count: 21
      }
    ]

    const data = {
      resultType: 'table',
      result: result
    }

    return {
      msg: 'OK',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/severity/statistics.*'), 'get', function (requestObj) {
    const result = [
      {
        severity: 'critical',
        count: 25
      },
      {
        severity: 'high',
        count: 31
      },
      {
        severity: 'info',
        count: 21
      },
      {
        severity: 'low',
        count: 25
      },
      {
        severity: 'medium',
        count: 32
      }
    ]

    const data = {
      resultType: 'table',
      result: result
    }

    return {
      msg: 'OK',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/event-type/statistics.*'), 'get', function (requestObj) {
    const result = [
      {
        eventType: 'Anonymity',
        count: 25
      },
      {
        eventType: 'Command and Control',
        count: 31
      }
    ]

    const data = {
      resultType: 'table',
      result: result
    }

    return {
      msg: 'OK',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/offender-ip/statistics.*'), 'get', function (requestObj) {
    const result = [
      {
        offenderIp: '221.7.1.20',
        count: 25
      },
      {
        offenderIp: '58.247.118.253',
        count: 31
      }
    ]

    const data = {
      resultType: 'table',
      result: result
    }

    return {
      msg: 'OK',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/victim-ip/statistics.*'), 'get', function (requestObj) {
    const result = [
      {
        victimIp: '21.77.1.201',
        count: 25
      },
      {
        victimIp: '58.47.118.153',
        count: 31
      },
      {
        victimIp: '22.47.223.57',
        count: 43
      }
    ]

    const data = {
      resultType: 'table',
      result: result
    }

    return {
      msg: 'OK',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/status/statistics.*'), 'get', function (requestObj) {
    const result = [
      {
        status: 1,
        count: 25
      },
      {
        status: 0,
        count: 31
      }
    ]

    const data = {
      resultType: 'table',
      result: result
    }

    return {
      msg: 'OK',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/ip/relation/event.*'), 'get', function (requestObj) {
    const result = [
      {
        eventId: 10010,
        severity: 'high',
        eventType: 'Command and Control',
        offenderIp: '1.1.1.1',
        victimIp: '2.2.2.2',
        startTime: 1697092617
      }
    ]

    const data = {
      resultType: 'table',
      result: result
    }

    return {
      msg: 'OK',
      code: 200,
      data: data
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/count.*'), 'get', function (requestObj) {
    return {
      msg: 'OK',
      code: 200,
      data: {
        resultType: 'single',
        result: 123
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/entity/detail/ip.*'), 'get', function (requestObj) {
    return {
      msg: 'OK',
      code: 200,
      data: {
        asn: {
          id: 2,
          asn: '14061',
          organization: 'DIGITALOCEAN-ASN - DigitalOcean, LLC, US'
        },
        malware: {
          threatType: 'command and control',
          malwareName: 'IcedID',
          malwareAlias: 'BokBot,IceID',
          mitreAttackDescription: '[IcedID](https://attack.mitre.org/software/S0483) is a modular banking malware designed to steal financial information that has been observed in the wild since at least 2017.  [IcedID](https://attack.mitre.org/software/S0483)  has been downloaded by [Emotet](https://attack.mitre.org/software/S0367) in multiple campaigns.(Citation: IBM IcedID November 2017)(Citation: Juniper IcedID June 2020)',
          mitreAttackPlatforms: 'Windows',
          mitreAttackTechniques: '[""Asymmetric Cryptography(T1573.002)"",""Asynchronous Procedure Call(T1055.004)"",""Browser Session Hijacking(T1185)"",""Domain Account(T1087.002)"",""Ingress Tool Transfer(T1105)"",""Malicious File(T1204.002)"",""Msiexec(T1218.007)"",""Native API(T1106)"",""Obfuscated Files or Information(T1027)"",""Permission Groups Discovery(T1069)"",""Registry Run Keys / Startup Folder(T1547.001)"",""Scheduled Task(T1053.005)"",""Software Packing(T1027.002)"",""Spearphishing Attachment(T1566.001)"",""Steganography(T1027.003)"",""System Information Discovery(T1082)"",""Visual Basic(T1059.005)"",""Web Protocols(T1071.001)"",""Windows Management Instrumentation(T1047)""]',
          mitreAttackGroups: '[""TA551(G0127)""]',
          confidenceLevel: 'high',
          reference: ''
        },
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
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/entity/detail/domain.*'), 'get', function (requestObj) {
    return {
      msg: 'OK',
      code: 200,
      data: {
        malware: {
          threatType: 'command and control',
          malwareName: 'IcedID',
          malwareAlias: 'BokBot,IceID',
          mitreAttackDescription: '[IcedID](https://attack.mitre.org/software/S0483) is a modular banking malware designed to steal financial information that has been observed in the wild since at least 2017.  [IcedID](https://attack.mitre.org/software/S0483)  has been downloaded by [Emotet](https://attack.mitre.org/software/S0367) in multiple campaigns.(Citation: IBM IcedID November 2017)(Citation: Juniper IcedID June 2020)',
          mitreAttackPlatforms: 'Windows',
          mitreAttackTechniques: '[""Asymmetric Cryptography(T1573.002)"",""Asynchronous Procedure Call(T1055.004)"",""Browser Session Hijacking(T1185)"",""Domain Account(T1087.002)"",""Ingress Tool Transfer(T1105)"",""Malicious File(T1204.002)"",""Msiexec(T1218.007)"",""Native API(T1106)"",""Obfuscated Files or Information(T1027)"",""Permission Groups Discovery(T1069)"",""Registry Run Keys / Startup Folder(T1547.001)"",""Scheduled Task(T1053.005)"",""Software Packing(T1027.002)"",""Spearphishing Attachment(T1566.001)"",""Steganography(T1027.003)"",""System Information Discovery(T1082)"",""Visual Basic(T1059.005)"",""Web Protocols(T1071.001)"",""Windows Management Instrumentation(T1047)""]',
          mitreAttackGroups: '[""TA551(G0127)""]',
          confidenceLevel: 'high',
          reference: ''
        },
        category: {
          categoryName: '门户网站',
          categoryGroup: '互联网',
          reputationLevel: 'high'
        }
      }
    }
  })
  Mock.mock(new RegExp(urlAndVersion + '/detection/security/entity/detail/app.*'), 'get', function (requestObj) {
    return {
      msg: 'OK',
      code: 200,
      data: {
        category: {
          appName: 'QQ',
          appId: 333,
          appCategory: '娱乐',
          appSubcategory: '聊天',
          appRisk: 'low',
          appDescription: '聊天社交软件',
          appLongname: 'Tencent qq',
          appTechnology: 'socket',
          appCompany: 'tencent',
          appCompanyCategory: '互联网'
        }
      }
    }
  })
}
