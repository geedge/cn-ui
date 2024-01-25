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
