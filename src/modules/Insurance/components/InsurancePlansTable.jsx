import { Link } from "react-router-dom";
import useInsuranceLocale from "../hooks/useInsuranceLocale";
import { formatInsuranceCurrency } from "../utils/insurance.helpers";
import InsuranceStatusBadge from "./InsuranceStatusBadge";

export default function InsurancePlansTable({ items = [], onEdit }) {
  const { language, t } = useInsuranceLocale();

  return (
    <div className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>{t("Plan", "Plan")}</th>
            <th>{t("Proveedor", "Provider")}</th>
            <th>{t("Cobertura", "Coverage")}</th>
            <th>{t("Costo base", "Base cost")}</th>
            <th>{t("Afiliados", "Enrollments")}</th>
            <th>{t("Estado", "Status")}</th>
            <th>{t("Acciones", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <p className="suite-muted">{item.companyName} · {item.type}</p>
              </td>
              <td>{item.provider}</td>
              <td>{item.coverageScope}</td>
              <td>{formatInsuranceCurrency(item.baseEmployeeCost, item.companyCurrency, language)}</td>
              <td>{item.enrolledEmployees} / {item.coveredDependents}</td>
              <td><InsuranceStatusBadge status={item.status} /></td>
              <td>
                <div className="insurance-table-actions">
                  <Link className="suite-button-secondary" to={`/insurance/plans/${item.id}`}>{t("Detalle", "Detail")}</Link>
                  <button className="suite-button-secondary" type="button" onClick={() => onEdit(item)}>{t("Editar", "Edit")}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
