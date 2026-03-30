export default function EmployeeTimeline({ items = [], emptyTitle, emptyDescription }) {
  if (!items.length) {
    return (
      <div className="employees-empty employees-empty--soft">
        <h3>{emptyTitle}</h3>
        <p className="employees-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="employees-timeline">
      {items.map((item) => (
        <article key={item.id} className="employees-timeline-item">
          <span className="employees-timeline-dot" />
          <div className="employees-timeline-body">
            <div className="employees-timeline-head">
              <div>
                <span>{item.eyebrow}</span>
                <strong>{item.title}</strong>
              </div>
              <time>{item.date}</time>
            </div>
            {item.description ? <p className="employees-muted">{item.description}</p> : null}
            {item.trailing ? <small className="employees-muted">{item.trailing}</small> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
