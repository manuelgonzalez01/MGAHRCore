import ReportStatusBadge from "./ReportStatusBadge";

export default function ReportInsightCard({ title, description, tone = "neutral" }) {
  return (
    <article className={`reports-insight reports-insight--${tone}`}>
      <div className="reports-card__head">
        <strong>{title}</strong>
        <ReportStatusBadge status={tone} />
      </div>
      <p className="reports-muted">{description}</p>
    </article>
  );
}
