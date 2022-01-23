<template>
  <textarea
      ref="textSearch"
  ></textarea>
  <div class="search__suffixes search__suffixes--text-mode">
    <div class="search__suffix" @click="changeMode">
      <i class="cn-icon cn-icon-search-advance"></i>
    </div>
    <div class="search__suffix">
      <i class="el-icon-search"></i>
    </div>
  </div>
</template>

<script>
import 'codemirror/theme/ambiance.css'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/mode/sql/sql'
const CodeMirror = require('codemirror')
export default {
  name: 'TextMode',
  methods: {
    initCodeMirror () {
      CodeMirror.fromTextArea(this.$refs.textSearch, {
        mode: {
          name: 'sql'
        },
        lineNumbers: false
      })
    },
    search () {
      this.$emit('search', this.metaList)
    },
    changeMode () {
      this.$emit('changeMode', 'tag')
    }
  },
  mounted () {
    this.initCodeMirror()
  }
}
</script>
