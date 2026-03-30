export default function VacationEmptyState({ title, description }) {
  return (
    <section className="suite-empty">
      <h2>{title}</h2>
      <p className="suite-muted">{description}</p>
    </section>
  );
}
