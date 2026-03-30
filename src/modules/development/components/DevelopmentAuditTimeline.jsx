import useDevelopmentLocale from "../hooks/useDevelopmentLocale";

export default function DevelopmentAuditTimeline({ items = [] }) {
  const { t } = useDevelopmentLocale();

  if (!items.length) {
    return <p className="development-muted">{t("Sin eventos registrados.", "No events recorded yet.")}</p>;
  }

  return (
    <div className="development-timeline">
      {items.map((item) => (
        <article key={item.id} className="development-timeline__item">
          <div className="development-timeline__meta">
            <span className="development-chip">{item.eyebrow || item.entityType || t("Evento", "Event")}</span>
            <strong>{item.title || item.summary}</strong>
            <p className="development-muted">{item.description || `${item.actorName} | ${item.action}`}</p>
          </div>
          <div className="development-timeline__trail">
            <span>{item.date || item.createdAt?.slice(0, 10) || "-"}</span>
            <span className="development-muted">{item.trailing || item.actorRole || ""}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
