import Mock from 'mockjs'

const openMock = false
if (openMock) {
  Mock.mock(RegExp(BASE_CONFIG.baseUrl + 'visual/panel*'), 'get', function (requestObj) {
    return {
      "msg": "success",
      "code": 200,
      "data": {
        "total": 1,
        "pageSize": 10,
        "pages": 1,
        "pageNo": 1,
        "list": [
          {
            "id": 2,
            "name": "Network & App",
            "i18n": "npm.npm",
            "type": 2,
            "params": "",
            "cby": 1,
            "ctime": "2021-06-03 08:27:32",
            "uby": 1,
            "utime": "2021-06-03 08:28:10",
            "remark": "",
            "state": 1,
            "buildIn": 1
          }
        ]
      }
    }
  })
}
