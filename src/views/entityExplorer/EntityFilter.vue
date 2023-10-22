<template>
  <div class="entity-filter-case" style="position: relative">
    <div class="filter-case__header">{{ $t('entities.filter1') }}</div>

    <div v-if="filterDataLength>0">
      <div class="entity-filter" v-for="(item, index) in myFilterData" :key="index">
        <div v-if="item.data.length>0">
          <div class="filter__header">
            <i :class="item.icon"></i>
            {{ item.title }}
          </div>

          <div class="filter__body" style="position: relative">
            <loading :loading="loadingLeft" style="top: -5px;"></loading>

            <div class="filter__body-item"
                 v-for="(data, i) in item.data.slice(0, item.showNum)"
                 :key="i"
                 @click="filter(data.label, data)">
              <div class="filter__body-item-left">
                <div v-if="data.flag">
                  <img v-if="data.flag===countryNameIdMapping.Unknown || !countryNameIdMapping[data.flag]" src="../../../public/images/flag/Unknown.svg" class="filter-country-flag">
                  <img v-else :src="require(`../../../public/images/flag/${countryNameIdMapping[data.flag]}.png`)" class="filter-country-flag"/>
                </div>
                <div v-else class="filter__body-item-left-index">{{ i+1 }}</div>
                <div class="filter__body-item-left-label">
                  <el-tooltip :content="data.label" placement="top" effect="light" :disabled="disabledLabel">
                    <span @mouseenter="handleMouse(`filter${index}${i}`)" :id="`filter${index}${i}`">
                      <span v-if="item.topColumn==='ip.port'">
                        {{ data.port }}/{{ data.l7Protocol }}
                      </span>
                      <span v-else>{{ data.label }}</span>
                    </span>
                  </el-tooltip>
                </div>
              </div>
              <div class="filter__body-item-right">{{ data.value }}</div>
            </div>
          </div>
          <div @click="showMoreFilter(item, index)"
               :class="item.showNum === item.data.length ? 'filter-no-show-more' : 'filter-show-more'">
            {{ $t('overall.showMore') }}
          </div>
          <div class="filter-hr"></div>
        </div>
      </div>
    </div>
    <chart-no-data v-else style="padding-top: 40px"></chart-no-data>

  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { countryNameIdMapping } from '@/utils/constants'
export default {
  name: 'EntityFilter',
  components: { ChartNoData, Loading },
  props: {
    filterData: {
      type: Array
    },
    loadingLeft: {
      type: Boolean
    }
  },
  computed: {
    filterDataLength () {
      let length = 0
      this.myFilterData.forEach(item => {
        length += item.data.length
      })

      return length
    }
  },
  data () {
    return {
      disabledLabel: true,
      countryNameIdMapping,
      myFilterData: []
    }
  },
  mounted () {
    this.myFilterData = this.filterData
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
    },
    showMoreFilter (item, index) {
      if ((item.data.length - item.showNum) >= 5) {
        item.shouNum += 5
        this.myFilterData[index].showNum += 5
      } else {
        this.myFilterData[index].showNum += (item.data.length - item.showNum)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
