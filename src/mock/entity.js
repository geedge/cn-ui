import Mock from 'mockjs'

const openMock = true
if (openMock) {
  Mock.mock(new RegExp(BASE_CONFIG.baseUrl + 'interface/entityDetail/totalTrafficAnalysis.*'), 'get', function (requestObj) {
    const titleList = ['totalBitsRate', 'inboundBitsRate', 'outboundBitsRate', 'internalBitsRate', 'throughBitsRate', 'other']
    const arr = [{ type: 'Bits/s' }, { type: 'Packets/s' }, { type: 'Sessions/s' }]

    const endTime = JSON.parse(getQuery(requestObj.url).endTime)
    let step = 0
    for (let i = 0; i < arr.length; i++) {
      for (const j in titleList) {
        let startTime = JSON.parse(getQuery(requestObj.url).startTime)
        step = (endTime - startTime) / 100 // 每条数据的时间间隔

        const values = []
        let max = 2975
        let min = 0
        if (titleList[j] === 'totalBitsRate') {
          max = 4462975
          min = 1162975
        }
        for (let i = 0; i < 101; i++) {
          const random = Math.floor(Math.random() * (max - min) + min)
          values.push([startTime, random])
          startTime += step
        }

        const newValues = JSON.parse(JSON.stringify(values))
        const sortArr = newValues.sort((a, b) => a[1] - b[1])
        const maxAnalysis = Math.floor(sortArr[sortArr.length - 1][1])
        let avg = 0
        let sum = 0
        newValues.forEach((item) => {
          sum += item[1]
        })
        avg = JSON.parse(sum / newValues.length)

        const analysis = {
          avg: avg,
          max: maxAnalysis,
          min: Math.floor(sortArr[0][1]),
          p95: maxAnalysis * 0.95 // 模拟值，p95并未最大值的95%
        }

        // Metric为Packets/s时，没有other的tab选项
        if (arr[i].type === 'Packets/s' && titleList[j] === 'other') {
          analysis.avg = 0
        }

        if (arr[i].type === 'Sessions/s') {
          // Metric为Sessions/s时，只有total选项，故total填充数据完毕终止循环，节省性能
          arr[i].totalBitsRate = { values: values, analysis: analysis }
          break
        } else {
          arr[i][titleList[j]] = { values: values, analysis: analysis }
        }
      }
    }

    return {
      msg: 'success',
      code: 200,
      data: {
        result: arr
      }
    }
  })
}

const getQuery = (url) => {
  // str为？之后的参数部分字符串
  const str = url.substr(url.indexOf('?') + 1)
  // arr每个元素都是完整的参数键值
  const arr = str.split('&')
  // result为存储参数键值的集合
  const result = {}
  for (let i = 0; i < arr.length; i++) {
    // item的两个元素分别为参数名和参数值
    const item = arr[i].split('=')
    result[item[0]] = item[1]
  }
  return result
}
