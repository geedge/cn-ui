<template>
  <div class="entity-filter-case">
    <div class="filter-case__header">{{$t('entities.filter')}}</div>
    <div
        class="entity-filter"
        v-for="(filter, index) in filterData"
        :key="index"
    >
      <div class="filter__header">{{filter.title}}</div>
      <div class="filter__body">
        <div class="filter__row" v-for="(item, i) in filter.data" :key="i">
          <div class="row__label">
            <i :class="item.icon"></i>
            <span>{{item.label}}</span>
          </div>
          <div class="row__value">{{item.value}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EntityFilter',
  props: {
    filterData: Array
  }
}
</script>
