export default function PersonnelActionAuditTimeline({ items = [], t }) {
  return (
    <section className="suite-card">
      <h2>{t("Auditoria", "Audit")}</h2>
      <div className="personnel-audit-list">
        {items.map((item) => (
          <article key={item.id} className="suite-list-item">
            <span>{item.timestamp?.slice(0, 10) || "-"}</span>
            <strong>{item.summary}</strong>
            <p className="suite-muted">{item.actor}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
