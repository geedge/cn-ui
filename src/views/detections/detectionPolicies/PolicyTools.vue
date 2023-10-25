<template>
  <div>
    <div class="top-tools__left">
      <button
          id="knowledge-base-add"
          :title="$t('knowledgeBase.createKnowledgeBase')"
          class="top-tool-btn margin-r-10 top-tool-btn--create"
          @click="onCreate"
          style="width:72px;">
        <i class="cn-icon-xinjian cn-icon"></i>
        <span>{{ $t('overall.create') }}</span>
      </button>

      <button
          :disabled="disableEdit"
          id="knowledge-base-edit"
          :title="$t('knowledgeBase.editKnowledgeBase')"
          class="top-tool-btn margin-r-10"
          @click="onEdit"
          style="width:72px;">
        <i class="cn-icon-edit cn-icon" ></i>
        <span>{{$t('overall.edit')}}</span>
      </button>

      <button
          :disabled="disableDelete"
          id="knowledge-base-delete"
          :title="$t('knowledgeBase.deleteKnowledgeBase')"
          class="top-tool-btn margin-r-10"
          @click="onDelete"
          style="width:72px;">
        <i class="cn-icon-delete cn-icon"></i>
        <span>{{ $t('overall.delete') }}</span>
      </button>

      <div class="top-tool-search margin-l-10">
        <el-input v-model="keyWord" size="small" style="height: 28px;" @keyup.enter="onSearch"></el-input>
        <button
            class="top-tool-btn top-tool-btn--search"
            style="border-radius: 0 2px 2px 0 !important;"
            @click="onSearch">
          <i class="el-icon-search"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetectionTools',
  props: {
    disableDelete: {
      type: Boolean,
      default: true
    },
    disableEdit: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      keyWord: ''
    }
  },
  methods: {
    onSearch () {
      this.$emit('search', this.keyWord)
    },
    onCreate () {
      this.$emit('create')
    },
    onEdit () {
      this.$emit('edit')
    },
    onDelete (data) {
      this.$emit('delete', data)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
