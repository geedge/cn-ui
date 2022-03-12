export default {
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String], // 数据在父组件查询后传入，本组件内不查询，只根据接传递的数据来渲染
    entity: Object,
    timeFilter: Object,
    queryParams: Object // 接口请求参数
  }
}
