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
        <template #default="scope" :column="item">
          <span :test-id="`${item.prop}${scope.$index}`">{{scope.row[item.prop]}}</span>
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
      ],
      mergeRequestData0: null,
      mergeRequestData1: null,
      mergeRequestChildData0: null,
      mergeRequestChildData1: null
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
    /**
     * 同一url，不同入参的axios请求内包含多个不同url请求的demo
     * @returns {Promise<void>}
     */
    async mergeRequest () {
      axios.get('/api/differentParam', { params: { name: 0 } }).then(response => {
        this.mergeRequestData0 = response.data
      })
      axios.get('/api/differentParam', { params: { name: 1 } }).then(response => {
        this.mergeRequestData1 = response.data
        axios.get('/api/getChildId').then(response1 => {
          this.mergeRequestChildData0 = response1.data
        })
        axios.get('/api/getChildTitle').then(response2 => {
          this.mergeRequestChildData1 = response2.data
        })
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
