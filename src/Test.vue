<template>
  <span data-test="count">{{count}}</span>
  <button data-test="button" @click="click">click</button>
</template>

<script>
/* vue-jest的测试示例 */
import VueRouter from 'vue-router'
export default {
  name: 'Test',
  data () {
    return {
      count: 0
    }
  },
  methods: {
    click () {
      this.count++
    }
  },
  created () {
    const { currentRoute } = VueRouter.useRouter()
    return {
      currentRoute
    }
  }
}
</script>
