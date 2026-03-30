import StatusBadge from "./StatusBadge";
import useI18n from "../../../app/providers/useI18n";
import { formatDateTimeBySettings } from "../../../utils/dateTime";

export default function RecruitmentActivityFeed({ items, copy }) {
  const { language } = useI18n();

  return (
    <div className="recruitment-activity-feed">
      {items.map((item) => (
        <article key={`${item.type}-${item.id}`} className="recruitment-activity-item">
          <div className={`recruitment-activity-icon recruitment-activity-icon--${item.type}`}>
            {item.type.slice(0, 1).toUpperCase()}
          </div>
          <div className="recruitment-activity-copy">
            <h3>{item.title}</h3>
            <p>{item.meta}</p>
          </div>
          <div className="recruitment-activity-meta">
            <span>{formatDateTimeBySettings(item.date, language)}</span>
            <StatusBadge
              label={copy.labels.status[item.status] || copy.labels.stage[item.status] || item.status}
              value={item.status}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
