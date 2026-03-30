import "../../shared/hrSuite.css";
import "../personnelActions.css";
import PersonnelActionsHeader from "../components/PersonnelActionsHeader";
import PromotionsTable from "../components/PromotionsTable";
import usePromotions from "../hooks/usePromotions";
import usePersonnelActionsLocale from "../hooks/usePersonnelActionsLocale";

export default function PromotionsPage() {
  const { t } = usePersonnelActionsLocale();
  const { data, loading, error } = usePromotions();

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando promociones", "Loading promotions")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar promociones", "Could not load promotions")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page personnel-actions-page">
      <PersonnelActionsHeader eyebrow={t("Promotions", "Promotions")} title={t("Promociones", "Promotions")} description={t("Lectura especifica de promociones, readiness e impacto de carrera.", "Specific view of promotions, readiness, and career impact.")} />
      <section className="suite-card">
        <PromotionsTable items={data.actions} t={t} actionTo={(item) => `/personnel-actions/${item.id}`} />
      </section>
    </main>
  );
}
