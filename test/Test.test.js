import Test from '../src/Test'
import { mount } from '@vue/test-utils'
import { getNameByEventType } from '@/utils/tools'
import axios from 'axios'

// 模拟的axios返回数据
const mockPostList = { data: { id: 2, title: 'title2' } }

describe('单元测试demo', () => {
  test('Vue组件--点击按钮后count的值+1', async () => {
    // 加载vue组件，获得实例
    const wrapper = mount(Test)
    // 取到文本和按钮的dom
    const textNode = await wrapper.get('[test-id="count"]')
    const button = await wrapper.get('[test-id="button"]')
    // 断言文本dom的内容是否是'0'
    expect(textNode.text()).toContain('0')
    // 模拟按钮dom点击，执行click()方法
    await button.trigger('click')
    // 断言点击按钮后文本dom的内容是否是'1'
    expect(textNode.text()).toContain('1')
    // 再次点击
    await button.trigger('click')
    // 断言点击按钮后文本dom的内容是否是'2'
    expect(textNode.text()).toBe('2')

    /* 更多断言类型：https://jestjs.io/zh-Hans/docs/expect */
  })

  test('Vue组件--直接获取vue实例中的data和method', async () => {
    // 模拟axios返回数据
    axios.get.mockResolvedValue(mockPostList)
    // 加载vue组件，获得实例
    const wrapper = mount(Test)
    const textNode2 = await wrapper.get('[test-id="title"]')
    // 通过wrapper.vm.xxx直接执行click方法、获取data的数据
    expect(wrapper.vm.count).toEqual(0)
    await wrapper.vm.click()
    expect(wrapper.vm.count).toBe(1)

    expect(textNode2.text()).toEqual('title')
    await wrapper.vm.getPosts()
    await wrapper.vm.$nextTick(() => {
      expect(textNode2.text()).toBe('title2')
    })
  })

  test('js方法--getNameByEventType', async () => {
    expect(getNameByEventType('http error')).toBe('http error ratio')
  })
})
