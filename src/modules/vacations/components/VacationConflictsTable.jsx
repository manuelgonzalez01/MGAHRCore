export default function VacationConflictsTable({ conflicts = [] }) {
  return (
    <section className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>Conflicto</th>
            <th>Colaborador</th>
            <th>Severidad</th>
            <th>Ventana</th>
          </tr>
        </thead>
        <tbody>
          {conflicts.map((conflict) => (
            <tr key={conflict.id}>
              <td>
                <strong>{conflict.title}</strong>
                <p className="suite-muted">{conflict.detail}</p>
              </td>
              <td>{conflict.employeeName}</td>
              <td>{conflict.severity}</td>
              <td>{conflict.affectedWindow}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
