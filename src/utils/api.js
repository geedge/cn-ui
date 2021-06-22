/**
 * @author 陈劲松
 * @date 2021/6/11
 * @description 1.定义api；2.定义通用查询方法，函数名应为 获取详情getItem、获取列表getItemList。例如getUser、getUserList
*/
import { get, post } from '@/utils/http'
import { sortByOrderNum } from '@/permission'

export const api = {
  // 系统相关
  permission: '/sys/user/permissions',
  i18n: '/sys/i18n/lang',
  dict: '/sys/dict',
  // 业务
  panel: '/visual/panel',
  chart: '/visual/chart'
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
/* 字典 */
export async function getDictList (params) {
  return await getData(api.dict, params, true)
}

export async function getData (url, params = {}, isQueryList) {
  const request = new Promise(resolve => {
    get(url, params).then(response => {
      if (response.code === 200) {
        resolve(isQueryList ? response.data.list : response.data)
      }
    })
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
  const request = new Promise(resolve => {
    get(api.i18n, { l: langs }).then(response => {
      resolve(response.data)
    })
  })
  return await request
}
