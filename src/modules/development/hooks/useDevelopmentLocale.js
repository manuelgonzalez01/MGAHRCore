import useI18n from "../../../app/providers/useI18n";

export default function useDevelopmentLocale() {
  const { language } = useI18n();
  const isEnglish = language === "en";

  return {
    language,
    isEnglish,
    t: (es, en) => (isEnglish ? en : es),
  };
}
