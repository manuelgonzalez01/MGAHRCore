import "../../shared/hrSuite.css";
import "../personnelActions.css";
import PersonnelActionsHeader from "../components/PersonnelActionsHeader";
import SalaryChangesTable from "../components/SalaryChangesTable";
import useSalaryChanges from "../hooks/useSalaryChanges";
import usePersonnelActionsLocale from "../hooks/usePersonnelActionsLocale";

export default function SalaryIncreasesPage() {
  const { t } = usePersonnelActionsLocale();
  const { data, loading, error } = useSalaryChanges();

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando aumentos", "Loading salary increases")}</h1></section></main>;
  if (error || !data) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar aumentos", "Could not load salary increases")}</h1><p>{error?.message}</p></section></main>;

  return (
    <main className="suite-page personnel-actions-page">
      <PersonnelActionsHeader eyebrow={t("Salary Governance", "Salary Governance")} title={t("Aumentos salariales", "Salary increases")} description={t("Control before/after salarial, vigencia y aprobacion.", "Control salary before/after, validity, and approval.")} />
      <section className="suite-card">
        <SalaryChangesTable items={data.actions} t={t} actionTo={(item) => `/personnel-actions/${item.id}`} />
      </section>
    </main>
  );
}
