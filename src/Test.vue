<template>
  <span test-id="count">{{count}}</span>
  <span test-id="id">{{obj.id}}</span>
  <span test-id="title">{{obj.title}}</span>
  <button test-id="button" @click="click">click</button>
  <span test-id="tab">{{lineTab}}</span>
</template>

<script>
/* vue-jest的测试示例 */
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ref } from 'vue'
import indexedDBUtils from '@/indexedDB'
export default {
  name: 'Test',
  data () {
    return {
      count: 0,
      obj: { id: 1, title: 'title' },
      indexedDBValue: null
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
    },
    async setIndexedDBValue () {
      await indexedDBUtils.selectTable('test').put({ id: 1, name: 'test' })
    },
    async getIndexedDBValue () {
      this.indexedDBValue = await indexedDBUtils.selectTable('test').get(1)
    }
  },
  setup () {
    const { query } = useRoute()
    const { currentRoute } = useRouter()
    const localstorageValue = localStorage.getItem('key')
    const lineTab = ref(query.lineTab || '')
    const path = currentRoute.value.path
    return {
      lineTab,
      path,
      localstorageValue
    }
  }
}
</script>
