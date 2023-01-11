/**
 * jest: https://jestjs.io/docs/getting-started
 * vue-jest: https://test-utils.vuejs.org/guide/
 * */

import Test from '../src/Test'
import { mount } from '@vue/test-utils'
import { getNameByEventType } from '@/utils/tools'
import axios from 'axios'

// 模拟的axios返回数据
const mockId = { data: 2 }
const mockTitle = { data: 'title2' }
const mockCount = { data: 999 }

describe('单元测试demo', () => {
  test('Vue组件--点击按钮后count的值+1', async () => {
    // 加载vue组件，获得实例
    const wrapper = mount(Test)
    // 取到文本和按钮的dom
    const textNode = await wrapper.get('[test-id="count"]')
    const button = await wrapper.get('[test-id="button"]')
    // 断言文本dom的内容是否是'0'
    expect(textNode.text()).toBe('0')
    // 模拟按钮dom点击，执行click()方法
    await button.trigger('click')
    // 断言点击按钮后文本dom的内容是否是'1'
    expect(textNode.text()).toBe('1')
    // 再次点击
    await button.trigger('click')
    // 断言点击按钮后文本dom的内容是否是'2'
    expect(textNode.text()).toBe('2')

    /* 更多断言类型：https://jestjs.io/docs/expect */
  })
  test('Vue组件--直接获取vue实例中的data和method', async () => {
    // 模拟axios返回数据
    // 测试内容只有一个axios请求的时候
    axios.get.mockResolvedValue(mockCount)
    // 加载vue组件，获得实例
    const wrapper = mount(Test)
    const textNode = await wrapper.get('[test-id="count"]')
    // 通过wrapper.vm.xxx直接执行click方法、获取data的数据
    expect(wrapper.vm.count).toBe(0)
    await wrapper.vm.click()
    expect(wrapper.vm.count).toBe(1)
    await wrapper.vm.getCount()
    await wrapper.vm.$nextTick(() => {
      expect(textNode.text()).toBe('999')
    })
  })
  test('Vue组件--多个axios请求', async () => {
    // 模拟axios返回数据
    // 测试内容有多个url不同的axios请求的话，需分开写
    axios.get.mockImplementation(url => {
      switch (url) {
        case '/api/getObjId':
          return Promise.resolve(mockId)
        case '/api/getObjTitle':
          return Promise.resolve(mockTitle)
      }
    })
    // 加载vue组件，获得实例
    const wrapper = mount(Test)
    const textNode = await wrapper.get('[test-id="id"]')
    const textNode2 = await wrapper.get('[test-id="title"]')
    expect(textNode2.text()).toBe('title')
    await wrapper.vm.getObj()
    await wrapper.vm.$nextTick(() => {
      expect(textNode.text()).toBe('2')
      expect(textNode2.text()).toBe('title2')
      expect(wrapper.vm.obj).toEqual({ id: 2, title: 'title2' })
    })
  })

  test('js方法--getNameByEventType', async () => {
    expect(getNameByEventType('http error')).toBe('http error ratio')
  })
})
