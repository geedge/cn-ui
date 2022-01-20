<template>
  <div class="cn-chart__app-basic" :style="computePosition">
    <div class="cn-chart__body">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <el-descriptions :column="1" style="padding: 20px 30px;">
          <el-descriptions-item :label="$t('overall.appName') + ':'">{{$_.get(chartData, "name") || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.appFullName') + ':'">{{$_.get(chartData, "allName") || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.technology') + ':'">{{$_.get(chartData, "tech") || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.remark') + ':'">{{$_.get(chartData, "description") || '-'}}</el-descriptions-item>
        </el-descriptions>
        <div class="cn-chart__body-single">
          <div class="cn-chart__body-single-table">
            <div class="single-value-icon__box">
              <div class="single-value__icon"><i class="cn-icon cn-icon-category"></i></div>
            </div>
            <div class="single-value__content">
              <div>
                <span>{{$t('entities.category')}}</span>
              </div>
              <div>
                <span>{{$_.get(chartData, "category") || '-'}}</span>
              </div>
            </div>
          </div>
          <div class="cn-chart__body-single-table">
            <div class="single-value-icon__box">
              <div class="single-value__icon single-value-color-g"><i class="cn-icon cn-icon-sub-category"></i></div>
            </div>
            <div class="single-value__content">
              <div>
                <span>{{$t('entities.subcategory')}}</span>
              </div>
              <div>
                <span>{{$_.get(chartData, "subcategory") || '-'}}</span>
              </div>
            </div>
          </div>
          <div class="cn-chart__body-single-table">
            <div class="single-value-icon__box">
              <div class="single-value__icon single-value-color-y"><i class="cn-icon cn-icon-credit"></i></div>
            </div>
            <div class="single-value__content">
              <div>
                <span>{{$t('entities.reputationLevel')}}</span>
              </div>
              <div>
                <span>{{$_.get(chartData, "risk") || '-'}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChartSingleValue from "@/views/charts/charts/ChartSingleValue";
import {isIpBasicInfo} from "@/views/charts/charts/tools";
export default {
  name: "ChartAppBasicInfo",
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object
  },
  components: {
    ChartSingleValue
  },
  data () {
    return {

    }
  },
  watch: {
    chartData: {
      deep: true,
      immediate: true,
      handler (n) {
      }
    }
  },
  computed: {
    computePosition() {
      const gridColumn = `${this.chartInfo.x} / ${this.chartInfo.x + this.chartInfo.w}`
      const gridRow = `${this.chartInfo.y} / ${this.chartInfo.y + this.chartInfo.h}`
      return {
        gridColumn,
        gridRow
      }
    }
  },
  mounted() {
  },
  setup (props) {
    isIpBasicInfo: isIpBasicInfo(props.chartInfo.type)
  }
}
</script>

<style scoped>

</style>
