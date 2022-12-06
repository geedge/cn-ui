import Test from '../src/Test'
import { mount } from '@vue/test-utils'

// 模拟vue-router库，否则组件中引用vue-router的代码报错
jest.mock('vue-router', () => {
  return {
    useRouter: function () { return { currentRoute: '/' } }
  }
})
test('点击按钮后count的值+1', async () => {
  // 加载vue组件，获得实例
  const wrapper = mount(Test)

  // 取到文本和按钮的dom
  const textNode = await wrapper.get('[data-test="count"]')
  const button = await wrapper.get('[data-test="button"]')
  // 断言文本dom的内容是否是'0'
  expect(textNode.text()).toContain('0')
  // 模拟按钮dom点击，执行click()方法
  await button.trigger('click')
  // 断言点击按钮后文本dom的内容是否是'1'
  expect(textNode.text()).toContain('1')
  // 再次点击
  await button.trigger('click')
  // 断言点击按钮后文本dom的内容是否是'2'
  expect(textNode.text()).toContain('2')

  // 通过wrapper.vm.xxx直接执行click方法、获取data的数据
  expect(wrapper.vm.count).toEqual(2)
  await wrapper.vm.click()
  expect(wrapper.vm.count).toEqual(3)

  // 更多断言类型：https://jestjs.io/zh-Hans/docs/expect
})
