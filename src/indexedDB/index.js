import { dbName, dbGeoDataTableName, dbDrilldownTableConfig, dbUserTableColumnCustomizeConfig, dbRoleTableColumnCustomizeConfig, dbOperationLogTableColumnCustomizeConfig, dbChartTableColumnCustomizeConfig, dbI18nTableColumnCustomizeConfig, dbReportTableColumnCustomizeConfig, dbGalaxySettingTableColumnCustomizeConfig } from '@/utils/constants'
import Dexie from 'dexie'
/* https://dexie.org/ */

const db = new Dexie(dbName)
db.version(4).stores({
  [dbGeoDataTableName]: '++name, geo',
  [dbDrilldownTableConfig]: '++id, config',
  [dbUserTableColumnCustomizeConfig]: '++id, config',
  [dbRoleTableColumnCustomizeConfig]: '++id, config',
  [dbOperationLogTableColumnCustomizeConfig]: '++id, config',
  [dbChartTableColumnCustomizeConfig]: '++id, config',
  [dbI18nTableColumnCustomizeConfig]: '++id, config',
  [dbReportTableColumnCustomizeConfig]: '++id, config',
  [dbGalaxySettingTableColumnCustomizeConfig]: '++id, config',
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
