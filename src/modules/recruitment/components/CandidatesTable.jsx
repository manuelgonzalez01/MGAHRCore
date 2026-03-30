import StageBadge from "./StageBadge";
import StatusBadge from "./StatusBadge";

export default function CandidatesTable({ items, copy, selectedId, onSelect }) {
  return (
    <div className="recruitment-table-shell">
      <table className="recruitment-table">
        <thead>
          <tr>
            <th>{copy.table.candidate}</th>
            <th>{copy.table.position}</th>
            <th>{copy.table.stage}</th>
            <th>{copy.table.score}</th>
            <th>{copy.table.availability}</th>
            <th>{copy.table.location}</th>
            <th>{copy.table.contact}</th>
            <th>{copy.table.status}</th>
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
                <div className="recruitment-item-title">{item.name}</div>
                <div className="recruitment-item-subtitle">{item.experience}</div>
              </td>
              <td>{item.position}</td>
              <td>
                <StageBadge value={item.stage} label={copy.labels.stage[item.stage]} />
              </td>
              <td>{item.score}/100</td>
              <td>{item.availability}</td>
              <td>{item.location || "-"}</td>
              <td>{item.contact || "-"}</td>
              <td>
                <StatusBadge value={item.status} label={copy.labels.status[item.status]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
