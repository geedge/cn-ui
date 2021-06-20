/**
 * @author 陈劲松
 * @date 2021/6/11
 * @description 1.定义api；2.定义通用查询函数，函数名应为 获取详情getItem、获取列表getItemList。例如getUser、getUserList
*/
import { get } from '@/utils/http'

export const api = {
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

export async function getData (url, params = {}, isQueryList) {
  const request = new Promise((resolve, reject) => {
    get(url, params).then(response => {
      if (response.code === 200) {
        resolve(isQueryList ? response.data.list : response.data)
      }
    })
  })
  return await request
}
