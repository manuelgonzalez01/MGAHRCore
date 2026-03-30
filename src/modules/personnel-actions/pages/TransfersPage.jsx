import "../../shared/hrSuite.css";
import "../personnelActions.css";
import PersonnelActionsHeader from "../components/PersonnelActionsHeader";
import TransfersTable from "../components/TransfersTable";
import useTransfers from "../hooks/useTransfers";
import usePersonnelActionsLocale from "../hooks/usePersonnelActionsLocale";

export default function TransfersPage() {
  const { t } = usePersonnelActionsLocale();
  const { data, loading, error } = useTransfers();

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando traslados", "Loading transfers")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar traslados", "Could not load transfers")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page personnel-actions-page">
      <PersonnelActionsHeader eyebrow={t("Transfers", "Transfers")} title={t("Traslados", "Transfers")} description={t("Cambios organizacionales, reubicaciones y movimientos de reporting.", "Organizational changes, relocations, and reporting movements.")} />
      <section className="suite-card">
        <TransfersTable items={data.actions} t={t} actionTo={(item) => `/personnel-actions/${item.id}`} />
      </section>
    </main>
  );
}
