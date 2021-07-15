const shortList = [' ', 'K', 'M', 'G', 'T', 'Quadrillion', 'Quintillion']
function asciiCompute (num, ascii, units, dot = 2) {
  if (!num && num !== 0 && num !== '0') {
    return ''
  }
  num = Number(num)
  let carry = 0
  if (num > 1) {
    const log = Math.log(num) / Math.log(ascii)
    carry = parseInt(log)
    num = num / Math.pow(ascii, carry)
  }
  if (Number.isInteger(num)) {
    return num + ' ' + units[carry]
  } else {
    return num.toFixed(dot) + ' ' + units[carry]
  }
}
export function shortFormatter (value, index, dot = 2) {
  return asciiCompute(value, 1000, shortList, dot)
}
export function tooltipShortFormatter (obj, index, callback, dot = 2) {
  return asciiCompute(obj.value, 1000, shortList, dot)
}
