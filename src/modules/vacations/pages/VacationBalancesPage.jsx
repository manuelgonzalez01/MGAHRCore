import "../../shared/hrSuite.css";
import VacationBalanceMovementTimeline from "../components/VacationBalanceMovementTimeline";
import VacationBalancesTable from "../components/VacationBalancesTable";
import VacationsHeader from "../components/VacationsHeader";
import useVacationBalances from "../hooks/useVacationBalances";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationBalancesPage() {
  const { copy } = useVacationLocale();
  const { loading, balances } = useVacationBalances();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingBalances}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.balancesEyebrow} title={copy.balancesTitle} description={copy.balancesDescription} />
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationBalancesTable balances={balances} />
        </div>
        <div className="suite-rail">
          <VacationBalanceMovementTimeline movements={balances[0]?.movements || []} />
        </div>
      </section>
    </main>
  );
}
