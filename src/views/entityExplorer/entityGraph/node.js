import _ from 'lodash'
import i18n from '@/i18n'
import axios from 'axios'
import { api } from '@/utils/api'
import { entityDefaultColor, intentColor } from '@/utils/constants'
import { formatTags } from '@/utils/tools'

export default class Node {
  /*
  * type: 对应nodeType
  * cfg: { entityType, entityName, x, y, fx, fy }
  * */
  constructor (type, id, cfg, sourceNode) {
    this.type = type
    this.id = id
    this.x = _.get(cfg, 'x', null)
    this.y = _.get(cfg, 'y', null)
    this.fx = _.get(cfg, 'fx', null)
    this.fy = _.get(cfg, 'fy', null)
    this.myData = {
      entityType: cfg.entityType,
      entityName: cfg.entityName
    }
    if (sourceNode) {
      this.sourceNode = sourceNode
    }
    this.label = this.generateLabel()

    const img = new Image()
    img.src = this.getIconUrl(cfg.entityType, type === nodeType.rootNode)
    this.img = img
  }

  generateLabel () {
    switch (this.type) {
      case nodeType.rootNode:
      case nodeType.entityNode: {
        return this.id
      }
      case nodeType.listNode: {
        return `${this.getLabelText()}(${_.get(this.sourceNode.myData, 'relatedEntities.' + this.myData.entityType + '.total', 0)})`
      }
      case nodeType.tempNode: {
        return this.getLabelText()
      }
    }
    return ''
  }

  getLabelText () {
    if (this.myData.entityType === 'ip') {
      if (this.sourceNode.myData.entityType === 'app') {
        return i18n.global.t('entities.tab.relatedIp')
      } else if (this.sourceNode.myData.entityType === 'domain') {
        return i18n.global.t('entities.graph.resolveIp')
      }
    } else if (this.myData.entityType === 'domain') {
      if (this.sourceNode.myData.entityType === 'ip') {
        return i18n.global.t('entities.graph.resolvedDomain')
      } else if (this.sourceNode.myData.entityType === 'app') {
        return i18n.global.t('entities.graph.relatedDomain')
      } else if (this.sourceNode.myData.entityType === 'domain') {
        return i18n.global.t('entities.subdomain')
      }
    } else if (this.myData.entityType === 'app') {
      return i18n.global.t('entities.tab.relatedApp')
    }
    return ''
  }

  getIconUrl (entityType, colored) {
    const suffix = colored ? '-colored' : ''
    return require(`@/assets/img/entity-symbol2/${entityType}${suffix}.svg`)
  }

  isSubdomain () {
    if (this.sourceNode) {
      return this.sourceNode.myData.entityType === 'domain' && this.myData.entityType === 'domain'
    } else {
      return false
    }
  }

  // 查询basicInfo、tags、关联实体数量
  async queryDetailData () {
    const entityType = this.myData.entityType
    const entityName = this.myData.entityName

    this.myData.basicInfo = await this.queryEntityBasicInfo(entityType, entityName)

    const tags = await this.queryTags(entityType, entityName)
    let _tags = []
    formatTags(tags, entityType, _tags)
    if (_.isArray(tags.tags)) {
      _tags = _.concat(_tags, tags.tags.map(tag => ({ value: tag.name, color: intentColor[tag.intent] || entityDefaultColor })))
    }
    this.myData.tags = _tags

    const relatedEntityTotalCount = await this.queryRelatedEntitiesCount(entityType, entityName)
    this.myData.relatedEntities = {
      ip: { total: relatedEntityTotalCount.ipCount, loadedCount: 0 },
      domain: { total: this.myData.entityType === 'domain' ? relatedEntityTotalCount.subDomainCount : relatedEntityTotalCount.domainCount, loadedCount: 0 },
      app: { total: relatedEntityTotalCount.appCount, loadedCount: 0 }
    }
  }

  async queryEntityBasicInfo (entityType, entityName) {
    const response = await axios.get(`${api.entity.entityGraph.basicInfo}/${entityType}?resource=${entityName}`).catch(e => {
      console.error(e)
      throw e
    })
    if (response.data && response.status === 200) {
      return response.data.data
    } else {
      console.error(response)
      throw response
    }
  }

  async queryTags (entityType, entityName) {
    const response = await axios.get(`${api.entity.entityGraph.tags}/${entityType}?resource=${entityName}`).catch(e => {
      console.error(e)
      throw e
    })
    if (response.data && response.status === 200) {
      return response.data.data
    } else {
      console.error(response)
      throw response
    }
  }

  async queryRelatedEntitiesCount (entityType, entityName) {
    const response = await axios.get(`${api.entity.entityGraph.relatedEntityCount}/${entityType}?resource=${entityName}`).catch(e => {
      console.error(e)
      throw e
    })
    if (response.data && response.status === 200) {
      return response.data.data
    } else {
      console.error(response)
      throw response
    }
  }
}
export const nodeType = {
  rootNode: 'rootNode',
  listNode: 'listNode',
  entityNode: 'en-tityNode',
  tempNode: 'tempNode'
}
export async function queryRelatedEntity (node, targetEntityType) {
  let _targetEntityType = targetEntityType
  if (node.myData.entityType === 'domain' && targetEntityType === 'domain') {
    _targetEntityType = 'subdomain'
  }
  let url = `${api.entity.entityGraph[`${node.myData.entityType}Related${_.upperFirst(_targetEntityType)}`]}?resource=${node.myData.entityName}&pageSize=10`
  const current = node.myData.relatedEntities[targetEntityType].loadedCount
  const pageNo = parseInt(current / 10) + 1
  url += `&pageNo=${pageNo}`
  const response = await axios.get(url).catch(e => {
    console.error(e)
    throw e
  })
  if (response.data && response.status === 200) {
    return response.data.data
  } else {
    console.error(response)
    throw response
  }
}
