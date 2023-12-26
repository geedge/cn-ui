export const mockData = {
  common: {
    data1: {
      status: 200,
      data: {
        code: 200,
        data: {
          resultType: 'table',
          result: [
            { linkId: '257', outBytes: '0', outBitsRate: 0, inBytes: '493739879', inBitsRate: 1097199.76 },
            { linkId: '256', outBytes: '4147998874', outBitsRate: 9217775.28, inBytes: '0', inBitsRate: 0 },
            { linkId: '1024', outBytes: '4229808296', outBitsRate: 9399574, inBytes: '0', inBitsRate: 0 },
            { linkId: '1793', outBytes: '0', outBitsRate: 0, inBytes: '604840505', inBitsRate: 1344090 },
            { linkId: '2817', outBytes: '0', outBitsRate: 0, inBytes: '430811638', inBitsRate: 957359.2 },
            { linkId: '0', outBytes: '819878366014', outBitsRate: 1821951924.48, inBytes: '140774357362', inBitsRate: 312831905.28 },
            { linkId: '1281', outBytes: '0', outBitsRate: 0, inBytes: '544675122', inBitsRate: 1210389.12 },
            { linkId: '2049', outBytes: '0', outBitsRate: 0, inBytes: '711346274', inBitsRate: 1580769.52 },
            { linkId: '1536', outBytes: '4195896971', outBitsRate: 9324215.52, inBytes: '0', inBitsRate: 0 },
            { linkId: '2305', outBytes: '0', outBitsRate: 0, inBytes: '524865003', inBitsRate: 1166366.64 },
            { linkId: '1792', outBytes: '4145790227', outBitsRate: 9212867.2, inBytes: '0', inBitsRate: 0 },
            { linkId: '1025', outBytes: '0', outBitsRate: 0, inBytes: '492227445', inBitsRate: 1093838.8 },
            { linkId: '2816', outBytes: '4000074817', outBitsRate: 8889055.12, inBytes: '0', inBitsRate: 0 },
            { linkId: '513', outBytes: '0', outBitsRate: 0, inBytes: '1444814826', inBitsRate: 3210699.6 },
            { linkId: '768', outBytes: '4370006099', outBitsRate: 9711124.64, inBytes: '0', inBitsRate: 0 },
            { linkId: '512', outBytes: '3894190397', outBitsRate: 8653756.4, inBytes: '0', inBitsRate: 0 },
            { linkId: '769', outBytes: '0', outBitsRate: 0, inBytes: '1877580759', inBitsRate: 4172401.68 },
            { linkId: '2304', outBytes: '3767761711', outBitsRate: 8372803.84, inBytes: '0', inBitsRate: 0 },
            { linkId: '1537', outBytes: '0', outBitsRate: 0, inBytes: '367986916', inBitsRate: 817748.72 },
            { linkId: '1280', outBytes: '4040444894', outBitsRate: 8978766.4, inBytes: '0', inBitsRate: 0 },
            { linkId: '2048', outBytes: '4682050724', outBitsRate: 10404557.2, inBytes: '0', inBitsRate: 0 }
          ]
        }
      }
    },
    data2: {
      status: 200,
      data: {
        code: 200,
        data: {
          resultType: 'table',
          result: [{
            outLinkDirection: '太原',
            inLinkDirection: '西宁',
            outBytes: '2407509269',
            outBitsRate: 5350020.56,
            inBytes: '193368911',
            inBitsRate: 429708.72
          }, {
            outLinkDirection: '西安',
            inLinkDirection: '西安',
            outBytes: '3609358392',
            outBitsRate: 8020796.4,
            inBytes: '345009143',
            inBitsRate: 766686.96
          }, {
            outLinkDirection: '西宁',
            inLinkDirection: '西安',
            outBytes: '1273508499',
            outBitsRate: 2830018.88,
            inBytes: '122646511',
            inBitsRate: 272547.84
          }, {
            outLinkDirection: '太原',
            inLinkDirection: '太原',
            outBytes: '14840136119',
            outBitsRate: 32978080.24,
            inBytes: '3386427658',
            inBitsRate: 7525394.8
          }, {
            outLinkDirection: '西安',
            inLinkDirection: '太原',
            outBytes: '7070361369',
            outBitsRate: 15711914.16,
            inBytes: '1853445429',
            inBitsRate: 4118767.6
          }, {
            outLinkDirection: '西宁',
            inLinkDirection: '太原',
            outBytes: '2619231460',
            outBitsRate: 5820514.32,
            inBytes: '291561196',
            inBitsRate: 647913.76
          }, {
            outLinkDirection: '',
            inLinkDirection: '',
            outBytes: '409939183007',
            outBitsRate: 910975962.24,
            inBytes: '70387178681',
            inBitsRate: 156415952.64
          }, {
            outLinkDirection: '太原',
            inLinkDirection: '西安',
            outBytes: '7808050741',
            outBitsRate: 17351223.84,
            inBytes: '1001570985',
            inBitsRate: 2225713.28
          }, {
            outLinkDirection: '西宁',
            inLinkDirection: '西宁',
            outBytes: '337068337',
            outBitsRate: 749040.72,
            inBytes: '165230290',
            inBitsRate: 367178.4
          }, {
            outLinkDirection: '西安',
            inLinkDirection: '西宁',
            outBytes: '1508798824',
            outBitsRate: 3352886.24,
            inBytes: '133628244',
            inBitsRate: 296951.68
          }]
        }
      }
    }
  },
  empty: {
    data1: {
      status: 200,
      data: { code: 200, data: { resultType: 'table', result: [] }, msg: 'OK' }
    },
    data2: {
      status: 200,
      data: { code: 200, data: { resultType: 'table', result: [] }, msg: 'OK' }
    }
  },
  boundary: {
    data1: {
      status: 200,
      data: {
        code: 200,
        queryKey: '549b4c3bcabf0feee193b834671879de',
        data: {
          result: [
            {
              linkId: '257',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '493739879',
              inBitsRate: 0
            }, {
              linkId: '256',
              outBytes: '4147998874',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '1024',
              outBytes: '4229808296',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '1793',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '604840505',
              inBitsRate: 0
            }, {
              linkId: '2817',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '430811638',
              inBitsRate: 0
            }, {
              linkId: '0',
              outBytes: '819878366014',
              outBitsRate: 1821951924.48,
              inBytes: '140774357362',
              inBitsRate: 312831905.28
            }, {
              linkId: '1281',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '544675122',
              inBitsRate: 0
            }, {
              linkId: '2049',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '711346274',
              inBitsRate: 0
            }, {
              linkId: '1536',
              outBytes: '4195896971',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '2305',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '524865003',
              inBitsRate: 0
            }, {
              linkId: '1792',
              outBytes: '4145790227',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '1025',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '492227445',
              inBitsRate: 0
            }, {
              linkId: '2816',
              outBytes: '4000074817',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '513',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '1444814826',
              inBitsRate: 0
            }, {
              linkId: '768',
              outBytes: '4370006099',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '512',
              outBytes: '3894190397',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '769',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '1877580759',
              inBitsRate: 0
            }, {
              linkId: '2304',
              outBytes: '3767761711',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '1537',
              outBytes: '0',
              outBitsRate: 0,
              inBytes: '367986916',
              inBitsRate: 0
            }, {
              linkId: '1280',
              outBytes: '4040444894',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }, {
              linkId: '2048',
              outBytes: '4682050724',
              outBitsRate: 100000000000.00,
              inBytes: '0',
              inBitsRate: 0
            }]
        }
      }
    },
    data2: {
      status: 200,
      data: {
        code: 200,
        data: {
          resultType: 'table',
          result: [{
            outLinkDirection: '太原',
            inLinkDirection: '西宁',
            outBytes: '2407509269',
            outBitsRate: 0,
            inBytes: '193368911',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '西安',
            inLinkDirection: '西安',
            outBytes: '3609358392',
            outBitsRate: 0,
            inBytes: '345009143',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '西宁',
            inLinkDirection: '西安',
            outBytes: '1273508499',
            outBitsRate: 0,
            inBytes: '122646511',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '太原',
            inLinkDirection: '太原',
            outBytes: '14840136119',
            outBitsRate: 0,
            inBytes: '3386427658',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '西安',
            inLinkDirection: '太原',
            outBytes: '7070361369',
            outBitsRate: 0,
            inBytes: '1853445429',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '西宁',
            inLinkDirection: '太原',
            outBytes: '2619231460',
            outBitsRate: 0,
            inBytes: '291561196',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '',
            inLinkDirection: '',
            outBytes: '409939183007',
            outBitsRate: 0,
            inBytes: '70387178681',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '太原',
            inLinkDirection: '西安',
            outBytes: '7808050741',
            outBitsRate: 0,
            inBytes: '1001570985',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '西宁',
            inLinkDirection: '西宁',
            outBytes: '337068337',
            outBitsRate: 0,
            inBytes: '165230290',
            inBitsRate: 10000000000000.00
          }, {
            outLinkDirection: '西安',
            inLinkDirection: '西宁',
            outBytes: '1508798824',
            outBitsRate: 0,
            inBytes: '133628244',
            inBitsRate: 10000000000000.00
          }]
        },
        msg: 'OK'
      }
    }
  },
  equalValue: {
    data1: {
      "status": 200,
      data: {
        "data": {
          "resultType": "table",
          "result": [
            {
              "linkId": "1025",
              "outBytes": "0",
              "outBitsRate": 0.0,
              "inBytes": "104870932",
              "inBitsRate": 38841.12
            },
            {
              "linkId": "512",
              "outBytes": "104870932",
              "outBitsRate": 38841.12,
              "inBytes": "0",
              "inBitsRate": 0.0
            }
          ]
        }
      }
    },
    data2: {
      "status": 200,
      "data": {
        "data": {
          "resultType": "table",
          "result": [
            {
              "outLinkDirection": "太原",
              "inLinkDirection": "西宁",
              "outBytes": "104870932",
              "outBitsRate": 38841.12,
              "inBytes": "104870932",
              "inBitsRate": 38841.12
            }
          ]
        }
      }
    }
  }
}

