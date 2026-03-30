import { applyFilters, buildDistribution } from "../utils/reports.helpers";
import { getReportingContext } from "./reportingContext.service";

export async function getLegalReports(filters = {}, contextOverride) {
  const context = contextOverride || await getReportingContext();
  const documents = applyFilters(context.compliance.documents, filters, { dateKey: "expiresAt" });
  const approvals = applyFilters(context.compliance.approvals, filters);
  const employees = applyFilters(context.employees, filters, { dateKey: "startDate", statusKey: "activeState" });
  const expiredDocuments = documents.filter((item) => item.status === "expired");
  const attentionDocuments = documents.filter((item) => item.status === "attention");
  const incompleteFiles = employees.filter((item) => item.dossierReadiness < 80 || item.profileCompletion < 85);

  return {
    summary: {
      expiredDocuments: expiredDocuments.length,
      pendingCriticalApprovals: approvals.filter((item) => item.priority === "Critica" && item.status === "pending").length,
      incompleteFiles: incompleteFiles.length,
      policyConflicts: context.vacations.conflicts.length,
    },
    expiredDocuments: [...expiredDocuments, ...attentionDocuments].slice(0, 12),
    criticalApprovals: approvals.filter((item) => item.status === "pending").slice(0, 10),
    employeeAlerts: incompleteFiles.slice(0, 10).map((item) => ({
      employeeName: item.name,
      departmentName: item.departmentName,
      profileCompletion: item.profileCompletion,
      dossierReadiness: item.dossierReadiness,
    })),
    riskByDomain: [
      { label: "Documentos", count: expiredDocuments.length + attentionDocuments.length },
      { label: "Aprobaciones", count: approvals.filter((item) => item.status === "pending").length },
      { label: "Expedientes", count: incompleteFiles.length },
      { label: "Conflictos", count: context.vacations.conflicts.length },
    ],
    entityHotspots: buildDistribution(context.compliance.entities.filter((item) => item.usageCount > 0), "relatedModule", (item) => item.usageCount),
  };
}

export default { getLegalReports };
