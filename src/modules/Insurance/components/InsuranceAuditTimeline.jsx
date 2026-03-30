import useInsuranceLocale from "../hooks/useInsuranceLocale";

export default function InsuranceAuditTimeline({ entries = [], title = "Auditoria" }) {
  const { t } = useInsuranceLocale();

  return (
    <section className="suite-card">
      <h2>{title}</h2>
      <div className="insurance-timeline">
        {entries.map((entry) => (
          <article key={entry.id} className="suite-list-item">
            <span>{entry.timestamp?.slice(0, 16).replace("T", " ")}</span>
            <strong>{entry.summary}</strong>
            <p className="suite-muted">{entry.actor}</p>
            {entry.before || entry.after ? (
              <p className="suite-muted">
                {entry.before ? t("Estado previo registrado", "Previous state recorded") : t("Sin estado previo", "No previous state")}
                {" · "}
                {entry.after ? t("Estado resultante registrado", "Resulting state recorded") : t("Sin estado resultante", "No resulting state")}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
