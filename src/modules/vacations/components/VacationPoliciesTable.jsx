import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationPoliciesTable({ policies = [], onEdit, onDelete }) {
  const { copy, language, getCategoryLabel } = useVacationLocale();

  return (
    <section className="suite-table-shell">
      <table className="suite-table">
        <thead>
          <tr>
            <th>{copy.policyMaster}</th>
            <th>{copy.context}</th>
            <th>{copy.version}</th>
            <th>{copy.eligibility}</th>
            <th>{copy.accrualCarryOver}</th>
            <th>{copy.controls}</th>
            <th>{copy.tableActions}</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr key={policy.id}>
              <td>
                <strong>{policy.companyName || copy.global}</strong>
                <p className="suite-muted">{policy.locationName || copy.global}</p>
              </td>
              <td>
                {(policy.countryCode || policy.locationName || copy.global)} / {getCategoryLabel(policy.employeeCategory || "all")}
                <p className="suite-muted">{policy.leaveType || (language === "es" ? "anual" : "annual")}</p>
              </td>
              <td>
                {policy.versionLabel || `v${policy.version || 1}.0`}
                <p className="suite-muted">
                  {policy.effectiveFrom || (language === "es" ? "sin fecha" : "no date")} {policy.effectiveTo ? `- ${policy.effectiveTo}` : `| ${language === "es" ? "activa" : "active"}`}
                </p>
              </td>
              <td>
                {policy.entitlementDays} {copy.days}
                <p className="suite-muted">{policy.minServiceMonths} {language === "es" ? "meses de antiguedad" : "months of seniority"}</p>
              </td>
              <td>
                {language === "es" ? "Arrastre" : "Carry-over"} {policy.carryOverLimit}
                <p className="suite-muted">{language === "es" ? "Vence en" : "Expires in"} {policy.expiresAfterMonths} {language === "es" ? "meses" : "months"}</p>
              </td>
              <td>
                HR {language === "es" ? "desde" : "from"} {policy.hrApprovalThresholdDays} {copy.days}
                <p className="suite-muted">{language === "es" ? "Cobertura minima" : "Minimum coverage"} {Math.round(policy.minCoverageRatio * 100)}% | {language === "es" ? "Max" : "Max"} {policy.maxDaysPerRequest || 0}</p>
              </td>
              <td>
                <div className="suite-inline-actions">
                  <button className="suite-button-secondary" onClick={() => onEdit?.(policy)} type="button">{copy.edit}</button>
                  <button className="suite-button-secondary" onClick={() => onDelete?.(policy)} type="button">{copy.delete}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
