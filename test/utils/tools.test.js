import { computeScore } from '@/utils/tools'
import { zeroData, undefinedData, commonScoreBase, commonData, commonData2, commonScoreBase2 } from './mockData/score'

describe('computeScore测试', () => {
  test('含0', () => {
    expect(computeScore(zeroData, commonScoreBase)).toEqual(6)
  })
  test('含undefined', () => {
    expect(computeScore(undefinedData, commonScoreBase)).toEqual('-')
  })
  test('普通数据', () => {
    expect(computeScore(commonData, commonScoreBase)).toEqual(4)
  })
  test('普通数据2', () => {
    expect(computeScore(commonData2, commonScoreBase2)).toEqual(4)
  })
})
