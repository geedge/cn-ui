import { dbName, dbGeoDataTableName, dbDrilldownTableConfig } from '@/utils/constants'
import Dexie from 'dexie'
/* https://dexie.org/ */

const db = new Dexie(dbName)
db.version(3).stores({
  [dbGeoDataTableName]: '++name, geo',
  [dbDrilldownTableConfig]: '++id, config',
  test: '++id, name'
})
function selectTable (tableName) {
  return db[tableName]
}

const indexedDBUtils = {
  db,
  selectTable
}
export default indexedDBUtils
