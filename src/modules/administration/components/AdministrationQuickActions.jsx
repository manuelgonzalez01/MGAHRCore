export default function AdministrationQuickActions({ items = [] }) {
  return (
    <div className="administration-quick-grid">
      {items.map((item) => (
        <article key={item.title} className="administration-action-card">
          <div>
            <strong>{item.title}</strong>
            <p className="administration-muted">{item.description}</p>
          </div>
          <button type="button" className="administration-primary-button" onClick={item.action}>
            {item.actionLabel}
          </button>
        </article>
      ))}
    </div>
  );
}
