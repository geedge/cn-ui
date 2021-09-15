<template>
  <el-dialog
      v-model="show"
      :top="top"
      :modal="modal"
      :custom-class="customClass"
      :show-close="showClose"
      :width="width"
      destroy-on-close
  >
    <cn-panel :entity="entity" :is-entity-detail="true"></cn-panel>
  </el-dialog>
</template>

<script>
import Panel from '@/views/charts/Panel'
export default {
  name: 'EntityDetail',
  components: {
    'cn-panel': Panel
  },
  props: {
    showDetail: Boolean,
    top: {
      type: String,
      default: '5vh'
    },
    modal: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: String,
      default: 'entity-detail__dialog'
    },
    showClose: {
      type: Boolean,
      default: true
    },
    width: { // 高度需要通过customClass自行定义
      type: [String, Number],
      default: '90vw'
    },
    entity: Object // 实体，{ type: 'ip|domain|app', name: name, icon: icon-class }
  },
  data () {
    return {
      show: false
    }
  },
  watch: {
    showDetail (n, o) {
      this.show = n
    },
    show (n, o) {
      this.$emit('update:show-detail', n)
    }
  }
}
</script>
