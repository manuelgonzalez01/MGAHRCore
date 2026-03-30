import PermissionBadge from "./PermissionBadge";

export default function AdminHealthPanel({ items = [] }) {
  return (
    <div className="administration-list">
      {items.map((item) => (
        <article key={item.id} className="administration-health-card">
          <div className="administration-health-row">
            <div>
              <span>{item.area}</span>
              <strong>{item.detail}</strong>
            </div>
            <PermissionBadge value={item.status} />
          </div>
        </article>
      ))}
    </div>
  );
}
