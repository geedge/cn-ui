const mockData = {
  // 空
  empty: {
    status: 200,
    data: {
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
      status: 200,
      data: {
        code: 200,
        data: {
          resultType: 'object',
          result: []
        },
        msg: 'OK'
      }
    }
  },
  // 正常数据
  common: {
    status: 200,
    data: {
      code: 200,
      data: {
        resultType: 'object',
        result: [
          {
            location: {
              isp: 'dba Omsoft',
              updateTime: 1685696510,
              createTime: 1685696510,
              isValid: 1
            }
          },
          {
            malware: {
              threatType: 'command and control',
              malwareName: 'IcedID',
              malwareAlias: 'BokBot,IceID',
              updateTime: 1685696510,
              createTime: 1685696510,
              isValid: 1
            }
          },
          {
            darkweb: {
              nodeType: 'i2p',
              updateTime: 1685696510,
              createTime: 1685696510,
              isValid: 1
            }
          },
          {
            tags: {
              id: 1,
              name: '门户网站',
              updateTime: 1685696500,
              createTime: 1685696500,
              isValid: 1,
              intent: 'Unknow'
            }
          },
          {
            tags: {
              id: 1,
              name: '用户tag',
              updateTime: 1685696500,
              createTime: 1685696500,
              isValid: 1,
              intent: 'Benign'
            }
          }
        ]
      },
      msg: 'OK'
    }
  }
}

export default mockData
