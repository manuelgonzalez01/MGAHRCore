import useI18n from "../../../app/providers/useI18n";

export default function useHealthLocale() {
  const { language } = useI18n();

  return {
    language,
    t: (es, en) => (language === "en" ? en : es),
  };
}
