import StatusBadge from "./StatusBadge";

export default function InterviewsTable({ items, copy, selectedId, onSelect }) {
  return (
    <div className="recruitment-table-shell">
      <table className="recruitment-table">
        <thead>
          <tr>
            <th>{copy.table.date}</th>
            <th>{copy.table.candidate}</th>
            <th>{copy.table.position}</th>
            <th>{copy.table.interviewer}</th>
            <th>{copy.table.format}</th>
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
                <div className="recruitment-item-title">{item.date}</div>
                <div className="recruitment-item-subtitle">{item.time}</div>
              </td>
              <td>{item.candidateName}</td>
              <td>{item.vacancy}</td>
              <td>{item.interviewer}</td>
              <td>{copy.labels.format?.[item.format] || item.format}</td>
              <td>
                <StatusBadge value={item.status} label={copy.labels.status[item.status]} />
              </td>
              <td>
                <button type="button" className="recruitment-inline-button">
                  {copy.buttons.sendReminder}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
