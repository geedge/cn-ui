import _ from 'lodash'
import i18n from '@/i18n'
import axios from 'axios'
import { api } from '@/utils/api'
import { entityDefaultColor, entityDetailTags, tagValueLabelMapping } from '@/utils/constants'

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
  }

  generateLabel () {
    switch (this.type) {
      case nodeType.rootNode:
      case nodeType.entityNode: {
        return this.id
      }
      case nodeType.listNode: {
        return `${this.getLabelText()}(${_.get(this.sourceNode.myData, 'relatedEntity.' + this.myData.entityType + '.total', 0)})`
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
    Object.keys(tags).forEach(k => {
      if (k !== 'userDefinedTags' && tags[k]) {
        Object.keys(tags[k]).forEach(k2 => {
          const find = entityDetailTags[entityType].find(t => t.name === k2)
          if (find) {
            _tags.push({ key: k2, value: this.tagValueHandler(k, k2, tags[k][k2]), type: find.type })
          }
        })
      }
    })
    if (_.isArray(tags.userDefinedTags)) {
      _tags = _.concat(_tags, tags.userDefinedTags.map(tag => ({ value: tag.tagValue, color: tag.knowledgeBase ? tag.knowledgeBase.color : entityDefaultColor })))
    }
    this.myData.tags = _tags

    const relatedEntityTotalCount = await this.queryRelatedEntityCount(entityType, entityName)
    this.myData.relatedEntity = {
      ip: { total: relatedEntityTotalCount.ipCount, list: [] },
      domain: { total: this.myData.entityType === 'domain' ? relatedEntityTotalCount.subDomainCount : relatedEntityTotalCount.domainCount, list: [] },
      app: { total: relatedEntityTotalCount.appCount, list: [] }
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

  async queryRelatedEntityCount (entityType, entityName) {
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

  tagValueHandler (k, k2, value) {
    if (k === 'psiphon3Ip') {
      if (k2 === 'type') {
        const find = tagValueLabelMapping.find(t => t.value === value)
        if (find) {
          return find.name
        }
      }
    }
    return value
  }
}
export const nodeType = {
  rootNode: 'rootNode',
  listNode: 'listNode',
  entityNode: 'entityNode',
  tempNode: 'tempNode'
}
export async function queryRelatedEntity (node, targetEntityType) {
  let _targetEntityType = targetEntityType
  if (node.myData.entityType === 'domain' && targetEntityType === 'domain') {
    _targetEntityType = 'subdomain'
  }
  let url = `${api.entity.entityGraph[`${node.myData.entityType}Related${_.upperFirst(_targetEntityType)}`]}?resource=${node.myData.entityName}&pageSize=10`
  const current = node.myData.relatedEntity[targetEntityType].list.length
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
