import { get } from '@/utils/http'
import { getTextRect } from '@/utils/tools'
export default {
  data () {
    return {
      relationshipDataOne: [], // 数据
      relationshipDataTow: [], // 数据
      relationshipShowOne: false, // 控制 ... 的展示隐藏
      relationshipShowTow: false, // 控制 ... 的展示隐藏
      relationshipShowMoreOne: false, // 控制弹框的展示隐藏
      relationshipShowMoreTow: false, // 控制弹框的展示隐藏
      relationshipMoreDataOne: [], // 展示所有
      relationshipMoreDataTow: [], // 展示所有
      timer: null
    }
  },
  methods: {
    // 请求数据 relationshipUrlOne => 路由 refOne => ref
    getRelatedServerDataOne (relationshipUrlOne, refOne) {
      get(relationshipUrlOne, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          // this.relationshipDataOne = response.data.result
          const relationshipDataOne = response.data.result
          // 将请求数据 传入方法中
          this.relatedServerWidth(relationshipDataOne, refOne, 1)
        }
      })
    },
    getRelatedServerDataTow (relationshipUrlTow, refTow) {
      get(relationshipUrlTow, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          // this.relationshipDataTow = response.data.result
          const relationshipDataTow = response.data.result
          // 将请求数据 传入方法中
          this.relatedServerWidth(relationshipDataTow, refTow, 2)
        }
      })
    },
    // data => 数据， value => ref
    relatedServerWidth (data, value, num) {
      // 最大宽度
      const relatedServerWidth = this.$refs.relationship.offsetWidth
      let sum = 194
      let flag = true
      data.forEach((item, index) => {
        // 每条数据的宽度
        const width = getTextRect(item.appName || item.domain || item.ipAddr).width + 47
        if (width > 47 && width !== 0) {
          sum += width
          if (flag && sum >= relatedServerWidth && num === 1) {
            flag = false
            this.relationshipShowOne = true
          } else if (flag && sum >= relatedServerWidth && num === 2) {
            flag = false
            this.relationshipShowTow = true
          }
        }
        item.show = flag
      })
      if (num === 1) {
        this.relationshipDataOne = data
      } else if (num === 2) {
        this.relationshipDataTow = data
      }
    },
    // 点击事件 控制弹框的展示隐藏，展示全部的数据
    more (data, index) {
      if (index === 1) {
        // 展示数据
        this.relationshipMoreDataOne = data
        // 弹框的显示隐藏
        this.relationshipShowMoreOne = true
        // 展示当前弹框是，隐藏其他弹框
        this.relationshipShowMoreTow = false
      }
      if (index === 2) {
        // 展示数据
        this.relationshipMoreDataTow = data
        // 弹框的显示隐藏
        this.relationshipShowMoreTow = true
        // 展示当前弹框是，隐藏其他弹框
        this.relationshipShowMoreOne = false
      }
    },
    mouseout () {
      this.relationshipShowMoreTow = false
      this.relationshipShowMoreOne = false
    }
  }
}
