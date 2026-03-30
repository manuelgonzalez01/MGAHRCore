import { getOccupationalHealthDomain } from "./occupationalHealthDomain.service";
export { saveMedicalVisitRecord } from "./occupationalHealthDomain.service";

export async function getMedicalVisitsWorkspace(filters = {}) {
  const domain = await getOccupationalHealthDomain(filters);
  return {
    items: domain.filtered.visits,
    options: domain.options,
    cases: domain.cases.filter((item) => item.type === "medical_visit"),
  };
}
