export default function HealthTimeline({ items = [] }) {
  return (
    <div className="health-timeline">
      {items.map((item) => (
        <article key={item.id} className="suite-list-item">
          <span>{item.date}</span>
          <strong>{item.title}</strong>
          <p className="suite-muted">{item.detail}</p>
        </article>
      ))}
    </div>
  );
}
