import StatusBadge from "./StatusBadge";
import useI18n from "../../../app/providers/useI18n";
import { formatDateTimeBySettings } from "../../../utils/dateTime";

export default function JobRequestsTable({ items, copy, selectedId, onSelect }) {
  const { language } = useI18n();

  return (
    <div className="recruitment-table-shell">
      <table className="recruitment-table">
        <thead>
          <tr>
            <th>{copy.table.request}</th>
            <th>{copy.table.position}</th>
            <th>{copy.table.department}</th>
            <th>{copy.table.manager}</th>
            <th>{copy.table.openings}</th>
            <th>{copy.table.modality}</th>
            <th>{copy.table.createdAt}</th>
            <th>{copy.table.status}</th>
            <th>{copy.table.action}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={item.id === selectedId ? "is-active" : ""}
              onClick={() => onSelect?.(item.id)}
            >
              <td>
                <div className="recruitment-item-title">{item.title}</div>
                <div className="recruitment-item-subtitle">{item.id}</div>
              </td>
              <td>
                <div>{item.position || item.title}</div>
                <div className="recruitment-item-subtitle">{item.levelName || item.levelId || "-"}</div>
              </td>
              <td>{item.department}</td>
              <td>
                <div>{item.hiringManager}</div>
                <div className="recruitment-item-subtitle">
                  <StatusBadge
                    category="priority"
                    value={item.priority}
                    label={copy.labels.priority[item.priority]}
                  />
                </div>
              </td>
              <td>{item.openings}</td>
              <td>
                <div>{copy.labels.modality?.[item.modality] || item.modality}</div>
                <div className="recruitment-item-subtitle">{item.location}</div>
              </td>
              <td>{formatDateTimeBySettings(item.createdAt, language)}</td>
              <td>
                <StatusBadge value={item.status} label={copy.labels.status[item.status]} />
              </td>
              <td>
                <button type="button" className="recruitment-inline-button">
                  {copy.buttons.openProfile}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
