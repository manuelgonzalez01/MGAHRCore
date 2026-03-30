import useInsuranceLocale from "../hooks/useInsuranceLocale";
import { formatInsuranceCurrency } from "../utils/insurance.helpers";
import InsuranceStatusBadge from "./InsuranceStatusBadge";

export default function InsuranceEnrollmentTable({ items = [], mode = "active", onAction, actionLabel = "Editar" }) {
  const { language, t } = useInsuranceLocale();

  return (
    <div className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>{t("Colaborador", "Employee")}</th>
            <th>{t("Plan", "Plan")}</th>
            <th>{t("Dependientes", "Dependents")}</th>
            <th>{t("Vigencia", "Coverage dates")}</th>
            <th>{t("Costos", "Costs")}</th>
            <th>{t("Estado", "Status")}</th>
            <th>{t("Acciones", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.employeeName}</strong>
                <p className="suite-muted">{item.positionName} · {item.departmentName}</p>
              </td>
              <td>{item.planName || item.recommendedPlanId || "-"}</td>
              <td>{item.dependentIds?.length || item.dependents?.length || 0}</td>
              <td>{item.effectiveDate || "-"} {mode === "changes" && item.terminationDate ? `→ ${item.terminationDate}` : ""}</td>
              <td>{formatInsuranceCurrency(item.totalCost || 0, item.companyCurrency || "BOB", language)}</td>
              <td><InsuranceStatusBadge status={item.status} /></td>
              <td>
                <button className="suite-button-secondary" type="button" onClick={() => onAction(item)}>
                  {actionLabel}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
