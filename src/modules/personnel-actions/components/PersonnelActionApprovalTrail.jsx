export default function PersonnelActionApprovalTrail({ items = [], t }) {
  return (
    <section className="suite-card">
      <h2>{t("Trail de aprobacion", "Approval trail")}</h2>
      <div className="personnel-trail">
        {items.map((item) => (
          <article key={item.id} className="suite-list-item">
            <span>{item.changedAt?.slice(0, 10) || "-"}</span>
            <strong>{item.actor}</strong>
            <p className="suite-muted">{`${item.fromStatus || "-"} -> ${item.toStatus} | ${item.role}`}</p>
            {item.comment ? <p className="suite-muted">{item.comment}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
