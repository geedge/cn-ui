<template>
  <span test-id="count">{{count}}</span>
  <span test-id="title">{{getData.title}}</span>
  <button test-id="button" @click="click">click</button>
</template>

<script>
/* vue-jest的测试示例 */
import VueRouter from 'vue-router'
import axios from 'axios'
export default {
  name: 'Test',
  data () {
    return {
      count: 0,
      getData: { id: 1, title: 'title' }
    }
  },
  methods: {
    click () {
      this.count++
    },
    async getPosts () {
      axios.get('/api/posts').then(response => {
        this.getData = response.data
      })
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
