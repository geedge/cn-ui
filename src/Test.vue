<template>
  <span test-id="count">{{count}}</span>
  <span test-id="id">{{obj.id}}</span>
  <span test-id="title">{{obj.title}}</span>
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
      obj: { id: 1, title: 'title' }
    }
  },
  methods: {
    click () {
      this.count++
    },
    async getObj () {
      axios.get('/api/getObjId').then(response => {
        this.obj.id = response.data
      })
      axios.get('/api/getObjTitle').then(response => {
        this.obj.title = response.data
      })
    },
    async getCount () {
      axios.get('/api/getCount').then(response => {
        this.count = response.data
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
