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
            userDefinedTag: {
              id: 1,
              tagValue: '门户网站',
              updateTime: 1685696500,
              createTime: 1685696500,
              isValid: 1
            }
          },
          {
            userDefinedTag: {
              id: 1,
              tagValue: '用户tag',
              updateTime: 1685696500,
              createTime: 1685696500,
              isValid: 1
            }
          }
        ]
      },
      msg: 'OK'
    }
  }
}

export default mockData
