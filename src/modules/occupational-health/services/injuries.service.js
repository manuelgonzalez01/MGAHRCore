import { getOccupationalHealthDomain } from "./occupationalHealthDomain.service";
export { saveInjuryRecord } from "./occupationalHealthDomain.service";

export async function getInjuriesWorkspace(filters = {}) {
  const domain = await getOccupationalHealthDomain(filters);
  return {
    items: domain.filtered.injuries,
    options: domain.options,
    cases: domain.cases.filter((item) => item.type === "injury"),
  };
}
