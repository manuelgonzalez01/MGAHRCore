export default function VacationBalancesTable({ balances = [] }) {
  return (
    <section className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Entorno</th>
            <th>Ganado</th>
            <th>Aprobado</th>
            <th>Pendiente</th>
            <th>Disponible</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((balance) => (
            <tr key={balance.employeeId}>
              <td>
                <strong>{balance.employeeName}</strong>
                <p className="suite-muted">{balance.department}</p>
              </td>
              <td>{balance.company}<p className="suite-muted">{balance.location}</p></td>
              <td>{balance.earned}</td>
              <td>{balance.approved}</td>
              <td>{balance.pending}</td>
              <td>{balance.available}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
