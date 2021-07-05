/**
 * 缓存
 * @author 陈劲松
 * @date 2021/6/30
*/

const cache = {
  capitalGeo: null
}

export function getCache (key, defaultValue = null) {
  return cache[key] ? cache[key] : defaultValue
}

export function setCache (key, value) {
  cache[key] = value
}
