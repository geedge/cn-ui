<template>
  <div>
    <div class="top-tools__left">
      <button
          id="policy-base-add"
          v-if="hasPermission('createDetectionPolicy')"
          :title="$t('knowledgeBase.createKnowledgeBase')"
          class="business-button margin-r-10"
          @click="onCreate">
        <i class="cn-icon-xinjian cn-icon"></i>
        <span>{{ $t('overall.create') }}</span>
      </button>

      <button
          :disabled="disableEdit"
          v-if="hasPermission('editDetectionPolicy')"
          id="knowledge-base-edit"
          :title="$t('knowledgeBase.editKnowledgeBase')"
          class="business-button business-button--light margin-r-10"
          @click="onEdit">
        <i class="cn-icon-edit cn-icon" ></i>
        <span>{{$t('overall.edit')}}</span>
      </button>

      <button
          :disabled="disableDelete"
          v-if="hasPermission('deleteDetectionPolicy')"
          id="knowledge-base-delete"
          :title="$t('knowledgeBase.deleteKnowledgeBase')"
          class="business-button business-button--light margin-r-10"
          @click="onDelete">
        <i class="cn-icon-delete cn-icon"></i>
        <span>{{ $t('overall.delete') }}</span>
      </button>

      <div class="top-tool-search margin-l-10">
        <el-input v-model="keyWord" size="small" class="search__input" @keyup.enter="onSearch"></el-input>
        <button
            class="business-button business-button--light top-tool-btn--search"
            @click="onSearch">
          <el-icon><Search /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'

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
  mounted () {
    const { query } = useRoute()
    if (query.name) {
      this.keyWord = query.name
      this.onSearch()
    }
  },
  methods: {
    onSearch () {
      this.$emit('search', this.keyWord)
      if (!this.keyWord) {
        const query = this.$route.query
        delete query.name
        this.reloadUrl(query, 'clear')
      }
    },
    onCreate () {
      this.$emit('create')
    },
    onEdit () {
      this.$emit('edit')
    },
    onDelete (data) {
      this.$emit('delete', data)
    },
    reloadUrl (newParam, clean) {
      const { query } = this.$route
      let newUrl = urlParamsHandler(window.location.href, query, newParam)
      if (clean) {
        newUrl = urlParamsHandler(window.location.href, query, newParam, clean)
      }
      overwriteUrl(newUrl)
    }
  }
}
</script>
