export const mockData = {
  common: {
    data1: {
      status: 200,
      data: { code: 200, queryKey: '549b4c3bcabf0feee193b834671879de', success: true, message: null, statistics: { elapsed: 3, rows_read: 11480, bytes_read: 459200, result_size: 1214, result_rows: 21 }, job: null, formatType: 'json', meta: [{ name: 'link_id', type: 'string', category: 'Dimension' }, { name: 'out_bytes', type: 'long', category: 'Metric' }, { name: 'in_bytes', type: 'long', category: 'Metric' }], data: { resultType: 'table', result: [{ linkId: '257', outBytes: '0', outBitsRate: 0, inBytes: '493739879', inBitsRate: 1097199.76 }, { linkId: '256', outBytes: '4147998874', outBitsRate: 9217775.28, inBytes: '0', inBitsRate: 0 }, { linkId: '1024', outBytes: '4229808296', outBitsRate: 9399574, inBytes: '0', inBitsRate: 0 }, { linkId: '1793', outBytes: '0', outBitsRate: 0, inBytes: '604840505', inBitsRate: 1344090 }, { linkId: '2817', outBytes: '0', outBitsRate: 0, inBytes: '430811638', inBitsRate: 957359.2 }, { linkId: '0', outBytes: '819878366014', outBitsRate: 1821951924.48, inBytes: '140774357362', inBitsRate: 312831905.28 }, { linkId: '1281', outBytes: '0', outBitsRate: 0, inBytes: '544675122', inBitsRate: 1210389.12 }, { linkId: '2049', outBytes: '0', outBitsRate: 0, inBytes: '711346274', inBitsRate: 1580769.52 }, { linkId: '1536', outBytes: '4195896971', outBitsRate: 9324215.52, inBytes: '0', inBitsRate: 0 }, { linkId: '2305', outBytes: '0', outBitsRate: 0, inBytes: '524865003', inBitsRate: 1166366.64 }, { linkId: '1792', outBytes: '4145790227', outBitsRate: 9212867.2, inBytes: '0', inBitsRate: 0 }, { linkId: '1025', outBytes: '0', outBitsRate: 0, inBytes: '492227445', inBitsRate: 1093838.8 }, { linkId: '2816', outBytes: '4000074817', outBitsRate: 8889055.12, inBytes: '0', inBitsRate: 0 }, { linkId: '513', outBytes: '0', outBitsRate: 0, inBytes: '1444814826', inBitsRate: 3210699.6 }, { linkId: '768', outBytes: '4370006099', outBitsRate: 9711124.64, inBytes: '0', inBitsRate: 0 }, { linkId: '512', outBytes: '3894190397', outBitsRate: 8653756.4, inBytes: '0', inBitsRate: 0 }, { linkId: '769', outBytes: '0', outBitsRate: 0, inBytes: '1877580759', inBitsRate: 4172401.68 }, { linkId: '2304', outBytes: '3767761711', outBitsRate: 8372803.84, inBytes: '0', inBitsRate: 0 }, { linkId: '1537', outBytes: '0', outBitsRate: 0, inBytes: '367986916', inBitsRate: 817748.72 }, { linkId: '1280', outBytes: '4040444894', outBitsRate: 8978766.4, inBytes: '0', inBitsRate: 0 }, { linkId: '2048', outBytes: '4682050724', outBitsRate: 10404557.2, inBytes: '0', inBitsRate: 0 }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20arrayJoin%28splitByChar%28%27_%27%2C%20concat%28toString%28common_out_link_id%29%2C%20%27_%27%2C%20toString%28common_in_link_id%29%29%29%29%20AS%20link_id%2CSUM%28IF%28toString%28common_out_link_id%29%20%3D%20link_id%2C%20traffic_outbound_byte%2C%200%29%29%20AS%20out_bytes%2CSUM%28IF%28toString%28common_in_link_id%29%20%3D%20link_id%2C%20traffic_inbound_byte%2C%200%29%29%20AS%20in_bytes%20FROM%20metric_link%20WHERE%20stat_time%20%3E%3D%201675303793%20AND%20stat_time%20%3C%201675307393%20GROUP%20BY%20link_id&format=json&option=real-time', msg: 'OK' }
    },
    data2: {
      status: 200,
      data: { code: 200, queryKey: 'ee2e820b1275748167cdee82b2b4ea40', success: true, message: null, statistics: { elapsed: 3, rows_read: 11480, bytes_read: 618564, result_size: 1053, result_rows: 10 }, job: null, formatType: 'json', meta: [{ name: 'out_link_direction', type: 'string', category: 'Dimension' }, { name: 'in_link_direction', type: 'string', category: 'Dimension' }, { name: 'out_bytes', type: 'long', category: 'Metric' }, { name: 'in_bytes', type: 'long', category: 'Metric' }], data: { resultType: 'table', result: [{ outLinkDirection: '太原', inLinkDirection: '西宁', outBytes: '2407509269', outBitsRate: 5350020.56, inBytes: '193368911', inBitsRate: 429708.72 }, { outLinkDirection: '西安', inLinkDirection: '西安', outBytes: '3609358392', outBitsRate: 8020796.4, inBytes: '345009143', inBitsRate: 766686.96 }, { outLinkDirection: '西宁', inLinkDirection: '西安', outBytes: '1273508499', outBitsRate: 2830018.88, inBytes: '122646511', inBitsRate: 272547.84 }, { outLinkDirection: '太原', inLinkDirection: '太原', outBytes: '14840136119', outBitsRate: 32978080.24, inBytes: '3386427658', inBitsRate: 7525394.8 }, { outLinkDirection: '西安', inLinkDirection: '太原', outBytes: '7070361369', outBitsRate: 15711914.16, inBytes: '1853445429', inBitsRate: 4118767.6 }, { outLinkDirection: '西宁', inLinkDirection: '太原', outBytes: '2619231460', outBitsRate: 5820514.32, inBytes: '291561196', inBitsRate: 647913.76 }, { outLinkDirection: '', inLinkDirection: '', outBytes: '409939183007', outBitsRate: 910975962.24, inBytes: '70387178681', inBitsRate: 156415952.64 }, { outLinkDirection: '太原', inLinkDirection: '西安', outBytes: '7808050741', outBitsRate: 17351223.84, inBytes: '1001570985', inBitsRate: 2225713.28 }, { outLinkDirection: '西宁', inLinkDirection: '西宁', outBytes: '337068337', outBitsRate: 749040.72, inBytes: '165230290', inBitsRate: 367178.4 }, { outLinkDirection: '西安', inLinkDirection: '西宁', outBytes: '1508798824', outBitsRate: 3352886.24, inBytes: '133628244', inBitsRate: 296951.68 }] }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20out_link_direction%20AS%20out_link_direction%2C%20in_link_direction%20AS%20in_link_direction%2C%20SUM%28traffic_outbound_byte%29%20AS%20out_bytes%2C%20SUM%28traffic_inbound_byte%29%20AS%20in_bytes%20FROM%20metric_link%20WHERE%20stat_time%20%3E%3D%201675303793%20AND%20stat_time%20%3C%201675307393%20GROUP%20BY%20out_link_direction%2C%20in_link_direction&format=json&option=real-time', msg: 'OK' }
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
  }
}

export const linkInfoData = [{ originalLinkId: '256', linkId: 'Hundredgige1', direction: 'out', nextHop: '西安', bandwidth: 100000000000 }, { originalLinkId: '257', linkId: 'Hundredgige1', direction: 'in', nextHop: '西安', bandwidth: 100000000000 }, { originalLinkId: '512', linkId: 'Hundredgige2', direction: 'out', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '513', linkId: 'Hundredgige2', direction: 'in', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '768', linkId: 'Hundredgige3', direction: 'out', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '769', linkId: 'Hundredgige3', direction: 'in', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '1024', linkId: 'Hundredgige4', direction: 'out', nextHop: '西宁', bandwidth: 100000000000 }, { originalLinkId: '1025', linkId: 'Hundredgige4', direction: 'in', nextHop: '西宁', bandwidth: 100000000000 }, { originalLinkId: '1280', linkId: 'Hundredgige5', direction: 'out', nextHop: '西安', bandwidth: 100000000000 }, { originalLinkId: '1281', linkId: 'Hundredgige5', direction: 'in', nextHop: '西安', bandwidth: 100000000000 }, { originalLinkId: '1536', linkId: 'Hundredgige6', direction: 'out', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '1537', linkId: 'Hundredgige6', direction: 'in', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '1792', linkId: 'Hundredgige7', direction: 'out', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '1793', linkId: 'Hundredgige7', direction: 'in', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '2048', linkId: 'Hundredgige8', direction: 'out', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '2049', linkId: 'Hundredgige8', direction: 'in', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '2304', linkId: 'Hundredgige9', direction: 'out', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '2305', linkId: 'Hundredgige9', direction: 'in', nextHop: '太原', bandwidth: 100000000000 }, { originalLinkId: '2816', linkId: 'Hundredgige10', direction: 'out', nextHop: '西安', bandwidth: 100000000000 }, { originalLinkId: '2817', linkId: 'Hundredgige10', direction: 'in', nextHop: '西安', bandwidth: 100000000000 }]
