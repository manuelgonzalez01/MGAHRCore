import { getOccupationalHealthDomain } from "./occupationalHealthDomain.service";
export { saveLaboratoryTestRecord } from "./occupationalHealthDomain.service";

export async function getLaboratoryTestsWorkspace(filters = {}) {
  const domain = await getOccupationalHealthDomain(filters);
  return {
    items: domain.filtered.labs,
    options: domain.options,
  };
}
