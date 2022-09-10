import Mock from 'mockjs'

const openMock = true
if (openMock) {
  Mock.mock(BASE_CONFIG.baseUrl + 'interface/linkMonitor/links', 'get', function (requestObj) {
    const linkData = []
    for (let i = 0; i < 94; i++) {
      linkData.push({ linkId: 20 * (i + 300), totalBitsRate: Math.floor(Math.pow(1.1, i) * 10000) })
    }
    return {
      msg: 'success',
      code: 200,
      data: {
        result: linkData
      }
    }
  })
}
