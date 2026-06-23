import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationKO from './locales/ko/translation.json';
import translationEN from './locales/en/translation.json';
import translationJA from './locales/ja/translation.json';
import translationZH from './locales/zh-TW/translation.json';

const resources = {
  ko: {
    translation: translationKO
  },
  en: {
    translation: translationEN
  },
  ja: {
    translation: translationJA
  },
  'zh-TW': {
    translation: translationZH
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
