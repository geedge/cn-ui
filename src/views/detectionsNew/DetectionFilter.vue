<template>
  <div>
    <div class="new-detection-filter-title">
      {{ $t('detections.filters') }}
    </div>
    <div class="new-detection-filter-content">
      <div>
        <div class="new-filter-content-title">{{ $t('overall.status') }}</div>
        <div class="new-filter-content-content">
          <el-checkbox-group v-model="checkStatus" @change="onChangeCategory" style="display: flex;flex-direction: column">
            <el-checkbox v-for="item in statusList" :key="item.label" class="new-filter-content-checkbox" :label="item.status">
              <div>{{ item.label }}</div>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div>
        <div class="new-filter-content-title">{{ $t('overall.category') }}</div>
        <div class="new-filter-content-content">
          <el-checkbox-group v-model="checkCategory" @change="onChangeCategory">
            <el-checkbox v-for="item in categoryList" :key="item.value" class="new-filter-content-checkbox" :label="item.value">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div>
        <div class="new-filter-content-title">{{ $t('overall.type') }}</div>
        <div class="new-filter-content-content">
          <el-checkbox-group v-model="checkType" @change="onChangeCategory" style="display: flex;flex-direction: column">
            <el-checkbox v-for="item in typeList" :key="item.value" class="new-filter-content-checkbox" :label="item.value">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { api } from '@/utils/api'

export default {
  name: 'DetectionFilter',
  data () {
    return {
      statusList: [],
      categoryList: [],
      typeList: [],
      checkStatus: [],
      checkCategory: [],
      checkType: [],
      url: api.detection.statistics
    }
  },
  mounted () {
    // 开发时删除---start
    this.statusList = [
      { status: 1, label: 'Enabled' },
      { status: 0, label: 'Disabled' }
    ]
    this.checkStatus = [0, 1]
    this.categoryList = [
      { value: 'security', label: 'Security Event' },
      { value: 'performance', label: 'Performance Event' },
      { value: 'regulatory_risk', label: 'Regulatory Risk Event' }
    ]
    this.checkCategory = ['security', 'performance', 'regulatory_risk']
    this.typeList = [
      { value: 'c&c', label: 'C&C' },
      { value: 'ddos', label: 'DDos' },
      { value: 'lateral_movement', label: 'Lateral movement' },
      { value: 'brute_force', label: 'Brute force' }
    ]
    this.checkType = ['c&c', 'ddos', 'lateral_movement', 'brute_force']
    // 开发时删除---end

    // todo 暂时禁用，后续再开发时解禁
    // this.getFilterData()
  },
  methods: {
    getFilterData (params) {
      let searchParams = { pageSize: -1 }
      if (params) {
        searchParams = { ...searchParams, ...params }
      }
      axios.get(this.url, { params: searchParams }).then(response => {
        if (response.status === 200) {
          if (response.data.data.statusList) {
            this.statusList = []
            response.data.data.statusList.forEach(item => {
              this.statusList.push({ status: item.status, label: this.switchStatus(item.status) })
              this.checkStatus.push(item.status)
            })
          }

          this.categoryList = response.data.data.categoryList
          if (response.data.data.categoryList) {
            response.data.data.categoryList.forEach(item => {
              this.checkCategory.push(item.value)
            })
          }

          this.typeList = response.data.data.typeList
          if (response.data.data.typeList) {
            response.data.data.typeList.forEach(item => {
              this.checkType.push(item.value)
            })
          }
        } else {
          console.error(response.data)
        }
      }).finally(() => {
        // this.initTypeData()
        // this.initStatusData()
        // const self = this
        // this.$nextTick(() => {
        //   if (self.$refs.knowledgeTreeTypeFilter) {
        //     self.$refs.knowledgeTreeTypeFilter.setCheckedKeys(this.defaultCheckedCategory)
        //   }
        //   if (self.$refs.knowledgeTreeStatusFilter) {
        //     self.$refs.knowledgeTreeStatusFilter.setCheckedKeys(this.defaultCheckedStatus)
        //   }
        // })
      })
    },
    onChangeCategory (data) {
      // todo 暂时禁用，后续再开发时解禁
      // 根据选择的值，构造不同入参，传给列表页，调用查询列表接口
    },
    switchStatus (status) {
      switch (status) {
        case 0: return 'Disabled'
        case 1: return 'Enabled'
      }
    }
  }
}
</script>
