const mockData = {
  // 空
  empty: {
    data: {
      status: 200,
      code: 200,
      data: {
        resultType: 'object',
        result: []
      }
    }
  },
  bytes: {
    // 边界
    boundary: {
      data: {
        status: 200,
        code: 200,
        data: {
          resultType: 'object',
          result: [
            {
              type: 'bytes',
              totalBitsRate: {
                analysis: {
                  avg: '0'
                }
              },
              inboundBitsRate: {
                analysis: {
                  avg: '0'
                }
              },
              outboundBitsRate: {
                analysis: {
                  avg: '95229000000000000000'
                }
              },
              internalBitsRate: {
                analysis: {
                  avg: '0'
                }
              },
              throughBitsRate: {
                analysis: {
                  avg: '0'
                }
              },
              other: {
                analysis: {
                  avg: '0.01'
                }
              }
            },
            {
              type: 'packets'
            },
            {
              type: 'sessions'
            }
          ]
        },
        msg: 'OK'
      }
    }
  },
  // 正常数据
  common: {
    data: {
      status: 200,
      code: 200,
      data: {
        resultType: 'object',
        result: [
          {
            type: 'bytes',
            totalBitsRate: {
              values: [[1673247564, '96801019.52']],
              analysis: {
                avg: '112042808.24',
                max: '301842105.76',
                min: '52096324',
                p95: '168089003.35199997'
              }
            },
            inboundBitsRate: {
              values: [[1673247564, '11814508.48']],
              analysis: {
                avg: '18587597.36',
                max: '137528138.88',
                min: '3181142.88',
                p95: '49561521.447999954'
              }
            },
            outboundBitsRate: {
              values: [[1673247564, '84282965.52']],
              analysis: {
                avg: '87557861.44',
                max: '290402258',
                min: '45337684.48',
                p95: '121041718.81199999'
              }
            },
            internalBitsRate: {
              values: [[1673247564, '9125.12']],
              analysis: {
                avg: '278114.32',
                max: '2215460.48',
                min: '0',
                p95: '923494.5719999998'
              }
            },
            throughBitsRate: {
              values: [[1673247564, '694420.48']],
              analysis: {
                avg: '5619235.12',
                max: '42455480.24',
                min: '262607.76',
                p95: '13559588.195999999'
              }
            },
            other: {
              values: [[1673247564, '0.00']],
              analysis: {
                avg: '0.01',
                max: '0.08',
                min: '0.00',
                p95: '0.08'
              }
            }
          },
          {
            type: 'packets',
            totalPacketsRate: {
              values: [[1673247564, '12077.53']],
              analysis: {
                avg: '14062.37',
                max: '32840.42',
                min: '6564.17',
                p95: '20923.167999999987'
              }
            },
            inboundPacketsRate: {
              values: [[1673247564, '3865.58']],
              analysis: {
                avg: '4241.61',
                max: '15460.03',
                min: '1918.22',
                p95: '8549.799999999997'
              }
            },
            outboundPacketsRate: {
              values: [[1673247564, '8118.89']],
              analysis: {
                avg: '9170.98',
                max: '27134.58',
                min: '4510.25',
                p95: '13690.540999999996'
              }
            },
            internalPacketsRate: {
              values: [[1673247564, '15.89']],
              analysis: {
                avg: '35.95',
                max: '276.47',
                min: '0.00',
                p95: '122.49749999999999'
              }
            },
            throughPacketsRate: {
              values: [[1673247564, '77.17']],
              analysis: {
                avg: '613.82',
                max: '3768.56',
                min: '42.92',
                p95: '1279.757499999999'
              }
            },
            other: {
              values: [[1673247564, '0.00']],
              analysis: {
                avg: '0',
                max: '0.01',
                min: '0.00',
                p95: '0.01'
              }
            }
          },
          {
            type: 'sessions',
            totalSessionsRate: {
              values: [[1673247564, '29.92']],
              analysis: {
                avg: '29.89',
                max: '29.92',
                min: '29.67',
                p95: '29.92'
              }
            }
          }]
      },
      msg: 'OK'
    }
  }
}

export default mockData
