<template>
  <div class="entity-left-filter">
    <div class="filter__header">{{$t('entities.filter')}}</div>
    <div class="filter__body">
      <el-collapse v-model="active" class="filter__collapse">
        <el-collapse-item
            name="0"
        >
          <template #title>
            <div class="collapse-header"><i :class="topFilterData.icon" class="collapse-header__icon"></i><span>{{topFilterData.title}}</span></div>
          </template>
          <el-tree
              :data="topFilterData.data"
              :props="{ isLeaf: 'leaf' }"
              :expand-on-click-node="false"
              :load="loadLevel2"
              lazy
              node-key="name"
              ref="tree-0"
              highlight-current
              @node-click="(data, node, component) => nodeClick(data, node, component, 0)"
          >
            <template #default="{ node, data }">
              <div class="filter-item">
                <div>{{data.name}}</div>
                <span>{{data.count}}</span>
              </div>
            </template>
          </el-tree>
          <div class="filter__more" :class="{'filter__more--disabled': topFilterData.hasnotMore}" @click="showMore(topFilterData)">{{$t('overall.showMore')}}</div>
        </el-collapse-item>
        <el-collapse-item
            name="1"
        >
          <template #title>
            <div class="collapse-header"><i :class="bottomFilterData.icon" class="collapse-header__icon"></i><span>{{bottomFilterData.title}}</span></div>
          </template>
          <el-tree
              :data="bottomFilterData.data"
              :props="{ isLeaf: 'leaf' }"
              :expand-on-click-node="false"
              node-key="name"
              ref="tree-1"
              highlight-current
              @node-click="(data, node, component) => nodeClick(data, node, component, 1)"
          >
            <template #default="{ node, data }">
              <div class="filter-item">
                <div>{{data.name}}</div>
                <span>{{data.count}}</span>
              </div>
            </template>
          </el-tree>
          <div class="filter__more" :class="{'filter__more--disabled': bottomFilterData.hasnotMore}" @click="showMore(bottomFilterData)">{{$t('overall.showMore')}}</div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeftFilter',
  props: {
    topFilterData: Object,
    bottomFilterData: Object
  },
  data () {
    return {
      active: ['0', '1'],
      currentDataTop: null,
      currentDataBottom: null
    }
  },
  methods: {
    async loadLevel2 (node, resolve) {
      resolve(await this.$parent.loadLevel2FilterData(node, this.topFilterData.column))
    },
    nodeClick (data, node, component, index) {
      const currentData = index === 0 ? this.currentDataTop : this.currentDataBottom
      const column = index === 0 ? this.topFilterData.column : this.bottomFilterData.column
      if (this.dataEqual(currentData, data)) {
        node.isCurrent = false
      }
      if (index === 0) {
        this.currentDataTop = this.$_.cloneDeep(data)
      } else {
        this.currentDataBottom = this.$_.cloneDeep(data)
      }
      this.$emit('select', data, node, index, column)
    },
    showMore (filterData) {
      if (!filterData.hasnotMore) {
        this.$emit('showMore', filterData.column)
      }
    },
    dataEqual (obj1, obj2) {
      if (!obj1 || !obj2) {
        return false
      }
      let equal = true
      this.$_.forIn(obj1, (value, key) => {
        if (value !== obj2[key]) {
          equal = false
        }
      })
      return equal
    }
  }
}
</script>
