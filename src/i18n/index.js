import { createI18n } from 'vue-i18n'
import cn from './cn'
import en from './en'
const i18n = createI18n({
  locale: localStorage.getItem('cn-language') || 'en',
  messages: {
    cn: cn,
    en: en
  }
})
export default i18n
