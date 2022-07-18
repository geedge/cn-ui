<template>
  <div class="npm-tabs">
    <el-tabs @tab-change="tabChange">
      <el-tab-pane>
        <template #label>
          <div class="npm-tab__label">
            <i class="cn-icon cn-icon-overview"></i>
            <span>{{$t('overall.overview')}}</span>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <div class="npm-tab__label">
            <i class="cn-icon cn-icon-location"></i>
            <span>{{$t('overall.location')}}</span>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
          <div class="npm-tab__label">
            <i class="cn-icon cn-icon-events"></i>
            <span>{{$t('overall.events')}}</span>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'NpmTabs',
  methods: {
    tabChange (index) {
      this.$emit('tabChange', index)
    }
  }
}
</script>
