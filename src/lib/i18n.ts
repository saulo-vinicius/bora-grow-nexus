
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import enTranslation from "../locales/en.json";
import ptTranslation from "../locales/pt.json";
import brTranslation from "../locales/br.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  pt: {
    translation: ptTranslation,
  },
  br: {
    translation: brTranslation,
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
  });

export default i18n;