export const linkInfoData = [{ linkId: 256, interfaceName: 'Hundredgige1', direction: 0, peerCity: '西安', bandwidth: 100000000000 }, { linkId: 257, interfaceName: 'Hundredgige1', direction: 1, peerCity: '西安', bandwidth: 100000000000 }, { linkId: 512, interfaceName: 'Hundredgige2', direction: 0, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 513, interfaceName: 'Hundredgige2', direction: 1, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 768, interfaceName: 'Hundredgige3', direction: 0, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 769, interfaceName: 'Hundredgige3', direction: 1, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 1024, interfaceName: 'Hundredgige4', direction: 0, peerCity: '西宁', bandwidth: 100000000000 }, { linkId: 1025, interfaceName: 'Hundredgige4', direction: 1, peerCity: '西宁', bandwidth: 100000000000 }, { linkId: 1280, interfaceName: 'Hundredgige5', direction: 0, peerCity: '西安', bandwidth: 100000000000 }, { linkId: 1281, interfaceName: 'Hundredgige5', direction: 1, peerCity: '西安', bandwidth: 100000000000 }, { linkId: 1536, interfaceName: 'Hundredgige6', direction: 0, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 1537, interfaceName: 'Hundredgige6', direction: 1, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 1792, interfaceName: 'Hundredgige7', direction: 0, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 1793, interfaceName: 'Hundredgige7', direction: 1, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 2048, interfaceName: 'Hundredgige8', direction: 0, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 2049, interfaceName: 'Hundredgige8', direction: 1, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 2304, interfaceName: 'Hundredgige9', direction: 0, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 2305, interfaceName: 'Hundredgige9', direction: 1, peerCity: '太原', bandwidth: 100000000000 }, { linkId: 2816, interfaceName: 'Hundredgige10', direction: 0, peerCity: '西安', bandwidth: 100000000000 }, { linkId: 2817, interfaceName: 'Hundredgige10', direction: 1, peerCity: '西安', bandwidth: 100000000000 }]
