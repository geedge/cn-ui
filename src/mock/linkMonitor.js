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
        data.push({ egressLinkId: egress, ingressLinkId: ingress, egressBytes: 12800000000, ingressBytes: 52800000000, totalBytes: 98541200, score: 6, tcpConnectionEstablishLatency: 50, httpResponseLatency: 50, sslResponseLatency: 50, packetsLoss: 0.2, packetRetrans: 0.1 })
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
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/link/overview/quadrupleIngressAnalysis.*'), 'get', function (requestObj) {
    const data = [
      {
        clientCity: 'beijing',
        commonEgressLinkId: 257,
        ingressLinkDirection: 'xian',
        serverCity: 'taiyuan',
        ingressBytes: 10000000000
      },
      {
        clientCity: 'xingjiang',
        commonEgressLinkId: 513,
        ingressLinkDirection: 'xian',
        serverCity: 'liaoning',
        ingressBytes: 20000000000
      },
      {
        clientCity: 'shanghai',
        commonEgressLinkId: 769,
        ingressLinkDirection: 'xian',
        serverCity: 'anhui',
        ingressBytes: 30000000000
      },
      {
        clientCity: 'tianjing',
        commonEgressLinkId: 1025,
        ingressLinkDirection: 'xian',
        serverCity: 'taiyuan',
        ingressBytes: 30000000000
      }
    ]
    return {
      msg: 'success',
      code: 200,
      data: {
        result: data
      }
    }
  })
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/link/overview/quadrupleEgressAnalysis.*'), 'get', function (requestObj) {
    const data = [
      {
        clientCity: 'beijing',
        commonEgressLinkId: 256,
        egressLinkDirection: 'xian',
        serverCity: 'taiyuan',
        egressBytes: 10000000000
      },
      {
        clientCity: 'xingjiang',
        commonEgressLinkId: 512,
        egressLinkDirection: 'xian',
        serverCity: 'liaoning',
        egressBytes: 20000000000
      },
      {
        clientCity: 'shanghai',
        commonEgressLinkId: 768,
        egressLinkDirection: 'xian',
        serverCity: 'anhui',
        egressBytes: 30000000000
      },
      {
        clientCity: 'tianjing',
        commonEgressLinkId: 1024,
        egressLinkDirection: 'xian',
        serverCity: 'taiyuan',
        egressBytes: 30000000000
      }
    ]
    return {
      msg: 'success',
      code: 200,
      data: {
        result: data
      }
    }
  })

  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/linkMonitor/bigramAnalysis1.*'), 'get', function (requestObj) {
    const data = []
    const ingressLinkIds = ['256', '512', '768', '1024', '1280', '1536', '1792', '2048', '2304', '2816']
    const egressLinkIds = ['257', '513', '769', '1025', '1281', '1537', '1793', '2049', '2305', '2817']
    ingressLinkIds.forEach(ingress => {
      egressLinkIds.forEach(egress => {
        data.push({ egressLinkId: egress, ingressLinkId: ingress, egressBytes: 12800000000, ingressBytes: 52800000000, totalBytes: 98541200, establishLatencyMs: 50, httpResponseLatency: 50, sslConLatency: 50, tcpLostlenPercent: 0.2, pktRetransPercent: 0.1 })
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

  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/linkMonitor/bigramNextHopAnalysis1.*'), 'get', function (requestObj) {
    const data = []
    const ingressLinkIds = ['西安', '太原', '西宁']
    const egressLinkIds = ['西安', '太原', '西宁']
    ingressLinkIds.forEach(ingress => {
      egressLinkIds.forEach(egress => {
        data.push({ egressLinkDirection: egress, ingressLinkDirection: ingress, egressBytes: 12800000000, ingressBytes: 52800000000, totalBytes: 985412000, establishLatencyMs: 50, httpResponseLatency: 50, sslConLatency: 50, tcpLostlenPercent: 0.2, pktRetransPercent: 0.1 })
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
