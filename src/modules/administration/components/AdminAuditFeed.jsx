import useI18n from "../../../app/providers/useI18n";
import { formatDateTimeBySettings } from "../../../utils/dateTime";

export default function AdminAuditFeed({ items = [] }) {
  const { language } = useI18n();

  return (
    <div className="administration-audit-feed">
      {items.map((item) => (
        <article key={item.id} className="administration-audit-item">
          <span>{formatDateTimeBySettings(item.timestamp, language)}</span>
          <strong>{item.title}</strong>
          <p className="administration-muted">{item.detail}</p>
          <p className="administration-muted">Actor: {item.actor}</p>
        </article>
      ))}
    </div>
  );
}
