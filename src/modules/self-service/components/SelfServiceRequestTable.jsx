import SelfServiceStatusBadge from "./SelfServiceStatusBadge";

export default function SelfServiceRequestTable({ items = [], language = "es" }) {
  const typeLabels = {
    permission: language === "en" ? "Permission" : "Permiso",
    vacation: language === "en" ? "Vacation" : "Vacaciones",
    profile_change: language === "en" ? "Profile change" : "Cambio de perfil",
  };

  return (
    <table className="self-service-table">
      <thead>
        <tr>
          <th>{language === "en" ? "Type" : "Tipo"}</th>
          <th>{language === "en" ? "Title" : "Solicitud"}</th>
          <th>{language === "en" ? "Dates" : "Fechas"}</th>
          <th>{language === "en" ? "Approver" : "Aprobador"}</th>
          <th>{language === "en" ? "Status" : "Estado"}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{typeLabels[item.requestType] || item.requestType}</td>
            <td>
              <strong>{item.title}</strong>
              <p className="suite-muted">{item.reason || item.notes || "-"}</p>
            </td>
            <td>{item.startDate || item.createdAt?.slice(0, 10) || "-"} {item.endDate ? `| ${item.endDate}` : ""}</td>
            <td>{item.currentApprover || "-"}</td>
            <td><SelfServiceStatusBadge status={item.status} language={language} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
