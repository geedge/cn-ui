import _ from 'lodash'
import { nodeType } from '@/views/entityExplorer/entityGraph/node'
import i18n from '@/i18n'
import { entityType } from '@/utils/constants'
import axios from 'axios'
import { api } from '@/utils/api'

export function generateLabel (type, id, data, sourceNode) {
  switch (type) {
    case nodeType.rootNode:
    case nodeType.entityNode: {
      return id
    }
    case nodeType.listNode: {
      return `${getLabelText(data, sourceNode)}(${_.get(sourceNode.data, 'relatedEntities.' + data.entityType + '.total', 0)})`
    }
    case nodeType.tempNode: {
      return getLabelText(data, sourceNode)
    }
  }
  return ''
}

export function builtTooltip (node) {
  if (node && node.type !== nodeType.tempNode) {
    if (node.type === nodeType.listNode) {
      let iconClass = ''
      let title = ''
      let total = 0
      let loadedCount = 0
      switch (node.data.entityType) {
        case 'ip': {
          iconClass = 'cn-icon cn-icon-resolve-ip'
          title = i18n.global.t('entities.graph.resolveIp')
          total = _.get(node.sourceNode.data, 'relatedEntities.ip.total', 0)
          loadedCount = _.get(node.sourceNode.data, 'relatedEntities.ip.list', []).length
          break
        }
        case 'domain': {
          iconClass = 'cn-icon cn-icon-subdomain'
          title = node.isSubdomain ? i18n.global.t('entities.subdomain') : i18n.global.t('entity.graph.resolveDomain')
          total = _.get(node.sourceNode.data, 'relatedEntities.domain.total', 0)
          loadedCount = _.get(node.sourceNode.data, 'relatedEntities.domain.list', []).length
          break
        }
        case 'app': {
          iconClass = 'cn-icon cn-icon-app-name'
          title = i18n.global.t('entities.tab.relatedApp')
          total = _.get(node.sourceNode.data, 'relatedEntities.app.total', 0)
          loadedCount = _.get(node.sourceNode.data, 'relatedEntities.app.list', []).length
          break
        }
      }
      return `<div class="primary-node-tooltip">
              <div class="tooltip__header"><i class="${iconClass}"></i><span class="tooltip__title">${title}</span></div>
              <div class="tooltip__content">
                <span>${i18n.global.t('entity.graph.associatedCount')}:&nbsp;${total}</span>
                <span>${i18n.global.t('entity.graph.expandedEntityCount')}:&nbsp;${loadedCount}</span>
              </div>
            </div>`
    } else if (node.type === nodeType.entityNode || node.type === nodeType.rootNode) {
      if (node.data && node.data.tags && node.data.tags.length > 0) {
        return `<div class="entity-node-tooltip">
                <div class="tooltip__header">
                  <span class="tooltip__title">${node.realId}</span>
                </div>
                <div class="tooltip__content">
                  <div class="content-header">
                    <div class="header-icon"></div>
                    <span>${i18n.global.t('entity.graph.tags')}</span>
                  </div>
                  <div class="content-tag-list">${this.generateTagHTML(node.data.tags)}</div>
                </div>
              </div>`
      } else {
        return `<div style="padding: 0 6px; font-size: 15px; line-height: 15px; color: #111;">${node.realId}</div>`
      }
    }
  }
}
function generateTagHTML (tags) {
  let html = ''
  if (tags) {
    tags.forEach(t => {
      html += `<div class="entity-tag entity-tag--level-two-${t.type}">
                  <span>${t.value}</span>
                </div>`
    })
  }
  return html
}

function getLabelText (data, sourceNode) {
  if (data.entityType === entityType.ip) {
    if (sourceNode.data.entityType === entityType.app) {
      return i18n.global.t('entities.tab.relatedIp')
    } else if (sourceNode.data.entityType === entityType.domain) {
      return i18n.global.t('entities.graph.resolveIp')
    }
  } else if (data.entityType === entityType.domain) {
    if (sourceNode.data.entityType === entityType.ip) {
      return i18n.global.t('entities.graph.resolvedDomain')
    } else if (sourceNode.data.entityType === entityType.app) {
      return i18n.global.t('entities.graph.relatedDomain')
    } else if (sourceNode.data.entityType === entityType.domain) {
      return i18n.global.t('entities.subdomain')
    }
  } else if (data.entityType === entityType.app) {
    return i18n.global.t('entities.tab.relatedApp')
  }
  return ''
}

export async function queryEntityBasicInfo (entityType, entityName) {
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

export async function queryTags (entityType, entityName) {
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

export async function queryRelatedEntityCount (entityType, entityName) {
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
