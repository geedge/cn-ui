import { get } from '@/utils/http'
export default {
  data () {
    return {
      relationDomainData: [],
      relationAppData: [],
      showMoreApp: false,
      showMoreDomain: false,
      moreDataDomain: [],
      moreDataApp: [],
      showDomainMore: false,
      showAppMore: false
    }
  },
  methods: {
    getRelatedServerData () {
      get(this.relatedServerDomainUrl, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.relationDomainData = response.data.result
          this.relatedServerWidth(this.relationDomainData, 'relatedDomain')
        }
      })
      get(this.relatedServerAppUrl, this.getQueryParams()).then(response => {
        if (response.code === 200) {
          this.relationAppData = response.data.result
          this.relatedServerWidth(this.relationAppData, 'relatedServerApp')
        }
      })
    },
    relatedServerWidth (data, value) {
      const relatedServerWidth = this.$refs.relationship.offsetWidth
      let sum = 0
      let flag = true
      data.map((item, index) => {
        if (this.$refs[value + index]) {
          const width = this.$refs[value + index].offsetWidth + 22
          if (width) {
            sum += width
            if (flag && relatedServerWidth < sum) {
              flag = false
              this.showDomainMore = true
            }
          }
          item.show = flag
        }
        return item
      })
      console.log(data)
    },
    more (data, showMore, index) {
      if (index === 1) {
        this.moreDataDomain = data
        this.showMoreDomain = !showMore
        this.showMoreApp = false
      }
      if (index === 2) {
        this.moreDataApp = data
        this.showMoreApp = !showMore
        this.showMoreDomain = false
      }
    }
  }
}
