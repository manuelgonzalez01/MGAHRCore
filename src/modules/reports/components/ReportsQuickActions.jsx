import { Link } from "react-router-dom";

export default function ReportsQuickActions({ items = [] }) {
  return (
    <section className="reports-quick-actions">
      {items.map((item) => (
        <Link key={item.path} to={item.path}>
          <div>
            <strong>{item.label}</strong>
            <small>{item.helper}</small>
          </div>
        </Link>
      ))}
    </section>
  );
}
