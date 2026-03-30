export default function SelfServiceEmptyState({
  title,
  description,
  action = null,
}) {
  return (
    <section className="suite-empty">
      <h1>{title}</h1>
      <p>{description}</p>
      {action ? <div className="self-service-empty-action">{action}</div> : null}
    </section>
  );
}
