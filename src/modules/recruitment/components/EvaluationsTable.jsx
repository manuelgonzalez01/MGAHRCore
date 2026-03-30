import StatusBadge from "./StatusBadge";

export default function EvaluationsTable({ items, copy, selectedId, onSelect }) {
  return (
    <div className="recruitment-table-shell">
      <table className="recruitment-table">
        <thead>
          <tr>
            <th>{copy.table.candidate}</th>
            <th>{copy.table.position}</th>
            <th>{copy.table.score}</th>
            <th>{copy.table.technicalScore}</th>
            <th>{copy.table.competencyScore}</th>
            <th>{copy.table.observation}</th>
            <th>{copy.table.recommendation}</th>
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
              <td>{item.candidateName}</td>
              <td>{item.vacancy}</td>
              <td>{item.score}/100</td>
              <td>{item.technicalScore || 0}/100</td>
              <td>{item.competencyScore || 0}/100</td>
              <td>{item.summary}</td>
              <td>
                <StatusBadge
                  value={item.recommendation}
                  label={copy.labels.recommendation[item.recommendation]}
                />
              </td>
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
