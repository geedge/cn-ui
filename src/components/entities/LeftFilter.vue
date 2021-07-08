<template>
  <div class="entity-left-filter">
    <div class="filter__header">{{$t('entities.filter')}}</div>
    <div class="filter__body">
      <el-collapse v-model="active">
        <el-collapse-item
            v-for="(f, i) in filterData"
            :key="i"
            :title="f.title"
            :name="`${i}`"
            class="filter__collapse"
        >
          <el-tree
              :data="f.data"
          >
            <template #default="{ node, data }">
              <span>{{data[f.key]}}-{{data.count}}</span>
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
  mounted () {
    console.info(this.filterData)
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

    .filter__collapse {
      max-height: 50%;

      .el-collapse-item__header {
        padding-left: 10px;
      }
    }
  }
}
</style>
