import { dbName, dbGeoDataTableName, dbDrilldownTableConfig } from '@/utils/constants'
import Dexie from 'dexie'

export const db = new Dexie(dbName)
db.version(2).stores({
  [dbGeoDataTableName]: '++name, geo',
  [dbDrilldownTableConfig]: '++id, config'
})
