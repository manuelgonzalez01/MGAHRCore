import "../../shared/hrSuite.css";
import VacationApprovalQueue from "../components/VacationApprovalQueue";
import VacationAuditLogPanel from "../components/VacationAuditLogPanel";
import VacationImpactPreview from "../components/VacationImpactPreview";
import VacationsHeader from "../components/VacationsHeader";
import useVacationApprovals from "../hooks/useVacationApprovals";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationApprovalsPage() {
  const { copy, isSpanish } = useVacationLocale();
  const { loading, queue, history, approve, reject, returnForChanges } = useVacationApprovals();
  const selected = queue[0] || null;
  const approvalActor = isSpanish ? "Director de RRHH" : "HR Director";
  const returnNote = isSpanish ? "Ajustar fechas y cobertura." : "Adjust dates and coverage.";
  const rejectNote = isSpanish ? "Saldo insuficiente segun politica." : "Insufficient balance according to policy.";

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingApprovals}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.approvalsEyebrow} title={copy.approvalsTitle} description={copy.approvalsDescription} />
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationApprovalQueue
            requests={queue}
            onApprove={(id) => approve(id, { actor: approvalActor })}
            onReturn={(id) => returnForChanges(id, { actor: approvalActor, note: returnNote })}
            onReject={(id) => reject(id, { actor: approvalActor, note: rejectNote })}
          />
        </div>
        <div className="suite-rail">
          <VacationImpactPreview preview={selected?.impactPreview} />
          <VacationAuditLogPanel events={history.slice(0, 12)} />
        </div>
      </section>
    </main>
  );
}
