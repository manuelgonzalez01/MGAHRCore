import "../../shared/hrSuite.css";
import VacationConflictsTable from "../components/VacationConflictsTable";
import VacationsHeader from "../components/VacationsHeader";
import useVacationDashboard from "../hooks/useVacationDashboard";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationConflictsPage() {
  const { copy } = useVacationLocale();
  const { loading, conflicts } = useVacationDashboard();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingConflicts}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.conflictsEyebrow} title={copy.conflictsTitle} description={copy.conflictsDescription} />
      <VacationConflictsTable conflicts={conflicts} />
    </main>
  );
}
