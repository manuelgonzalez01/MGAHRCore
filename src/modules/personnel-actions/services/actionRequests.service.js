import { getPersonnelActionById, getPersonnelActionsDomain, savePersonnelAction } from "./personnelActionsDomain.service";

export async function getPersonnelActionsListWorkspace(filters = {}) {
  const domain = await getPersonnelActionsDomain(filters);
  return {
    actions: domain.filteredActions,
    options: domain.options,
    auditLog: domain.auditLog,
    kpis: domain.kpis,
    employees: domain.employees,
    organizations: domain.organizations,
  };
}

export async function getPersonnelActionDetailsWorkspace(actionId) {
  return getPersonnelActionById(actionId);
}

export { savePersonnelAction };
