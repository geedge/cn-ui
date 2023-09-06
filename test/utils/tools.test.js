import { computeScore } from '@/utils/tools'
import { zeroData, undefinedData } from './mockData/score'

describe('computeScore测试', () => {
  test('含0', () => {
    expect(computeScore(zeroData)).toEqual(6)
  })
  test('含undefined', () => {
    expect(computeScore(undefinedData)).toEqual('-')
  })
})
