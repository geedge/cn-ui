<!-- 提示信息  -->
<template>
  <div class="Hint" style="padding: 0;z-index: 2;" @click.stop>
<!--    <el-row style="padding: 0;display: flex;flex-direction: row">-->
<!--      <el-col style="width: 300px;min-height: 302px;z-index: 2;">-->
<!--        <hint-info v-on="$listeners" :hintList="hintList"></hint-info>-->
<!--      </el-col>-->
<!--      <el-col style="width: calc(100% - 300px);min-height: 302px">-->
<!--        <helper-info :hintSearch="hintSearch"></helper-info>-->
<!--      </el-col>-->
<!--    </el-row>-->
    <div style="display: flex;flex-direction: row;width: calc(100% - 41px);box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);margin-top: 6px;">
      <div style="width: 324px;min-height: 302px;z-index: 2;border: 1px solid #DEDEDE;">
        <hint-info v-on="$listeners" :hintList="hintList" @select="onSelect"></hint-info>
      </div>
      <div style="width: calc(100% - 324px);min-height: 302px;z-index:2">
        <helper-info :hintSearch="hintSearch"></helper-info>
      </div>
    </div>
  </div>
</template>

<script>
import HelperInfo from './HelperInfo.vue'
import HintInfo from './HintInfo.vue'

export default {
  name: 'Hint',
  props: {
    hintList: [],
    hintSearch: {}
  },
  components: {
    HintInfo,
    HelperInfo
  },
  methods: {
    onSelect (item, index, hintList) {
      this.$emit('select', item, index, hintList)
    }
  }
}
</script>

<style lang="" scoped>

</style>
