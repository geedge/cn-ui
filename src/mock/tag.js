import Mock from 'mockjs'

const openMock = true
if (openMock) {
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag/parser'), 'post', function (requestObj) {
    return {
      code: 200,
      msg: 'success',
      data: {
        list: [
          {
            entityType: 'I2P',
            entityValue: '103.3.138.0',
            isValid: 0,
            errorAttribute: 'entityType'
          },
          {
            entityType: 'IP',
            entityValue: '103.3.136.0/25',
            isValid: 1
          },
          {
            entityType: 'IP',
            entityValue: '192.168.1.1-192.168.1.2a',
            isValid: 0,
            errorAttribute: 'entityValue'
          },
          {
            entityType: 'Domain',
            entityValue: 'www.baidu.com',
            isValid: 1
          }
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag.*'), 'delete', function (requestObj) {
    return {
      code: 200,
      message: 'success',
      data: {
        ids: [
          'UUID1',
          'UUID2'
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag.*'), 'post', function (requestObj) {
    return {
      msg: 'success',
      code: 200,
      data: {
        id: '标签UUID'
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag.*'), 'put', function (requestObj) {
    return {
      msg: 'success',
      code: 200,
      data: {
        id: '标签UUID'
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag/list.*'), 'get', function (requestObj) {
    return {
      msg: 'success',
      code: 200,
      data: {
        pageNo: 1,
        pageSize: 20,
        total: 1,
        list: [
          {
            id: '08b2a4cd-1c38-4be1-b641-8e5b607e2075',
            name: 'tag1',
            category: 'categoty1',
            indicatorType: 'IP',
            intent: 'Benign',
            description: ' tag1 description',
            isBuiltIn: 1,
            createdTime: 1685412014,
            updatedTime: 1685412014
          },
          {
            id: '08b2a4cd-1c38-4be1-b641-8e5b607e2076',
            name: 'tag2',
            category: 'categoty1',
            indicatorType: 'IP,Domain',
            intent: 'Benign',
            description: ' tag1 description',
            isBuiltIn: 0,
            createdTime: 1685412014,
            updatedTime: 1685412014
          },
          {
            id: '08b2a4cd-1c38-4be1-b641-8e5b607e20751',
            name: 'tag123',
            category: 'categoty1',
            indicatorType: 'IP',
            intent: 'Malicious',
            description: ' tag1 description',
            isBuiltIn: 1,
            createdTime: 1685412014,
            updatedTime: 1685412014
          },
          {
            id: '08b2a4cd-1c38-4be1-b641-8e5b607e20761',
            name: 'tag246',
            category: 'categoty1',
            indicatorType: 'IP,Domain',
            intent: 'Unknow',
            description: ' tag1 description',
            isBuiltIn: 1,
            createdTime: 1685412014,
            updatedTime: 1685412014
          }
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag/.*/indicator/trend.*'), 'get', function (requestObj) {
    return {
      code: 200,
      success: true,
      msg: 'OK',
      data: {
        resultType: 'table',
        result: [
          {
            statTime: 1711526563,
            ipIndicatorCount: 217,
            domainIndicatorCount: 125
          },
          {
            statTime: 1711526569,
            ipIndicatorCount: 515,
            domainIndicatorCount: 415
          },
          {
            statTime: 1711526575,
            ipIndicatorCount: 17,
            domainIndicatorCount: 15
          },
          {
            statTime: 1711526581,
            ipIndicatorCount: 565,
            domainIndicatorCount: 35
          }
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag/.*/trafficEntity/trend.*'), 'get', function (requestObj) {
    return {
      code: 200,
      success: true,
      msg: 'OK',
      data: {
        resultType: 'table',
        result: [
          {
            statTime: 1711526563,
            ipIndicatorCount: 27,
            domainIndicatorCount: 25
          },
          {
            statTime: 1711526569,
            ipIndicatorCount: 55,
            domainIndicatorCount: 45
          },
          {
            statTime: 1711526575,
            ipIndicatorCount: 17,
            domainIndicatorCount: 15
          },
          {
            statTime: 1711526581,
            ipIndicatorCount: 55,
            domainIndicatorCount: 35
          }
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag/.*/trafficEntity/statistics.*'), 'get', function (requestObj) {
    return {
      msg: 'success',
      code: 200,
      data: {
        result: [
          {
            type: 'Domain',
            count: 36
          },
          {
            type: 'IP',
            count: 10
          }
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag/.*/indicator/statistics.*'), 'get', function (requestObj) {
    return {
      msg: 'success',
      code: 200,
      data: {
        result: [
          {
            type: 'Domain',
            count: 33
          },
          {
            type: 'IP',
            count: 100
          }
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/tag/.*'), 'get', function (requestObj) {
    return {
      code: 200,
      message: 'success',
      data: {
        pageNo: 1,
        pageSize: 10,
        total: 5,
        id: '08b2a4cd-1c38-4be1-b641-8e5b607e2075',
        name: 'tag',
        category: 'categoty1',
        indicatorType: 'Domain',
        intent: 'Benign',
        description: ' tag1 description',
        isBuiltIn: 1,
        createdTime: 1685412014,
        updatedTime: 1685412014,
        itemList: [
          {
            id: 1,
            entityType: 'Domain',
            entityValue: 'www.baidu.com'
          },
          {
            id: 2,
            entityType: 'IP',
            entityValue: '172.0.0.0/8'
          },
          {
            id: 3,
            entityType: 'IP',
            entityValue: '192.168.44.12'
          },
          {
            id: 4,
            entityType: 'IP',
            entityValue: '192.168.44.13-192.168.44.14'
          }
        ]
      }
    }
  })
}
