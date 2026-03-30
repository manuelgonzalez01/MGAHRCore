import PersonnelActionStatusBadge from "./PersonnelActionStatusBadge";
import PersonnelActionTypeBadge from "./PersonnelActionTypeBadge";

export default function PersonnelActionDetailsCard({ item, t }) {
  if (!item) {
    return null;
  }

  return (
    <section className="suite-card">
      <div className="suite-head">
        <div>
          <h2>{item.title}</h2>
          <p className="suite-muted">{item.reason}</p>
        </div>
        <div className="personnel-action-buttons">
          <PersonnelActionTypeBadge label={item.typeLabel} />
          <PersonnelActionStatusBadge status={item.status} label={item.statusLabel} />
        </div>
      </div>
      <div className="personnel-impact-grid">
        {[
          [t("Fecha efectiva", "Effective date"), item.effectiveDate],
          [t("Solicitado por", "Requested by"), item.requestedBy],
          [t("Flujo", "Flow"), item.approvalFlowName],
          [t("Impacto", "Impact"), item.impactSummary],
        ].map(([label, value]) => (
          <article key={label} className="personnel-impact-card">
            <span>{label}</span>
            <strong>{value || "-"}</strong>
          </article>
        ))}
      </div>
      {item.businessJustification ? <p className="suite-muted">{item.businessJustification}</p> : null}
    </section>
  );
}
