<template>
  <span test-id="count">{{count}}</span>
  <span test-id="id">{{obj.id}}</span>
  <span test-id="title">{{obj.title}}</span>
  <button test-id="button" @click="click">click</button>
  <span test-id="tab">{{lineTab}}</span>
  <el-table
      :data="tableData"
      class="test-table"
      height="100%"
      empty-text=" "
  >
    <template v-for="(item, index) in tableTitles" :key="index">
      <el-table-column>
        <template  #default="scope" :column="item">
          {{scope.row[item.prop]}}
        </template>
      </el-table-column>
    </template>
  </el-table>
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
      differentParamData0: null,
      differentParamData1: null,
      indexedDBValue: null,
      tableData: [
        {
          name: 'a',
          age: 10
        },
        {
          name: 'b',
          age: 11
        }
      ],
      tableTitles: [
        { label: 'Name', prop: 'name' },
        { label: 'Age', prop: 'age' }
      ]
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
    async differentRequestParam () {
      axios.get('/api/differentParam', { params: { name: 0 } }).then(response => {
        this.differentParamData0 = response.data
      })
      axios.get('/api/differentParam', { params: { name: 1 } }).then(response => {
        this.differentParamData1 = response.data
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
