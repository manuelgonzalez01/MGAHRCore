import "../../shared/hrSuite.css";
import "../reports.css";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportsEmptyState from "../components/ReportsEmptyState";
import ReportsFilters from "../components/ReportsFilters";
import ReportsHeader from "../components/ReportsHeader";
import ReportsKpiCards from "../components/ReportsKpiCards";
import ReportsSectionCard from "../components/ReportsSectionCard";
import SalaryDistributionPanel from "../components/SalaryDistributionPanel";
import WorkforceDistributionTable from "../components/WorkforceDistributionTable";
import useSalaryReports from "../hooks/useSalaryReports";
import useReportsLocale from "../hooks/useReportsLocale";

export default function SalaryReportsPage() {
  const { t } = useReportsLocale();
  const { data, filters, options, loading, setFilter, resetFilters, exportReport, exportState } = useSalaryReports();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando salary intelligence", "Loading salary intelligence")}</h1></section></main>;
  }

  if (!data) {
    return <ReportsEmptyState title={t("Sin reporte salarial", "No salary report")} />;
  }

  return (
    <main className="reports-page">
      <ReportsHeader eyebrow={t("Compensation & Salary Analytics", "Compensation & Salary Analytics")} title={t("Compensacion, distribucion y movimientos", "Compensation, distribution, and movements")} description={t("Analitica salarial por nivel, departamento y movimientos historicos conectados al expediente.", "Salary analytics by level, department, and historical movements connected to employee records.")} />
      <ReportsFilters filters={filters} options={options} onChange={setFilter} onReset={resetFilters} visibleFields={["companyId", "departmentId", "levelId", "positionId", "employeeType"]} />
      <ReportsKpiCards
        items={[
          { label: t("Empleados trazados", "Tracked employees"), value: data.summary.trackedEmployees, format: "number" },
          { label: t("Salario promedio", "Average salary"), value: data.summary.averageSalary, format: "currency" },
          { label: t("Payroll base", "Payroll base"), value: data.summary.payrollBase, format: "currency" },
          { label: t("Compa ratio medio", "Average compa ratio"), value: data.summary.averageCompaRatio, format: "percent" },
        ]}
      />
      <SalaryDistributionPanel bands={data.distributionBands} byLevel={data.byLevel} />
      <ReportExportPanel exportState={exportState} onExport={exportReport} />
      <section className="reports-columns">
        <ReportsSectionCard title={t("Comparativo por departamento", "Department comparison")} description={t("Acumulado salarial y cobertura por area.", "Salary accumulation and coverage by area.")}>
          <WorkforceDistributionTable title={t("Departamento", "Department")} rows={data.byDepartment} valueLabel={t("Acumulado", "Accumulated")} valueType="currency" />
        </ReportsSectionCard>
        <ReportsSectionCard title={t("Movimientos salariales", "Salary movements")} description={t("Ultimos movimientos vinculados a Employees y Personnel Actions.", "Latest movements tied to Employees and Personnel Actions.")}>
          <div className="reports-table-shell">
            <table className="reports-table">
              <thead><tr><th>{t("Colaborador", "Employee")}</th><th>{t("Cambio", "Change")}</th><th>{t("Motivo", "Reason")}</th><th>{t("Fecha", "Date")}</th></tr></thead>
              <tbody>
                {data.movements.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.employeeName}</strong><p>{item.departmentName}</p></td>
                    <td>{item.change}</td>
                    <td>{item.reason}</td>
                    <td>{item.effectiveDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportsSectionCard>
      </section>
    </main>
  );
}
