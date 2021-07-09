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
              :load="(node, resolve) => f.load(node, resolve, f.filterType, f.childrenKey ? f.childrenKey : f.key)"
              :node-key="f.key"
              :props="{ isLeaf: 'leaf' }"
              :expand-on-click-node="false"
              :lazy="i === 0"
              :show-checkbox="i === 1"
              @node-click="nodeClick"
          >
            <template #default="{ node, data }">
              <div class="filter-item">
                <span>{{node.level === 1 ? data[f.key] : ''}}{{node.level === 2 ? data[f.childrenKey] : ''}}</span>
                <span>{{data.count}}</span>
              </div>
            </template>
          </el-tree>
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
      active: ['1']
    }
  },
  methods: {
    nodeClick (data, node) {
      this.$emit('select', data)
    }
  },
  watch: {
    filterData (n) {
      console.info(n)
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

        .filter-item {
          display: flex;
          justify-content: space-between;
          padding-right: 6px;
          width: 100%;
        }
      }
    }
  }
}
</style>
