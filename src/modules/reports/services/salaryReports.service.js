import { applyFilters, average, buildDistribution, round, sumBy } from "../utils/reports.helpers";
import { getReportingContext } from "./reportingContext.service";

export async function getSalaryReports(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const employees = applyFilters(context.employees, filters, { dateKey: "startDate", statusKey: "activeState" });
  const salaryTracked = employees.filter((item) => item.totalCompensation > 0);
  const salaryMovements = applyFilters(context.personnelActions.salaryMovements, filters, { dateKey: "effectiveDate" });

  return {
    summary: {
      trackedEmployees: salaryTracked.length,
      averageSalary: round(average(salaryTracked.map((item) => item.salary?.baseSalary)), 0),
      payrollBase: sumBy(salaryTracked, (item) => item.salary?.baseSalary),
      variablePay: sumBy(salaryTracked, (item) => item.salary?.variable),
      averageCompaRatio: round(average(salaryTracked.map((item) => item.salary?.compaRatio || 0)) * 100, 1),
    },
    byLevel: buildDistribution(salaryTracked, "levelName", (item) => item.salary?.baseSalary),
    byDepartment: buildDistribution(salaryTracked, "departmentName", (item) => item.salary?.baseSalary),
    distributionBands: [
      { label: "Menor a 7K", count: salaryTracked.filter((item) => item.salary?.baseSalary < 7000).length },
      { label: "7K - 9.9K", count: salaryTracked.filter((item) => item.salary?.baseSalary >= 7000 && item.salary?.baseSalary < 10000).length },
      { label: "10K - 12.9K", count: salaryTracked.filter((item) => item.salary?.baseSalary >= 10000 && item.salary?.baseSalary < 13000).length },
      { label: "13K o mas", count: salaryTracked.filter((item) => item.salary?.baseSalary >= 13000).length },
    ],
    movements: salaryMovements.slice(0, 12),
    alerts: salaryTracked
      .filter((item) => (item.salary?.compaRatio || 0) < 0.9 || (item.salary?.compaRatio || 0) > 1.1)
      .map((item) => ({
        employeeName: item.name,
        departmentName: item.departmentName,
        levelName: item.levelName,
        compaRatio: round((item.salary?.compaRatio || 0) * 100, 1),
      })),
  };
}

export default { getSalaryReports };
