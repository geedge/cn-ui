import { createI18n } from 'vue-i18n/index'
import { storageKey, EN } from '@/utils/constants'
import { getI18n } from '@/utils/api'
import store from '@/store'

const i18n = createI18n({
  locale: localStorage.getItem(storageKey.language) || EN
})
export async function loadI18n () {
  if (!store.state.i18n) {
    const items = await getI18n()
    if (items) {
      store.commit('loadI18n')
      store.state.i18nObj = items
      Object.keys(items).forEach(lang => {
        i18n.global.mergeLocaleMessage(lang, items[lang])
      })
    }
  }
}
export default i18n
