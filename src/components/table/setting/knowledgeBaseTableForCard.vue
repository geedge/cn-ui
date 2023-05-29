<template>
  <el-checkbox-group v-model="checkList">
    <div @click="isSelectedStatus && clickCard(data,$event)"  @mouseenter="mouseenter(data)" @mouseleave="mouseleave(data)" v-for="data in tableData" :key="data.knowledgeId" class="card-item"  :class="data.isSelected ? 'card-selected' : ''">
      <div class="card-content">
        <div class="card-title">
          <div class="card-title-name" :title="data.name">{{data.name}}</div>
          <div class="card-title-more">
            <span v-show="!isSelectedStatus && data.showMore"><i class="cn-icon cn-icon-more-dark" @mouseenter="mouseenterMore(data)" test-id="mouseenter-dark"></i></span>
            <div class="card-operate" v-show="!isSelectedStatus && data.moreOptions" @mouseleave="mouseleaveMore(data)">
              <div class="card-title-more-edit" @click="edit(data.knowledgeId)" >{{$t('overall.edit')}}</div>
              <div class="card-title-more-delete" @click="del(data)" >{{$t('overall.delete')}}</div>
            </div>
            <el-checkbox @click.stop="" @change="(val) => {checkboxStatusChange(val,data)}" style="position: absolute;right: -12px;" v-if="isSelectedStatus" :key="data.knowledgeId" :label="data"><br></el-checkbox>

          </div>
        </div>
        <div class="card-id">ID:{{data.knowledgeId}}</div>
        <div class="card-desc" :title="data.description">{{data.description?data.description:'—'}}</div>
      </div>
      <div class="card-operate__footer">
        <div class="card-type">
          <div class="card-category">{{tagCategoryText(data.category)}}</div>
          <div class="card-source">{{tagSourceText(data.source)}}</div>
        </div>
        <el-switch class="card-enable"
                   v-model="data.status"
                   active-color="#38ACD2"
                   inactive-color="#C0CEDB"
                   @change="changeStatus($event,data.knowledgeId)"
        >
        </el-switch>
      </div>
    </div>
  </el-checkbox-group>
</template>

<script>
import table from '@/mixins/table'
import { knowledgeBaseCategory, knowledgeBaseSource } from '@/utils/constants'
export default {
  name: 'knowledgeBaseTableForCard',
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
            // item.status = true
          })
        }
      }
    }
  },
  methods: {
    clickCard (data, event) {
      if (data.isSelected) { // 原来为选中，当前点击后未选中
        const index = this.checkList.indexOf(data)
        if (index > -1) {
          this.checkList.splice(index, 1)
        }
      } else {
        const index = this.checkList.indexOf(data)
        if (index === -1) {
          this.checkList.push(data)
        }
      }
      const val = !data.isSelected
      data.isSelected = val
      this.$emit('checkboxStatusChange', val, data)
    },
    checkboxStatusChange (val, data) {
      data.isSelected = val
      this.$emit('checkboxStatusChange', val, data)
    },
    showSelect () {
      // this.isSelectedStatus = true
    },
    hideSelect () {
      // this.isSelectedStatus = false
    },
    clearSelect () {
      this.$nextTick(() => {
        this.checkList = []
        if (this.tableData && this.tableData.length > 0) {
          this.tableData.forEach(data => {
            data.isSelected = false
          })
        }
      })
    },
    mouseenterMore (card) {
      this.tableData.forEach(t => {
        if (t.knowledgeId === card.knowledgeId) {
          t.moreOptions = true
        }
      })
    },
    mouseleaveMore (card) {
      this.tableData.forEach(t => {
        if (t.knowledgeId === card.knowledgeId) {
          t.moreOptions = false
        }
      })
    },
    mouseenter (card) {
      this.tableData.forEach(t => {
        if (t.knowledgeId === card.knowledgeId) {
          t.showMore = true
        }
      })
    },
    mouseleave (card) {
      this.tableData.forEach(t => {
        if (t.knowledgeId === card.knowledgeId) {
          t.showMore = false
          t.moreOptions = false
        }
      })
    },
    del (data) {
      this.$emit('delete', data)
    },
    edit (id) {
      const pageNo = this.$router.currentRoute.value.query.pageNo
      const listMode = this.$router.currentRoute.value.query.listMode
      this.$router.push({
        path: '/knowledgeBase/edit',
        query: {
          t: +new Date(),
          pageNoForTable: pageNo || 1,
          id: id,
          listMode: listMode
        }
      })
    }
  },
  mounted () {
    this.tableData.forEach(item => {
      item.showMore = false
      item.moreOptions = false
      // item.status = true
    })
  },
  computed: {
    tagCategoryText () {
      return function (type) {
        const t = knowledgeBaseCategory.find(t => t.value === type)
        return t ? t.name : ''
      }
    },
    tagSourceText () {
      return function (type) {
        const t = knowledgeBaseSource.find(t => t.value === type)
        return t ? t.name : ''
      }
    }

  }
}
</script>
