import { unitTypes } from '@/utils/constants'
import _ from 'lodash'

const numberUnit = ['', 'K', 'M', 'G', 'T', 'P', 'E']
const byteUnit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']
const bpsUnit = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps']
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
export function bpsUnitConvert (value, sourceUnit, targetUnit, dot = 2) {
  return asciiCompute(value, 1000, bpsUnit, dot)
}
export function byteUnitConvert (value, unitType, sourceUnit = 'B', targetUnit, dot = 2) {
  return asciiCompute(value, 1024, byteUnit, dot)
}
/* 时间单位转换，例如将ms转为h */
export function timeUnitFormatter (time, sourceUnit = 'ms', targetUnit, dot = 2) {
  if (!_.isNumber(time) || time === 0) {
    return [0, sourceUnit]
  }
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
// unitType = time / number / byte / percent
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
      case unitTypes.percent: {
        const r = (value * 100).toFixed(dot)
        if (_.isNaN(r)) {
          return ['-', '']
        } else {
          return [r, '%']
        }
      }
      case unitTypes.number: {
        return numberUnitConvert(value, sourceUnit, targetUnit, dot)
      }
      case unitTypes.bps: {
        return bpsUnitConvert(value, sourceUnit, targetUnit, dot)
      }
      case unitTypes.byte: {
        return byteUnitConvert(value, unitType, sourceUnit, targetUnit, dot)
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

/* 单位转换，返回转换后的[value, unit]，type=time时若value<1ms，返回<1ms，type=percent时若value<0.01%，返回<0.01% */
export function valueToRangeValue (value, unitType) {
  const values = unitConvert(Number(value), unitType)
  if (values[0] || values[0] === 0) {
    switch (unitType) {
      case unitTypes.time: {
        if (values[0] < 1) {
          return ['<1', 'ms']
        }
        break
      }
      case unitTypes.percent: {
        if (values[0] < 0.01) {
          return ['<0.01', '%']
        }
        break
      }
      default: break
    }
  }
  return values
}
