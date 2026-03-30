import useInsuranceLocale from "../hooks/useInsuranceLocale";
import InsuranceStatusBadge from "./InsuranceStatusBadge";

export default function InsuranceDependentsTable({ items = [] }) {
  const { t } = useInsuranceLocale();

  return (
    <div className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>{t("Dependiente", "Dependent")}</th>
            <th>{t("Empleado", "Employee")}</th>
            <th>{t("Relacion", "Relationship")}</th>
            <th>{t("Plan", "Plan")}</th>
            <th>{t("Beneficiario", "Beneficiary")}</th>
            <th>{t("Estado", "Status")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.dependentName}</td>
              <td>{item.employeeName}</td>
              <td>{item.relationship}</td>
              <td>{item.planName}</td>
              <td>{item.beneficiary}</td>
              <td><InsuranceStatusBadge status={item.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
