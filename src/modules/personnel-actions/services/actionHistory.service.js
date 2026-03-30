import { getPersonnelActionById, getPersonnelActionsDomain } from "./personnelActionsDomain.service";

export async function getPersonnelActionHistory(actionId) {
  const action = await getPersonnelActionById(actionId);
  return action?.auditEntries || [];
}

export async function getPersonnelActionsAuditFeed() {
  const domain = await getPersonnelActionsDomain();
  return domain.auditLog;
}
