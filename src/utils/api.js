/**
 * @author 陈劲松
 * @date 2021/6/11
 * @description 1.定义api；2.定义通用查询方法，函数名应为 获取详情getItem、获取列表getItemList。例如getUser、getUserList
*/
import { get, post } from '@/utils/http'
import axios from 'axios'
import { sortByOrderNum } from '@/permission'
import { storageKey } from '@/utils/constants'

export const api = {
  // 系统相关
  permission: '/sys/user/permissions',
  i18n: '/sys/i18n/lang',
  dict: '/sys/dict',
  user: '/sys/user',
  role: '/sys/role',
  galaxyProxy: '/galaxy/setting',
  operationLog: '/sys/log',
  chartList: '/visual/chart/list',
  // 业务
  panel: '/visual/panel',
  chart: '/visual/chart',
  entityList: '/interface/entity/list',
  entityCount: '/interface/entity/total',
  entityFilter: '/interface/entity/filter',
  ipThroughput: '/interface/entity/ip/detail/throughput',
  domainThroughput: '/interface/entity/domain/detail/throughput',
  appThroughput: '/interface/entity/app/detail/throughput',
  filterTop: '/interface/entity/filter/top'
}

/* panel */
export async function getPanelList (params) {
  return await getData(api.panel, params, true)
}
export async function getPanel (id) {
  return await getData(`${api.chart}/${id}`)
}
/* chart */
export async function getChartList (params) {
  return await getData(api.chart, params, true)
}
export async function getChart (id) {
  return await getData(`${api.chart}/${id}`)
}
/* entity列表 */
export async function getEntityList (params) {
  return await getData(api.entityList, params, true)
}
/* entity总数 */
export async function getEntityCount (params) {
  return await getData(api.entityCount, params)
}
/* ip类型entity过滤器数据 */
export async function getEntityFilter (params) {
  return await getData(api.entityFilter, params, true)
}
/* 字典 */
export async function getDictList (params) {
  return await getData(api.dict, params, true)
}

export async function getData (url, params = {}, isQueryList) {
  const request = new Promise((resolve, reject) => {
    try {
      get(url, params).then(response => {
        if (response.code === 200) {
          resolve(isQueryList ? response.data.list || response.data.result : response.data.result || response.data)
        } else {
          reject(response)
        }
      })
    } catch (e) {
      reject(e)
    }
  }).catch(response => {
    console.error(response)
  })
  return await request
}

export async function getConfigJson () {
  const request = new Promise(resolve => {
    get(`${process.env.BASE_URL}config.json?Timestamp=${new Date().getTime()}`).then(config => {
      resolve(config)
    })
  })
  return await request
}

export async function getPermission () {
  const request = new Promise(resolve => {
    post(api.permission, { token: sessionStorage.getItem('cn-token') }).then(response => {
      resolve({
        menuList: sortByOrderNum(response.data.menus),
        buttonList: response.data.buttons,
        roleList: response.data.roles
      })
    })
  })
  return await request
}

export async function getI18n () {
  const dictData = await getDictList()
  const langs = dictData.map(d => d.value).join(',')
  sessionStorage.setItem(storageKey.languages, langs)
  const request = new Promise(resolve => {
    get(api.i18n, { l: langs }).then(response => {
      response.data.cn = response.data.zh
      resolve(response.data)
    })
  })
  return await request
}

/* 获得原始的3611-2 json字符串数据 */
export async function getIso36112JsonData (suffix) {
  const request = new Promise(resolve => {
    axios({
      url: `${window.location.protocol}//${window.location.host}:${window.location.port}/geojson/${suffix}.json`
    }).then(response => {
      resolve(response.data || response || null)
    })
  })
  return await request
}
