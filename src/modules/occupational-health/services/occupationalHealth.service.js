import { getOccupationalHealthDomain } from "./occupationalHealthDomain.service";
export { getInjuriesWorkspace } from "./injuries.service";
export { getMedicalVisitsWorkspace } from "./medicalVisits.service";
export { getLaboratoryTestsWorkspace } from "./laboratoryTests.service";
export { getMedicinesWorkspace } from "./medicines.service";
export {
  saveInjuryRecord,
  saveMedicalVisitRecord,
  saveLaboratoryTestRecord,
  saveMedicineRecord,
  saveConditionRecord,
  exportOccupationalHealthSection,
} from "./occupationalHealthDomain.service";

export async function getOccupationalHealthDashboard(filters = {}) {
  const domain = await getOccupationalHealthDomain(filters);

  return {
    visits: domain.visits.map((item) => ({
      id: item.id,
      employeeName: item.employeeName,
      type: item.visitType,
      status: item.caseStatus,
      owner: item.physician,
      result: item.result,
      restrictions: item.restrictions,
      date: item.occurredAt,
    })),
    injuries: domain.injuries.map((item) => ({
      id: item.id,
      employeeName: item.employeeName,
      severity: item.severity,
      status: item.status,
      area: item.departmentName,
      type: item.incidentType,
      occurredAt: item.occurredAt,
      cause: item.cause,
    })),
    labs: domain.labs.map((item) => ({
      id: item.id,
      employeeName: item.employeeName,
      panel: item.testType,
      status: item.status,
      result: item.result,
      date: item.scheduledAt,
    })),
    medicines: domain.medicines.map((item) => ({
      id: item.id,
      employeeName: item.employeeName,
      medicine: item.medicine,
      owner: "Health Office",
      status: item.status,
      deliveredAt: item.deliveredAt,
    })),
    conditions: domain.conditions,
    cases: domain.cases,
    stats: domain.stats,
    reporting: domain.reporting,
    options: domain.options,
  };
}

export default { getOccupationalHealthDashboard };
