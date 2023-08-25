import axios from 'axios'
import { storageKey } from '@/utils/constants'
import store from '@/store'

const CancelToken = axios.CancelToken

axios.interceptors.request.use(config => {
  const token = localStorage.getItem(storageKey.token)
  // 添加http请求终止方法
  const arr = []
  const cancelToken = new CancelToken(function executor (c) {
    arr.push(c)
    store.commit('setHttpCancel', arr)
  })
  // 登录超时，将参数q的+变为空格
  if (config.params && config.params.q && config.params.q.length > 0) {
    let q = config.params.q
    if (q.indexOf('+') > -1) {
      q = q.replace(/\+/g, ' ')
    }
    config.params.q = q
  }

  config.cancelToken = cancelToken
  if (token) {
    config.headers['Cn-Authorization'] = token // 请求头token
  }
  return config
},
err => Promise.reject(err)
)
const accountErrorCode = [518003, 518004, 518005, 518006, 518007, 518008] // 账号锁定等
const licenceErrorCode = [711001]

// 若get请求的url中带问号，则将url上的参数截取，改为对象形式传参
axios.interceptors.request.use(
  config => {
    if (config.method === 'get') {
      const url = config.url
      const index = url.indexOf('?')
      if (index > -1) {
        const pre = url.substring(0, index)
        const suf = url.substring(index + 1, url.length)
        const paramsArr = suf.split('&')
        const params = {}
        paramsArr.forEach(p => {
          const i = p.indexOf('=')
          if (i > -1) {
            params[p.substring(0, i)] = p.substring(i + 1, p.length)
          } else {
            params[p] = ''
          }
        })
        config = { ...config, url: pre, params: params }
      }
    }
    return config
  }
)
axios.interceptors.response.use(
  response => {
    if (licenceErrorCode.indexOf(response.data.code) !== -1) {
      localStorage.removeItem(storageKey.token)
      window.location.href = '/'
    } else if (accountErrorCode.indexOf(response.data.code) !== -1) {
      localStorage.removeItem(storageKey.token)
      window.location.href = '/'
    }
    return response
  },
  error => {
    return Promise.reject(error)
  }
)
export function getForDebug (url, params) {
  return new Promise((resolve) => {
    axios.get(url, {
      params: params
    }).then(response => {
      resolve(response)
    }).catch(err => {
      if (err.response) {
        resolve(err.response)
      } else if (err.message) {
        resolve(err.message)
      }
    })
  })
}

export function postForDebug (url, params, headers) {
  return new Promise(resolve => {
    axios.post(url, params, { headers: headers }).then(response => {
      resolve(response, response)
    }).catch(err => {
      if (err.response) {
        resolve(err.response)
      } else if (err.message) {
        resolve(err.message)
      }
    })
  })
}
