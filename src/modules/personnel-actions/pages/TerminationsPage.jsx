import "../../shared/hrSuite.css";
import "../personnelActions.css";
import PersonnelActionsHeader from "../components/PersonnelActionsHeader";
import TerminationsTable from "../components/TerminationsTable";
import useTerminations from "../hooks/useTerminations";
import usePersonnelActionsLocale from "../hooks/usePersonnelActionsLocale";

export default function TerminationsPage() {
  const { t } = usePersonnelActionsLocale();
  const { data, loading, error } = useTerminations();

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando desvinculaciones", "Loading terminations")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar desvinculaciones", "Could not load terminations")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page personnel-actions-page">
      <PersonnelActionsHeader eyebrow={t("Terminations", "Terminations")} title={t("Desvinculaciones", "Terminations")} description={t("Gestiona salidas, motivos, fecha efectiva y documentacion vinculada.", "Manage exits, reasons, effective dates, and linked documentation.")} />
      <section className="suite-card">
        <TerminationsTable items={data.actions} t={t} actionTo={(item) => `/personnel-actions/${item.id}`} />
      </section>
    </main>
  );
}
