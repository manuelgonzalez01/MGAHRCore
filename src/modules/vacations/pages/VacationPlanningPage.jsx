import "../../shared/hrSuite.css";
import TeamCoveragePanel from "../components/TeamCoveragePanel";
import VacationPlanningGrid from "../components/VacationPlanningGrid";
import VacationsHeader from "../components/VacationsHeader";
import useVacationPlanning from "../hooks/useVacationPlanning";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationPlanningPage() {
  const { copy } = useVacationLocale();
  const { loading, plans, conflicts, balances } = useVacationPlanning();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingPlanning}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.planningEyebrow} title={copy.planningTitle} description={copy.planningDescription} />
      <section className="suite-stats">
        <article className="suite-stat"><span>{copy.plans}</span><strong>{plans.length}</strong><p className="suite-muted">{copy.planningDescription}</p></article>
        <article className="suite-stat"><span>{copy.avgCompliance}</span><strong>{plans.length ? `${Math.round((plans.reduce((sum, item) => sum + (item.complianceRatio || 0), 0) / plans.length) * 100)}%` : "0%"}</strong><p className="suite-muted">{copy.compliance}</p></article>
        <article className="suite-stat"><span>{copy.highBalance}</span><strong>{balances.filter((item) => item.available >= 10).length}</strong><p className="suite-muted">{copy.expiringBalances}</p></article>
      </section>
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationPlanningGrid plans={plans} />
        </div>
        <div className="suite-rail">
          <TeamCoveragePanel conflicts={conflicts} />
        </div>
      </section>
    </main>
  );
}
