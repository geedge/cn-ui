import _ from 'lodash'

export default {
  props: {
    entity: Object
  },
  data () {
    return {
      entityData: {}
    }
  },
  computed: {
    iconClass () {
      let className
      switch (this.entityData.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app'
          break
        }
        default: break
      }
      return className
    }
  },
  methods: {
    entityDetail (entity) {

    },
    queryTraffic () {

    },
    querySecurity () {

    },
    queryAlert () {

    }
  },
  mounted () {
    this.entityData = _.cloneDeep(this.entity)
    setTimeout(() => { this.queryTraffic() })
    setTimeout(() => { this.querySecurity() })
    setTimeout(() => { this.queryAlert() })
  }
}
