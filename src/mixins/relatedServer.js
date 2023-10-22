import axios from 'axios'
import { getTextRect } from '@/utils/tools'
export default {
  data () {
    return {
      relationshipDataOne: [], // 数据
      relationshipDataTwo: [], // 数据
      relationshipShowOne: false, // 控制 ... 的展示隐藏
      relationshipShowTwo: false, // 控制 ... 的展示隐藏
      relationshipShowMoreOne: false, // 控制弹框的展示隐藏
      relationshipShowMoreTwo: false, // 控制弹框的展示隐藏
      relationshipMoreDataOne: [], // 展示所有
      relationshipMoreDataTwo: [] // 展示所有
    }
  },
  methods: {
    // 请求数据 relationshipUrlOne => 路由 refOne => ref
    getRelatedServerDataOne (relationshipUrlOne, refOne) {
      this.loadingRelationshipOne = true
      axios.get(relationshipUrlOne, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          const relationshipDataOne = []
          if (response.data.data.result.length > 0) {
            response.data.data.result.forEach(item => {
              relationshipDataOne.push({ value: item, show: true })
            })
          }
          // 将请求数据 传入方法中
          this.relatedServerWidth(relationshipDataOne, refOne, 1)
        }
        this.loadingRelationshipOne = false
      })
    },
    getRelatedServerDataTwo (relationshipUrlTow, refTow) {
      this.loadingRelationshipTwo = true
      axios.get(relationshipUrlTow, { params: this.getQueryParams() }).then(response => {
        if (response.status === 200) {
          const relationshipDataTwo = []
          if (response.data.data.result.length > 0) {
            response.data.data.result.forEach(item => {
              relationshipDataTwo.push({ value: item, show: true })
            })
          }
          // 将请求数据 传入方法中
          this.relatedServerWidth(relationshipDataTwo, refTow, 2)
        }
        this.loadingRelationshipTwo = false
      })
    },
    // data => 数据， value => ref
    relatedServerWidth (data, value, num) {
      // 最大宽度
      const relatedServerWidth = this.$refs.relationship.offsetWidth
      let sum = 240
      let flag = true
      data.forEach((item) => {
        // 每条数据的宽度
        const width = getTextRect(item.value).width + 67
        if (width > 67 && width !== 0) {
          sum += width
          if (flag && sum >= relatedServerWidth && num === 1) {
            flag = false
            this.relationshipShowOne = true
          } else if (flag && sum >= relatedServerWidth && num === 2) {
            flag = false
            this.relationshipShowTwo = true
          }
        }
        item.show = flag
      })
      if (num === 1) {
        this.relationshipDataOne = data
      } else if (num === 2) {
        this.relationshipDataTwo = data
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
        this.relationshipShowMoreTwo = false
      } else if (index === 2) {
        // 展示数据
        this.relationshipMoreDataTwo = data
        // 弹框的显示隐藏
        this.relationshipShowMoreTwo = true
        // 展示当前弹框是，隐藏其他弹框
        this.relationshipShowMoreOne = false
      }
    },
    mouseout () {
      this.relationshipShowMoreTwo = false
      this.relationshipShowMoreOne = false
    }
  },
  computed: {
    scoreDot () {
      const dots = []
      if (this.score === '-') {
        for (let i = 0; i < 6; i++) {
          dots.push({
            class: 'score-dot'
          })
        }
      } else {
        for (let i = 0; i < 6; i++) {
          if (i < this.score) {
            dots.push({
              class: `score-dot ${handleClass(this.score)}`
            })
          } else {
            dots.push({
              class: 'score-dot'
            })
          }
        }
      }
      return dots

      function handleClass (score) {
        if (score <= 2) {
          return 'score-dot--red'
        } else if (score <= 4) {
          return 'score-dot--yellow'
        } else if (score <= 6) {
          return 'score-dot--green'
        }
        return ''
      }
    }
  }
}
