import { applyInsuranceFilters } from "../utils/insurance.helpers";
import { getInsuranceDomain } from "./insuranceDomain.service";

export async function getInsuranceDependentsWorkspace(filters = {}, planId = "") {
  const domain = await getInsuranceDomain();
  const dependents = applyInsuranceFilters(domain.dependents, filters)
    .filter((item) => !planId || item.planId === planId);

  return {
    dependents,
    summary: {
      coveredDependents: dependents.filter((item) => item.status === "active").length,
      beneficiaries: dependents.filter((item) => String(item.beneficiary).toLowerCase() === "si").length,
      plansWithDependents: new Set(dependents.map((item) => item.planId)).size,
    },
  };
}

export default {
  getInsuranceDependentsWorkspace,
};
