import "../../shared/hrSuite.css";
import "../personnelActions.css";
import PersonnelActionsHeader from "../components/PersonnelActionsHeader";
import useExitLetters from "../hooks/useExitLetters";
import usePersonnelActionsLocale from "../hooks/usePersonnelActionsLocale";

export default function ExitLettersPage() {
  const { t } = usePersonnelActionsLocale();
  const { data, loading, error } = useExitLetters();

  if (loading) return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando cartas de salida", "Loading exit letters")}</h1></section></main>;
  if (error) return <main className="suite-page"><section className="suite-empty"><h1>{t("No pudimos cargar cartas", "Could not load letters")}</h1><p>{error.message}</p></section></main>;

  return (
    <main className="suite-page personnel-actions-page">
      <PersonnelActionsHeader eyebrow={t("Exit Documentation", "Exit Documentation")} title={t("Cartas de salida", "Exit letters")} description={t("Vista documental conectada a desvinculaciones efectivas o en curso.", "Document workspace connected to effective or pending terminations.")} />
      <section className="suite-card">
        <div className="personnel-exit-list">
          {data.letters.map((item) => (
            <article key={item.id} className="suite-list-item">
              <span>{item.documentNumber}</span>
              <strong>{item.employeeName}</strong>
              <p className="suite-muted">{item.effectiveDate} | {item.status}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
