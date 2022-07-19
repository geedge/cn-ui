<template>
  <div class="network-overview-apps">
    <div class="line-select-metric">
      <span>{{$t('network.metric')}}:</span>
      <div class="line-select__operation">
        <el-select
            size="mini"
            v-model="metricFilter"
            class="option__select select-topn"
            placeholder=""
            popper-class="option-popper"
        >
          <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <div class="app-cards">
      <div class="app-card" v-for="(app, index) in chart.params.app" :key="index">

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NetworkOverviewApps',
  props: {
    chart: Object
  },
  data () {
    return {
      metricFilter: '',
      metricOptions: []
    }
  }
}
</script>
