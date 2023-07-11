<template>
  <div class="entity-filter-case" style="position: relative">
    <div class="filter-case__header">{{ $t('entities.filter1') }}</div>

    <div v-if="filterDataLength>0">
      <div class="entity-filter" v-for="(item, index) in filterData" :key="index">
        <div v-if="item.data.length>0">
          <div class="filter__header">
            <i :class="item.icon"></i>
            {{ item.title }}
          </div>

          <div class="filter__body" style="position: relative">
            <loading :loading="loadingLeft" style="top: -5px;"></loading>

            <div class="filter__body-item" v-for="(data, i) in item.data" :key="i" @click="filter(data.label, data)">
              <div class="filter__body-item-left">
                <!--当前无更好方案匹配国旗，后续解决-->
                <!--<div v-if="data.flag">-->
                <!--  <img :src="require(`../../../public/images/flag/${data.flag}.svg`)" class="filter-country-flag"/>-->
                <!--</div>-->
                <div class="filter__body-item-left-index">{{ i+1 }}</div>
                <div class="filter__body-item-left-label">
                  <el-tooltip :content="data.label" placement="top" effect="light" :disabled="disabledLabel">
                    <span @mouseenter="handleMouse(`filter${index}${i}`)" :id="`filter${index}${i}`">{{ data.label }}</span>
                  </el-tooltip>
                </div>
              </div>

              <div class="filter__body-item-right">{{ data.value }}</div>
            </div>
            <div class="filter-hr"></div>
          </div>
        </div>
      </div>
    </div>
    <chart-no-data v-else style="padding-top: 40px"></chart-no-data>

  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
export default {
  name: 'EntityFilter',
  components: { ChartNoData, Loading },
  props: {
    filterData: {
      type: Object
    },
    loadingLeft: {
      type: Boolean
    }
  },
  computed: {
    filterDataLength () {
      let length = 0
      this.filterData.forEach(item => {
        length += item.data.length
      })

      return length
    }
  },
  data () {
    return {
      disabledLabel: true
    }
  },
  methods: {
    /**
     * 判断文字是否溢出，超出则鼠标移入tooltip显示，否则鼠标移入不显示
     * @param id
     */
    handleMouse (id) {
      const dom = document.getElementById(id)
      if (dom) {
        const width = document.getElementById(id).offsetWidth
        this.disabledLabel = width < 180
      } else {
        this.disabledLabel = true
      }
    },
    filter (name, data) {
      this.$emit('filter', name, data)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
