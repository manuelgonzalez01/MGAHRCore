import useReportsLocale from "../hooks/useReportsLocale";

export default function ReportsEmptyState({ title, description }) {
  const { t } = useReportsLocale();

  return (
    <section className="reports-card reports-empty">
      <h3>{title || t("Sin datos", "No data available")}</h3>
      <p>{description || t("No hay registros disponibles para el filtro actual.", "There are no records available for the current filter.")}</p>
    </section>
  );
}
