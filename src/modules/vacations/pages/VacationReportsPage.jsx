import "../../shared/hrSuite.css";
import VacationsHeader from "../components/VacationsHeader";
import useVacationReports from "../hooks/useVacationReports";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationReportsPage() {
  const { copy } = useVacationLocale();
  const { loading, operational, expiringBalances, highBalanceEmployees, planningCompliance, liability, riskSummary } = useVacationReports();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingReports}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.reportsEyebrow} title={copy.reportsTitle} description={copy.reportsDescription} badges={[{ label: copy.liabilityLabel, value: liability, tone: "info" }]} />
      <section className="suite-stats">
        <article className="suite-stat"><span>Conflictos</span><strong>{riskSummary.conflicts}</strong></article>
        <article className="suite-stat"><span>Pendientes</span><strong>{riskSummary.pendingApprovals}</strong></article>
        <article className="suite-stat"><span>Devueltos</span><strong>{riskSummary.returnedForChanges}</strong></article>
      </section>
      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-table-shell">
            <table className="suite-table">
              <thead><tr><th>Departamento</th><th>Aprobado</th><th>Pendiente</th><th>Solicitudes</th></tr></thead>
              <tbody>{operational.map((item) => <tr key={item.department}><td>{item.department}</td><td>{item.approvedDays}</td><td>{item.pendingDays}</td><td>{item.requests}</td></tr>)}</tbody>
            </table>
          </section>
        </div>
        <div className="suite-rail">
          <section className="suite-card">
            <h2>Saldos altos</h2>
            <div className="suite-list">{highBalanceEmployees.map((item) => <article className="suite-list-item" key={item.employeeId}><strong>{item.employeeName}</strong><p className="suite-muted">{item.available} dias | {item.department}</p></article>)}</div>
          </section>
          <section className="suite-card">
            <h2>Por vencer</h2>
            <div className="suite-list">{expiringBalances.map((item) => <article className="suite-list-item" key={item.employeeName}><strong>{item.employeeName}</strong><p className="suite-muted">{item.carriedOver} dias | {item.expiryWindow}</p></article>)}</div>
          </section>
          <section className="suite-card">
            <h2>Cumplimiento del plan</h2>
            <div className="suite-list">{planningCompliance.slice(0, 8).map((item) => <article className="suite-list-item" key={item.employeeId}><strong>{item.employeeName}</strong><p className="suite-muted">{item.status}</p></article>)}</div>
          </section>
        </div>
      </section>
    </main>
  );
}
