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
/* 时间单位转换，例如将ms转为h */
const timeStep = [ // 步进倍数，以ms为基数
  { unit: 'ms', step: 1 },
  { unit: 's', step: 1000 },
  { unit: 'm', step: 60 },
  { unit: 'h', step: 60 },
  { unit: 'd', step: 24 }
]
export function timeUnitFormatter (time, sourceUnit = 'ms', targetUnit, dot = 2) {
  let sourceIndex = -1
  let targetIndex = -1
  timeStep.forEach((t, i) => {
    sourceUnit === t.unit && (sourceIndex = i)
    targetUnit && targetUnit === t.unit && (targetIndex = i)
  })
  let multi = 1
  let result = parseFloat(time)
  if (targetIndex < 0) {
    while (sourceIndex < timeStep.length - 1 && result > timeStep[sourceIndex + 1].step) {
      sourceIndex++
      multi = timeStep[sourceIndex].step
      result /= multi
    }
    return [multi === 1 ? result : result.toFixed(dot), timeStep[sourceIndex].unit]
  } else {
    timeStep.forEach((s, i) => {
      if (i <= targetIndex) {
        multi *= s.step
      }
    })
    result /= multi
    return [result.toFixed(dot), targetUnit]
  }
}
