/**
 * jest: https://jestjs.io/docs/getting-started
 * vue-jest: https://test-utils.vuejs.org/guide/
 * */

import Test from '../src/Test'
import { mount } from '@vue/test-utils'
import { getNameByEventType } from '@/utils/tools'
import axios from 'axios'
import indexedDBUtils from '@/indexedDB'
import ElementPlus from 'element-plus'

// 模拟的axios返回数据
const mockId = { data: 2 }
const mockTitle = { data: 'title2' }
const mockCount = { data: 999 }
const mockDifferentParam0 = { data: 0 }
const mockDifferentParam1 = { data: 1 }
const mergeRequestParam0 = { data: 0 }
const mergeRequestParam1 = { data: 1 }
const mergeRequestChildParam0 = { data: 0 }
const mergeRequestChildParam1 = { data: 1 }

describe('单元测试demo', () => {
  test('Vue组件--点击按钮后count的值+1', async () => {
    // 若组件中使用了vue-router，需要细化模拟相关内容
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
    // 加载vue组件，获得实例
    const wrapper = mount(Test, {
      global: {
        plugins: [ElementPlus]
      }
    })
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
  test('Vue组件--获取路由中的参数', async () => {
    // query中带上lineTab参数
    require('vue-router').useRoute.mockReturnValue({ query: { lineTab: 'total' } })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
    // 加载vue组件，获得实例
    const wrapper = mount(Test, {
      global: {
        plugins: [ElementPlus]
      }
    })
    // 取到文本和按钮的dom
    const textNode = await wrapper.get('[test-id="tab"]')
    expect(textNode.text()).toBe('total')
  })
  test('Vue组件--模拟获取localstorage/sessionStorage的内容', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
    // 模拟localStorage的getItem
    jest.spyOn(localStorage.__proto__, 'getItem').mockImplementation(key => key)
    // 加载vue组件，获得实例
    const wrapper = mount(Test, {
      global: {
        plugins: [ElementPlus]
      }
    })
    expect(wrapper.vm.localstorageValue).toBe('key')
  })
  test('Vue组件--直接获取vue实例中的data和method', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
    // 模拟axios返回数据
    // 测试内容只有一个axios请求的时候
    axios.get.mockResolvedValue(mockCount)
    // 加载vue组件，获得实例
    const wrapper = mount(Test, {
      global: {
        mocks: {
          $t: key => key
        },
        plugins: [ElementPlus]
      }
    })
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
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
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
    const wrapper = mount(Test, {
      global: {
        plugins: [ElementPlus]
      }
    })
    const textNode = await wrapper.get('[test-id="id"]')
    const textNode2 = await wrapper.get('[test-id="title"]')
    expect(textNode2.text()).toBe('title')
    await wrapper.vm.getObj()
    await wrapper.vm.$nextTick(() => {
      expect(textNode.text()).toBe('2')
      expect(textNode2.text()).toBe('title2')
      // 匹配整个对象
      expect(wrapper.vm.obj).toEqual({ id: 2, title: 'title2' })
    })
  })
  test('Vue组件--多个同url不同参数的axios请求', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
    // 模拟axios返回数据
    axios.get.mockResolvedValueOnce(mockDifferentParam0)
    axios.get.mockResolvedValueOnce(mockDifferentParam1)
    // 加载vue组件，获得实例
    const wrapper = mount(Test, {
      global: {
        plugins: [ElementPlus]
      }
    })
    await wrapper.vm.differentRequestParam()
    expect(wrapper.vm.differentParamData0).toBe(0)
    expect(wrapper.vm.differentParamData1).toBe(1)
  })
  test('Vue组件--axios请求内包含多个不同url的组合请求', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
    // 模拟axios返回数据
    axios.get.mockResolvedValueOnce(mergeRequestParam0)
    axios.get.mockResolvedValueOnce(mergeRequestParam1)

    axios.get.mockImplementation(url => {
      switch (url) {
        case '/api/getChildId':
          return Promise.resolve(mergeRequestChildParam0)
        case '/api/getChildTitle':
          return Promise.resolve(mergeRequestChildParam1)
      }
    })

    // 加载vue组件，获得实例
    const wrapper = mount(Test, {
      global: {
        plugins: [ElementPlus]
      }
    })
    await wrapper.vm.mergeRequest()
    await wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.mergeRequestData0).toBe(0)
      expect(wrapper.vm.mergeRequestData1).toBe(1)
      expect(wrapper.vm.mergeRequestChildData0).toBe(0)
      expect(wrapper.vm.mergeRequestChildData1).toBe(1)
    })
  })
  test('Vue组件--模拟indexedDB操作', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
    // 加载vue组件，获得实例
    const wrapper = mount(Test, {
      global: {
        plugins: [ElementPlus]
      }
    })
    // 模拟indexedDB的内容
    indexedDBUtils.selectTable.mockReturnValue({
      put: jest.fn(),
      get: jest.fn().mockResolvedValue({ a: 1 })
    })
    await wrapper.vm.setIndexedDBValue()
    await wrapper.vm.getIndexedDBValue()
    expect(wrapper.vm.indexedDBValue).toEqual({ a: 1 })
  })
  test('Vue组件--使用第三方组件的情况（以el-table为例）', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    require('vue-router').useRouter.mockReturnValue({ currentRoute: { value: { path: '/' } } })
    // 加载vue组件，获得实例
    const wrapper = mount(Test, {
      global: {
        plugins: [ElementPlus]
      }
    })
    // 执行nextTick等待el-table渲染完成
    await wrapper.vm.$nextTick()
    const textNode = await wrapper.get('[test-id="name0"]')
    const textNode2 = await wrapper.get('[test-id="age1"]')
    expect(textNode.text()).toBe('a')
    expect(textNode2.text()).toBe('11')
  })
  test('js方法--getNameByEventType', async () => {
    expect(getNameByEventType('http error')).toBe('http error ratio')
  })
})
