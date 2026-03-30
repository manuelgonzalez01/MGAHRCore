import { useEffect, useMemo, useState } from "react";
import { translations } from "../../i18n/translations";
import I18nContext from "./I18nContext";

const STORAGE_KEY = "mgahrcore.language";
const ADMIN_SETTINGS_KEY = "mgahrcore.administration.settings";
const DEFAULT_LANGUAGE = "es";

function getInitialLanguage() {
  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  const storedSettings = window.localStorage.getItem(ADMIN_SETTINGS_KEY);

  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage;
  }

  if (storedSettings) {
    try {
      const parsedSettings = JSON.parse(storedSettings);
      if (parsedSettings?.language && translations[parsedSettings.language]) {
        return parsedSettings.language;
      }
    } catch {
      return DEFAULT_LANGUAGE;
    }
  }

  return DEFAULT_LANGUAGE;
}

function resolveTranslation(language, key) {
  const segments = key.split(".");
  let current = translations[language];

  for (const segment of segments) {
    current = current?.[segment];
  }

  return current;
}

export default function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    function t(key, fallback = key) {
      return resolveTranslation(language, key) ?? fallback;
    }

    return {
      language,
      setLanguage,
      t,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
