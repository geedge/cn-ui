import { dbName, dbGeoDataTableName } from '@/utils/constants'
import Dexie from 'dexie'

export const db = new Dexie(dbName)
db.version(1).stores({
  [dbGeoDataTableName]: '++name, geo'
})
