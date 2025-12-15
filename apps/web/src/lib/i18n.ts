import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en/common.json'
import th from '@/locales/th/common.json'

const resources = {
  en: { translation: en },
  th: { translation: th },
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    ns: ['translation'],
    defaultNS: 'translation',
    lng: typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'en') : 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

  try {
    // eslint-disable-next-line no-console
    console.log('[i18n] initialized, language=', i18n.language, 'resources:', Object.keys(resources))
  } catch (e) {}
}

export default i18n
