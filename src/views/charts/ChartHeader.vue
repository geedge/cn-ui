<template>
  <div class="chart-header" :class="{'chart-header--title-chart': isTitle}">
    <div class="chart-header__title">{{chartInfo.name}}</div>
    <chart-error :isError="isError" :errorInfo="errorInfo"></chart-error>
    <div class="chart-header__tools" v-if="!isTitle">
      <el-popover trigger="click" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
        <template #reference>
          <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
        </template>
      </el-popover>
      <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
    </div>
  </div>
</template>

<script>
import { isTitle } from './charts/tools'
import ChartError from '@/components/charts/ChartError'
export default {
  name: 'ChartHeader',
  props: {
    chartInfo: Object,
    errorInfo: {
      type: String,
      default: ''
    },
    isError: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ChartError
  },
  data () {
    return {
      dropdownMenuShow: false,
      errorText: ''
    }
  },
  methods: {
    refresh () {
      this.$emit('refresh')
    }
  },
  setup (props) {
    return {
      isTitle: isTitle(props.chartInfo.type)
    }
  }
}
</script>
