import Mock from 'mockjs'

const openMock = true
if (openMock) {
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/locationIntelligence/population/density.*'), 'get', function (requestObj) {
    const data = [453, 782, 128, 569, 934, 231, 678, 345, 890]
    return {
      msg: 'success',
      code: 200,
      data: data.map(d => ({ subscriberId: d, number: d }))
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/locationIntelligence/map.*'), 'get', function (requestObj) {
    const data = [453, 782, 128, 569, 934, 231, 678, 345, 890]
    const hexId = ['8931aa42e67ffff', '8931aa42e2bffff', '8931aa42a9bffff', '8931aa42a93ffff', '8931aa42a07ffff', '8931aa42aa7ffff', '8931aa40583ffff', '8931aa42a1bffff', '8931aa42853ffff']
    return {
      msg: 'success',
      code: 200,
      data: {
        list: data.map((d, i) => ({ hexId: hexId[i], number: d }))
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/locationIntelligence/active/trend.*'), 'get', function (requestObj) {
    const lineData = [
      [
        1707357180,
        '0'
      ],
      [
        1707357240,
        '67781'
      ],
      [
        1707357300,
        '8878'
      ],
      [
        1707357360,
        '71386'
      ],
      [
        1707357420,
        '119827'
      ],
      [
        1707357480,
        '63332'
      ],
      [
        1707357540,
        '139829'
      ],
      [
        1707357600,
        '12184'
      ],
      [
        1707357660,
        '3922'
      ],
      [
        1707357720,
        '41349'
      ],
      [
        1707357780,
        '54148'
      ],
      [
        1707357840,
        '2530'
      ],
      [
        1707357900,
        '17814'
      ],
      [
        1707357960,
        '0'
      ],
      [
        1707358020,
        '25336'
      ],
      [
        1707358080,
        '5684'
      ],
      [
        1707358140,
        '46829'
      ],
      [
        1707358200,
        '2546'
      ],
      [
        1707358260,
        '33345'
      ],
      [
        1707358320,
        '304847'
      ],
      [
        1707358380,
        '73994'
      ],
      [
        1707358440,
        '170837'
      ],
      [
        1707358500,
        '35891'
      ],
      [
        1707358560,
        '138272'
      ],
      [
        1707358620,
        '194981'
      ],
      [
        1707358680,
        '292987'
      ],
      [
        1707358740,
        '95844'
      ],
      [
        1707358800,
        '7424'
      ],
      [
        1707358860,
        '22057'
      ],
      [
        1707358920,
        '61791'
      ],
      [
        1707358980,
        '23838'
      ],
      [
        1707359040,
        '11664'
      ],
      [
        1707359100,
        '76485'
      ],
      [
        1707359160,
        '37542'
      ],
      [
        1707359220,
        '40851'
      ],
      [
        1707359280,
        '27611'
      ],
      [
        1707359340,
        '170709'
      ],
      [
        1707359400,
        '2290'
      ],
      [
        1707359460,
        '15577'
      ],
      [
        1707359520,
        '124024'
      ],
      [
        1707359580,
        '22947'
      ],
      [
        1707359640,
        '4131'
      ],
      [
        1707359700,
        '208705'
      ],
      [
        1707359760,
        '120407'
      ],
      [
        1707359820,
        '58706'
      ],
      [
        1707359880,
        '90036'
      ],
      [
        1707359940,
        '41000'
      ],
      [
        1707360000,
        '87489'
      ],
      [
        1707360060,
        '12170'
      ],
      [
        1707360120,
        '24611'
      ],
      [
        1707360180,
        '25815'
      ],
      [
        1707360240,
        '50903'
      ],
      [
        1707360300,
        '102385'
      ],
      [
        1707360360,
        '58121'
      ],
      [
        1707360420,
        '95365'
      ],
      [
        1707360480,
        '66674'
      ],
      [
        1707360540,
        '89708'
      ],
      [
        1707360600,
        '64098'
      ],
      [
        1707360660,
        '41778'
      ],
      [
        1707360720,
        '246241'
      ],
      [
        1707360780,
        '0'
      ]
    ]
    return {
      msg: 'success',
      code: 200,
      data: {
        result: lineData
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/locationIntelligence/active/count.*'), 'get', function (requestObj) {
    const item = JSON.parse(requestObj.body)
    if (item && item.cycle === 0) {
      return {
        msg: 'success',
        code: 200,
        data: {
          total: 16366
        }
      }
    } else {
      return {
        msg: 'success',
        code: 200,
        data: {
          total: 19366
        }
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/locationIntelligence/baseStation.*'), 'get', function (requestObj) {
    return {
      msg: 'success',
      code: 200,
      data: {
        list: [
          {
            longitude: 116.38,
            latitude: 39.9
          },
          {
            longitude: 116.39,
            latitude: 39.9
          },
          {
            longitude: 116.383,
            latitude: 39.886
          },
          {
            longitude: 116.378,
            latitude: 39.902
          },
          {
            longitude: 116.369,
            latitude: 39.91
          },
          {
            longitude: 116.38,
            latitude: 39.91
          }
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/locationIntelligence/followed/subscribers.*'), 'get', function (requestObj) {
    return {
      msg: 'success',
      code: 200,
      data: {
        list: [
          {
            "subscriberId":111,
            "group": "terrorist",
            "info": "terrorist leader",
            "location": "china",
            "active": 1
          },
          {
            "subscriberId":444,
            "group": "terrorist",
            "info": "terrorist leader",
            "location": "china",
            "active": 1
          },
          {
            "subscriberId":555,
            "group": "terrorist",
            "info": "terrorist leader",
            "location": "china",
            "active": 0
          },{
            "subscriberId":666,
            "group": "terrorist",
            "info": "terrorist leader",
            "location": "china",
            "active": 1
          },{
            "subscriberId":777,
            "group": "terrorist",
            "info": "terrorist leader",
            "location": "china",
            "active": 0
          },{
            "subscriberId":888,
            "group": "terrorist",
            "info": "terrorist leader",
            "location": "china",
            "active": 1
          }
        ]
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'v1/locationIntelligence/list.*'), 'get', function (requestObj) {
    return {
      msg: 'success',
      code: 200,
      data: {
        total:1,
        pageSize:20,
        pageNo:1,
        pages:1,
        list: [
          {
            "subscriberId":111,
            "active": 1,
            "phone_number": 18601680302,
            "follow": 1
          },
          {
            "subscriberId":222,
            "active": 1,
            "phone_number": 18601680303,
            "follow": 0
          },
          {
            "subscriberId":333,
            "active": 0,
            "phone_number": 18601680304,
            "follow": 0
          },{
            "subscriberId":444,
            "active": 1,
            "phone_number": 18601680305,
            "follow": 1
          },{
            "subscriberId":555,
            "active": 0,
            "phone_number": 18601680306,
            "follow": 1
          },{
            "subscriberId":666,
            "active": 1,
            "phone_number": 18601680307,
            "follow": 1
          },{
            "subscriberId":777,
            "active": 1,
            "phone_number": 18601680308,
            "follow": 1
          },{
            "subscriberId":888,
            "active": 1,
            "phone_number": 18601680300,
            "follow": 1
          }
        ]
      }
    }
  })
}
