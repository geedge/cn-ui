import { createI18n } from 'vue-i18n'
import { storageKey } from '@/utils/constants'
import { getI18n } from '@/utils/api'
import store from '@/store'
import cn from './cn'
import en from './en'

const i18n = createI18n({
  locale: localStorage.getItem(storageKey.language) || 'en'
  /* messages: {
    cn: cn,
    en: en
  } */
})
export async function loadI18n () {
  if (!store.state.i18n) {
    const items = await getI18n()
    store.commit('loadI18n')
    Object.keys(items).forEach(lang => {
      i18n.global.mergeLocaleMessage(lang, items[lang])
    })
  }
}
export default i18n
