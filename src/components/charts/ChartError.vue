<template>
  <el-popover
          v-if="isError"
          placement="top-start"
          trigger="hover"
          popper-class="chart-error-popper"
          :close-delay=10
          offset="10"
          :width="-1"
  > <!-- :width="-1" 是为了让min-width及max-width生效，让width失效-->
    <div >{{errorInfo}}</div>
    <template #reference>
    <span  class="chart-info-corner chart-info-corner--error">
                  <i class="cn-chart-icon-warning fa "></i>
                  <span class="chart-info-corner-inner"></span>
              </span>
    </template>
  </el-popover>
</template>

<script>
export default {
  name: 'ChartError',
  props: {
    isError: Boolean,
    errorInfo:String
  }
}
</script>
