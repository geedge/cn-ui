<template>
  <div>
    <div class="detection-filter-title">
      {{ $t('detections.filters') }}
    </div>
    <div class="detection-filter-content">
      <div>
        <div class="filter-content-title">{{ $t('overall.status') }}</div>
        <div class="filter-content-content">
          <el-checkbox-group v-model="checkStatus" @change="onChangeCategory" style="display: flex;flex-direction: column">
            <el-checkbox v-for="item in statusList" :key="item.label" class="filter-content-checkbox" :label="item.status">
              <div>{{ item.label }}</div>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div>
        <div class="filter-content-title">{{ $t('overall.category') }}</div>
        <div class="filter-content-content">
          <el-checkbox-group v-model="checkCategory" @change="onChangeCategory">
            <el-checkbox v-for="item in categoryList" :key="item.value" class="filter-content-checkbox" :label="item.value">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div>
        <div class="filter-content-title">{{ $t('overall.type') }}</div>
        <div class="filter-content-content">
          <el-checkbox-group v-model="checkType" @change="onChangeCategory" style="display: flex;flex-direction: column">
            <el-checkbox v-for="item in typeList" :key="item.value" class="filter-content-checkbox" :label="item.value">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from '@/utils/http'
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
      get(this.url, searchParams).then(response => {
        if (response.code === 200) {
          if (response.data.statusList) {
            this.statusList = []
            response.data.statusList.forEach(item => {
              this.statusList.push({ status: item.status, label: this.switchStatus(item.status) })
              this.checkStatus.push(item.status)
            })
          }

          this.categoryList = response.data.categoryList
          if (response.data.categoryList) {
            response.data.categoryList.forEach(item => {
              this.checkCategory.push(item.value)
            })
          }

          this.typeList = response.data.typeList
          if (response.data.typeList) {
            response.data.typeList.forEach(item => {
              this.checkType.push(item.value)
            })
          }
        } else {
          console.error(response)
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

<style lang="scss" scoped>
.detection-filter-title {
  height: 32px;
  line-height: 32px;
  background: #F7F7F7;
  padding: 0 20px;
  box-shadow: 0 1px 0 0 rgba(226, 229, 236, 1);
  border-radius: 4px 4px 0 0;
}
.detection-filter-content {
  padding: 20px;

  .filter-content-title {
    font-family: NotoSansHans-Medium;
    font-size: 14px;
    line-height: 14px;
    margin-bottom: 10px;
    color: #353636;
    font-weight: 500;
  }
  .filter-content-content {
    display: flex;
    flex-direction: column;

    .filter-content-checkbox {
      line-height: 16px;
      margin-bottom: 10px;
      font-family: NotoSansSChineseRegular;
      font-size: 14px;
      color: #353636;
      font-weight: 400;

      .el-checkbox__inner {
        width: 16px !important;
        height: 16px !important;
        text-align: center !important;
        line-height: 16px !important;
      }

      .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        border-color: #38ACD2;
        background: #38ACD2;
        border-radius: 2px;
      }
      .el-checkbox__input.is-indeterminate .el-checkbox__inner:before {
        background: #FFFFFF;
        border-radius: 1px;
      }
      .el-checkbox__input.is-checked {
        .el-checkbox__inner {
          border-color: #38ACD2;
          background: #38ACD2;
          border-radius: 2px;
        }
      }
      .el-checkbox__input.is-focus {
        .el-checkbox__inner {
          border-color: #38ACD2;
        }
      }

      .el-checkbox__label {
        font-family: NotoSansSChineseRegular;
        font-size: 14px;
        color: #353636;
        font-weight: 400;
      }
    }
  }
}
</style>
