import "../../shared/hrSuite.css";
import VacationAuditLogPanel from "../components/VacationAuditLogPanel";
import VacationHistoryTimeline from "../components/VacationHistoryTimeline";
import VacationsHeader from "../components/VacationsHeader";
import useVacationDashboard from "../hooks/useVacationDashboard";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationHistoryPage() {
  const { copy } = useVacationLocale();
  const { loading, history } = useVacationDashboard();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingHistory}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.historyEyebrow} title={copy.historyTitle} description={copy.historyDescription} />
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationHistoryTimeline events={history} />
        </div>
        <div className="suite-rail">
          <VacationAuditLogPanel events={history} />
        </div>
      </section>
    </main>
  );
}
