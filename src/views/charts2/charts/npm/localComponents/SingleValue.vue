<template>
  <div class="single-value" v-for="(npm, index) in newNpmNetworkData" :key="index">
    <div class="single-value__title" style="display: flex">
      {{ $t(npmNetworkName[index].name) }}
      <chart-error v-if="npm.message" tooltip :content="npm.message"></chart-error>
    </div>

    <div class="single-value__content">
      <div class="single-value__content-number" v-if="index ===0 || index ===1 || index ===2">
        {{ unitConvert(npm.Avg, unitTypes.time).join(' ') }}
      </div>
      <div class="single-value__content-number" v-else>
        {{unitConvert(npm.Avg, unitTypes.percent).join(' ')}}
      </div>
      <div v-if="npm.value > 0" class="single-value__content-trend single-value__content-trend-red">
        <i class="cn-icon-rise1 cn-icon"></i>&nbsp;
        <span v-if="npm.value <= 5">
            {{ unitConvert(npm.value, unitTypes.percent).join('') }}
        </span>
        <span v-else>>500.00%</span>
      </div>
      <div v-else-if="npm.value < 0" class="single-value__content-trend single-value__content-trend-green">
        <i class="cn-icon-decline cn-icon"></i>&nbsp;
        <span v-if="npm.value >= -5">
            {{ unitConvert(npm.value, unitTypes.percent).join('').replaceAll('-', '') }}
        </span>
        <span v-else>>500.00%</span>
      </div>
      <div v-else-if="npm.value === 0" class="single-value__content-trend single-value__content-trend-black">
        <i class="cn-icon-constant cn-icon"></i>
      </div>
      <div v-else></div>
    </div>

    <div class="single-value__circle">
      <div class="single-value__circle-p95">
        <span v-if="index ===0 || index ===1 || index ===2">
          P95:{{ unitConvert(npm.P95, unitTypes.time).join(' ') }}</span>
        <span v-else>
          P95:{{ unitConvert(npm.P95, unitTypes.percent).join(' ') }}
        </span>
      </div>
      <div class="single-value__circle-p99">
        <span v-if="index ===0 || index ===1 || index ===2">
          P99:{{ unitConvert(npm.P99, unitTypes.time).join(' ') }}
        </span>
        <span v-else>
          P99:{{ unitConvert(npm.P99, unitTypes.percent).join(' ') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import ChartError from '@/components/common/Error'

export default {
  name: 'SingleValue',
  components: { ChartError },
  props: {
    npmNetworkName: Array,
    npmNetworkData: Array
  },
  data () {
    return {
      unitTypes,
      unitConvert,
      newNpmNetworkData: [] // 整合处理传过来的数据列表
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    /**
    * 初始化数据
    */
    initData () {
      // 传过来的数据
      const npmNetworkData = this.npmNetworkData
      // 处理数据后的数组
      const dealList = []

      if (npmNetworkData !== undefined && npmNetworkData.length > 0) {
        npmNetworkData.forEach((item) => {
          const tempObj = {}
          for (const i in item) {
            if (item.msg || item.message) {
              // 为了兼容字段为msg的情况
              tempObj.message = item.msg ? item.msg : item.message
            } else {
              // 将含有avg、p90等关键字使用avg、p90来代替，形成统一属性
              if (i.indexOf('Avg') > -1) {
                tempObj.Avg = item[i]
              } else if (i.indexOf('P50') > -1) {
                tempObj.P50 = item[i]
              } else if (i.indexOf('P90') > -1) {
                tempObj.P90 = item[i]
              } else if (i.indexOf('P95') > -1) {
                tempObj.P95 = item[i]
              } else if (i.indexOf('P99') > -1) {
                tempObj.P99 = item[i]
              }
              tempObj.value = item.value
            }
          }
          dealList.push(tempObj)
        })
        this.newNpmNetworkData = dealList
      }
    }
  }
}
</script>
