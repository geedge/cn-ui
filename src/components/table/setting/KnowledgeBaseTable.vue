<template>
  <el-checkbox-group v-model="checkList" @change="" style="display:flex;flex-flow:row wrap;">
    <div @mouseenter="mouseenter(data)" @mouseleave="mouseleave(data)" v-for="data in tableData" :key="data.id" class="card-item" style="">
      <div class="card-content">
        <div class="card-title">
          <div class="card-title-name">
            {{data.tagName}}
          </div>
          <div class="card-title-more">
            <span v-show="!isSelectedStatus && data.showMore"><i class="cn-icon cn-icon-more-dark" @mouseenter="mouseenterMore(data)" test-id="mouseenter-dark"></i></span>
            <div class="card-operate" v-show="!isSelectedStatus && data.moreOptions" @mouseleave="mouseleaveMore(data)">
              <div class="card-title-more-edit" @click="edit(data.id)" >{{$t('overall.edit')}}</div>
              <div class="card-title-more-delete" @click="del(data)" >{{$t('overall.delete')}}</div>
            </div>
            <el-checkbox @change="(val) => {checkboxStatusChange(val,data)}" style="position: absolute;right: -12px;" v-if="isSelectedStatus" :key="data.id" :label="data"><br></el-checkbox>

          </div>
        </div>
        <div class="card-id">ID:{{data.id}}</div>
        <div class="card-desc">{{data.remark?data.remark:'—'}}</div>
      </div>
      <div class="card-operate__footer">
        <div class="card-type">{{data.tagType}}</div>
        <el-switch class="card-enable"
                   disabled
                   v-model="data.status"
                   active-color="#38ACD2"
                   inactive-color="#C0CEDB"
        >
        </el-switch>
      </div>
    </div>
  </el-checkbox-group>
</template>

<script>
import table from '@/mixins/table'
import { knowledgeBaseType } from '@/utils/constants'
export default {
  name: 'knowledgeBaseTable',
  mixins: [table],
  props: {
    isSelectedStatus: {
      type: Boolean
    }
  },
  data () {
    return {
      tableTitle: [],
      checkList: []
    }
  },
  watch: {
    tableData: {
      handler (n) {
        if (this.tableData && this.tableData.length > 0) {
          this.tableData.forEach(item => {
            item.status = true
          })
        }
      }
    }
  },
  methods: {
    checkboxStatusChange (val, data) {
      this.$emit('checkboxStatusChange', val, data)
    },
    showSelect () {
      // this.isSelectedStatus = true
    },
    hideSelect () {
      // this.isSelectedStatus = false
    },
    mouseenterMore (card) {
      this.tableData.forEach(t => {
        if (t.id === card.id) {
          t.moreOptions = true
        }
      })
    },
    mouseleaveMore (card) {
      this.tableData.forEach(t => {
        if (t.id === card.id) {
          t.moreOptions = false
        }
      })
    },
    mouseenter (card) {
      this.tableData.forEach(t => {
        if (t.id === card.id) {
          t.showMore = true
        }
      })
    },
    mouseleave (card) {
      this.tableData.forEach(t => {
        if (t.id === card.id) {
          t.showMore = false
          t.moreOptions = false
        }
      })
    },
    del (data) {
      this.$emit('delete', data)
    },
    edit (id) {
      this.$router.push({
        path: '/knowledgeBase/edit',
        query: {
          t: +new Date(),
          id: id
        }
      })
    }
  },
  mounted () {
    this.tableData.forEach(item => {
      item.showMore = false
      item.moreOptions = false
      item.status = true
    })
  },
  computed: {}
}
</script>
