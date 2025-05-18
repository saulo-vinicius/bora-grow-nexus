
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import enTranslation from "../locales/en.json";
import brTranslation from "../locales/br.json";
import esTranslation from "../locales/es.json";
import ptTranslation from "../locales/pt.json";

// Set up a test to ensure there are no missing keys between translations
const compareKeys = (obj1: object, obj2: object, path = ""): string[] => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  let missingKeys: string[] = [];
  
  keys1.forEach(key => {
    const newPath = path ? `${path}.${key}` : key;
    if (!(key in obj2)) {
      missingKeys.push(newPath);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
      missingKeys = [...missingKeys, ...compareKeys(obj1[key], obj2[key], newPath)];
    }
  });
  
  return missingKeys;
};

// Log any missing translation keys in development
if (process.env.NODE_ENV === 'development') {
  const enKeys = compareKeys(enTranslation, ptTranslation);
  const ptKeys = compareKeys(ptTranslation, enTranslation);
  const brKeys = compareKeys(enTranslation, brTranslation);
  const esKeys = compareKeys(enTranslation, esTranslation);
  
  if (enKeys.length > 0) console.warn('Missing PT translations:', enKeys);
  if (ptKeys.length > 0) console.warn('Extra PT translations:', ptKeys);
  if (brKeys.length > 0) console.warn('Missing BR translations:', brKeys);
  if (esKeys.length > 0) console.warn('Missing ES translations:', esKeys);
}

const resources = {
  en: {
    translation: enTranslation,
  },
  br: {
    translation: brTranslation,
  },
  es: {
    translation: esTranslation,
  },
  pt: {
    translation: ptTranslation,
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    returnNull: false, // This will return the key instead of null if translation is missing
    returnEmptyString: false, // This will return the key instead of empty string
  });

export default i18n;
