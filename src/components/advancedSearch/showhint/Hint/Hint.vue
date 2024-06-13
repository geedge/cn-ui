<!-- 提示信息  -->
<template>
  <div class="Hint" @click.stop>
    <div class="hint__block">
      <div class="hint__block-filter">
        <hint-info v-on="$listeners" :hintList="hintList" @select="onSelect" @keydownEnter="onKeydownEnter"></hint-info>
      </div>
      <div class="hint__block-helper">
        <helper-info :hintSearch="hintSearch"></helper-info>
      </div>
    </div>
  </div>
</template>

<script>
import HelperInfo from './HelperInfo.vue'
import HintInfo from './HintInfo.vue'

export default {
  name: 'Hint',
  props: {
    hintList: [],
    hintSearch: {}
  },
  components: {
    HintInfo,
    HelperInfo
  },
  methods: {
    onSelect (item, index, hintList) {
      this.$emit('select', item, index, hintList)
    },
    onKeydownEnter (e) {
      this.$emit('keydownEnter', e)
    }
  }
}
</script>
