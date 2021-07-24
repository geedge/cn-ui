<template>
  <div class="entity-left-filter">
    <div class="filter__header">{{$t('entities.filter')}}</div>
    <div class="filter__body">
      <el-collapse v-model="active" class="filter__collapse">
        <el-collapse-item
            v-for="(f, i) in filterData"
            :key="i"
            :title="f.title"
            :name="`${i}`"
        >
          <el-tree
              :data="f.data"
              :load="(node, resolve) => loadFilter(node, resolve, f)"
              :node-key="f.key"
              :props="{ isLeaf: 'leaf' }"
              :expand-on-click-node="false"
              :lazy="i === 0"
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
      active: ['0', '1']
    }
  },
  methods: {
    nodeClick (data, node, component, index) {
      // if ((data.country && !data.region) || ())
      this.$emit('select', data, node, index)
    },
    showMore (key, hasnotMore) {
      if (!hasnotMore) {
        this.$emit('showMore', key)
      }
    },
    loadFilter (node, resolve, f) {
      this.$emit('loadFilter', node, resolve, f.filterType, f.childrenKey, f.key)
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
  width: 100%;
  height: 100%;
  border: 1px solid $--right-box-border-color;
  overflow: auto;

  .filter__header {
    background-color: #FAFAFA;
    padding-left: 8px;
    height: 36px;
    line-height: 36px;
    color: #333;
    font-size: 14px;
  }
  .filter__body {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;

    .filter__collapse {
      .el-collapse-item__header {
        padding-left: 10px;
        padding-top: 8px;
        font-weight: bold;

        &.is-active {
          border-bottom: 1px solid $--right-box-border-color;
        }
      }
      .el-collapse-item__wrap {
        padding-top: 6px !important;

        .el-collapse-item__content {
          padding-bottom: 15px;
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
          color: $--color-primary;
          cursor: pointer;
        }
        .filter__more.filter__more--disabled {
          color: #999;
          cursor: default;
        }
      }
    }
  }
}
</style>
