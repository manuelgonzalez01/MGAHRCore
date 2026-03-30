import { getPersonnelActionById } from "./personnelActionsDomain.service";

export async function getPersonnelActionImpact(actionId) {
  const action = await getPersonnelActionById(actionId);
  return action?.impact || null;
}
