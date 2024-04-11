<template>
  <el-table
      id="detectionTable"
      class="detection-table"
      ref="dataTable"
      :data="tableData"
      height="100%"
      tooltip-effect="light"
      border
      empty-text=" "
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @row-dblclick="rowDoubleClick"
  >
    <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        :selectable="selectable"
        width="55">
    </el-table-column>
    <el-table-column
        v-for="(item, index) in customTableTitles"
        :key="`col-${index}`"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
        :sort-orders="['ascending', 'descending']"
        :sortable="item.sortable"
        :width="`${item.width}`"
        class="data-column"
        :show-overflow-tooltip="['library'].indexOf(item.prop) > -1"
    >
      <template #header>
        <span class="data-column__span">{{ item.label }}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
        <template v-if="item.prop === 'name'">
          <template v-if="scope.row.i18n">
            <span :title="scope.row[item.prop]">{{ $t(scope.row.i18n) }}</span>
          </template>
          <template v-else-if="scope.row.name">
            <span :title="scope.row[item.prop]">{{ scope.row.name }}</span>
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'status'">
          <div :class="`detection-tag-status${scope.row[item.prop]}`">
            {{ $t(switchStatus(scope.row[item.prop])) }}
          </div>
        </template>
        <template v-else-if="item.prop === 'category'">
          {{ changeCategory(scope.row[item.prop]) }}
        </template>
        <template v-else-if="item.prop === 'description'">
          <div class="padding-r-20">{{ scope.row[item.prop] }}</div>
        </template>
        <template v-else-if="item.prop === 'dimensions' && scope.row[item.prop]">
          <span class="detection-tag-blue">{{ scope.row[item.prop] }}</span>
        </template>
        <template v-else-if="item.prop === 'library' && scope.row[item.prop]">
          <el-tooltip
              effect="light"
              trigger="hover"
              placement="left"
          >
            <span class="detection-table-library">{{ scope.row[item.prop] }}</span>
            <template #content>
              <div class="policy-library-tip">
                <div class="tip__header">{{scope.row[item.prop]}}</div>
                <div class="tip__tags">
                  <div class="tip__tag" v-if="knowledgeBaseSource.find(s => s.value === $_.get(scope.row.ruleConfigObj, 'knowledgeBase.source'))">
                    {{
                      knowledgeBaseSource.find(s => s.value === $_.get(scope.row.ruleConfigObj, 'knowledgeBase.source')) &&
                      knowledgeBaseSource.find(s => s.value === $_.get(scope.row.ruleConfigObj, 'knowledgeBase.source')).name
                    }}</div>
                  <div
                      class="tip__tag"
                      v-if="$_.get(scope.row.ruleConfigObj, 'knowledgeBase.color')"
                      :style="{backgroundColor: $_.get(scope.row.ruleConfigObj, 'knowledgeBase.color'), color: 'var(--el-color-white)'}"
                  >{{colorText($_.get(scope.row.ruleConfigObj, 'knowledgeBase.color'))}}</div>
                </div>
                <div class="tip__description" :class="{ 'tip__description--non': !($_.get(scope.row.ruleConfigObj, 'knowledgeBase.description')) }">
                  <template v-if="$_.get(scope.row.ruleConfigObj, 'knowledgeBase.description')">
                    {{$_.get(scope.row.ruleConfigObj, 'knowledgeBase.description')}}
                  </template>
                  <template v-else>{{$t('tip.noDescription')}}</template>
                </div>
              </div>
            </template>
          </el-tooltip>
        </template>
        <span v-else>{{ scope.row[item.prop] || '-' }}</span>
      </template>
    </el-table-column>
    <template v-slot:empty>
      <div class="table-no-data" v-if="isNoData">
        <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
      </div>
    </template>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { dateFormatByAppearance } from '@/utils/date-util'
import { switchStatus } from '@/utils/tools'
import _ from 'lodash'
import { detectionUnitList, knowledgeBaseSource, knowledgeBaseColor } from '@/utils/constants'
import { useRoute } from 'vue-router'

export default {
  name: 'DetectionTable',
  props: {
    isNoData: {
      type: Boolean,
      default: false
    },
    policyDetail: {
      type: Object
    }
  },
  mixins: [table],
  data () {
    return {
      knowledgeBaseColor,
      knowledgeBaseSource,
      tableTitle: [
        {
          label: this.$t('knowledge.status'),
          prop: 'status',
          show: true,
          minWidth: 70
        },
        {
          label: 'ID',
          prop: 'ruleId',
          show: true,
          minWidth: 65
        },
        {
          label: this.$t('config.roles.name'),
          prop: 'name',
          minWidth: 90,
          show: true
        },
        {
          label: this.$t('overall.category'),
          prop: 'category',
          minWidth: 140,
          show: true
        },
        {
          label: this.$t('overall.type'),
          prop: 'eventType',
          minWidth: 145,
          show: true
        },
        {
          label: this.$t('overall.remark'),
          prop: 'description',
          minWidth: 205,
          show: true
        },
        {
          label: this.$t('detection.create.dimensions'),
          prop: 'dimensions',
          minWidth: 204,
          show: true
        },
        {
          label: this.$t('detection.library'),
          prop: 'library',
          minWidth: 204,
          show: true
        }
      ]
    }
  },
  mounted () {
    const { query } = useRoute()
    // 初始化勾选状态
    if (query.name && query.ruleId && this.policyDetail) {
      this.selectionChange([this.policyDetail])
      const timer = setTimeout(() => {
        this.$refs.dataTable.toggleAllSelection([this.policyDetail])
        clearTimeout(timer)
      }, 400)
    }
  },
  computed: {
    colorText () {
      const vm = this
      return function (color) {
        const t = vm.knowledgeBaseColor.find(t => t.value === color)
        return t ? vm.$t(t.label) : vm.$t(vm.knowledgeBaseColor[0].label)
      }
    }
  },
  watch: {
    tableData: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          n.forEach(t => {
            if (t.ruleType === 'indicator_match') {
              t.library = _.get(t, 'ruleConfigObj.knowledgeBase.name', '-')
            } else if (t.ruleType === 'threshold') {
              t.dimensions = _.get(t, 'ruleConfigObj.dimensions', '-')
            }
          })
        }
      }
    }
  },
  methods: {
    dateFormatByAppearance,
    switchStatus,
    rowDoubleClick (data) {
      this.$emit('rowDoubleClick', data)
    },
    changeCategory (value) {
      if (value) {
        const obj = detectionUnitList.categoryList.find(d => d.value === value)
        let label = value
        if (obj) {
          label = this.$t(obj.label)
        }
        return label
      }
    }
  }
}
</script>
