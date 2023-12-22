import AdvancedSearch from '@/components/advancedSearch/Index'
import { mount } from '@vue/test-utils'
import { mockData } from './mockData/AdvancedSearch'
import common from '@/mixins/common'

const fullText = true
const showList = true
const connectionList = [{ value: 'AND', label: 'AND' }]
const showHint = false
const noHighlight = false
const entityColumnList = mockData.entityColumnList
const entityDataset = mockData.entityDataset
const detectionColumnList = mockData.detectionColumnList
const detectionDataset = mockData.detectionDataset

let wrapper
function initWrapper ({ str = '', metaList = [], mode, columnList, dataset }) {
  const defaultMode = mode
  wrapper = mount(AdvancedSearch, {
    propsData: {
      defaultMode,
      fullText,
      showList,
      columnList,
      connectionList,
      showHint,
      noHighlight
    },
    data () {
      return {
        isUnitTesting: true,
        dataset: dataset,
        searchMode: mode,
        unitTestStr: str,
        metaList: metaList,
        q: '',
        str: ''
      }
    },
    mixins: [common]
  })
}

describe('components/advancedSearch/Index.vue测试', () => {
  test('1.entity--text模式下空搜索', async () => {
    const param = {
      str: '',
      mode: 'text',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const textSearchMode = wrapper.find('[test-id="text-search"]')
      await textSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe('')
      })
      resolve()
    }, 200))
  })
  test('2.entity--text模式下模糊搜索', async () => {
    const param = {
      str: "'8.8.8.8' AND 'baidu.com' AND baidu",
      mode: 'text',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const textSearchMode = wrapper.find('[test-id="text-search"]')
      await textSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("ip='8.8.8.8' AND domain like '%baidu.com' AND app like '%baidu%'")
      })
      resolve()
    }, 200))
  })
  test('3.entity--text模式下精准搜和模糊搜索', async () => {
    const param = {
      str: "ip='8.8.8.8' AND 'baidu.com' AND app='baidu'",
      mode: 'text',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const textSearchMode = wrapper.find('[test-id="text-search"]')
      await textSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("ip='8.8.8.8' AND domain like '%baidu.com' AND app='baidu'")
      })
      resolve()
    }, 200))
  })
  test('4.entity--text模式下多个一样的key=value转为key in (……)', async () => {
    const param = {
      str: "ip='6.6.6.6' AND ip='7.7.7.7' AND ip='8.8.8.8'",
      mode: 'text',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const textSearchMode = wrapper.find('[test-id="text-search"]')
      await textSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("ip IN ('6.6.6.6','7.7.7.7','8.8.8.8')")
      })
      resolve()
    }, 200))
  })
  test('5.entity--text模式下测试has函数', async () => {
    const param = {
      str: "has(tag,'mtproxy') AND ip.country='United States' AND 8.8.8.8",
      mode: 'text',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const textSearchMode = wrapper.find('[test-id="text-search"]')
      await textSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("has(tag,'mtproxy') AND ip.country='United States' AND ip='8.8.8.8'")
      })
      resolve()
    }, 200))
  })
  test('6.entity--tag模式下空搜索', async () => {
    const param = {
      metaList: [],
      mode: 'tag',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const tagSearchMode = wrapper.find('[test-id="tag-search"]')
      await tagSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe('')
      })
      resolve()
    }, 200))
  })
  test('7.entity--tag模式下模糊查询', async () => {
    const param = {
      metaList: [
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'ip',
            isEditing: false,
            show: false,
            isFullText: true
          },
          operator: {
            value: '=',
            isEditing: false,
            show: false
          },
          value: {
            value: '\'8.8.8.8\'',
            label: '\'8.8.8.8\'',
            isEditing: false,
            show: false
          }
        },
        {
          meta: 'connection',
          value: 'AND',
          isEditing: false
        },
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'domain',
            isEditing: false,
            show: false,
            isFullText: true
          },
          operator: {
            value: 'like',
            isEditing: false,
            show: false
          },
          value: {
            value: 'baidu.com',
            label: 'baidu.com',
            isEditing: false,
            show: false,
            label1: '%baidu.com'
          },
          isEditing: true
        },
        {
          meta: 'connection',
          value: 'AND',
          isEditing: false
        },
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'app',
            isEditing: false,
            show: false,
            isFullText: true
          },
          operator: {
            value: 'like',
            isEditing: false,
            show: false
          },
          value: {
            value: 'baidu',
            label: 'baidu',
            isEditing: false,
            show: false,
            label1: '%baidu%'
          },
          isEditing: true
        }
      ],
      mode: 'tag',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const tagSearchMode = wrapper.find('[test-id="tag-search"]')
      await tagSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("ip='8.8.8.8' AND domain like '%baidu.com' AND app like '%baidu%'")
      })
      resolve()
    }, 200))
  })
  test('8.entity--tag模式下精准和模糊查询', async () => {
    const param = {
      metaList: [
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'ip',
            isEditing: false,
            show: false,
            isFullText: true
          },
          operator: {
            value: '=',
            isEditing: false,
            show: false
          },
          value: {
            value: '\'8.8.8.8\'',
            label: '\'8.8.8.8\'',
            isEditing: false,
            show: false
          }
        },
        {
          meta: 'connection',
          value: 'AND',
          isEditing: false
        },
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'ip.city',
            isEditing: false,
            show: true
          },
          operator: {
            value: '=',
            isEditing: false,
            show: true
          },
          value: {
            value: 'Beijing City',
            label: 'Beijing City',
            isEditing: false,
            show: true
          },
          isEditing: true
        },
        {
          meta: 'connection',
          value: 'AND',
          isEditing: false
        },
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'domain',
            isEditing: false,
            show: false,
            isFullText: true
          },
          operator: {
            value: 'like',
            isEditing: false,
            show: false
          },
          value: {
            value: 'baidu.com',
            label: 'baidu.com',
            isEditing: false,
            show: false,
            label1: '%baidu.com'
          },
          isEditing: true
        }
      ],
      mode: 'tag',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const tagSearchMode = wrapper.find('[test-id="tag-search"]')
      await tagSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("ip='8.8.8.8' AND ip.city='Beijing City' AND domain like '%baidu.com'")
      })
      resolve()
    }, 200))
  })
  test('9.entity--tag模式下模拟has函数', async () => {
    const param = {
      metaList: [
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'ip.country',
            isEditing: false,
            show: true
          },
          operator: {
            value: '=',
            isEditing: false,
            show: true
          },
          value: {
            value: '\'United States\'',
            label: '\'United States\'',
            isEditing: false,
            show: true
          },
          isEditing: true
        },
        {
          meta: 'connection',
          value: 'AND',
          isEditing: false
        },
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'ip',
            isEditing: false,
            show: true
          },
          operator: {
            value: '=',
            isEditing: false,
            show: true
          },
          value: {
            value: '\'8.8.8.8\'',
            label: '\'8.8.8.8\'',
            isEditing: false,
            show: true
          },
          isEditing: true
        },
        {
          meta: 'connection',
          value: 'AND',
          isEditing: false
        },
        {
          meta: 'condition',
          column: {
            name: '',
            type: 'string',
            label: 'tag',
            isEditing: false,
            show: true
          },
          operator: {
            value: 'has',
            isEditing: false,
            show: true
          },
          value: {
            value: '\'mtproxy\'',
            label: '\'mtproxy\'',
            isEditing: false,
            show: true
          },
          isEditing: true
        }
      ],
      mode: 'tag',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const tagSearchMode = wrapper.find('[test-id="tag-search"]')
      await tagSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("ip.country='United States' AND ip='8.8.8.8' AND has(tag,'mtproxy')")
      })
      resolve()
    }, 200))
  })
  test('10.detection--text模式下测试value为枚举值', async () => {
    const param = {
      str: "status='Ended' AND severity='Critical' AND eventType='Anonymity'",
      mode: 'text',
      columnList: detectionColumnList,
      dataset: detectionDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const textSearchMode = wrapper.find('[test-id="text-search"]')
      await textSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("status='1' AND severity='critical' AND eventType='Anonymity'")
      })
      resolve()
    }, 200))
  })
  test('11.detection--text模式模拟点击左侧filter测试addParams()', async () => {
    const param = {
      str: "severity='Critical' AND eventType='Anonymity'",
      mode: 'text',
      columnList: detectionColumnList,
      dataset: detectionDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const textSearchMode = wrapper.find('[test-id="text-search"]')
      const params = [{ column: 'status', operator: '=', value: 'Ended' }]
      await wrapper.vm.addParams(params)
      await textSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("severity='critical' AND eventType='Anonymity' AND status='1'")
      })
      resolve()
    }, 200))
  })
  test('12.detection--text模式点击changeMode转为tag模式并搜索', async () => {
    const param = {
      str: "domain='baidu.com'",
      mode: 'text',
      columnList: entityColumnList,
      dataset: entityDataset
    }
    initWrapper(param)

    await new Promise(resolve => setTimeout(async () => {
      const textSearchMode = wrapper.find('[test-id="text-search"]')
      await textSearchMode.trigger('click')
      const unitTestParam = await wrapper.vm.unitTestParam
      await wrapper.vm.$nextTick(() => {
        expect(unitTestParam.q).toBe("domain='baidu.com'")
      })

      setTimeout(async () => {
        const textChangeMode = wrapper.find('[test-id="text-change-mode"]')
        await textChangeMode.trigger('click')
        const newParam = {
          metaList: [
            {
              meta: 'condition',
              column: {
                name: '',
                type: 'string',
                label: 'domain',
                isEditing: false,
                show: false,
                isFullText: true
              },
              operator: {
                value: '=',
                isEditing: false,
                show: false
              },
              value: {
                value: "domain='baidu.com'",
                label: "domain='baidu.com'",
                isEditing: false,
                show: false
              }
            }
          ],
          mode: 'tag',
          columnList: entityColumnList,
          dataset: entityDataset
        }
        initWrapper(newParam)
        const tagSearchMode = wrapper.find('[test-id="tag-search"]')
        await tagSearchMode.trigger('click')
        const unitTestParam1 = wrapper.vm.unitTestParam
        await wrapper.vm.$nextTick(() => {
          expect(unitTestParam1.q).toBe("domain='baidu.com'")
        })
      }, 200)
      resolve()
    }, 200))
  })
})
