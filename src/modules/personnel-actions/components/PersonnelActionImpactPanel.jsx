export default function PersonnelActionImpactPanel({ impact = {}, t }) {
  return (
    <section className="suite-card">
      <h2>{t("Impacto before / after", "Before / after impact")}</h2>
      <div className="personnel-impact-grid">
        {Object.entries(impact).map(([key, item]) => (
          <article key={key} className={`personnel-impact-card ${item.changed ? "changed" : ""}`}>
            <span>{item.label}</span>
            <strong>{item.before || "-"}</strong>
            <p className="suite-muted">{t("Nuevo valor", "New value")}: {item.after || "-"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
