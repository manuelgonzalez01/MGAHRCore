import useI18n from "../../../app/providers/useI18n";
import useSystemSettings from "./useSystemSettings";

export default function useLanguageSettings() {
  const { language, setLanguage } = useI18n();
  const { settings, loading, saveSettings } = useSystemSettings();

  async function updateLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    await saveSettings({ ...(settings || {}), language: nextLanguage });
  }

  return {
    language,
    settings,
    loading,
    updateLanguage,
  };
}
