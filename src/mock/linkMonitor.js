import Mock from 'mockjs'

const openMock = true
if (openMock) {
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/linkMonitor/links.*'), 'get', function (requestObj) {
    const linkData = []
    for (let i = 0; i < 10; i++) {
      linkData.push({ linkId: 20 * (i + 300), totalBitsRate: Math.floor(Math.pow(1.3, i) * 10000) })
    }
    return {
      msg: 'success',
      code: 200,
      data: {
        result: linkData
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/linkMonitor/linkTrafficDirection.*'), 'get', function (requestObj) {
    const data = []
    const ingressLinkIds = ['256', '512', '768', '1024', '1280', '1536', '1792', '2048', '2304', '2816']
    const egressLinkIds = ['257', '513', '769', '1025', '1281', '1537', '1793', '2049', '2305', '2817']
    ingressLinkIds.forEach(ingress => {
      egressLinkIds.forEach(egress => {
        data.push({ egressLinkId: egress, ingressLinkId: ingress, egressBytes: 128000, ingressBytes: 12800, totalBytes: 130800, establishLatencyMs: 50, httpResponseLatency: 50, sslConLatency: 50, tcpLostlenPercent: 0.2, pktRetransPercent: 0.1 })
      })
    })
    return {
      msg: 'success',
      code: 200,
      data: {
        result: data
      }
    }
  })
}
