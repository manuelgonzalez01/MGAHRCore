export default function DevelopmentEmptyState({ title, description }) {
  return (
    <section className="development-card development-empty">
      <h2>{title}</h2>
      <p className="development-muted">{description}</p>
    </section>
  );
}
