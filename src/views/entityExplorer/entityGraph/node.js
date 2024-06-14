import _ from 'lodash'
import { entityDefaultColor, entityType } from '@/utils/constants'
import { formatTags } from '@/utils/tools'
import { generateLabel, builtTooltip, queryEntityBasicInfo, queryTags, queryRelatedEntityCount } from '@/views/entityExplorer/entityGraph/utils'
import { api } from '@/utils/api'
import axios from 'axios'

export default class Node {
  /*
  * type: 对应nodeType
  * cfg: { entityType, entityName }
  * */
  constructor (type, id, data, sourceNode, strength, img) {
    this.id = id
    this.type = type
    this.vx = 0
    this.vy = 0
    this.fx = sourceNode ? null : 0// 设置为0，即可固定中心节点。0为中心节点，1为中心节点的子节点，2为第三级节点
    this.fy = sourceNode ? null : 0// 设置为0，即可固定中心节点。0为中心节点，1为中心节点的子节点，2为第三级节点
    this.img = img
    this.strength = strength || -10
    this.sourceNode = sourceNode
    this.isSubdomain = sourceNode ? sourceNode.data.entityType === entityType.domain && data.entityType === entityType.domain : false
    this.data = {
      entityType: data.entityType,
      entityName: data.entityName
    }
    this.label = generateLabel(type, id, data, sourceNode)
    this.name = builtTooltip(this)
  }

  // listNode和entityNode专用，查询实体信息
  async queryDetailData () {
    const entityType = this.data.entityType
    const entityName = this.data.entityName

    this.data.basicInfo = await queryEntityBasicInfo(entityType, entityName)

    const tags = await queryTags(entityType, entityName)
    let _tags = []
    formatTags(tags, entityType, _tags)
    if (_.isArray(tags.userDefinedTags)) {
      _tags = _.concat(_tags, tags.userDefinedTags.map(tag => ({ value: tag.tagValue, color: tag.knowledgeBase ? tag.knowledgeBase.color : entityDefaultColor })))
    }
    this.data.tags = _tags

    const relatedEntityTotalCount = await queryRelatedEntityCount(entityType, entityName)
    this.data.relatedEntities = {
      ip: { total: relatedEntityTotalCount.ipCount, pageNo: 0, list: [] }, //
      domain: { total: this.data.entityType === 'domain' ? relatedEntityTotalCount.subDomainCount : relatedEntityTotalCount.domainCount, pageNo: 0, list: [] }, // pageNo: 0,
      app: { total: relatedEntityTotalCount.appCount, pageNo: 0, list: [] }// pageNo: 0,
    }
  }

  getNeighbors (gData) {
    const { links } = gData
    const neighboringNodes = []
    const neighboringTargetNodes = []
    const neighboringSourceNodes = []
    const neighboringTargetLinks = []
    const neighboringSourceLinks = []
    const neighboringLinks = links.filter(l => {
      if (l.target === this || l.source === this) {
        neighboringNodes.push(l.target === this ? l.source : l.target)
        if (l.target === this) {
          neighboringSourceNodes.push(l.source)
          neighboringSourceLinks.push(l)
        } else {
          neighboringTargetNodes.push(l.target)
          neighboringTargetLinks.push(l)
        }
        return true
      }
      return false
    })
    return {
      nodes: neighboringNodes,
      targetNodes: neighboringTargetNodes,
      sourceNodes: neighboringSourceNodes,
      links: neighboringLinks,
      targetLinks: neighboringTargetLinks,
      sourceLinks: neighboringSourceLinks
    }
  }

  // 获取唯一source，listNode和tempNode专用，因为entityNode的source可能有多个，rootNode无source
  getSourceNode (gData) {
    const links = gData.links.filter(l => l.target.id === this.id)
    const nodes = gData.nodes.filter(n => links.some(l => l.source.id === n.id))
    return nodes.length > 0 ? nodes[0] : null
  }

  // listNode和entityNode专用，查询关联实体列表
  async queryRelatedEntities (targetEntityType) {
    let _targetEntityType = targetEntityType
    if (this.data.entityType === entityType.domain && targetEntityType === entityType.domain) {
      _targetEntityType = 'subdomain'
    }
    console.info(this.data, targetEntityType)
    const url = `${api.entity.entityGraph[`${this.data.entityType}Related${_.upperFirst(_targetEntityType)}`]}?resource=${this.data.entityName}&pageSize=10&pageNo=${this.data.relatedEntities[targetEntityType].pageNo + 1}`
    const response = await axios.get(url).catch(e => {
      console.error(e)
      throw e
    })
    if (response.data && response.status === 200) {
      this.data.relatedEntities[targetEntityType].pageNo += 1
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
  entityNode: 'entityNode',
  tempNode: 'tempNode'
}
