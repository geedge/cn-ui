<template>
  <div class="entity-left-filter">
    <div class="filter__header">{{$t('entities.filter')}}</div>
    <div class="filter__body">
      <el-collapse v-model="active" class="filter__collapse">
        <el-collapse-item
            v-for="(f, i) in filterData"
            :key="i"
            :name="`${i}`"
        >
          <template #title>
            <div class="collapse-header"><i :class="f.icon" class="collapse-header__icon"></i><span>{{f.title}}</span></div>
          </template>
          <el-tree
              :data="f.data"
              :load="(node, resolve) => loadFilter(node, resolve, f)"
              :node-key="f.key"
              :props="{ isLeaf: 'leaf' }"
              :expand-on-click-node="false"
              :lazy="i === 0"
              :ref="`tree-${i}`"
              highlight-current
              @node-click="(data, node, component) => nodeClick(data, node, component, i)"
          >
            <template #default="{ node, data }">
              <div class="filter-item">
                <div :title="node.level === 1 ? data[f.key] : (node.level === 2 ? data[f.childrenKey] : '')">{{node.level === 1 ? data[f.key] : (node.level === 2 ? data[f.childrenKey] : '')}}</div>
                <span>{{data.count}}</span>
              </div>
            </template>
          </el-tree>
          <div class="filter__more" :class="{'filter__more--disabled': f.hasnotMore}" @click="showMore(f.key, f.hasnotMore)">{{$t('overall.showMore')}}</div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeftFilter',
  props: {
    filterData: Array
  },
  data () {
    return {
      active: ['0', '1'],
      currentDataTop: null,
      currentDataBottom: null
    }
  },
  methods: {
    nodeClick (data, node, component, index) {
      const currentData = index === 0 ? this.currentDataTop : this.currentDataBottom
      if (this.dataEqual(currentData, data)) {
        node.isCurrent = false
      }
      if (index === 0) {
        this.currentDataTop = this.$_.cloneDeep(data)
      } else {
        this.currentDataBottom = this.$_.cloneDeep(data)
      }
      this.$emit('select', data, node, index)
    },
    showMore (key, hasnotMore) {
      if (!hasnotMore) {
        this.$emit('showMore', key)
      }
    },
    loadFilter (node, resolve, f) {
      this.$emit('loadFilter', node, resolve, f.filterType, f.childrenKey, f.key)
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
  },
  watch: {
    filterData: {
      deep: true,
      immediate: true,
      handler (n) {
        this.active = ['0', '1']
      }
    }
  }
}
</script>

<style lang="scss">
.entity-left-filter {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  width: 100%;
  height: 100%;
  // border: 1px solid $--right-box-border-color;
  overflow: auto;

  .filter__header {
    background-color: #E1E6ED;
    margin-bottom: 10px;
    padding-left: 8px;
    height: 36px;
    line-height: 36px;
    color: #666;
    font-size: 14px;
  }
  .filter__body {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;

    .filter__collapse {
      .el-collapse-item {
        margin-bottom: 10px;
      }
      .el-collapse-item__header {
        padding-left: 15px;
        padding-top: 8px;
        color: #8FA1BE;
        border-bottom: none !important;
      }
      .collapse-header {
        display: flex;
        width: 100%;
        border-bottom: 1px solid $--content-right-background-color;
      }
      .collapse-header__icon {
        padding-right: 6px;
        font-size: 14px;
      }
      .el-collapse-item__wrap {
        padding-top: 14px !important;

        .el-collapse-item__content {
          padding-bottom: 15px;

          .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
            background-color: $--tree-node-hover-background-color;
          }
          .el-tree-node.is-expanded, .el-tree-node.is-current {
            &>.el-tree-node__content>.filter-item {
              font-weight: bold;
            }
          }
          .el-tree-node__content {
            height: 30px;
          }
        }
        .filter-item {
          display: flex;
          justify-content: space-between;
          padding-right: 6px;
          width: 100%;

          div {
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .filter__more {
          padding-left: 24px;
          line-height: 36px;
          color: #8FA1BE;
          cursor: pointer;
        }
        .filter__more.filter__more--disabled {
          color: #ccc;
          cursor: default;
        }
      }
    }
  }
}
</style>
