import RequisitionStatusBadge from "./RequisitionStatusBadge";

export default function RequisitionSummaryPanel({
  title,
  requisition,
  labels,
  onLoad,
  actionLabel,
}) {
  if (!requisition) {
    return null;
  }

  return (
    <section className="requisition-card requisition-card--summary">
      <div className="requisition-card__header">
        <h3>{title}</h3>
        <RequisitionStatusBadge
          value={requisition.status}
          label={labels.status[requisition.status] || requisition.status}
        />
      </div>

      <div className="requisition-summary">
        <article>
          <span>{labels.request}</span>
          <strong>{requisition.title}</strong>
        </article>
        <article>
          <span>{labels.position}</span>
          <strong>{requisition.position || "-"}</strong>
        </article>
        <article>
          <span>{labels.department}</span>
          <strong>{requisition.department || "-"}</strong>
        </article>
        <article>
          <span>{labels.owner}</span>
          <strong>{requisition.recruiterOwner || requisition.hiringManager || "-"}</strong>
        </article>
      </div>

      {onLoad ? (
        <button type="button" className="recruitment-secondary-button" onClick={() => onLoad(requisition)}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
