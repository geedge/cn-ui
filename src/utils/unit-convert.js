import { unitTypes } from '@/utils/constants'

const numberUnit = ['', 'K', 'M', 'G', 'T', 'P', 'E']
const byteUnit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']
const timeUnit = [ // 时间单位步进倍数，以ms为基数
  { unit: 'ms', step: 1 },
  { unit: 's', step: 1000 },
  { unit: 'm', step: 60 },
  { unit: 'h', step: 60 },
  { unit: 'd', step: 24 }
]
function asciiCompute (num, ascii = 1000, units, dot = 2) {
  if (!num && num !== 0 && num !== '0') {
    return ['', '']
  }
  num = Number(num)
  let carry = 0
  if (num > 1) {
    const log = Math.log(num) / Math.log(ascii)
    carry = parseInt(log)
    num = num / Math.pow(ascii, carry)
  }
  if (Number.isInteger(num)) {
    return [num, units[carry]]
  } else {
    return [num.toFixed(dot), units[carry]]
  }
}

export function numberUnitConvert (value, sourceUnit, targetUnit, dot = 2) {
  return asciiCompute(value, 1000, numberUnit, dot)
}
export function byteUnitConvert (value, sourceUnit = 'B', targetUnit, dot = 2) {
  return asciiCompute(value, 1024, byteUnit, dot)
}
/* 时间单位转换，例如将ms转为h */
export function timeUnitFormatter (time, sourceUnit = 'ms', targetUnit, dot = 2) {
  let sourceIndex = -1
  let targetIndex = -1
  timeUnit.forEach((t, i) => {
    sourceUnit === t.unit && (sourceIndex = i)
    targetUnit && targetUnit === t.unit && (targetIndex = i)
  })
  let multi = 1
  let result = parseFloat(time)
  if (targetIndex < 0) {
    while (sourceIndex < timeUnit.length - 1 && result > timeUnit[sourceIndex + 1].step) {
      sourceIndex++
      multi = timeUnit[sourceIndex].step
      result /= multi
    }
    return [multi === 1 ? result : result.toFixed(dot), timeUnit[sourceIndex].unit]
  } else {
    timeUnit.forEach((s, i) => {
      if (i <= targetIndex) {
        multi *= s.step
      }
    })
    result /= multi
    return [result.toFixed(dot), targetUnit]
  }
}

/* 单位转换，返回转换后的[value, unit] */
// unitType = time / number / byte
export default function unitConvert (value, unitType, sourceUnit, targetUnit, dot = 2) {
  if (unitType === unitTypes.string) {
    if (value) {
      if (typeof value === 'string') {
        return [value, '']
      } else {
        return ['-', '']
      }
    } else {
      return ['-', '']
    }
  }
  if (!value && value !== 0) {
    return ['-', '']
  } else {
    switch (unitType) {
      case unitTypes.time: {
        return timeUnitFormatter(value, sourceUnit, targetUnit, dot)
      }
      case unitTypes.percent:
      case unitTypes.number: {
        return numberUnitConvert(value, sourceUnit, targetUnit, dot)
      }
      case unitTypes.byte: {
        return byteUnitConvert(value, sourceUnit, targetUnit, dot)
      }
    }
  }
}

export function getUnitType (column) {
  if (column) {
    switch (column.toLowerCase()) {
      case 'time': {
        return unitTypes.time
      }
      case 'bytes': {
        return unitTypes.byte
      }
      case 'sessions':
      default: {
        return unitTypes.number
      }
    }
  } else {
    return unitTypes.number
  }
}
